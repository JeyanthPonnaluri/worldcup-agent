def get_personalized_suggestions(fan_profile: dict) -> dict:
    """
    Generate tailored recommendations and suggestions based on a fan's profile information.
    
    Args:
        fan_profile: A dictionary containing the fan's profile details:
          - name: Fan's name.
          - language: Preferred language code (e.g., 'en', 'pt', 'ja').
          - food_preferences: List of dietary restrictions/preferences.
          - crowd_tolerance: User's crowd tolerance level ('low', 'medium', 'high').
          - previous_bookings: List of previous booking activities.
          
    Returns:
        A dictionary containing:
          - personalized_suggestions: Custom suggestions list.
    """
    name = fan_profile.get("name", "Fan")
    diet = fan_profile.get("food_preferences", [])
    tolerance = fan_profile.get("crowd_tolerance", "medium")
    bookings = fan_profile.get("previous_bookings", [])
    
    suggestions = []
    
    # 1. Custom greeting and profile confirmation
    suggestions.append(f"Welcome back, {name}! Applying profile filters for {', '.join(diet) if diet else 'General Dining'}.")
    
    # 2. Crowd tolerance-based buffer adjustments
    if tolerance == "low":
        suggestions.append(
            "Crowd buffer: High surge delays expected. We recommend arriving at least 2 hours before kickoff "
            "and entering immediately via the shortest queue gate to minimize standing in congested zones."
        )
    elif tolerance == "medium":
        suggestions.append(
            "Crowd buffer: Standard delays expected. Plan to arrive 1.5 hours before kickoff to comfortably find your seats."
        )
    else:
        suggestions.append(
            "Crowd buffer: Flexible arrival. You are comfortable with crowds; standard entry gates are suitable."
        )
        
    # 3. Dietary matching note
    if diet:
        suggestions.append(
            f"Dietary note: We have prioritized concession stands tagged with {', '.join(diet)} "
            "that are closest to your seating block."
        )
        
    # 4. Merch / Booking history suggestions
    has_merch_booking = any(b.get("booking_type") == "merchandise" for b in bookings)
    if has_merch_booking:
        suggestions.append("Fan perk: Since you purchased merchandise in past matches, don't forget to visit the Express Merchandise Hub on Concourse 1 for discount perks.")
    else:
        suggestions.append("Fan perk: Check out the Official Merchandise Stand near Gate A for KhelMitra exclusive gear.")
        
    return {
        "personalized_suggestions": suggestions
    }
