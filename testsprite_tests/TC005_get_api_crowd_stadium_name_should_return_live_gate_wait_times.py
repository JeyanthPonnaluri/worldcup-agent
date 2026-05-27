import requests
import websocket
import threading
import json
import time

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://127.0.0.1:8000"
TIMEOUT = 30

def test_get_api_crowd_stadium_name_should_return_live_gate_wait_times():
    session = requests.Session()
    try:
        # 1. Signup a new user
        signup_payload = {
            "username": "testuser_crowd_tc005",
            "email": "testuser_crowd_tc005@example.com",
            "password": "TestPass123!",
            "dietary_preferences": ["vegetarian"],
            "crowd_tolerance": "medium",
            "favorite_team": "Testers FC",
            "preferred_gate": "Gate A"
        }
        r = session.post(f"{BASE_URL}/auth/signup", json=signup_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Signup failed: {r.status_code}, {r.text}"

        # 2. Login to get JWT token
        login_payload = {"username": signup_payload["username"], "password": signup_payload["password"]}
        r = session.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Login failed: {r.status_code}, {r.text}"
        token = r.json().get("access_token") or r.json().get("token")
        assert token, "JWT token missing in login response"

        headers_auth = {"Authorization": f"Bearer {token}"}

        # 3. Verify profile endpoint (protected) to check token correctness
        r = session.get(f"{BASE_URL}/auth/profile", headers=headers_auth, timeout=TIMEOUT)
        assert r.status_code == 200, f"Profile access failed: {r.status_code}, {r.text}"
        profile_data = r.json()
        assert profile_data.get("username") == signup_payload["username"]

        # 4. Fetch the list of stadiums to get a valid stadium_name
        r = session.get(f"{BASE_URL}/api/stadiums", timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to get stadiums: {r.status_code}, {r.text}"
        stadiums = r.json()
        assert isinstance(stadiums, list) and len(stadiums) > 0, "Stadiums list empty or invalid"
        stadium_name = stadiums[0]

        # 5. GET /api/crowd/{stadium_name} to retrieve live gate wait times
        r = session.get(f"{BASE_URL}/api/crowd/{stadium_name}", timeout=TIMEOUT)
        assert r.status_code == 200, f"GET /api/crowd/{stadium_name} failed: {r.status_code}, {r.text}"
        crowd_data = r.json()
        assert isinstance(crowd_data, dict), "Crowd data response is not an object"
        # Verify gate wait times keys and values (wait times should be integers >= 0)
        for gate, wait_time in crowd_data.items():
            assert isinstance(gate, str), "Gate name is not string"
            assert isinstance(wait_time, int), "Wait time is not integer"
            assert wait_time >= 0, "Wait time is negative"

        # 6. Websocket test for live telemetry /ws/crowd
        ws_url = f"ws://localhost:8000/ws/crowd"
        received_messages = []

        def on_message(wsapp, message):
            try:
                data = json.loads(message)
                received_messages.append(data)
            except Exception:
                pass

        def on_error(wsapp, error):
            received_messages.append({"error": str(error)})

        def on_close(wsapp, close_status_code, close_msg):
            received_messages.append({"closed": True})

        ws = websocket.WebSocketApp(ws_url,
                                    on_message=on_message,
                                    on_error=on_error,
                                    on_close=on_close)
        ws_thread = threading.Thread(target=ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()

        # Wait briefly for connection and possible messages
        time.sleep(3)

        # 7. POST /api/crowd/update to trigger an update
        # Choose a gate from the crowd data or use a default valid gate name if none found
        gate_name = None
        for key in crowd_data.keys():
            gate_name = key
            break
        if not gate_name:
            gate_name = "Gate A"  # fallback default

        update_payload = {
            "stadium_name": stadium_name,
            "gate_name": gate_name,
            "waiting_time": 5
        }
        r = session.post(f"{BASE_URL}/api/crowd/update", json=update_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"POST /api/crowd/update failed: {r.status_code}, {r.text}"

        # Wait to receive WebSocket updates related to the simulation update
        time.sleep(5)

        ws.close()
        ws_thread.join(timeout=5)

        # Check at least one WebSocket crowd update received without error
        assert any(isinstance(m, dict) and "error" not in m for m in received_messages), "No valid WebSocket crowd updates received"

        # 8. Frontend Integration checks (simplified GET calls simulating frontend pages)
        # SignIn page
        r = requests.get(f"{FRONTEND_URL}/signin", timeout=TIMEOUT)
        assert r.status_code == 200
        assert ("Sign In" in r.text or "sign in" in r.text.lower())

        # SignUp page
        r = requests.get(f"{FRONTEND_URL}/signup", timeout=TIMEOUT)
        assert r.status_code == 200
        assert ("Sign Up" in r.text or "sign up" in r.text.lower())

        # Profile page requires auth - simulate with token
        r = requests.get(f"{FRONTEND_URL}/profile", headers=headers_auth, timeout=TIMEOUT)
        assert r.status_code in [200, 401, 403]  # Depending on frontend auth system

        # Bottom navigation and header tabs presence check
        for page in ["", "profile", "signin", "signup"]:
            r = requests.get(f"{FRONTEND_URL}/{page}", timeout=TIMEOUT)
            assert r.status_code == 200

        # Google Maps element rendering check - check presence of map div or script
        r = requests.get(FRONTEND_URL, timeout=TIMEOUT)
        assert "google" in r.text.lower() or "maps" in r.text.lower()

        # Dynamic color gate markers and route polyline cannot be fully tested without JS environment,
        # so we omit complex frontend dynamic checks here.

        # 9. Authentication flow additional verifications as per instructions

        # Login with invalid credentials
        r = session.post(f"{BASE_URL}/auth/login", json={"username": "wronguser", "password": "wrongpass"}, timeout=TIMEOUT)
        assert r.status_code == 401

        # Access protected profile without token
        r = session.get(f"{BASE_URL}/auth/profile", timeout=TIMEOUT)
        assert r.status_code == 401

        # Logout with valid token
        r = session.post(f"{BASE_URL}/auth/logout", headers=headers_auth, timeout=TIMEOUT)
        assert r.status_code == 200

    finally:
        # Cleanup: delete created user if API provided delete, assume not available, so no cleanup here.
        pass

test_get_api_crowd_stadium_name_should_return_live_gate_wait_times()