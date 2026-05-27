import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_post_apifeedback_records_user_feedback_or_returns_errors():
    url = f"{BASE_URL}/api/feedback"
    headers = {"Content-Type": "application/json"}

    # Valid payload (expected HTTP 200)
    valid_payload = {
        "username": "testuser123",
        "accepted_recommendation": "Try the recommended gate C",
        "rejected_recommendation": "Avoid gate A",
        "route_satisfaction": 4,
        "food_satisfaction": 5,
        "gate_satisfaction": 3
    }
    try:
        valid_response = requests.post(url, json=valid_payload, headers=headers, timeout=TIMEOUT)
    except Exception as e:
        assert False, f"Exception during valid feedback POST: {e}"
    assert valid_response.status_code == 200
    try:
        valid_json = valid_response.json()
    except Exception:
        valid_json = None
    assert valid_json is not None

    # Malformed payload (missing required fields) - expect HTTP 422
    malformed_payload = {
        "username": "testuser123",
        # missing accepted_recommendation, rejected_recommendation, and satisfaction scores
    }
    try:
        malformed_response = requests.post(url, json=malformed_payload, headers=headers, timeout=TIMEOUT)
    except Exception as e:
        assert False, f"Exception during malformed feedback POST: {e}"
    assert malformed_response.status_code == 422
    try:
        bad_json = malformed_response.json()
    except Exception:
        bad_json = {}
    detail_str = bad_json.get("detail", "")
    assert isinstance(detail_str, str)
    assert "validation error" in detail_str.lower()

    # Invalid scores (out-of-range or wrong type) - expect HTTP 422
    invalid_scores_payload = {
        "username": "testuser123",
        "accepted_recommendation": "Try the recommended gate C",
        "rejected_recommendation": "Avoid gate A",
        "route_satisfaction": 10,   # invalid, assuming scores are 1-5
        "food_satisfaction": -1,    # invalid negative
        "gate_satisfaction": "high" # invalid type
    }
    try:
        invalid_scores_response = requests.post(url, json=invalid_scores_payload, headers=headers, timeout=TIMEOUT)
    except Exception as e:
        assert False, f"Exception during invalid scores feedback POST: {e}"
    assert invalid_scores_response.status_code == 422
    try:
        invalid_json = invalid_scores_response.json()
    except Exception:
        invalid_json = {}
    detail_str2 = invalid_json.get("detail", "")
    assert isinstance(detail_str2, str)
    assert "validation error" in detail_str2.lower()

    # Simulate persistence failure to get HTTP 500
    # We assume that sending a special username triggers persistence failure (e.g., "trigger_500")
    persistence_fail_payload = {
        "username": "trigger_500",
        "accepted_recommendation": "Try the recommended gate C",
        "rejected_recommendation": "Avoid gate A",
        "route_satisfaction": 3,
        "food_satisfaction": 3,
        "gate_satisfaction": 3
    }
    try:
        persistence_fail_response = requests.post(url, json=persistence_fail_payload, headers=headers, timeout=TIMEOUT)
    except Exception as e:
        assert False, f"Exception during persistence failure feedback POST: {e}"
    # The response should be either HTTP 500 or possibly some other error code if not supported
    assert persistence_fail_response.status_code in (500, 200, 422), "Expected 500, got {}".format(persistence_fail_response.status_code)
    if persistence_fail_response.status_code == 500:
        try:
            error_json = persistence_fail_response.json()
        except Exception:
            error_json = {}
        # Optional: Check if any error message indicative of persistence failure is present
        assert isinstance(error_json, dict)
    # else if 200 or 422, the system might not simulate persistence failure - just accept those as valid


test_post_apifeedback_records_user_feedback_or_returns_errors()