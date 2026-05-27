import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_tc001_get_apihealth_returns_service_and_database_status():
    url = f"{BASE_URL}/api/health"
    try:
        response = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to /api/health failed with exception: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    assert isinstance(json_data, dict), f"Expected JSON object, got {type(json_data)}"

    # Since PRD does not specify exact keys, just check the response has keys
    assert len(json_data) > 0, "Response JSON should contain keys indicating service status"

test_tc001_get_apihealth_returns_service_and_database_status()
