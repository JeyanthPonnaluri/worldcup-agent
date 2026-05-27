import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def post_auth_login_should_authenticate_and_issue_jwt_token():
    # Generate unique user info for signup to avoid duplication
    unique_suffix = str(uuid.uuid4())[:8]
    signup_data = {
        "username": f"testuser_{unique_suffix}",
        "email": f"testuser_{unique_suffix}@example.com",
        "password": "StrongP@ssw0rd!",
        "dietary_preferences": ["vegetarian"],
        "crowd_tolerance": "medium",
        "favorite_team": "Team A",
        "preferred_gate": "Gate 1"
    }
    signup_url = f"{BASE_URL}/auth/signup"
    login_url = f"{BASE_URL}/auth/login"
    logout_url = f"{BASE_URL}/auth/logout"
    profile_url = f"{BASE_URL}/auth/profile"

    token = None

    try:
        # 1. Signup
        resp_signup = requests.post(signup_url, json=signup_data, timeout=TIMEOUT)
        assert resp_signup.status_code == 200, f"Signup failed: {resp_signup.text}"
        signup_resp_json = resp_signup.json()
        # Basic signup success validation
        assert isinstance(signup_resp_json, dict), "Signup response not a JSON object"

        # 2. Login with valid credentials
        login_data = {
            "username": signup_data["username"],
            "password": signup_data["password"]
        }
        resp_login = requests.post(login_url, json=login_data, timeout=TIMEOUT)
        assert resp_login.status_code == 200, f"Login failed: {resp_login.text}"
        login_resp_json = resp_login.json()
        # Adjusted to look for 'access_token' key, as commonly used for JWT
        assert "access_token" in login_resp_json, "JWT token missing in login response"
        token = login_resp_json["access_token"]

        # 3. Access profile with valid token
        headers_auth = {"Authorization": f"Bearer {token}"}
        resp_profile = requests.get(profile_url, headers=headers_auth, timeout=TIMEOUT)
        assert resp_profile.status_code == 200, f"Profile access failed: {resp_profile.text}"
        profile_json = resp_profile.json()
        assert profile_json.get("username") == signup_data["username"], "Profile username mismatch"

        # 4. Logout session
        resp_logout = requests.post(logout_url, headers=headers_auth, timeout=TIMEOUT)
        assert resp_logout.status_code == 200, f"Logout failed: {resp_logout.text}"

        # 5. Invalid credentials login should fail with 401
        invalid_login_data = {
            "username": signup_data["username"],
            "password": "WrongPassword123!"
        }
        resp_invalid_login = requests.post(login_url, json=invalid_login_data, timeout=TIMEOUT)
        assert resp_invalid_login.status_code == 401, f"Invalid login did not fail as expected: {resp_invalid_login.text}"

        # 6. Profile access missing token should return 401
        resp_profile_no_token = requests.get(profile_url, timeout=TIMEOUT)
        assert resp_profile_no_token.status_code == 401, f"Profile access without token did not fail as expected: {resp_profile_no_token.text}"

    finally:
        if token:
            # Attempt logout again in case still logged in (ignore failures)
            try:
                requests.post(logout_url, headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
            except Exception:
                pass
        # Cleanup: delete the user if an endpoint existed for that purpose (not specified here)
        # So no direct cleanup action can be done for user deletion

post_auth_login_should_authenticate_and_issue_jwt_token()
