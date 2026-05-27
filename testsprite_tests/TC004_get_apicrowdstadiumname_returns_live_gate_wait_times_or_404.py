import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_get_apicrowdstadiumname_returns_live_gate_wait_times_or_404():
    valid_stadium = r"Wankhede Stadium Mumbai"
    unknown_stadium = r"Unknown Stadium XYZ"

    # Test valid stadium returns 200 and has expected keys/structure
    try:
        valid_response = requests.get(f"{BASE_URL}/api/crowd/{valid_stadium}", timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to valid stadium crowd endpoint failed: {e}"
    assert valid_response.status_code == 200, f"Expected 200 for valid stadium, got {valid_response.status_code}"
    try:
        valid_json = valid_response.json()
    except ValueError:
        assert False, "Response for valid stadium is not valid JSON"
    # Should contain gate wait times info, so check it's a dict and non-empty
    assert isinstance(valid_json, dict), "Expected crowd data response to be a dict"
    assert len(valid_json) > 0, "Expected crowd data dict to be non-empty for valid stadium"

    # Test unknown stadium returns 404 with appropriate error detail string
    try:
        unknown_response = requests.get(f"{BASE_URL}/api/crowd/{unknown_stadium}", timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to unknown stadium crowd endpoint failed: {e}"
    assert unknown_response.status_code == 404, f"Expected 404 for unknown stadium, got {unknown_response.status_code}"
    try:
        unknown_json = unknown_response.json()
    except ValueError:
        assert False, "Response for unknown stadium is not valid JSON"
    detail_str = unknown_json.get("detail", "")
    assert isinstance(detail_str, str), "Expected 'detail' field to be a string"
    assert detail_str.lower() != "", "'detail' string should not be empty for 404 response"

test_get_apicrowdstadiumname_returns_live_gate_wait_times_or_404()