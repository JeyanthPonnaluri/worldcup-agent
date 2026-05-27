import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_get_api_venue_stadium_name_should_return_404_for_unknown_stadium():
    unknown_stadium_name = "unknown_stadium_12345"
    url = f"{BASE_URL}/api/venue/{unknown_stadium_name}"
    try:
        response = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"

    assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"
    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check that the error payload contains 'venue-not-found' indication (key or message)
    # The exact payload schema for 404 is not strictly defined, but typical would be an error message.
    assert isinstance(json_data, dict), "Expected JSON object in response"
    error_keys = {'error', 'message', 'detail', 'code'}
    assert any(key in json_data for key in error_keys), "No error message key in JSON response"
    # Check that the error message or code contains 'venue-not-found'
    error_text = ""
    for key in error_keys:
        if key in json_data and isinstance(json_data[key], str):
            error_text = json_data[key].lower()
            break
    assert "venue-not-found" in error_text or "not found" in error_text or "venue" in error_text, \
        f"Error message does not indicate 'venue-not-found': {json_data}"

test_get_api_venue_stadium_name_should_return_404_for_unknown_stadium()