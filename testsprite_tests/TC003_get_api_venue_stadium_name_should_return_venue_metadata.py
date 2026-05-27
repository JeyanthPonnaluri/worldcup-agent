import requests
import time

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://127.0.0.1:8000"
TIMEOUT = 30

def test_get_api_venue_stadium_name_should_return_venue_metadata():
    session = requests.Session()

    # Step 1: User Signup
    unique_suffix = str(int(time.time()))
    signup_payload = {
        "username": f"testuser_tc003_{unique_suffix}",
        "email": f"testuser_tc003_{unique_suffix}@example.com",
        "password": "TestPass123!",
        "dietary_preferences": ["vegetarian"],
        "crowd_tolerance": "medium",
        "favorite_team": "TeamA",
        "preferred_gate": "Gate1"
    }
    signup_resp = session.post(f"{BASE_URL}/auth/signup", json=signup_payload, timeout=TIMEOUT)
    assert signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"

    try:
        # Step 2: User Login
        login_payload = {
            "username": signup_payload["username"],
            "password": signup_payload["password"]
        }
        login_resp = session.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"

        login_json = login_resp.json()
        token = login_json.get("token") or login_json.get("access_token")
        assert token, "No JWT token received"
        headers_auth = {"Authorization": f"Bearer {token}"}

        # Step 3: Verify profile access with token
        profile_resp = session.get(f"{BASE_URL}/auth/profile", headers=headers_auth, timeout=TIMEOUT)
        assert profile_resp.status_code == 200, f"Profile access failed: {profile_resp.text}"

        # Step 4: Use GET /api/stadiums to get a valid stadium_name
        stadiums_resp = session.get(f"{BASE_URL}/api/stadiums", timeout=TIMEOUT)
        assert stadiums_resp.status_code == 200, f"Failed to get stadiums: {stadiums_resp.text}"
        stadiums = stadiums_resp.json()
        assert isinstance(stadiums, list) and len(stadiums) > 0, "No stadiums available"
        stadium_name = stadiums[0]

        # Step 5: GET /api/venue/{stadium_name} to retrieve venue metadata
        venue_resp = session.get(f"{BASE_URL}/api/venue/{stadium_name}", timeout=TIMEOUT)
        assert venue_resp.status_code == 200, f"Venue metadata fetch failed: {venue_resp.text}"
        venue_data = venue_resp.json()
        assert isinstance(venue_data, dict), "Venue data is not a dictionary"
        # Basic keys check: venue metadata and gate details expected keys
        assert "venue_name" in venue_data or "stadium_name" in venue_data or len(venue_data) > 0, "Venue metadata missing"
        assert "gates" in venue_data and isinstance(venue_data["gates"], list), "Gate details missing or invalid"

        # Step 6: Frontend integration checks via HTTP requests (simulate frontend page access)
        # Check SignIn page
        signin_page_resp = requests.get(f"{FRONTEND_URL}/signin", timeout=TIMEOUT)
        assert signin_page_resp.status_code == 200, "SignIn page not accessible"

        # Check SignUp page
        signup_page_resp = requests.get(f"{FRONTEND_URL}/signup", timeout=TIMEOUT)
        assert signup_page_resp.status_code == 200, "SignUp page not accessible"

        # Check Profile page requires auth - simulate with token in headers via frontend API call
        profile_page_resp = requests.get(f"{FRONTEND_URL}/profile", headers=headers_auth, timeout=TIMEOUT)
        assert profile_page_resp.status_code in {200, 302, 304}, "Profile page not accessible with auth"

        # Check bottom and header navigation tabs present in homepage
        homepage_resp = requests.get(f"{FRONTEND_URL}/", timeout=TIMEOUT)
        assert homepage_resp.status_code == 200, "Homepage not accessible"
        homepage_content = homepage_resp.text
        assert any(nav in homepage_content.lower() for nav in ["bottom navigation", "header navigation"]), \
            "Navigation tabs missing in homepage"

        # Check Google Maps element rendering: look for typical identifiers in homepage HTML (like div with id map)
        assert "google.maps" in homepage_content.lower() or 'id="map"' in homepage_content.lower(), \
            "Google Maps element not rendered in homepage"

        # Dynamic color gate markers checking is frontend JS behavior, simulate by checking relevant JS/CSS loaded
        assert "marker-green" in homepage_content.lower() or "marker-yellow" in homepage_content.lower() or "marker-red" in homepage_content.lower(), \
            "Dynamic gate color markers missing"

        # Route polylines presence (usually a JS object or canvas)
        assert "polyline" in homepage_content.lower(), "Route polylines not found in homepage content"

        # Step 7: Test Authentication Scenarios related to this test case - invalid credentials and missing token

        # Invalid login credentials (expect 401)
        invalid_login_payload = {
            "username": signup_payload["username"],
            "password": "WrongPass!"
        }
        invalid_login_resp = session.post(f"{BASE_URL}/auth/login", json=invalid_login_payload, timeout=TIMEOUT)
        assert invalid_login_resp.status_code == 401, "Invalid login did not return 401"

        # Access protected profile without token (expect 401)
        profile_no_token_resp = session.get(f"{BASE_URL}/auth/profile", timeout=TIMEOUT)
        assert profile_no_token_resp.status_code == 401, "Profile access without token did not return 401"

        # Logout the user
        logout_resp = session.post(f"{BASE_URL}/auth/logout", headers=headers_auth, timeout=TIMEOUT)
        assert logout_resp.status_code == 200, "Logout failed"

    finally:
        # Cleanup: Delete the test user if possible (assuming an API or leave as is due to no delete API)
        # No delete user endpoint specified, so we skip this.
        pass

test_get_api_venue_stadium_name_should_return_venue_metadata()
