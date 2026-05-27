import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_TC010_get_authprofile_retrieves_or_denies_access_to_user_profile():
    # Helper to create a user for testing
    def signup_user(username, email, password):
        signup_payload = {
            "username": username,
            "email": email,
            "password": password,
            "dietary_preferences": [],
            "crowd_tolerance": "medium",
            "favorite_team": "TestTeam",
            "preferred_gate": "GateA"
        }
        resp = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload, timeout=TIMEOUT)
        return resp

    # Helper to login user and return token
    def login_user(username, password):
        login_payload = {
            "username": username,
            "password": password
        }
        resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
        return resp

    # Generate unique username to avoid conflicts
    unique_id = str(uuid.uuid4()).replace("-", "")[:12]
    username = f"testuser_{unique_id}"
    email = f"{username}@example.com"
    password = "Password123!"

    # Sign up new user
    signup_resp = signup_user(username, email, password)
    assert signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"

    # Login to get valid token
    login_resp = login_user(username, password)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_json = login_resp.json()
    token = login_json.get("access_token") or login_json.get("token")
    assert isinstance(token, str) and token, "No JWT token returned in login response"

    headers_valid = {"Authorization": f"Bearer {token}"}

    try:
        # 1. GET /auth/profile with valid JWT token returns 200 and user profile details
        resp_valid = requests.get(f"{BASE_URL}/auth/profile", headers=headers_valid, timeout=TIMEOUT)
        assert resp_valid.status_code == 200, f"Expected 200 for valid token, got {resp_valid.status_code}"
        profile_data = resp_valid.json()
        assert isinstance(profile_data, dict), "Profile response is not a JSON object"
        assert profile_data.get("username") == username, "Returned profile username mismatch"

        # 2. GET /auth/profile without token returns 401
        resp_no_token = requests.get(f"{BASE_URL}/auth/profile", timeout=TIMEOUT)
        assert resp_no_token.status_code == 401, f"Expected 401 without token, got {resp_no_token.status_code}"
        err_json = resp_no_token.json()
        assert "detail" in err_json and isinstance(err_json["detail"], str)

        # 3. GET /auth/profile with invalid token returns 401
        headers_invalid = {"Authorization": "Bearer invalid_or_expired_token"}
        resp_invalid = requests.get(f"{BASE_URL}/auth/profile", headers=headers_invalid, timeout=TIMEOUT)
        assert resp_invalid.status_code == 401, f"Expected 401 for invalid token, got {resp_invalid.status_code}"
        err_json_invalid = resp_invalid.json()
        assert "detail" in err_json_invalid and isinstance(err_json_invalid["detail"], str)

        # 4. GET /auth/profile for a non-existent user returns 404
        headers_fake_user = {"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.fakeuserinvalidtoken"}

        resp_nonexistent = requests.get(f"{BASE_URL}/auth/profile", headers=headers_fake_user, timeout=TIMEOUT)
        assert resp_nonexistent.status_code in (401, 404), f"Expected 401 or 404 for non-existent user token, got {resp_nonexistent.status_code}"
        err_json_nonexistent = resp_nonexistent.json()
        assert "detail" in err_json_nonexistent and isinstance(err_json_nonexistent["detail"], str)

    finally:
        # Cleanup: no user deletion endpoint given in PRD; so user persists.
        pass

test_TC010_get_authprofile_retrieves_or_denies_access_to_user_profile()
