import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_post_api_crowd_update_updates_crowd_wait_times_or_errors():
    url = f"{BASE_URL}/api/crowd/update"
    
    # Valid update data (using known valid stadium and gate name)
    valid_data = {
        "stadium_name": "Wankhede Stadium Mumbai",
        "gate_name": "North Gate",
        "waiting_time": 15
    }

    # Invalid waiting_time data (missing waiting_time)
    invalid_waiting_time_data = {
        "stadium_name": "Wankhede Stadium Mumbai",
        "gate_name": "North Gate"
        # waiting_time missing
    }

    # Invalid waiting_time data (waiting_time is None)
    invalid_waiting_time_data_null = {
        "stadium_name": "Wankhede Stadium Mumbai",
        "gate_name": "North Gate",
        "waiting_time": None
    }

    # Unknown stadium name
    unknown_stadium_data = {
        "stadium_name": "Unknown Stadium",
        "gate_name": "Some Gate",
        "waiting_time": 10
    }

    headers = {"Content-Type": "application/json"}

    # Test valid update returns HTTP 200 with confirmation
    resp = requests.post(url, json=valid_data, headers=headers, timeout=TIMEOUT)
    try:
        resp_json = resp.json()
    except ValueError:
        resp_json = {}
    assert resp.status_code == 200, f"Expected 200 for valid update, got {resp.status_code}"
    # Confirm update was applied (check response content that indicates success)
    # We only assert HTTP 200 as per spec, no body schema mandated. But we can check body is object.
    assert isinstance(resp_json, dict), "Response JSON should be an object for valid update"

    # Test invalid or missing waiting_time returns HTTP 422
    resp_invalid_missing = requests.post(url, json=invalid_waiting_time_data, headers=headers, timeout=TIMEOUT)
    try:
        error_json = resp_invalid_missing.json()
    except ValueError:
        error_json = {}
    assert resp_invalid_missing.status_code == 422, f"Expected 422 for missing waiting_time, got {resp_invalid_missing.status_code}"

    resp_invalid_null = requests.post(url, json=invalid_waiting_time_data_null, headers=headers, timeout=TIMEOUT)
    try:
        error_null_json = resp_invalid_null.json()
    except ValueError:
        error_null_json = {}
    assert resp_invalid_null.status_code == 422, f"Expected 422 for null waiting_time, got {resp_invalid_null.status_code}"

    # Test unknown stadium returns HTTP 404
    resp_unknown = requests.post(url, json=unknown_stadium_data, headers=headers, timeout=TIMEOUT)
    try:
        unknown_json = resp_unknown.json()
    except ValueError:
        unknown_json = {}
    assert resp_unknown.status_code == 404, f"Expected 404 for unknown stadium, got {resp_unknown.status_code}"
    # The response JSON is an object per spec
    assert isinstance(unknown_json, dict), "Response JSON should be an object for unknown stadium error"

test_post_api_crowd_update_updates_crowd_wait_times_or_errors()