import requests
import uuid
import string
import random


BASE_URL = "http://localhost:8000"
TIMEOUT = 30


def random_string(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def test_post_authsignup_registers_user_or_returns_error():
    url = f"{BASE_URL}/auth/signup"
    # Prepare unique user data to avoid duplication issues in creation
    unique_suffix = uuid.uuid4().hex[:8]
    user_data = {
        "username": f"testuser_{unique_suffix}",
        "email": f"testuser_{unique_suffix}@example.com",
        "password": "StrongPassw0rd!",
        "dietary_preferences": ["vegetarian", "gluten-free"],
        "crowd_tolerance": "medium",
        "favorite_team": "Mumbai Indians",
        "preferred_gate": "Gate A"
    }

    headers = {"Content-Type": "application/json"}

    # First attempt: valid user registration should succeed
    response = requests.post(url, json=user_data, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Expected 200 OK on valid signup, got {response.status_code}"
    json_data = response.json()
    assert isinstance(json_data, dict), "Response is not a JSON object"

    # Second attempt: duplicate registration should return 400 with "duplicate" in detail
    dup_response = requests.post(url, json=user_data, headers=headers, timeout=TIMEOUT)
    assert dup_response.status_code == 400, f"Expected 400 on duplicate signup, got {dup_response.status_code}"
    dup_json = dup_response.json()
    detail = dup_json.get("detail", "")
    assert "duplicate" in detail.lower(), f'Duplicate error detail missing "duplicate": {detail}'

    # Third attempt: invalid payload (missing required fields)
    invalid_payload = {
        "username": "",
        "email": "invalid-email",  # Not a valid email format likely to trigger validation error
        "password": "123",  # Weak password possibly failing validation
        "dietary_preferences": "not-an-array",  # Invalid type, expected array
        "crowd_tolerance": 123,  # Wrong type, expected string
        # missing favorite_team and preferred_gate
    }
    bad_response = requests.post(url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
    assert bad_response.status_code == 400, f"Expected 400 on invalid payload, got {bad_response.status_code}"
    bad_json = bad_response.json()
    detail = bad_json.get("detail", "")
    assert isinstance(detail, str), "Validation error detail is not a string"
    assert detail.lower().startswith("validation error") or "validation" in detail.lower() or detail.strip() != "", (
        f"Expected validation error detail, got: {detail}"
    )


test_post_authsignup_registers_user_or_returns_error()