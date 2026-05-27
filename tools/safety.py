import database

def get_safety_info(stadium_name: str) -> dict:
    """
    Look up safety facilities, medical booths, and emergency exit gates for a specific stadium.
    
    Args:
        stadium_name: Name of the stadium (e.g. 'Wankhede Stadium Mumbai').
        
    Returns:
        A dictionary containing:
          - medical_booths: List of located first-aid or medical rooms.
          - exit_gates: List of emergency exit gates.
          - general_tips: Safety recommendations for fans.
    """
    venue = database.get_venue(stadium_name)
    if not venue:
        return {
            "medical_booths": ["Main Medical Pavilion"],
            "exit_gates": ["Main Gate"],
            "general_tips": [
                "Locate the nearest exit signs upon seating.",
                "Keep hydrated during the match."
            ]
        }
        
    gates = [g["name"] for g in venue.get("gates", [])]
    
    # Custom local stadium medical facilities mapping
    medical_booths = []
    if "wankhede" in stadium_name.lower():
        medical_booths = [
            "First Aid Station behind North Stand (near Gate A)",
            "Apex Cardiac Care Unit (Section 108)"
        ]
    elif "modi" in stadium_name.lower():
        medical_booths = [
            "Emergency Medical Pavilion (Clubhouse Level)",
            "First Aid booth near Gate B",
            "Ambulance Standby (Gate A Exit)"
        ]
    elif "chinnaswamy" in stadium_name.lower():
        medical_booths = [
            "St. John First Aid Station near Gate B",
            "Emergency Medical Room (Lower Tier, West Block)"
        ]
    elif "hyderabad" in stadium_name.lower():
        medical_booths = [
            "Apollo Clinic First Aid Station (near Gate B)",
            "Emergency Response Room near VIP Gate"
        ]
    elif "delhi" in stadium_name.lower():
        medical_booths = [
            "Medical Booth near Gate A",
            "Emergency Clinic behind Section 2"
        ]
    else:
        medical_booths = [f"First Aid Station near {gates[0]}" if gates else "First Aid Room"]
        
    return {
        "medical_booths": medical_booths,
        "exit_gates": gates,
        "general_tips": [
            "Identify the nearest emergency exit gate to your seating block upon entry.",
            "Report any suspicious activity, unattended baggage, or safety hazards to stadium marshals.",
            "Drink plenty of water to stay hydrated under high-temperature match conditions.",
            "In the event of an evacuation, remain calm and walk to the nearest designated exit gate.",
            "Safety emergency helpline numbers are active on the back of your match tickets."
        ]
    }
