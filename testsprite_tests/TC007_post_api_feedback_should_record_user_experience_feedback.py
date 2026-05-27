import requests
import uuid

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://127.0.0.1:8000"
TIMEOUT = 30

def test_post_api_feedback_should_record_user_experience_feedback():
    # Step 1: Signup new user
    unique_id = str(uuid.uuid4())[:8]
    username = f"testuser_{unique_id}"
    email = f"{username}@example.com"
    password = "StrongP@ssw0rd!"
    signup_payload = {
        "username": username,
        "email": email,
        "password": password,
        "dietary_preferences": ["vegetarian"],
        "crowd_tolerance": "medium",
        "favorite_team": "The Eagles",
        "preferred_gate": "Gate 3"
    }
    signup_resp = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload, timeout=TIMEOUT)
    assert signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"

    try:
        # Step 2: Login with the new user to get JWT token
        login_payload = {"username": username, "password": password}
        login_resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json().get("access_token")
        assert token and isinstance(token, str), "JWT token missing or invalid"

        headers = {"Authorization": f"Bearer {token}"}

        # Backend test: POST /api/feedback with required fields and valid scores
        feedback_payload = {
            "username": username,
            "accepted_recommendation": "Try the vegetarian pasta",
            "rejected_recommendation": "Avoid the spicy wings",
            "route_satisfaction": 4,
            "food_satisfaction": 5,
            "gate_satisfaction": 3
        }
        feedback_resp = requests.post(f"{BASE_URL}/api/feedback", json=feedback_payload, timeout=TIMEOUT)
        assert feedback_resp.status_code == 200, f"Feedback POST failed: {feedback_resp.text}"
        resp_json = feedback_resp.json()
        assert isinstance(resp_json, dict), "Response JSON should be an object"
        assert "message" in resp_json or "status" in resp_json, "Expected confirmation message or status in response"

        # Frontend integration checks:
        # Verify SignIn page reachable
        signin_page = requests.get(f"{FRONTEND_URL}/signin", timeout=TIMEOUT)
        assert signin_page.status_code == 200, "Frontend signin page not reachable"

        # Verify SignUp page reachable
        signup_page = requests.get(f"{FRONTEND_URL}/signup", timeout=TIMEOUT)
        assert signup_page.status_code == 200, "Frontend signup page not reachable"

        # Verify Profile page requires authentication (should redirect or 401 without token)
        profile_resp_no_auth = requests.get(f"{FRONTEND_URL}/profile", timeout=TIMEOUT, allow_redirects=False)
        assert profile_resp_no_auth.status_code in {401, 302, 303}, "Profile page accessible without auth token (shouldn't)"

        # Login frontend simulation to get auth cookie or token (simulate frontend login)
        # Here assume front uses same token header or cookies, we just check backend profile API
        profile_api_resp = requests.get(f"{BASE_URL}/auth/profile", headers=headers, timeout=TIMEOUT)
        assert profile_api_resp.status_code == 200, f"Profile retrieval failed: {profile_api_resp.text}"
        profile_data = profile_api_resp.json()
        assert profile_data.get("username") == username, "Profile username mismatch"

        # Verify bottom and header navigation tabs (simulated by checking main frontend page)
        main_page = requests.get(FRONTEND_URL, timeout=TIMEOUT)
        assert main_page.status_code == 200, "Frontend main page access failed"
        main_page_text = main_page.text.lower()
        assert "nav" in main_page_text or "navigation" in main_page_text, "Navigation elements likely missing"

        # Verify Google Maps element rendering by checking frontend page contains Google Maps script or div
        maps_present = ("maps.googleapis.com" in main_page_text or "google maps" in main_page_text)
        assert maps_present, "Google Maps element not found on main frontend page"

        # Dynamic color gate markers and route polyline presence cannot be fully tested via pure backend HTTP, 
        # but verify some related keywords exist as proxy
        assert any(x in main_page_text for x in ["green marker", "yellow marker", "red marker", "route polyline"]),\
            "Expected dynamic color gate markers or route polyline indication missing in frontend HTML"

    finally:
        # Cleanup: Optionally, if there's a user deletion API, invoke it here
        # We do not have a delete user endpoint stated, so cleanup is limited to logout

        # Logout session
        try:
            logout_resp = requests.post(f"{BASE_URL}/auth/logout", headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
            assert logout_resp.status_code == 200, "Logout failed"
        except Exception:
            pass

test_post_api_feedback_should_record_user_experience_feedback()
