import requests
import time


BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_post_authlogin_authenticates_user_or_returns_unauthorized():
    signup_url = f"{BASE_URL}/auth/signup"
    login_url = f"{BASE_URL}/auth/login"
    headers = {"Content-Type": "application/json"}

    # Test user data
    user_data = {
        "username": "testuser_tc009",
        "email": "testuser_tc009@example.com",
        "password": "StrongPass123!",
        "dietary_preferences": ["vegetarian"],
        "crowd_tolerance": "medium",
        "favorite_team": "Test Team",
        "preferred_gate": "Gate 1"
    }

    # First create the user to have valid credentials for login test
    try:
        signup_resp = requests.post(signup_url, json=user_data, headers=headers, timeout=TIMEOUT)
        # If user exists, signup might return 400, but accept 200 or 400 as okay here for test continuation
        assert signup_resp.status_code in (200, 400)

        # Valid login test
        login_payload = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Expected 200 for valid login, got {login_resp.status_code}"
        json_resp = login_resp.json()
        assert "token" in json_resp or "access_token" in json_resp, "Response JSON should contain JWT token"

        # Invalid username test
        invalid_username_payload = {
            "username": "nonexistentuser12345",
            "password": user_data["password"]
        }
        invalid_user_resp = requests.post(login_url, json=invalid_username_payload, headers=headers, timeout=TIMEOUT)
        assert invalid_user_resp.status_code == 401, f"Expected 401 for invalid username, got {invalid_user_resp.status_code}"

        # Invalid password test
        invalid_password_payload = {
            "username": user_data["username"],
            "password": "WrongPass!234"
        }
        invalid_pass_resp = requests.post(login_url, json=invalid_password_payload, headers=headers, timeout=TIMEOUT)
        assert invalid_pass_resp.status_code == 401, f"Expected 401 for invalid password, got {invalid_pass_resp.status_code}"

    finally:
        # Cleanup: Delete the created user if API supports it (not specified in PRD, so omitted).
        # If there was a logout endpoint that required token, it could be called here.
        pass


test_post_authlogin_authenticates_user_or_returns_unauthorized()