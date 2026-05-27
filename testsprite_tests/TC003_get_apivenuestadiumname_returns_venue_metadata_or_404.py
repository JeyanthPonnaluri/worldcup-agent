import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_TC003_get_apivenuestadiumname_returns_venue_metadata_or_404():
    valid_stadium_name = r"Wankhede Stadium Mumbai"
    invalid_stadium_name = r"Unknown Stadium"

    headers = {"Accept": "application/json"}

    # Test with valid stadium name - expect HTTP 200 and venue metadata
    try:
        response_valid = requests.get(f"{BASE_URL}/api/venue/{valid_stadium_name}", headers=headers, timeout=TIMEOUT)
        assert response_valid.status_code == 200, f"Expected 200 for valid stadium, got {response_valid.status_code}"
        json_valid = response_valid.json()
        assert isinstance(json_valid, dict), f"Expected dict response for valid stadium, got {type(json_valid)}"
        # Basic keys check for venue metadata presence
        assert "gates" in json_valid or "stadium" in json_valid or len(json_valid.keys()) > 0, "Venue metadata keys missing"
    except requests.RequestException as e:
        assert False, f"Request failed for valid stadium name: {e}"

    # Test with invalid stadium name - expect HTTP 404 and an object with detail
    try:
        response_invalid = requests.get(f"{BASE_URL}/api/venue/{invalid_stadium_name}", headers=headers, timeout=TIMEOUT)
        assert response_invalid.status_code == 404, f"Expected 404 for unknown stadium, got {response_invalid.status_code}"
        json_invalid = response_invalid.json()
        assert isinstance(json_invalid, dict), f"Expected dict response for invalid stadium, got {type(json_invalid)}"
        detail_str = json_invalid.get("detail", "")
        assert isinstance(detail_str, str), "detail field should be a string"
        assert "not found" in detail_str.lower() or "unknown" in detail_str.lower() or "404" in detail_str.lower(), \
            "Error detail should indicate not found for invalid stadium"
    except requests.RequestException as e:
        assert False, f"Request failed for invalid stadium name: {e}"

test_TC003_get_apivenuestadiumname_returns_venue_metadata_or_404()