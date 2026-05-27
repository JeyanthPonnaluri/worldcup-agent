import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_post_api_itinerary_optimized_or_errors():
    url = f"{BASE_URL}/api/itinerary"
    headers = {"Content-Type": "application/json"}

    # Valid payload - expect 200 with optimized itinerary
    valid_payload = {
        "prompt": "Plan an optimized match-day itinerary for my visit",
        "stadium": "Wankhede Stadium Mumbai",
        "crowd_tolerance": "medium",
        "dietary_preferences": ["vegetarian"]
    }

    response = requests.post(url, json=valid_payload, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Expected 200 but got {response.status_code} for valid input"
    json_resp = response.json()
    assert isinstance(json_resp, dict), "Response should be a JSON object"
    # We expect some optimized itinerary keys; since schema not detailed, check keys existence
    assert "itinerary" in json_resp or "recommendations" in json_resp, "Response missing expected keys"

    # Invalid inputs that should cause 422 or 500 error
    invalid_payloads = [
        # Empty strings for required fields
        {"prompt": "", "stadium": "Wankhede Stadium Mumbai", "crowd_tolerance": "medium", "dietary_preferences": []},
        {"prompt": "Valid prompt", "stadium": "", "crowd_tolerance": "medium", "dietary_preferences": []},
        {"prompt": "Valid prompt", "stadium": "Wankhede Stadium Mumbai", "crowd_tolerance": "", "dietary_preferences": []},
        # Missing prompt
        {"stadium": "Wankhede Stadium Mumbai", "crowd_tolerance": "medium", "dietary_preferences": []},
        # Missing stadium
        {"prompt": "Valid prompt", "crowd_tolerance": "medium", "dietary_preferences": []},
        # Missing crowd_tolerance
        {"prompt": "Valid prompt", "stadium": "Wankhede Stadium Mumbai", "dietary_preferences": []},
        # dietary_preferences as empty string (invalid type)
        {"prompt": "Valid prompt", "stadium": "Wankhede Stadium Mumbai", "crowd_tolerance": "medium", "dietary_preferences": ""},
    ]

    for ipayload in invalid_payloads:
        r = requests.post(url, json=ipayload, headers=headers, timeout=TIMEOUT)
        assert r.status_code in (422, 500), f"Expected 422 or 500 but got {r.status_code} for payload: {ipayload}"
        try:
            err_json = r.json()
            # According to instructions, detail field is a string we can .lower()
            detail = err_json.get("detail", "")
            assert isinstance(detail, str), "Error detail field should be a string"
            assert "validation error" in detail.lower() or "error" in detail.lower() or "fail" in detail.lower() or detail.strip() != "", \
                "Error detail string should mention validation or failure"
        except Exception:
            # If no JSON or parse error, just continue as 422/500 was returned
            pass


test_post_api_itinerary_optimized_or_errors()