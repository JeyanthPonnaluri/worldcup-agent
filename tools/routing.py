import os
import requests
import urllib.parse
import math
import logging
from dotenv import load_dotenv

# Configure logger
logger = logging.getLogger("RoutingTool")

# Load environment variables
load_dotenv()

# Fallback coordinates for stadiums to ensure high uptime
STADIUM_COORDS = {
    "narendra modi stadium ahmedabad": (23.0919, 72.5975),
    "wankhede stadium mumbai": (18.9389, 72.8258),
    "m chinnaswamy stadium bengaluru": (12.9786, 77.5987),
    "rajiv gandhi international stadium hyderabad": (17.4065, 78.5505),
    "arun jaitley stadium delhi": (28.6379, 77.2432)
}

# Fallback coordinates for major cities
CITY_COORDS = {
    "ahmedabad": (23.0225, 72.5714),
    "mumbai": (18.9750, 72.8258),
    "bengaluru": (12.9716, 77.5946),
    "hyderabad": (17.3850, 78.4867),
    "delhi": (28.7041, 77.1025)
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in miles."""
    R = 3958.8  # Earth radius in miles
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def geocode_nominatim(query: str) -> tuple[float, float] or None:
    """Geocode an address query using Nominatim OpenStreetMap API."""
    headers = {
        "User-Agent": "WorldCupSmartFanAgent/1.0 (contact@worldcupfanagent.org)"
    }
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&limit=1"
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                logger.info(f"Geocoded '{query}' successfully to ({lat}, {lon}) via Nominatim.")
                return lat, lon
    except Exception as e:
        logger.warning(f"Nominatim geocoding failed for '{query}': {e}")
    
    # Try local dictionary matching for stadium names
    query_lower = query.lower()
    for key, coords in STADIUM_COORDS.items():
        if key in query_lower:
            logger.info(f"Using local fallback coordinates for stadium: '{query}' -> {coords}")
            return coords
            
    # Try local dictionary matching for cities
    for key, coords in CITY_COORDS.items():
        if key in query_lower:
            logger.info(f"Using local fallback coordinates for city: '{query}' -> {coords}")
            return coords
            
    return None

def calculate_recommended_departure(travel_time_mins: int) -> str:
    """Calculate the recommended departure time assuming a 7:00 PM kickoff and 90m arrival cushion."""
    # 7:00 PM is 19:00, which is 1140 minutes from midnight
    kickoff_minutes = 1140
    # Fans should arrive 90 minutes before kickoff
    arrival_cushion = 90
    
    departure_minutes = kickoff_minutes - arrival_cushion - travel_time_mins
    hour = departure_minutes // 60
    minute = departure_minutes % 60
    
    am_pm = "PM" if hour >= 12 else "AM"
    display_hour = hour % 12
    if display_hour == 0:
        display_hour = 12
        
    return f"{display_hour}:{minute:02d} {am_pm}"

def calculate_route(location: str, destination: str) -> dict:
    """
    Calculate the travel route and estimated transit time using OpenRouteService API
    and Nominatim geocoding, with robust local distance estimation fallback.
    """
    logger.info(f"Calculating route from '{location}' to '{destination}'...")
    
    # 1. Geocode origin and destination coordinates
    origin_coords = geocode_nominatim(location)
    dest_coords = geocode_nominatim(destination)
    
    # Fallback default if geocoding completely failed
    if not origin_coords:
        origin_coords = CITY_COORDS["mumbai"]
    if not dest_coords:
        dest_coords = STADIUM_COORDS["wankhede stadium mumbai"]
        
    origin_lat, origin_lon = origin_coords
    dest_lat, dest_lon = dest_coords
    
    # 2. Query OpenRouteService API
    api_key = os.getenv("OPENROUTE_API_KEY")
    route_data = None
    
    if api_key:
        url = "https://api.openrouteservice.org/v2/directions/driving-car"
        headers = {
            "Authorization": api_key,
            "Content-Type": "application/json"
        }
        body = {
            "coordinates": [
                [origin_lon, origin_lat],
                [dest_lon, dest_lat]
            ]
        }
        try:
            response = requests.post(url, json=body, headers=headers, timeout=5)
            if response.status_code == 200:
                route_data = response.json()
                logger.info("Successfully retrieved directions from OpenRouteService API.")
            else:
                logger.warning(f"OpenRouteService API returned status code {response.status_code}: {response.text}")
        except Exception as e:
            logger.warning(f"Failed to fetch directions from OpenRouteService API: {e}")
            
    # 3. Parse route data or invoke local fallback
    if route_data and "routes" in route_data and len(route_data["routes"]) > 0:
        route = route_data["routes"][0]
        summary = route.get("summary", {})
        
        # OpenRouteService returns distance in meters and duration in seconds
        distance_meters = summary.get("distance", 0.0)
        duration_seconds = summary.get("duration", 0.0)
        
        distance_miles = distance_meters / 1609.34
        travel_time_mins = int(duration_seconds / 60)
        
        # Build route summary instructions
        segments = route.get("segments", [])
        instructions = []
        if segments:
            steps = segments[0].get("steps", [])
            for step in steps[:3]:
                inst = step.get("instruction", "")
                if inst:
                    instructions.append(inst)
            if len(steps) > 3:
                instructions.append("continue along the main route to the stadium entrance.")
                
        if instructions:
            route_summary = " ".join(instructions)
        else:
            route_summary = f"Drive via the main highway system to the stadium. Route directions generated via OpenRouteService."
    else:
        # Fallback using Haversine great-circle calculation
        logger.info("Engaging Haversine distance-based local route estimation.")
        dist_miles = haversine_distance(origin_lat, origin_lon, dest_lat, dest_lon)
        # Add 30% winding road factor
        distance_miles = dist_miles * 1.3
        # Estimate travel time (average driving speed 30 mph with match-day traffic)
        travel_time_mins = int((distance_miles / 30) * 60) + 15  # 15 min buffer
        route_summary = f"Follow local stadium transit corridors. Direct distance is {dist_miles:.1f} miles (est. driving route {distance_miles:.1f} miles)."

    # Format output fields
    travel_time_str = f"{travel_time_mins} minutes"
    distance_str = f"{distance_miles:.1f} miles"
    recommended_departure_str = calculate_recommended_departure(travel_time_mins)
    
    return {
        "travel_time": travel_time_str,
        "distance": distance_str,
        "recommended_departure": recommended_departure_str,
        "route_summary": route_summary,
        # Preserve backwards compatibility keys:
        "travel_route": route_summary
    }
