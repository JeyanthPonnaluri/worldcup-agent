import requests
import json
import asyncio
import websockets
import os
import re

BACKEND_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000"

results = []

def record_result(category, name, passed, details):
    results.append({
        "category": category,
        "name": name,
        "passed": passed,
        "details": details
    })

# =====================================================================
# 1. Backend API Tests
# =====================================================================
def run_api_tests():
    print("Running Backend API Tests...")
    
    # GET /api/crowd/{stadium_name}
    try:
        r = requests.get(f"{BACKEND_URL}/api/crowd/Wankhede Stadium Mumbai")
        if r.status_code == 200:
            data = r.json()
            # Validate schema
            has_gates = all(gate in data for gate in ["Gate A", "Gate B", "VIP Gate"])
            passed = has_gates and isinstance(data, dict)
            details = f"Status: 200. Returned Gates: {list(data.keys())}" if passed else f"Schema mismatch: {data}"
            record_result("Backend API", "GET /api/crowd (Valid Stadium)", passed, details)
        else:
            record_result("Backend API", "GET /api/crowd (Valid Stadium)", False, f"HTTP {r.status_code}")
    except Exception as e:
        record_result("Backend API", "GET /api/crowd (Valid Stadium)", False, str(e))

    # GET /api/crowd/{stadium_name} Invalid input
    try:
        r = requests.get(f"{BACKEND_URL}/api/crowd/Nonexistent Stadium")
        passed = r.status_code == 404
        record_result("Backend API", "GET /api/crowd (Invalid Stadium)", passed, f"Status: {r.status_code}, expected 404")
    except Exception as e:
        record_result("Backend API", "GET /api/crowd (Invalid Stadium)", False, str(e))

    # GET /api/venue/{stadium_name}
    try:
        r = requests.get(f"{BACKEND_URL}/api/venue/Wankhede Stadium Mumbai")
        if r.status_code == 200:
            data = r.json()
            has_fields = "stadium_name" in data and "gates" in data and "city" in data
            record_result("Backend API", "GET /api/venue (Valid Venue)", has_fields, f"Stadium: {data.get('stadium_name')}, Gates Count: {len(data.get('gates', []))}")
        else:
            record_result("Backend API", "GET /api/venue (Valid Venue)", False, f"HTTP {r.status_code}")
    except Exception as e:
        record_result("Backend API", "GET /api/venue (Valid Venue)", False, str(e))

    # POST /api/feedback
    try:
        payload = {
            "username": "Alex",
            "accepted_recommendation": "VIP Gate",
            "rejected_recommendation": "Gate A",
            "route_satisfaction": 5,
            "food_satisfaction": 4,
            "gate_satisfaction": 5
        }
        r = requests.post(f"{BACKEND_URL}/api/feedback", json=payload)
        passed = r.status_code == 200 and r.json().get("status") == "success"
        record_result("Backend API", "POST /api/feedback (Valid Input)", passed, f"Status: {r.status_code}, Response: {r.text.strip()}")
    except Exception as e:
        record_result("Backend API", "POST /api/feedback (Valid Input)", False, str(e))

    # POST /api/feedback Invalid input handling (rating out of bounds / string when int expected)
    try:
        payload = {
            "username": "Alex",
            "accepted_recommendation": "VIP Gate",
            "route_satisfaction": "not_an_int" # invalid type
        }
        r = requests.post(f"{BACKEND_URL}/api/feedback", json=payload)
        # FastAPI validation error is 422
        passed = r.status_code == 422
        record_result("Backend API", "POST /api/feedback (Invalid Input Handling)", passed, f"Status: {r.status_code}, expected 422 validation error")
    except Exception as e:
        record_result("Backend API", "POST /api/feedback (Invalid Input Handling)", False, str(e))

# =====================================================================
# 2. Agent Workflow Tests
# =====================================================================
def run_agent_workflow_tests():
    print("Running Agent Workflow Tests...")

    # Test case: Vegetarian food only
    try:
        payload = {
            "prompt": "I want vegetarian food",
            "stadium": "Wankhede Stadium Mumbai",
            "crowd_tolerance": "medium",
            "dietary_preferences": ["vegetarian"]
        }
        r = requests.post(f"{BACKEND_URL}/api/itinerary", json=payload)
        if r.status_code == 200:
            res_data = r.json()
            itinerary = res_data.get("itinerary", "")
            
            # Check which verifications were run
            has_food = "Food Experience Verification" in itinerary
            has_crowd = "Crowd Intelligence Verification" in itinerary
            has_route = "Route Planning Verification" in itinerary
            
            passed = has_food and not has_crowd and not has_route
            details = f"Food Verification: {has_food}, Crowd: {has_crowd}, Route: {has_route}"
            record_result("Agent Workflow", "Input: 'I want vegetarian food' -> FoodExperienceAgent Only", passed, details)
        else:
            record_result("Agent Workflow", "Input: 'I want vegetarian food'", False, f"HTTP {r.status_code}")
    except Exception as e:
        record_result("Agent Workflow", "Input: 'I want vegetarian food'", False, str(e))

    # Test case: Crowd and route optimization
    try:
        payload = {
            "prompt": "I hate crowds and need fastest route",
            "stadium": "Wankhede Stadium Mumbai",
            "crowd_tolerance": "low",
            "dietary_preferences": []
        }
        r = requests.post(f"{BACKEND_URL}/api/itinerary", json=payload)
        if r.status_code == 200:
            res_data = r.json()
            itinerary = res_data.get("itinerary", "")
            
            has_food = "Food Experience Verification" in itinerary
            has_crowd = "Crowd Intelligence Verification" in itinerary
            has_route = "Route Planning Verification" in itinerary
            
            passed = has_crowd and has_route and not has_food
            details = f"Crowd Verification: {has_crowd}, Route: {has_route}, Food: {has_food}"
            record_result("Agent Workflow", "Input: 'I hate crowds...' -> Crowd & Route Agents Only", passed, details)
        else:
            record_result("Agent Workflow", "Input: 'I hate crowds...'", False, f"HTTP {r.status_code}")
    except Exception as e:
        record_result("Agent Workflow", "Input: 'I hate crowds...'", False, str(e))

    # Test case: Emergency
    try:
        payload = {
            "prompt": "Emergency near Gate A",
            "stadium": "Wankhede Stadium Mumbai",
            "crowd_tolerance": "medium",
            "dietary_preferences": []
        }
        r = requests.post(f"{BACKEND_URL}/api/itinerary", json=payload)
        if r.status_code == 200:
            res_data = r.json()
            itinerary = res_data.get("itinerary", "")
            
            has_safety = "Safety Verification" in itinerary
            has_food = "Food Experience Verification" in itinerary
            has_crowd = "Crowd Intelligence Verification" in itinerary
            
            passed = has_safety and not has_food and not has_crowd
            details = f"Safety Verification: {has_safety}, Food: {has_food}, Crowd: {has_crowd}"
            record_result("Agent Workflow", "Input: 'Emergency near Gate A' -> SafetyAgent Only", passed, details)
        else:
            record_result("Agent Workflow", "Input: 'Emergency near Gate A'", False, f"HTTP {r.status_code}")
    except Exception as e:
        record_result("Agent Workflow", "Input: 'Emergency near Gate A'", False, str(e))

# =====================================================================
# 3. RAG Tests
# =====================================================================
def run_rag_tests():
    print("Running RAG Tests...")
    try:
        payload = {
            "prompt": "Can I bring DSLR?",
            "stadium": "Wankhede Stadium Mumbai",
            "crowd_tolerance": "medium",
            "dietary_preferences": []
        }
        r = requests.post(f"{BACKEND_URL}/api/itinerary", json=payload)
        if r.status_code == 200:
            res_data = r.json()
            itinerary = res_data.get("itinerary", "")
            
            has_confidence = "Confidence" in itinerary
            has_sources = "Sources" in itinerary
            
            valid_sources = ["stadium_rules.txt", "faq.txt", "parking_info.txt", "transport_info.txt", "emergency_guidelines.txt"]
            has_any_source = any(src in itinerary for src in valid_sources)
            
            passed = has_confidence and has_sources and has_any_source
            details = f"Confidence Found: {has_confidence}, Sources Found: {has_sources}, Found any valid source: {has_any_source}"
            record_result("RAG Tests", "Input: 'Can I bring DSLR?' -> Retrieve from rules context", passed, details)
        else:
            record_result("RAG Tests", "Input: 'Can I bring DSLR?'", False, f"HTTP {r.status_code}")
    except Exception as e:
        record_result("RAG Tests", "Input: 'Can I bring DSLR?'", False, str(e))

# =====================================================================
# 4. Memory Tests
# =====================================================================
def run_memory_tests():
    print("Running Memory Tests...")
    try:
        # Step 1: Save vegetarian and low crowd preference by attending a match with these constraints
        payload1 = {
            "prompt": "I want vegetarian food and hate crowds",
            "stadium": "Wankhede Stadium Mumbai",
            "crowd_tolerance": "low",
            "dietary_preferences": ["vegetarian"]
        }
        r1 = requests.post(f"{BACKEND_URL}/api/itinerary", json=payload1)
        if r1.status_code != 200:
            record_result("Memory Tests", "Step 1: Save preferences", False, f"HTTP {r1.status_code}")
            return
            
        # Step 2: Query generic request "I am going to another match"
        payload2 = {
            "prompt": "I am going to another match",
            "stadium": "Narendra Modi Stadium Ahmedabad",
            "crowd_tolerance": "medium",  # default
            "dietary_preferences": []     # default (none)
        }
        r2 = requests.post(f"{BACKEND_URL}/api/itinerary", json=payload2)
        if r2.status_code == 200:
            res_data = r2.json()
            itinerary = res_data.get("itinerary", "")
            
            # Verify memory recall: Vegetarian dietary preference and Low crowd tolerance should be recalled
            recalled_veg = "Vegetarian" in itinerary or "veg" in itinerary.lower()
            recalled_low_crowd = "Low" in itinerary or "low" in itinerary.lower()
            
            passed = recalled_veg and recalled_low_crowd
            details = f"Recalled vegetarian preference: {recalled_veg}, Recalled low crowd tolerance: {recalled_low_crowd}"
            record_result("Memory Tests", "Query: 'I am going to another match' -> Recalls saved preferences", passed, details)
        else:
            record_result("Memory Tests", "Query: 'I am going to another match'", False, f"HTTP {r2.status_code}")
    except Exception as e:
        record_result("Memory Tests", "Query: 'I am going to another match'", False, str(e))

# =====================================================================
# 5. Google Maps Tests
# =====================================================================
def run_google_maps_tests():
    print("Running Google Maps Tests...")
    try:
        # Read the file
        filepath = "src/StadiumMap.jsx"
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Verify components and code elements are defined
            has_react_maps_api = "from \"@react-google-maps/api\"" in content or "from '@react-google-maps/api'" in content
            has_api_key_read = "import.meta.env.VITE_GOOGLE_MAPS_API_KEY" in content
            has_stadium_coords = "STADIUM_COORDS" in content
            has_gate_coords = "GATE_COORDS" in content
            has_polyline = "PolylineF" in content
            has_markers = "MarkerF" in content
            has_info_window = "InfoWindowF" in content
            
            passed = has_react_maps_api and has_api_key_read and has_stadium_coords and has_gate_coords and has_polyline and has_markers and has_info_window
            details = f"react-google-maps: {has_react_maps_api}, reads API key: {has_api_key_read}, STADIUM_COORDS: {has_stadium_coords}, GATE_COORDS: {has_gate_coords}, Polyline: {has_polyline}, Markers: {has_markers}, InfoWindow: {has_info_window}"
            record_result("Google Maps", "Verify StadiumMap.jsx elements and code setup", passed, details)
        else:
            record_result("Google Maps", "Verify StadiumMap.jsx elements and code setup", False, "StadiumMap.jsx does not exist")
    except Exception as e:
        record_result("Google Maps", "Verify StadiumMap.jsx elements and code setup", False, str(e))

# =====================================================================
# 6. WebSocket Telemetry Tests
# =====================================================================
async def run_websocket_tests_async():
    print("Running WebSocket Telemetry Tests...")
    try:
        # Connect to websocket
        stadium = "Wankhede Stadium Mumbai"
        url = f"{WS_URL}/ws/crowd?stadium={requests.utils.quote(stadium)}"
        async with websockets.connect(url) as websocket:
            # 1. Receive initial data frame
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            initial_data = json.loads(response)
            has_initial_data = initial_data.get("type") == "initial_data"
            gate_a_time = initial_data.get("data", {}).get("Gate A")
            
            # 2. Trigger crowd update via REST POST
            new_wait_time = 33
            update_payload = {
                "stadium_name": stadium,
                "gate_name": "Gate A",
                "waiting_time": new_wait_time
            }
            post_r = requests.post(f"{BACKEND_URL}/api/crowd/update", json=update_payload)
            if post_r.status_code != 200:
                record_result("WebSocket Tests", "WS Real-time Telemetry Updates", False, f"Failed to post update: HTTP {post_r.status_code}")
                return

            # 3. Receive telemetry update via WS
            update_response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            update_data = json.loads(update_response)
            
            has_update = update_data.get("type") == "crowd_update"
            updated_gate_a_time = update_data.get("data", {}).get("Gate A")
            
            passed = has_initial_data and has_update and updated_gate_a_time == new_wait_time
            details = f"Initial data: {has_initial_data} (Gate A: {gate_a_time}), Crowd update: {has_update} (Gate A: {updated_gate_a_time})"
            record_result("WebSocket Tests", "WS Real-time Telemetry Updates", passed, details)
    except Exception as e:
        record_result("WebSocket Tests", "WS Real-time Telemetry Updates", False, str(e))

def run_all_tests():
    run_api_tests()
    run_agent_workflow_tests()
    run_rag_tests()
    run_memory_tests()
    run_google_maps_tests()
    
    # Run async websocket tests
    asyncio.run(run_websocket_tests_async())
    
    # Generate final report
    generate_report()

def generate_report():
    print("\n" + "="*50)
    print("TEST EXECUTION REPORT")
    print("="*50)
    
    # Print failures only
    failures = [r for r in results if not r["passed"]]
    passed_count = len(results) - len(failures)
    
    print(f"Total Tests Executed: {len(results)}")
    print(f"Passed: {passed_count}")
    print(f"Failed: {len(failures)}")
    print("-"*50)
    
    if failures:
        print("FAILURES:")
        for failure in failures:
            print(f"- [{failure['category']}] {failure['name']}: {failure['details']}")
    else:
        print("ALL TESTS PASSED SUCCESSFULLY!")
    print("="*50)

    # Save Markdown report
    report_path = "testsprite_tests/test_report.md"
    with open(report_path, "w", encoding="utf-8") as f_report:
        f_report.write("# TestSprite Execution Report\n\n")
        f_report.write(f"- **Total Tests Executed**: {len(results)}\n")
        f_report.write(f"- **Passed**: {passed_count}\n")
        f_report.write(f"- **Failed**: {len(failures)}\n\n")
        
        f_report.write("## Test Cases Breakdown\n\n")
        f_report.write("| Category | Test Name | Status | Details |\n")
        f_report.write("| --- | --- | --- | --- |\n")
        for r in results:
            status_str = "✅ PASS" if r["passed"] else "❌ FAIL"
            f_report.write(f"| {r['category']} | {r['name']} | {status_str} | {r['details']} |\n")
            
        if failures:
            f_report.write("\n## Failure Details & Remediation\n\n")
            for failure in failures:
                f_report.write(f"### {failure['name']} ({failure['category']})\n")
                f_report.write(f"- **Description**: {failure['details']}\n\n")
                
    print(f"Saved test report to {report_path}")

if __name__ == "__main__":
    run_all_tests()
