import database

def recommend_entrance_gate(stadium_name: str, crowd_tolerance: str) -> dict:
    """
    Analyzes stadium gates and recommends the best gate based on the fan's crowd tolerance.
    """
    venue = database.get_venue(stadium_name)
    if not venue:
        return {"error": f"Stadium '{stadium_name}' not found."}
    
    gates = venue.get("gates", [])
    recommendations = []
    
    for gate in gates:
        gate_name = gate["name"]
        telemetry = database.get_live_crowd(stadium_name, gate_name)
        recommendations.append({
            "gate": gate_name,
            "waiting_time": telemetry["waiting_time"],
            "density_score": telemetry["density_score"]
        })
    
    if not recommendations:
        return {"error": "No gate queue data available."}
    
    recommendations.sort(key=lambda x: x["waiting_time"])
    best_gate = recommendations[0]
    
    if best_gate["waiting_time"] > 30:
        status = "Heavy Congestion"
    elif best_gate["waiting_time"] > 15:
        status = "Moderate Crowd"
    else:
        status = "Clear / Fast Entry"
        
    reasoning = f"Recommended {best_gate['gate']} because it has the shortest wait time."
        
    return {
        "recommended_gate": best_gate["gate"],
        "waiting_time_minutes": best_gate["waiting_time"],
        "status": status,
        "reasoning": reasoning
    }

def recommend_transit_route(start_location: str, destination_stadium: str, travel_mode: str) -> dict:
    """
    Simulated directions tool helper.
    """
    mode_speed_min_per_mile = {
        "driving": 2.5,
        "transit": 4.0,
        "walking": 20.0
    }
    speed = mode_speed_min_per_mile.get(travel_mode.lower(), 3.0)
    distance_miles = 12.5
    if "mumbai" in start_location.lower() and "wankhede" in destination_stadium.lower():
        distance_miles = 15.0
    elif "ahmedabad" in start_location.lower() and "narendra" in destination_stadium.lower():
        distance_miles = 10.5
    elif "airport" in start_location.lower():
        distance_miles = 8.0

    duration_minutes = int(distance_miles * speed)
    if travel_mode.lower() == "driving":
        traffic_status = "Heavy Match-day Delays"
        duration_minutes += 25
    elif travel_mode.lower() == "transit":
        traffic_status = "Crowded Transit System"
        duration_minutes += 10
    else:
        traffic_status = "Normal Pedestrian Congestion"
        
    return {
        "start": start_location,
        "destination": destination_stadium,
        "travel_mode": travel_mode,
        "distance_miles": distance_miles,
        "estimated_duration_minutes": duration_minutes,
        "traffic_status": traffic_status,
        "recommended_route_summary": f"Take main avenue, follow stadium transit corridor instructions."
    }
