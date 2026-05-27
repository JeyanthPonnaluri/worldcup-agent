import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_get_api_stadiums_should_return_list_of_stadiums():
    url = f"{BASE_URL}/api/stadiums"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    # Assert HTTP 200 status code
    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        json_data = response.json()
    except ValueError as e:
        assert False, f"Response is not valid JSON: {e}"

    # Assert response is a list (array)
    assert isinstance(json_data, list), f"Expected response to be a list but got {type(json_data)}"

    # Optional: Assert list is not empty to verify datastore reachable
    assert len(json_data) > 0, "Expected non-empty list of stadiums but got empty list"

test_get_api_stadiums_should_return_list_of_stadiums()