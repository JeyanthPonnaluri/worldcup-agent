import logging
import re
from agents.fan_agent import fan_agent
import database
from tools.routing import calculate_route
from tools.crowd import get_crowd_status
from tools.food import get_food_options
from tools.personalization import get_personalized_suggestions

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Orchestrator")

class MatchDayOrchestrator:
    """
    Coordinates user requests, runs the Gemini ADK agent loop, 
    and handles fallback execution logic to maintain 100% demo uptime.
    """
    
    def __init__(self):
        self.agent = fan_agent

    def process_fan_request(self, prompt: str, username: str = "Alex") -> str:
        logger.info(f"Processing fan request for user '{username}': '{prompt}'")
        try:
            # standard google-adk execution loop
            result = self.agent.run(prompt, username=username)
            if isinstance(result, dict) and "response" in result:
                response_text = result["response"]
                confidence = result.get("confidence", 100)
                sources = result.get("sources", [])
                
                # Append sources and confidence in a clean, small markdown format at the end
                metadata_lines = []
                if confidence is not None:
                    metadata_lines.append(f"**Confidence**: {confidence}%")
                if sources:
                    metadata_lines.append(f"**Sources**: {', '.join(sources)}")
                
                if metadata_lines:
                    response_text += "\n\n---\n" + " | ".join(metadata_lines)
                return response_text

            if hasattr(result, "text"):
                return result.text
            elif hasattr(result, "content"):
                return result.content
            return str(result)
        except Exception as e:
            logger.warning(
                f"Gemini ADK Agent execution halted: {e}. "
                "Engaging deterministic backend fallback system."
            )
            return self._generate_fallback_itinerary(prompt)

    def _generate_fallback_itinerary(self, prompt: str) -> str:
        """
        Gated fallback mechanism that extracts constraints via regex/keyword parsing,
        queries the local database, runs routing tools, and compiles the markdown response.
        """
        # 1. Entity Extraction via simple NLP parser rules
        prompt_lower = prompt.lower()
        
        # Determine Stadium & Location
        stadium_name = "Wankhede Stadium Mumbai"
        city = "Mumbai"
        if "modi" in prompt_lower or "ahmedabad" in prompt_lower:
            stadium_name = "Narendra Modi Stadium Ahmedabad"
            city = "Ahmedabad"
        elif "wankhede" in prompt_lower or "mumbai" in prompt_lower:
            stadium_name = "Wankhede Stadium Mumbai"
            city = "Mumbai"
        elif "chinnaswamy" in prompt_lower or "bengaluru" in prompt_lower or "bangalore" in prompt_lower:
            stadium_name = "M Chinnaswamy Stadium Bengaluru"
            city = "Bengaluru"
        elif "rajiv" in prompt_lower or "hyderabad" in prompt_lower:
            stadium_name = "Rajiv Gandhi International Stadium Hyderabad"
            city = "Hyderabad"
        elif "arun" in prompt_lower or "jaitley" in prompt_lower or "delhi" in prompt_lower:
            stadium_name = "Arun Jaitley Stadium Delhi"
            city = "Delhi"
            
        # Determine Match Time (Default: 7:00 PM)
        match_time = "7:00 PM"
        time_match = re.search(r"(\d{1,2}(?::\d{2})?\s*(?:am|pm|am|pm))", prompt_lower)
        if time_match:
            match_time = time_match.group(1).upper()
            
        # Determine Dietary Preferences
        diet_preference = "vegetarian"  # default preference
        if "vegan" in prompt_lower:
            diet_preference = "vegan"
        elif "halal" in prompt_lower:
            diet_preference = "halal"
        elif "gluten" in prompt_lower:
            diet_preference = "gluten-free"
        elif "vegetarian" in prompt_lower or "veg" in prompt_lower:
            diet_preference = "vegetarian"

        # Determine Crowd Tolerance
        crowd_tolerance = "medium"
        if "hate crowd" in prompt_lower or "avoid crowd" in prompt_lower or "low tolerance" in prompt_lower:
            crowd_tolerance = "low"
        elif "crowd okay" in prompt_lower or "fine with crowd" in prompt_lower:
            crowd_tolerance = "high"

        # 2. Invoke local tools with correct new signatures
        # A. Route calculations
        route_rec = calculate_route(f"Downtown {city}", stadium_name)
        
        # B. Crowd status
        crowd_status = get_crowd_status(stadium_name)
        gate_name = crowd_status.get("gate_recommendation", "Gate A")
        wait_time = crowd_status.get("waiting_time", "15 minutes")
        density_val = crowd_status.get("density_score", 0.5)
        
        # C. Food recommendations
        food_recs = get_food_options(stadium_name, diet_preference)
        restaurants = food_recs.get("recommended_restaurants", [])
        
        # D. Personalization suggestions
        fan_profile = {
            "name": "Alex",
            "language": "en",
            "food_preferences": [diet_preference],
            "crowd_tolerance": crowd_tolerance,
            "previous_bookings": []
        }
        pers_rec = get_personalized_suggestions(fan_profile)
        suggestions = pers_rec.get("personalized_suggestions", [])

        # 3. Build Markdown Itinerary
        itinerary = f"""# [Personalized Match-Day Itinerary]: {stadium_name}

## [Match-Day Summary]
- **Location**: {city}
- **Stadium**: {stadium_name}
- **Kickoff Time**: {match_time}
- **Assigned Seat Gate**: {gate_name}
- **Crowd Tolerance**: {crowd_tolerance.capitalize()}
- **Dietary Filter**: {diet_preference.capitalize()}

---

## [Transit Route & Directions]
- **Starting Point**: Downtown {city}
- **Route Guidance**: {route_rec.get('travel_route')}
- **Estimated Travel Duration**: {route_rec.get('travel_time')} (includes match-day delay adjustments)

---

## [Gate & Entrance Details]
- **Recommended Gate**: **{gate_name}**
- **Current Queue Wait Time**: **{wait_time}** (Density Score: {density_val})
- **Strategy**: Recommended {gate_name} because it provides the shortest queue entry.

---

## [Food & Concession Recommendations]
Based on your preference for **{diet_preference}**:
"""
        if restaurants:
            for food in restaurants:
                itinerary += (
                    f"- **{food['name']}**\n"
                    f"  - *Menu description*: {food['menu_description']}\n"
                    f"  - *Popular Items*: {', '.join(food['popular_items'])}\n"
                    f"  - *Dietary Tags*: {', '.join(food['dietary_tags'])}\n"
                )
        else:
            itinerary += "- No concessions matching your exact dietary tags were found. General refreshment stands are available near Section 100.\n"

        itinerary += f"""
---

## [Personalized Suggestions]
"""
        for suggestion in suggestions:
            itinerary += f"- {suggestion}\n"

        itinerary += f"""
---

## [Chronological Timeline] (Suggested Schedule)
- **4:30 PM** - Depart from Downtown {city} (Estimated travel: {route_rec.get('travel_time')}).
- **5:15 PM** - Arrive at stadium perimeter. Walk towards **{gate_name}**.
- **5:30 PM** - Clear security at **{gate_name}** (Current wait: {wait_time}).
- **5:50 PM** - Enter stadium. Head to food stall **{restaurants[0]['name'] if restaurants else 'General Refreshments'}** for pre-match meal.
- **6:30 PM** - Locate your seating block and get settled.
- **7:00 PM** - **Kickoff! Enjoy the match!**
- **Post-Match** - Exit via directions provided under Transit Route to avoid main crowd choke points.
"""
        return itinerary
