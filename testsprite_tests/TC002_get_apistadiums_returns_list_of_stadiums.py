import requests

BASE_ENDPOINT = "http://localhost:8000"
TIMEOUT = 30


def test_get_api_stadiums_returns_list_of_stadiums():
    url = f"{BASE_ENDPOINT}/api/stadiums"
    try:
        response = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to GET /api/stadiums failed: {e}"

    assert response.status_code == 200, f"Expected HTTP 200 but got {response.status_code}"

    try:
        json_response = response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"

    assert isinstance(json_response, list), f"Expected response to be a list but got {type(json_response)}"


test_get_api_stadiums_returns_list_of_stadiums()