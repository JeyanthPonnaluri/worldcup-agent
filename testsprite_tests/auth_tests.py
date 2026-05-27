import requests
import json
import os
import sys
import random

BACKEND_URL = "http://127.0.0.1:8000"

results = []

def record_result(name, passed, details):
    results.append({
        "name": name,
        "passed": passed,
        "details": details
    })

def run_tests():
    print("Running Authentication & Session API Tests...")

    # Define test user credentials
    username = "test_scout"
    email = "scout@khelmitra.ai"
    password = "SecurePassword123"

    # 1. SignUp Test (POST /auth/signup)
    try:
        rand_suffix = random.randint(1000, 9999)
        test_username = f"{username}_{rand_suffix}"
        test_email = f"scout_{rand_suffix}@khelmitra.ai"
        
        payload = {
            "username": test_username,
            "email": test_email,
            "password": password,
            "dietary_preferences": ["vegetarian"],
            "crowd_tolerance": "low",
            "favorite_team": "IND",
            "preferred_gate": "VIP Gate"
        }
        r = requests.post(f"{BACKEND_URL}/auth/signup", json=payload)
        passed = r.status_code == 200 and r.json().get("status") == "success"
        record_result("Sign Up Test (Valid Data)", passed, f"Status: {r.status_code}, Response: {r.text.strip()}")
    except Exception as e:
        record_result("Sign Up Test (Valid Data)", False, str(e))

    # 2. LogIn Test (POST /auth/login)
    token = None
    try:
        payload = {
            "username": test_username,
            "password": password
        }
        r = requests.post(f"{BACKEND_URL}/auth/login", json=payload)
        data = r.json()
        passed = r.status_code == 200 and "access_token" in data
        if passed:
            token = data["access_token"]
        record_result("Log In Test (Valid Credentials)", passed, f"Status: {r.status_code}, Token generated: {bool(token)}")
    except Exception as e:
        record_result("Log In Test (Valid Credentials)", False, str(e))

    # 3. Invalid Credentials Test (POST /auth/login with wrong password)
    try:
        payload = {
            "username": test_username,
            "password": "WrongPassword!"
        }
        r = requests.post(f"{BACKEND_URL}/auth/login", json=payload)
        passed = r.status_code == 401
        record_result("Invalid Credentials Test (Wrong Password)", passed, f"Status: {r.status_code}, Expected: 401")
    except Exception as e:
        record_result("Invalid Credentials Test (Wrong Password)", False, str(e))

    # 4. Protected Route Test (GET /auth/profile)
    # 4a. With valid token
    try:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        r = requests.get(f"{BACKEND_URL}/auth/profile", headers=headers)
        data = r.json()
        passed = r.status_code == 200 and data.get("username") == test_username
        record_result("Protected Route Test (Valid Token)", passed, f"Status: {r.status_code}, Username matched: {data.get('username') == test_username}")
    except Exception as e:
        record_result("Protected Route Test (Valid Token)", False, str(e))

    # 4b. With missing token
    try:
        r = requests.get(f"{BACKEND_URL}/auth/profile")
        passed = r.status_code == 401
        record_result("Protected Route Test (Missing Token)", passed, f"Status: {r.status_code}, Expected: 401")
    except Exception as e:
        record_result("Protected Route Test (Missing Token)", False, str(e))

    # Generate final report
    print("\n" + "="*50)
    print("AUTH TEST EXECUTION RESULTS")
    print("="*50)
    failures = [r for r in results if not r["passed"]]
    passed_count = len(results) - len(failures)
    
    print(f"Total Tests Executed: {len(results)}")
    print(f"Passed: {passed_count}")
    print(f"Failed: {len(failures)}")
    print("-"*50)
    
    for r in results:
        status_str = "PASS" if r["passed"] else "FAIL"
        print(f"- {r['name']}: [{status_str}] ({r['details']})")
    print("="*50)

    if failures:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
