import database

def find_food_options(stadium_name: str, dietary_preferences: list[str]) -> list[dict]:
    """
    Search and find concession stands inside the stadium matching dietary preferences.
    """
    venue = database.get_venue(stadium_name)
    if not venue:
        return []
        
    concessions = venue.get("food_options", [])
    matching = []
    
    # Standardize preferences
    prefs = [p.lower().strip() for p in dietary_preferences]
    
    for stall in concessions:
        diet_tags = [t.lower().strip() for t in stall.get("dietary_tags", [])]
        
        # Check if the concession matches any/all of the dietary preferences
        match_count = sum(1 for p in prefs if p in diet_tags)
        
        # Also inspect menu description for matches literally
        desc_lower = stall.get("menu_description", "").lower()
        keyword_match = sum(1 for p in prefs if p in desc_lower)
        
        if match_count > 0 or keyword_match > 0:
            matching.append({
                "concession_name": stall["name"],
                "dietary_tags": stall["dietary_tags"],
                "popular_items": stall.get("popular_items", []),
                "menu_description": stall["menu_description"],
                "match_strength": match_count + keyword_match
            })
            
    # Sort by match strength descending
    matching.sort(key=lambda x: x["match_strength"], reverse=True)
    
    # Strip match strength field from output cleanups
    for item in matching:
        del item["match_strength"]
        
    return matching

def get_food_options(venue: str, preference: str) -> dict:
    """
    Search and find recommended concessions/restaurants inside a stadium matching dietary preferences.
    
    Args:
        venue: Name of the stadium (e.g. 'AT&T Stadium', 'SoFi Stadium').
        preference: Dietary preference or food craving (e.g. 'vegan', 'halal', 'vegetarian', 'gluten-free').
        
    Returns:
        A dictionary containing:
          - recommended_restaurants: List of concession stands matching the dietary/food preference.
    """
    # preference is single string, query expects a list
    prefs = [preference] if preference else []
    
    # Expand logical equivalents for query matching
    expanded_prefs = set(prefs)
    if "vegetarian" in prefs or "veg" in prefs:
        expanded_prefs.add("vegan")
        expanded_prefs.add("vegetarian")
        expanded_prefs.add("plant-based")
        
    raw_concessions = find_food_options(venue, list(expanded_prefs))
    
    formatted_recommendations = []
    for stall in raw_concessions:
        formatted_recommendations.append({
            "name": stall["concession_name"],
            "dietary_tags": stall["dietary_tags"],
            "popular_items": stall["popular_items"],
            "menu_description": stall["menu_description"]
        })
        
    return {
        "recommended_restaurants": formatted_recommendations
    }
