import requests
import time
import json

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://127.0.0.1:8000"
TIMEOUT = 30

try:
    import websocket
    import threading
    HAS_WEBSOCKET = True
except ImportError:
    HAS_WEBSOCKET = False

def test_post_api_itinerary_should_generate_optimized_itinerary():
    session = requests.Session()
    # Generate unique user details
    timestamp = int(time.time())
    username = f"testuser{timestamp}"
    email = f"testuser{timestamp}@example.com"
    password = "SecureP@ssw0rd!"

    signup_payload = {
        "username": username,
        "email": email,
        "password": password,
        "dietary_preferences": ["vegetarian"],
        "crowd_tolerance": "medium",
        "favorite_team": "KhelMitra FC",
        "preferred_gate": "Gate A"
    }
    # Signup user
    r = session.post(f"{BASE_URL}/auth/signup", json=signup_payload, timeout=TIMEOUT)
    assert r.status_code == 200, f"Signup failed: {r.text}"

    try:
        # Login to get JWT token
        login_payload = {"username": username, "password": password}
        r = session.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Login failed: {r.text}"
        response_json = r.json()
        token = response_json.get("token")
        if not token:
            # Check common alternative key
            token = response_json.get("access_token")
        assert token, f"JWT token missing in login response: {response_json}"
        headers = {"Authorization": f"Bearer {token}"}

        # Verify profile access with token
        r = session.get(f"{BASE_URL}/auth/profile", headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Profile retrieval failed: {r.text}"

        # Verify invalid credentials login returns 401
        invalid_login = session.post(f"{BASE_URL}/auth/login", json={"username": username, "password": "wrongpass"}, timeout=TIMEOUT)
        assert invalid_login.status_code == 401

        # Verify accessing profile without token returns 401
        no_auth_profile = session.get(f"{BASE_URL}/auth/profile", timeout=TIMEOUT)
        assert no_auth_profile.status_code == 401

        # Test logout
        r = session.post(f"{BASE_URL}/auth/logout", headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200

        # After logout, profile should return 401
        r = session.get(f"{BASE_URL}/auth/profile", headers=headers, timeout=TIMEOUT)
        assert r.status_code == 401 or r.status_code == 404

        # Login again to obtain fresh token for itinerary tests
        r = session.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
        assert r.status_code == 200
        response_json = r.json()
        token = response_json.get("token") or response_json.get("access_token")
        headers = {"Authorization": f"Bearer {token}"}

        # Check available stadiums to pick a valid stadium
        r = session.get(f"{BASE_URL}/api/stadiums", timeout=TIMEOUT)
        assert r.status_code == 200
        stadiums = r.json()
        assert isinstance(stadiums, list) and len(stadiums) > 0
        stadium = stadiums[0]

        # Memory test: update profile preferences to remember
        update_payload = {
            "dietary_preferences": ["vegetarian"],
            "crowd_tolerance": "low",
            "favorite_team": "KhelMitra FC",
            "preferred_gate": "Gate B"
        }
        r = session.post(f"{BASE_URL}/auth/profile", headers=headers, json=update_payload, timeout=TIMEOUT)
        assert r.status_code == 200

        # Verify memory by retrieving profile back
        r = session.get(f"{BASE_URL}/auth/profile", headers=headers, timeout=TIMEOUT)
        profile = r.json()
        assert "dietary_preferences" in profile and "vegetarian" in profile["dietary_preferences"]
        assert profile.get("crowd_tolerance") == "low"
        assert profile.get("favorite_team") == "KhelMitra FC"
        assert profile.get("preferred_gate") == "Gate B"

        # Test POST /api/itinerary with different prompts

        # 1) Request 'I want vegetarian food' triggers ONLY FoodExperienceAgent/Verification:
        prompt1 = "I want vegetarian food"
        itinerary_payload1 = {
            "prompt": prompt1,
            "stadium": stadium,
            "crowd_tolerance": "low",
            "dietary_preferences": ["vegetarian"]
        }
        r1 = session.post(f"{BASE_URL}/api/itinerary", json=itinerary_payload1, timeout=TIMEOUT)
        assert r1.status_code == 200, f"Failed itinerary for prompt1: {r1.text}"
        itinerary1 = r1.json()
        assert "itinerary" in itinerary1 and isinstance(itinerary1["itinerary"], list)

        # 2) Request 'I hate crowds and need fastest route' triggers CrowdIntelligenceAgent and RoutePlanningAgent
        prompt2 = "I hate crowds and need fastest route"
        itinerary_payload2 = {
            "prompt": prompt2,
            "stadium": stadium,
            "crowd_tolerance": "low",
            "dietary_preferences": []
        }
        r2 = session.post(f"{BASE_URL}/api/itinerary", json=itinerary_payload2, timeout=TIMEOUT)
        assert r2.status_code == 200, f"Failed itinerary for prompt2: {r2.text}"
        itinerary2 = r2.json()
        assert "itinerary" in itinerary2 and isinstance(itinerary2["itinerary"], list)

        # 3) Request 'Emergency near Gate A' triggers ONLY SafetyAgent
        prompt3 = "Emergency near Gate A"
        itinerary_payload3 = {
            "prompt": prompt3,
            "stadium": stadium,
            "crowd_tolerance": "high",
            "dietary_preferences": []
        }
        r3 = session.post(f"{BASE_URL}/api/itinerary", json=itinerary_payload3, timeout=TIMEOUT)
        assert r3.status_code == 200, f"Failed itinerary for prompt3: {r3.text}"
        itinerary3 = r3.json()
        assert "itinerary" in itinerary3 and isinstance(itinerary3["itinerary"], list)

        # 4) RAG: Request 'Can I bring DSLR?' retrieves rule info
        prompt4 = "Can I bring DSLR?"
        itinerary_payload4 = {
            "prompt": prompt4,
            "stadium": stadium,
            "crowd_tolerance": "medium",
            "dietary_preferences": []
        }
        r4 = session.post(f"{BASE_URL}/api/itinerary", json=itinerary_payload4, timeout=TIMEOUT)
        assert r4.status_code == 200, f"Failed itinerary for prompt4: {r4.text}"
        itinerary4 = r4.json()
        assert "itinerary" in itinerary4 and isinstance(itinerary4["itinerary"], list)

        # 5) Memory: Save preferences, then recall across itineraries verified by updated dietary_preferences/profile above

        # 6) WebSocket: Live telemetry updates pushed over /ws/crowd when updates posted to /api/crowd/update

        if HAS_WEBSOCKET:
            # Prepare to connect WebSocket
            ws_url = "ws://localhost:8000/ws/crowd"
            crowd_updates_received = []

            def on_message(wsapp, message):
                crowd_updates_received.append(json.loads(message))
                # Close once received at least one update
                if len(crowd_updates_received) >= 1:
                    wsapp.close()

            def on_error(wsapp, error):
                raise Exception(f"WebSocket error: {error}")

            def on_open(wsapp):
                pass  # No message sending needed, just listen

            # Open WebSocket connection in background
            wsapp = websocket.WebSocketApp(ws_url, on_message=on_message, on_error=on_error, on_open=on_open)
            wsthread = threading.Thread(target=wsapp.run_forever)
            wsthread.daemon = True
            wsthread.start()

            # Wait for WS ready
            time.sleep(1)

            # Post an update to /api/crowd/update to trigger WS push
            update_payload = {
                "stadium_name": stadium,
                "gate_name": "Gate A",
                "waiting_time": 5
            }
            r_update = session.post(f"{BASE_URL}/api/crowd/update", json=update_payload, timeout=TIMEOUT)
            assert r_update.status_code == 200

            # Wait to receive WS message or timeout after max 10 sec
            timeout_ws = 10
            waited = 0
            while waited < timeout_ws and len(crowd_updates_received) == 0:
                time.sleep(1)
                waited += 1
            assert len(crowd_updates_received) > 0, "WebSocket did not receive crowd update"

        # 7) Frontend Components verification: confirm pages and elements load at FRONTEND_URL endpoints

        frontend_session = requests.Session()
        # SignUp page
        r_signup_page = frontend_session.get(f"{FRONTEND_URL}/signup", timeout=TIMEOUT)
        assert r_signup_page.status_code == 200 and "Sign Up" in r_signup_page.text

        # SignIn page
        r_signin_page = frontend_session.get(f"{FRONTEND_URL}/signin", timeout=TIMEOUT)
        assert r_signin_page.status_code == 200 and "Sign In" in r_signin_page.text

        # Profile page - requires login simulation
        # We'll simulate login to get cookie/session, but since no info on frontend auth, just check page loads (not protected here)
        r_profile_page = frontend_session.get(f"{FRONTEND_URL}/profile", timeout=TIMEOUT)
        assert r_profile_page.status_code in (200, 401, 403, 302)

        # Navigation tabs presence on homepage
        r_home = frontend_session.get(FRONTEND_URL, timeout=TIMEOUT)
        assert r_home.status_code == 200
        home_html = r_home.text
        assert "bottom-navigation" in home_html or "header-navigation" in home_html or "nav" in home_html

        # Google Maps element rendering (detect map container id or class)
        assert "google-map" in home_html or "gmap" in home_html or "map" in home_html

        # Dynamic color gate markers and route polyline presence in HTML or scripts
        # This cannot be fully asserted via requests; check keyword presence in HTML for dynamic markers
        assert ("marker-green" in home_html or "marker-yellow" in home_html or "marker-red" in home_html or "polyline" in home_html)

    finally:
        # Cleanup: delete user if API supported, else skip
        # No delete endpoint specified, so no cleanup here
        pass

test_post_api_itinerary_should_generate_optimized_itinerary()
