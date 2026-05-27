import requests
import asyncio
import threading
import time
import json
import websockets

BASE_URL = "http://127.0.0.1:8000"
CROWD_UPDATE_ENDPOINT = f"{BASE_URL}/api/crowd/update"
CROWD_WS_ENDPOINT = "ws://127.0.0.1:8000/ws/crowd"
STADIUMS_ENDPOINT = f"{BASE_URL}/api/stadiums"
CROWD_STADIUM_ENDPOINT = f"{BASE_URL}/api/crowd"

# Container for websocket messages
ws_messages = []

# Event to signal websocket listener to stop
stop_event = threading.Event()

async def ws_listener_async():
    try:
        async with websockets.connect(CROWD_WS_ENDPOINT) as websocket:
            while not stop_event.is_set():
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                    try:
                        msg_json = json.loads(message)
                        ws_messages.append(msg_json)
                    except Exception:
                        pass
                except asyncio.TimeoutError:
                    continue
    except Exception:
        pass

def ws_listener():
    asyncio.new_event_loop().run_until_complete(ws_listener_async())

def test_post_api_crowd_update_should_accept_valid_simulation_update():
    timeout = 30
    # Step 1: Get list of stadiums to pick a valid stadium and gate for update
    try:
        stadiums_resp = requests.get(STADIUMS_ENDPOINT, timeout=timeout)
        assert stadiums_resp.status_code == 200
        stadiums = stadiums_resp.json()
        assert isinstance(stadiums, list) and len(stadiums) > 0
    except Exception as e:
        raise AssertionError(f"Failed to get valid stadiums list: {e}")

    stadium_name = None
    gate_name = None
    # Step 2: Get crowd gate info for a valid stadium to identify a gate_name
    for stadium in stadiums:
        try:
            crowd_resp = requests.get(f"{CROWD_STADIUM_ENDPOINT}/{stadium}", timeout=timeout)
            if crowd_resp.status_code == 200:
                crowd_data = crowd_resp.json()
                # Expecting gates details with wait times in crowd_data
                if isinstance(crowd_data, dict) and 'gates' in crowd_data and isinstance(crowd_data['gates'], dict) and len(crowd_data['gates']) > 0:
                    stadium_name = stadium
                    gate_name = next(iter(crowd_data['gates'].keys()))
                    break
        except Exception:
            continue

    if not stadium_name or not gate_name:
        raise AssertionError("Could not identify a valid stadium and gate_name from crowd data to test update")

    # Prepare simulation update payload
    update_payload = {
        "stadium_name": stadium_name,
        "gate_name": gate_name,
        "waiting_time": 5  # An integer waiting time for simulation
    }

    # Start websocket listener thread
    ws_thread = threading.Thread(target=ws_listener, daemon=True)
    ws_thread.start()
    time.sleep(1)  # wait for websocket connection to establish

    # Step 3: POST the crowd simulation update
    try:
        headers = {"Content-Type": "application/json"}
        update_resp = requests.post(CROWD_UPDATE_ENDPOINT, json=update_payload, headers=headers, timeout=timeout)
        assert update_resp.status_code == 200
        resp_json = update_resp.json()
        assert isinstance(resp_json, dict)
        # Assuming some confirmation message or status in response
        assert "message" in resp_json or "status" in resp_json
    except Exception as e:
        # Stop the websocket listener before raising
        stop_event.set()
        ws_thread.join()
        raise AssertionError(f"Crowd update POST request failed or invalid response: {e}")

    # Step 4: Validate if websocket live telemetry updates received related to our update
    # wait some seconds for ws messages to arrive
    time.sleep(3)

    # Stop websocket listener
    stop_event.set()
    ws_thread.join()

    found_update_message = False
    for msg in ws_messages:
        try:
            # Look for a message with the stadium and gate updated and waiting_time matching or similar
            if msg.get("stadium_name") == stadium_name and msg.get("gate_name") == gate_name:
                if "waiting_time" in msg:
                    # Check waiting_time is integer and reasonable (equals or close to 5)
                    waiting_time_value = msg["waiting_time"]
                    if isinstance(waiting_time_value, int) and waiting_time_value >= 0:
                        found_update_message = True
                        break
        except Exception:
            continue

    assert found_update_message, "WebSocket did not receive relevant live telemetry updates after POST /api/crowd/update"


test_post_api_crowd_update_should_accept_valid_simulation_update()