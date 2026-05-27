import logging
import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Database")

try:
    from dotenv import load_dotenv
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, OperationFailure
    import os

    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    # Check connection
    client.server_info()
    db = client["worldcup_fan_agent"]
    logger.info("Successfully connected to MongoDB Atlas.")
    db_available = True
except ImportError:
    logger.warning("pymongo or python-dotenv is not installed. Falling back to in-memory mock data.")
    db_available = False
    db = None
except (ConnectionFailure, OperationFailure) as e:
    logger.warning(f"MongoDB Atlas not available: {e}. Falling back to in-memory mock data.")
    db_available = False
    db = None

# Mock databases for offline/local standalone capability
MOCK_VENUES = [
    {
        "stadium_name": "Narendra Modi Stadium Ahmedabad",
        "city": "Ahmedabad",
        "gates": [
            {"name": "Gate A", "location": {"type": "Point", "coordinates": [72.5955, 23.0929]}},
            {"name": "Gate B", "location": {"type": "Point", "coordinates": [72.5995, 23.0909]}},
            {"name": "VIP Gate", "location": {"type": "Point", "coordinates": [72.5975, 23.0949]}}
        ],
        "food_options": [
            {
                "name": "Gujarati Dhokla House",
                "dietary_tags": ["vegan", "gluten-free", "vegetarian"],
                "popular_items": ["Dhokla", "Fafda", "Jalebi"],
                "menu_description": "Traditional Gujarati snacks, steamed dhoklas, hot fafda, and sweet jalebis with buttermilk."
            }
        ]
    },
    {
        "stadium_name": "Wankhede Stadium Mumbai",
        "city": "Mumbai",
        "gates": [
            {"name": "Gate A", "location": {"type": "Point", "coordinates": [72.8248, 18.9379]}},
            {"name": "Gate B", "location": {"type": "Point", "coordinates": [72.8268, 18.9399]}},
            {"name": "VIP Gate", "location": {"type": "Point", "coordinates": [72.8258, 18.9369]}}
        ],
        "food_options": [
            {
                "name": "Mumbai Chowpatty Express",
                "dietary_tags": ["vegetarian"],
                "popular_items": ["Vada Pav", "Pav Bhaji", "Bhel Puri"],
                "menu_description": "Iconic Mumbai street food, hot buttered pav bhaji, spicy vada pav, and tangy bhel puri."
            }
        ]
    },
    {
        "stadium_name": "M Chinnaswamy Stadium Bengaluru",
        "city": "Bengaluru",
        "gates": [
            {"name": "Gate A", "location": {"type": "Point", "coordinates": [77.5977, 12.9776]}},
            {"name": "Gate B", "location": {"type": "Point", "coordinates": [77.5997, 12.9796]}},
            {"name": "VIP Gate", "location": {"type": "Point", "coordinates": [77.5987, 12.9766]}}
        ],
        "food_options": [
            {
                "name": "Bangalore Tiffin Room",
                "dietary_tags": ["vegan", "gluten-free", "vegetarian"],
                "popular_items": ["Idli", "Filter Coffee", "Masala Dosa"],
                "menu_description": "South Indian favorites, steaming hot idlis, crispy masala dosa, and authentic aromatic filter coffee."
            }
        ]
    },
    {
        "stadium_name": "Rajiv Gandhi International Stadium Hyderabad",
        "city": "Hyderabad",
        "gates": [
            {"name": "Gate A", "location": {"type": "Point", "coordinates": [78.5495, 17.4055]}},
            {"name": "Gate B", "location": {"type": "Point", "coordinates": [78.5515, 17.4075]}},
            {"name": "VIP Gate", "location": {"type": "Point", "coordinates": [78.5505, 17.4045]}}
        ],
        "food_options": [
            {
                "name": "Deccan Biryani Hub",
                "dietary_tags": ["halal", "gluten-free", "vegetarian"],
                "popular_items": ["Hyderabadi Veg Biryani", "Plain Dosa", "Mirchi Bajji"],
                "menu_description": "Famous Hyderabadi veg biryani cooked with aromatic spices, fresh crispy dosas, and spicy mirchi bajji."
            }
        ]
    },
    {
        "stadium_name": "Arun Jaitley Stadium Delhi",
        "city": "Delhi",
        "gates": [
            {"name": "Gate A", "location": {"type": "Point", "coordinates": [77.2422, 28.6369]}},
            {"name": "Gate B", "location": {"type": "Point", "coordinates": [77.2442, 28.6389]}},
            {"name": "VIP Gate", "location": {"type": "Point", "coordinates": [77.2432, 28.6359]}}
        ],
        "food_options": [
            {
                "name": "Delhi Chaat Corner",
                "dietary_tags": ["vegetarian"],
                "popular_items": ["Chole Bhature", "Aloo Tikki Chaat"],
                "menu_description": "Classic Delhi delights, fluffy chole bhature, crispy aloo tikki chaat, and sweet lassi."
            }
        ]
    }
]

MOCK_CROWD = {
    "Narendra Modi Stadium Ahmedabad": {
        "Gate A": {"density_score": 0.85, "waiting_time": 42},
        "Gate B": {"density_score": 0.50, "waiting_time": 18},
        "VIP Gate": {"density_score": 0.10, "waiting_time": 3}
    },
    "Wankhede Stadium Mumbai": {
        "Gate A": {"density_score": 0.85, "waiting_time": 42},
        "Gate B": {"density_score": 0.50, "waiting_time": 18},
        "VIP Gate": {"density_score": 0.10, "waiting_time": 3}
    },
    "M Chinnaswamy Stadium Bengaluru": {
        "Gate A": {"density_score": 0.85, "waiting_time": 42},
        "Gate B": {"density_score": 0.50, "waiting_time": 18},
        "VIP Gate": {"density_score": 0.10, "waiting_time": 3}
    },
    "Rajiv Gandhi International Stadium Hyderabad": {
        "Gate A": {"density_score": 0.85, "waiting_time": 42},
        "Gate B": {"density_score": 0.50, "waiting_time": 18},
        "VIP Gate": {"density_score": 0.10, "waiting_time": 3}
    },
    "Arun Jaitley Stadium Delhi": {
        "Gate A": {"density_score": 0.85, "waiting_time": 42},
        "Gate B": {"density_score": 0.50, "waiting_time": 18},
        "VIP Gate": {"density_score": 0.10, "waiting_time": 3}
    }
}

def get_venue(stadium_name: str) -> dict:
    """Find a venue by its stadium name."""
    if db_available:
        venue = db.venues.find_one({"stadium_name": {"$regex": f"^{stadium_name}$", "$options": "i"}})
        if venue:
            venue["_id"] = str(venue["_id"])
            return venue
    
    # Fallback search
    for v in MOCK_VENUES:
        if stadium_name.lower() in v["stadium_name"].lower():
            return v
    return None

def get_live_crowd(stadium_name: str, gate_name: str) -> dict:
    """Get the latest live crowd statistics for a specific stadium and gate."""
    if db_available:
        venue = get_venue(stadium_name)
        if venue:
            # Query the crowd_live collection for latest update
            from bson import ObjectId
            live_data = db.crowd_live.find_one(
                {"venue_id": ObjectId(venue["_id"]), "gate": gate_name},
                sort=[("timestamp", -1)]
            )
            if live_data:
                return {
                    "density_score": live_data.get("density_score"),
                    "waiting_time": live_data.get("waiting_time"),
                    "timestamp": str(live_data.get("timestamp"))
                }

    # Fallback mock search
    for name, gates in MOCK_CROWD.items():
        if stadium_name.lower() in name.lower():
            gate_data = gates.get(gate_name)
            if not gate_data:
                # find case-insensitive matching gate
                for g_name, g_val in gates.items():
                    if gate_name.lower() in g_name.lower():
                        return g_val
            return gate_data
    return {"density_score": 0.5, "waiting_time": 15}

import os
import json

MOCK_FANS_FILE = "mock_fans.json"

def _load_mock_fans() -> dict:
    try:
        if os.path.exists(MOCK_FANS_FILE):
            with open(MOCK_FANS_FILE, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Failed to load mock fans file: {e}")
    return {}

def _save_mock_fans(fans_data: dict):
    try:
        with open(MOCK_FANS_FILE, "w") as f:
            json.dump(fans_data, f, indent=2)
    except Exception as e:
        logger.warning(f"Failed to save mock fans file: {e}")

MOCK_USERS_FILE = "mock_users.json"

def _load_mock_users() -> dict:
    try:
        if os.path.exists(MOCK_USERS_FILE):
            with open(MOCK_USERS_FILE, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Failed to load mock users file: {e}")
    return {}

def _save_mock_users(users_data: dict):
    try:
        with open(MOCK_USERS_FILE, "w") as f:
            json.dump(users_data, f, indent=2)
    except Exception as e:
        logger.warning(f"Failed to save mock users file: {e}")

def get_user_by_username(username: str) -> dict:
    if db_available:
        try:
            user = db.users.find_one({"username": username})
            if user:
                user["_id"] = str(user["_id"])
                diet = user.get("dietary_preferences", [])
                if isinstance(diet, str):
                    user["dietary_preferences"] = [diet] if diet not in ["none", ""] else []
                return user
        except Exception as e:
            logger.error(f"Failed to fetch user by username from MongoDB: {e}")
    users_data = _load_mock_users()
    user = users_data.get(username)
    if user:
        diet = user.get("dietary_preferences", [])
        if isinstance(diet, str):
            user["dietary_preferences"] = [diet] if diet not in ["none", ""] else []
    return user

def get_user_by_email(email: str) -> dict:
    if db_available:
        try:
            user = db.users.find_one({"email": email})
            if user:
                user["_id"] = str(user["_id"])
                diet = user.get("dietary_preferences", [])
                if isinstance(diet, str):
                    user["dietary_preferences"] = [diet] if diet not in ["none", ""] else []
                return user
        except Exception as e:
            logger.error(f"Failed to fetch user by email from MongoDB: {e}")
    users_data = _load_mock_users()
    for user in users_data.values():
        if user.get("email") == email:
            diet = user.get("dietary_preferences", [])
            if isinstance(diet, str):
                user["dietary_preferences"] = [diet] if diet not in ["none", ""] else []
            return user
    return None

def save_user(user_data: dict):
    username = user_data.get("username")
    if db_available:
        try:
            db.users.update_one(
                {"username": username},
                {"$set": user_data},
                upsert=True
            )
            logger.info(f"Successfully saved user to users collection in MongoDB for {username}.")
        except Exception as e:
            logger.error(f"Failed to save user to MongoDB: {e}")
    
    users_data = _load_mock_users()
    users_data[username] = user_data
    _save_mock_users(users_data)

def save_fan_profile(username: str, profile_data: dict):
    if db_available:
        try:
            user = db.users.find_one({"username": username})
            if user:
                # Update settings fields in the user document
                diet_val = profile_data.get("dietary_preferences", [])
                if isinstance(diet_val, str):
                    diet_val = [diet_val] if diet_val not in ["none", ""] else []
                update_fields = {
                    "dietary_preferences": diet_val,
                    "crowd_tolerance": profile_data.get("crowd_tolerance", "medium"),
                    "favorite_team": profile_data.get("favorite_team", ""),
                    "preferred_gate": profile_data.get("preferred_gate", ""),
                    "visited_stadiums": profile_data.get("visited_stadiums", []),
                    "previous_routes": profile_data.get("previous_routes", [])
                }
                # Also capture any other customized parameters from profile_data
                for key, val in profile_data.items():
                    if key not in ["_id", "username", "email", "hashed_password", "created_at"]:
                        update_fields[key] = val
                db.users.update_one({"username": username}, {"$set": update_fields})
                logger.info(f"Successfully updated user profile in users collection for {username}.")
                return
            
            db.fans.update_one(
                {"username": username},
                {"$set": profile_data},
                upsert=True
            )
            logger.info(f"Successfully saved fan profile in MongoDB for {username}.")
        except Exception as e:
            logger.error(f"Failed to save user profile to MongoDB: {e}")
    else:
        users_data = _load_mock_users()
        if username in users_data:
            diet_val = profile_data.get("dietary_preferences", [])
            if isinstance(diet_val, str):
                diet_val = [diet_val] if diet_val not in ["none", ""] else []
            update_fields = {
                "dietary_preferences": diet_val,
                "crowd_tolerance": profile_data.get("crowd_tolerance", "medium"),
                "favorite_team": profile_data.get("favorite_team", ""),
                "preferred_gate": profile_data.get("preferred_gate", ""),
                "visited_stadiums": profile_data.get("visited_stadiums", []),
                "previous_routes": profile_data.get("previous_routes", [])
            }
            for key, val in profile_data.items():
                if key not in ["_id", "username", "email", "hashed_password", "created_at"]:
                    update_fields[key] = val
            users_data[username].update(update_fields)
            _save_mock_users(users_data)
            logger.info(f"Successfully updated user profile in mock_users.json for {username}.")
            return

    fans_data = _load_mock_fans()
    fans_data[username] = profile_data
    _save_mock_fans(fans_data)

def get_fan_profile(username: str) -> dict:
    if db_available:
        try:
            # Query the users collection first
            user = db.users.find_one({"username": username})
            if user:
                user["_id"] = str(user["_id"])
                # Map to format expected by fan agent if necessary
                if "previous_stadiums" not in user and "visited_stadiums" in user:
                    user["previous_stadiums"] = user["visited_stadiums"]
                return user
                
            profile = db.fans.find_one({"username": username})
            if profile:
                profile["_id"] = str(profile["_id"])
                return profile
        except Exception as e:
            logger.error(f"Failed to fetch user profile from MongoDB: {e}")
            
    users_data = _load_mock_users()
    if username in users_data:
        user = users_data[username]
        if "previous_stadiums" not in user and "visited_stadiums" in user:
            user["previous_stadiums"] = user["visited_stadiums"]
        return user
        
    fans_data = _load_mock_fans()
    return fans_data.get(username)

MOCK_FEEDBACK_FILE = "mock_feedback.json"

def _load_mock_feedback() -> list[dict]:
    try:
        if os.path.exists(MOCK_FEEDBACK_FILE):
            with open(MOCK_FEEDBACK_FILE, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Failed to load mock feedback file: {e}")
    return []

def _save_mock_feedback(feedback_list: list[dict]):
    try:
        with open(MOCK_FEEDBACK_FILE, "w") as f:
            json.dump(feedback_list, f, indent=2)
    except Exception as e:
        logger.warning(f"Failed to save mock feedback file: {e}")

def save_user_feedback(username: str, feedback_data: dict):
    feedback_list = _load_mock_feedback()
    feedback_list.append(feedback_data)
    _save_mock_feedback(feedback_list)
    
    if db_available:
        try:
            db.feedback.insert_one(feedback_data)
            logger.info(f"Successfully saved user feedback in MongoDB for {username}.")
        except Exception as e:
            logger.error(f"Failed to save user feedback to MongoDB: {e}")

def get_user_feedback(username: str) -> list[dict]:
    if db_available:
        try:
            feedbacks = list(db.feedback.find({"username": username}))
            for f in feedbacks:
                f["_id"] = str(f["_id"])
            return feedbacks
        except Exception as e:
            logger.error(f"Failed to fetch user feedback from MongoDB: {e}")
    feedback_list = _load_mock_feedback()
    return [f for f in feedback_list if f.get("username") == username]


