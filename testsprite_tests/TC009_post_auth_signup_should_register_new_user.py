import requests
import uuid

BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 30

def post_auth_signup_should_register_new_user():
    # Generate unique user data to avoid duplicates
    unique_suffix = str(uuid.uuid4())[:8]
    username = f"testuser_{unique_suffix}"
    email = f"{username}@example.com"
    password = "StrongPass!123"
    signup_payload = {
        "username": username,
        "email": email,
        "password": password,
        "dietary_preferences": ["vegetarian", "gluten-free"],
        "crowd_tolerance": "medium",
        "favorite_team": "City Hawks",
        "preferred_gate": "Gate 5"
    }
    
    session = requests.Session()
    try:
        # 1. POST /auth/signup - Register new user
        signup_resp = session.post(
            f"{BASE_URL}/auth/signup",
            json=signup_payload,
            timeout=TIMEOUT
        )
        assert signup_resp.status_code == 200, f"Signup failed: {signup_resp.status_code} {signup_resp.text}"
        signup_data = signup_resp.json()
        assert "message" in signup_data or "success" in signup_data, "Missing success indication in signup response"
        
        # 2. POST /auth/login - Authenticate with new user credentials
        login_payload = {"username": username, "password": password}
        login_resp = session.post(
            f"{BASE_URL}/auth/login",
            json=login_payload,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code} {login_resp.text}"
        login_data = login_resp.json()
        assert "access_token" in login_data, "JWT token missing from login response"
        token = login_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. GET /auth/profile - Retrieve profile using JWT token
        profile_resp = session.get(
            f"{BASE_URL}/auth/profile",
            headers=headers,
            timeout=TIMEOUT
        )
        assert profile_resp.status_code == 200, f"Profile retrieval failed: {profile_resp.status_code} {profile_resp.text}"
        profile_data = profile_resp.json()
        
        assert profile_data.get("username") == username, "Profile username mismatch"
        assert profile_data.get("email") == email, "Profile email mismatch"
        # Compare dietary_preferences ignoring order
        assert set(profile_data.get("dietary_preferences", [])) == set(signup_payload["dietary_preferences"]), "Dietary preferences mismatch"
        assert profile_data.get("crowd_tolerance") == signup_payload["crowd_tolerance"], "Crowd tolerance mismatch"
        assert profile_data.get("favorite_team") == signup_payload["favorite_team"], "Favorite team mismatch"
        assert profile_data.get("preferred_gate") == signup_payload["preferred_gate"], "Preferred gate mismatch"
        
        # 4. POST /auth/logout - Logout session
        logout_resp = session.post(
            f"{BASE_URL}/auth/logout",
            headers=headers,
            timeout=TIMEOUT
        )
        assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.status_code} {logout_resp.text}"
        
        # 5. Validate that accessing profile without token returns 401
        profile_resp_unauth = session.get(
            f"{BASE_URL}/auth/profile",
            timeout=TIMEOUT
        )
        assert profile_resp_unauth.status_code == 401, f"Unauthorized profile access status: {profile_resp_unauth.status_code}"
        
        # 6. Validate login with invalid credentials returns 401
        invalid_login_resp = session.post(
            f"{BASE_URL}/auth/login",
            json={"username": username, "password": "WrongPass123"},
            timeout=TIMEOUT
        )
        assert invalid_login_resp.status_code == 401, f"Invalid login should return 401 but got {invalid_login_resp.status_code}"
        
    finally:
        # Cleanup: no direct deletion API was specified in PRD for users,
        # so typically a test environment DB reset or manual cleanup is expected.
        # If a delete or deactivate endpoint existed, it would be called here.
        pass

post_auth_signup_should_register_new_user()
