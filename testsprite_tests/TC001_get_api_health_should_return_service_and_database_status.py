import requests

BASE_ENDPOINT = "http://127.0.0.1:8000"
TIMEOUT = 30


def test_get_api_health_should_return_service_and_database_status():
    url = f"{BASE_ENDPOINT}/api/health"
    try:
        response = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to /api/health failed with exception: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, dict), "Response JSON is not an object"


test_get_api_health_should_return_service_and_database_status()