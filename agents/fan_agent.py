import os
import logging
import json
import re
import math
import collections
import time
import random
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

def retry_gemini_call(func, *args, **kwargs):
    max_retries = 3
    base_delay = 1.0
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
            logger.warning(f"[RETRY_ENGINE] Gemini call failed: {e}. Retrying in {delay:.2f}s (attempt {attempt + 1}/{max_retries})...")
            time.sleep(delay)

# Import existing tools directly
from tools.routing import calculate_route
from tools.crowd import get_crowd_status
from tools.food import get_food_options
from tools.personalization import get_personalized_suggestions
from tools.safety import get_safety_info
import database

try:
    import chromadb
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

# Configure logger with specific KhelMitra formatting
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KhelMitraOrchestration")

class FanQueryEntities(BaseModel):
    location: str
    stadium: str
    crowd_tolerance: str
    dietary_preference: str
    match_time: str
    preferred_transport: str
    favorite_team: str

class AgentSelection(BaseModel):
    call_crowd_agent: bool
    call_route_agent: bool
    call_food_agent: bool
    call_safety_agent: bool
    call_rag_agent: bool
    reasoning: str

class LocalTFIDFRetriever:
    def __init__(self):
        self.docs = []
        self.doc_freqs = collections.defaultdict(int)
        self.num_docs = 0

    def add_document(self, text: str, source: str):
        words = self._tokenize(text)
        if not words:
            return
        
        term_counts = collections.Counter(words)
        self.docs.append({
            "text": text,
            "source": source,
            "term_counts": term_counts,
            "length": math.sqrt(sum(c*c for c in term_counts.values()))
        })
        self.num_docs += 1
        for term in term_counts:
            self.doc_freqs[term] += 1

    def _tokenize(self, text: str) -> list[str]:
        return re.findall(r'[a-z0-9]+', text.lower())

    def retrieve(self, query: str, top_k: int = 3) -> list[dict]:
        query_words = self._tokenize(query)
        if not query_words or not self.docs:
            return []
        
        query_counts = collections.Counter(query_words)
        query_len = math.sqrt(sum(c*c for c in query_counts.values()))
        
        scores = []
        for doc in self.docs:
            dot_product = 0.0
            for term, q_count in query_counts.items():
                if term in doc["term_counts"]:
                    tf_doc = doc["term_counts"][term]
                    idf = math.log((1.0 + self.num_docs) / (1.0 + self.doc_freqs[term]))
                    dot_product += q_count * tf_doc * idf
                    
            if dot_product > 0.0 and doc["length"] > 0 and query_len > 0:
                score = dot_product / (doc["length"] * query_len)
                scores.append((score, doc))
                
        scores.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scores[:top_k]]

class GeminiEmbeddingFunction:
    def __init__(self, client):
        self.client = client

    def __call__(self, input: list[str]) -> list[list[float]]:
        if not self.client:
            return [[0.0] * 768 for _ in input]
        try:
            embeddings = []
            for chunk in input:
                res = self.client.models.embed_content(
                    model='text-embedding-004',
                    contents=chunk
                )
                embeddings.append(res.embeddings[0].values)
            return embeddings
        except Exception as e:
            logger.warning(f"Failed to get Gemini embeddings: {e}")
            return [[0.0] * 768 for _ in input]

class RAGRetriever:
    def __init__(self, client):
        self.client = client
        self.use_chroma = False
        self.chunks = []
        
        self.knowledge_dir = "knowledge"
        self.knowledge_files = [
            "stadium_rules.txt",
            "parking_info.txt",
            "faq.txt",
            "emergency_guidelines.txt",
            "transport_info.txt"
        ]
        
        self.local_retriever = LocalTFIDFRetriever()
        self._load_knowledge()
        
        if CHROMADB_AVAILABLE:
            try:
                self.chroma_client = chromadb.EphemeralClient()
                self.emb_fn = GeminiEmbeddingFunction(client)
                self.collection = self.chroma_client.create_collection(
                    name="khelmitra_knowledge",
                    embedding_function=self.emb_fn
                )
                
                documents = [c["text"] for c in self.chunks]
                metadatas = [{"source": c["source"]} for c in self.chunks]
                ids = [f"doc_{i}" for i in range(len(self.chunks))]
                
                if documents:
                    self.collection.add(
                        documents=documents,
                        metadatas=metadatas,
                        ids=ids
                    )
                    self.use_chroma = True
                    logger.info("ChromaDB EphemeralClient initialized successfully.")
            except Exception as e:
                logger.warning(f"ChromaDB EphemeralClient initialization skipped: {e}. Using Local TF-IDF search.")
                
    def _load_knowledge(self):
        if not os.path.exists(self.knowledge_dir):
            logger.warning(f"Knowledge base directory '{self.knowledge_dir}' is missing.")
            return
            
        for filename in self.knowledge_files:
            filepath = os.path.join(self.knowledge_dir, filename)
            if os.path.exists(filepath):
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
                    for p in paragraphs:
                        chunk = {"text": p, "source": filename}
                        self.chunks.append(chunk)
                        self.local_retriever.add_document(p, filename)
                except Exception as e:
                    logger.error(f"Error loading knowledge file {filename}: {e}")
                    
    def retrieve(self, query: str, top_k: int = 3) -> list[dict]:
        if self.use_chroma:
            try:
                results = self.collection.query(
                    query_texts=[query],
                    n_results=top_k
                )
                retrieved = []
                if results and "documents" in results and results["documents"]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0] if "metadatas" in results else [{}]*len(docs)
                    for doc, meta in zip(docs, metas):
                        retrieved.append({
                            "text": doc,
                            "source": meta.get("source", "unknown")
                        })
                return retrieved
            except Exception as e:
                logger.warning(f"ChromaDB query failed: {e}. Falling back to Local TF-IDF.")
                
        return self.local_retriever.retrieve(query, top_k)

class PlanningAgent:
    """
    Analyzes user intent to determine which sub-agents need to be executed,
    minimizing cost and request latencies by avoiding unnecessary agent calls.
    """
    def __init__(self, client):
        self.client = client

    def _keyword_plan(self, prompt: str) -> dict:
        user_request = prompt
        if "User Request:" in prompt:
            user_request = prompt.split("User Request:", 1)[1]
        prompt_lower = user_request.lower()
        
        # If there's an emergency/safety trigger, the safety agent is called immediately.
        # Requirement: "Emergency near Gate A" -> Call: SafetyAgent immediately.
        if "emergency near" in prompt_lower or prompt_lower.startswith("emergency"):
            selection = {
                "call_crowd_agent": False,
                "call_route_agent": False,
                "call_food_agent": False,
                "call_safety_agent": True,
                "call_rag_agent": False,
                "reasoning": "Emergency detected, SafetyAgent priority selection."
            }
            logger.info(f"[AGENT_SELECTION] Selected: {selection}")
            return selection

        # Check for RAG Q&A keywords
        call_rag = any(k in prompt_lower for k in [
            "dslr", "camera", "power bank", "allowed", "prohibited", 
            "bring", "carry", "parking", "faq", "permit", "rules",
            "bag policy", "backpack", "bottle", "helmet", "can i", "are they allowed",
            "where is", "how to reach", "transit options", "metro to", "train to"
        ])
        
        # If the query contains food, transit route, crowd, or emergency keywords, do not treat it as a pure static RAG FAQ
        has_other_keywords = any(k in prompt_lower for k in [
            "food", "eat", "hungry", "concession", "diet", "vegan", "vegetarian", "halal", "gluten", "restaurant", "menu", "vada pav", "pav bhaji", "dosa", "dhokla", "biryani", "cuisine",
            "crowd", "gate", "congestion", "queue", "wait", "line", "enter", "entrance", "tolerance", "density",
            "route", "transit", "travel", "time", "depart", "traffic", "way", "get to", "commute", "start at", "fastest", "direction",
            "emergency", "medical", "exit", "help", "safety", "police", "first aid", "booth", "doctor", "accident", "injured", "danger"
        ])
        
        if call_rag and not has_other_keywords and not any(k in prompt_lower for k in ["going to another match", "staying in", "itinerary", "match day plan", "schedule"]):
            selection = {
                "call_crowd_agent": False,
                "call_route_agent": False,
                "call_food_agent": False,
                "call_safety_agent": False,
                "call_rag_agent": True,
                "reasoning": "Stadium Q&A detected, RAG agent selected."
            }
            logger.info(f"[AGENT_SELECTION] Selected: {selection}")
            return selection

        call_crowd = any(k in prompt_lower for k in ["crowd", "gate", "congestion", "queue", "wait", "line", "enter", "entrance", "tolerance", "density"])
        call_route = any(k in prompt_lower for k in ["route", "transit", "travel", "time", "depart", "traffic", "way", "get to", "commute", "start at", "fastest", "direction"])
        call_food = any(k in prompt_lower for k in ["food", "eat", "hungry", "concession", "diet", "vegan", "vegetarian", "halal", "gluten", "restaurant", "menu", "vada pav", "pav bhaji", "dosa", "dhokla", "biryani", "cuisine"])
        call_safety = any(k in prompt_lower for k in ["emergency", "medical", "exit", "help", "safety", "police", "first aid", "booth", "doctor", "accident", "injured", "danger"])

        # Default: If no specific agent matches, run all to be safe
        if not (call_crowd or call_route or call_food or call_safety or call_rag):
            call_crowd = call_route = call_food = call_safety = True
            
        selection = {
            "call_crowd_agent": call_crowd,
            "call_route_agent": call_route,
            "call_food_agent": call_food,
            "call_safety_agent": call_safety,
            "call_rag_agent": False,
            "reasoning": "Keyword-matching intent parsing."
        }
        logger.info(f"[AGENT_SELECTION] Selected: {selection}")
        return selection

    def plan(self, prompt: str) -> dict:
        logger.info("[PLANNER] Analyzing user intent and selecting agents...")
        
        user_request = prompt
        if "User Request:" in prompt:
            user_request = prompt.split("User Request:", 1)[1]
            
        if not self.client:
            return self._keyword_plan(prompt)

        planning_prompt = (
            "ROLE: You are the KhelMitra plan coordinator.\n"
            "GOAL: Analyze fan queries and decide which sub-agents need to be executed.\n"
            "RULES:\n"
            "- Select only the agents relevant to the user query.\n"
            "- Avoid running agents that are not needed.\n"
            "- If terms like 'emergency', 'medical', 'exit', or 'help' are used in an urgent context (e.g. 'Emergency near Gate A'), activate call_safety_agent and deactivate all other agents to prioritize safety immediately.\n"
            "- If the user asks a general stadium rule or FAQ question (e.g. DSLR cameras, power banks, parking locations, baggage policies), activate call_rag_agent and deactivate other agents.\n\n"
            f"Query: \"{user_request}\""
        )

        try:
            response = retry_gemini_call(
                self.client.models.generate_content,
                model='gemini-2.5-flash',
                contents=planning_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AgentSelection,
                )
            )
            selection = json.loads(response.text)
            logger.info(f"[AGENT_SELECTION] LLM Selected: {selection}")
            return selection
        except Exception as e:
            logger.warning(f"[PLANNER] LLM planning failed: {e}. Bypassing to keyword planner.")
            return self._keyword_plan(prompt)

class PreferenceLearningAgent:
    """
    Sub-agent responsible for analyzing historical user actions and feedback,
    discovering hidden user preferences, and adjusting user profile confidence scores.
    """
    def __init__(self, client):
        self.client = client

    def run(self, username: str, user_profile: dict) -> dict:
        logger.info(f"[PLANNER] PreferenceLearningAgent analyzing actions/feedback for user: {username}...")
        
        # Retrieve historical feedback
        feedback_list = database.get_user_feedback(username)
        if not feedback_list:
            logger.info("[PLANNER] No feedback logs found to learn from. Using default user profile.")
            return user_profile

        # 1. Analyze Gate Selections & Satisfaction
        gate_counts = collections.Counter()
        gate_satisfactions = collections.defaultdict(list)
        for fb in feedback_list:
            accepted_gate = fb.get("accepted_recommendation")
            gate_sat = fb.get("gate_satisfaction", 5)
            if accepted_gate:
                gate_counts[accepted_gate] += 1
                gate_satisfactions[accepted_gate].append(gate_sat)

        # Learning Rule: If a user repeatedly chooses a gate (>= 2 times) and has high average satisfaction (>= 4.0), learn as preferred gate
        learned_gate = None
        for gate, count in gate_counts.items():
            if count >= 2:
                avg_sat = sum(gate_satisfactions[gate]) / len(gate_satisfactions[gate])
                if avg_sat >= 4.0:
                    learned_gate = gate
                    break

        if learned_gate:
            user_profile["preferred_gate"] = learned_gate
            logger.info(f"[PLANNER] PreferenceLearningAgent learned preferred_gate: {learned_gate}")

        # 2. Analyze Food Selections & Satisfaction
        # Learning Rule: If user repeatedly has food satisfaction >= 4.0 with vegetarian food preference or in their feedback,
        # increase their vegetarian confidence score
        veg_feedbacks = 0
        total_veg_sat = 0
        for fb in feedback_list:
            food_sat = fb.get("food_satisfaction", 5)
            # If the user previously had vegetarian food preference, or chosen accepted/rejected suggestions
            # Let's count vegetarian-positive feedbacks
            if user_profile.get("dietary_preferences") == "vegetarian" or "vegetarian" in str(fb.values()).lower():
                if food_sat >= 4:
                    veg_feedbacks += 1
                    total_veg_sat += food_sat

        # Increase vegetarian confidence score dynamically
        # Base confidence starts at 70% if they selected vegetarian. For each high satisfaction rating, we add 10%, capped at 100%.
        if user_profile.get("dietary_preferences") == "vegetarian":
            base_confidence = 70
            new_confidence = min(100, base_confidence + (veg_feedbacks * 10))
            user_profile["vegetarian_confidence"] = new_confidence
            logger.info(f"[PLANNER] PreferenceLearningAgent updated vegetarian confidence score: {new_confidence}%")
        else:
            user_profile["vegetarian_confidence"] = 0

        # Save the updated profile back to database
        database.save_fan_profile(username, user_profile)
        return user_profile

class VerificationAgent:
    """
    Validates outputs of all executed sub-agents against database constraints 
    and checks consistency rules to guarantee correctness before final synthesis.
    """
    def verify_crowd(self, stadium: str, crowd_data: dict) -> tuple[bool, list[str]]:
        reasons = []
        valid = True
        
        # Check gate exists
        gate_name = crowd_data.get("gate_recommendation")
        if not gate_name:
            valid = False
            reasons.append("Recommended gate name is missing.")
        else:
            venue_data = database.get_venue(stadium)
            if venue_data:
                valid_gates = [g["name"] for g in venue_data.get("gates", [])]
                if not any(g.strip().lower() == gate_name.strip().lower() for g in valid_gates):
                    valid = False
                    reasons.append(f"Recommended gate '{gate_name}' does not exist at {stadium}.")
            else:
                reasons.append(f"Stadium venue data not found in database to verify gate '{gate_name}'.")

        # Check waiting time valid
        wait_time = crowd_data.get("waiting_time")
        if wait_time is None:
            valid = False
            reasons.append("Waiting time data is missing.")
        else:
            wait_str = str(wait_time).lower()
            if not wait_str.strip():
                valid = False
                reasons.append("Waiting time is empty.")
            nums = re.findall(r"\d+", wait_str)
            if nums:
                val = int(nums[0])
                if val < 0 or val > 360:
                    valid = False
                    reasons.append(f"Waiting time {val} minutes is out of realistic bounds.")
            else:
                if "unknown" in wait_str or "error" in wait_str:
                    valid = False
                    reasons.append(f"Waiting time data '{wait_time}' is invalid.")

        # Check density score valid
        density = crowd_data.get("density_score")
        if density is None:
            valid = False
            reasons.append("Density score is missing.")
        else:
            try:
                density_val = float(density)
                if not (0.0 <= density_val <= 1.0):
                    valid = False
                    reasons.append(f"Density score {density_val} is outside valid range [0.0, 1.0].")
                elif density_val > 0.8:
                    valid = False
                    reasons.append(f"Recommended gate density {density_val} exceeds safety comfort threshold of 0.8.")
            except ValueError:
                valid = False
                reasons.append(f"Density score '{density}' is not a valid float value.")
                
        return valid, reasons

    def verify_route(self, route_data: dict) -> tuple[bool, list[str]]:
        reasons = []
        valid = True
        
        # Check travel time realistic
        travel_time = route_data.get("travel_time")
        if not travel_time:
            valid = False
            reasons.append("Travel time is missing.")
        else:
            time_str = str(travel_time).lower()
            nums = re.findall(r"\d+", time_str)
            if nums:
                val = int(nums[0])
                if val <= 0:
                    valid = False
                    reasons.append(f"Travel time of {val} minutes is not realistic.")
                elif val > 600:
                    valid = False
                    reasons.append(f"Travel time of {val} minutes is excessively long and potentially incorrect.")
            else:
                if "unknown" in time_str or "error" in time_str:
                    valid = False
                    reasons.append(f"Travel time value '{travel_time}' is invalid.")

        # Check route available
        route = route_data.get("travel_route")
        if not route:
            valid = False
            reasons.append("Route details are missing.")
            
        return valid, reasons

    def verify_food(self, food_data: dict, dietary_preference: str) -> tuple[bool, list[str]]:
        reasons = []
        valid = True
        
        concessions = food_data.get("recommended_restaurants", [])
        
        # Check if dietary preference matches the concessions
        if dietary_preference and dietary_preference.lower() != "none":
            pref = dietary_preference.lower()
            if not concessions:
                valid = False
                reasons.append(f"No dining concessions found matching dietary preference '{dietary_preference}'.")
            else:
                for c in concessions:
                    tags = [t.lower() for t in c.get("dietary_tags", [])]
                    is_match = False
                    if "veg" in pref:
                        is_match = ("vegetarian" in tags or "vegan" in tags)
                    elif "vegan" in pref:
                        is_match = ("vegan" in tags)
                    elif "halal" in pref:
                        is_match = ("halal" in tags)
                    elif "gluten" in pref:
                        is_match = ("gluten-free" in tags or "gluten free" in tags)
                    else:
                        is_match = any(pref in tag or tag in pref for tag in tags)
                        
                    if not is_match:
                        valid = False
                        reasons.append(f"Concession '{c.get('name')}' dietary tags {c.get('dietary_tags')} do not match preference '{dietary_preference}'.")
                        
        return valid, reasons

    def verify_safety(self, safety_data: dict) -> tuple[bool, list[str]]:
        reasons = []
        valid = True
        medical = safety_data.get("medical_booths", [])
        exits = safety_data.get("exit_gates", [])
        if not medical:
            valid = False
            reasons.append("Medical support clinics do not exist or are missing from safety report.")
        if not exits:
            valid = False
            reasons.append("Emergency exit gates are missing from safety report.")
        return valid, reasons

class CrowdIntelligenceAgent:
    """
    Sub-agent responsible for crowd pattern analysis and gate recommendations under strict comfort and density constraints.
    """
    def __init__(self, client):
        self.client = client

    def run(self, stadium: str, crowd_tolerance: str, user_profile: dict = None) -> dict:
        logger.info("[CROWD_ANALYSIS] CrowdIntelligenceAgent evaluating crowd density rules...")
        
        # Look up all gate telemetry from database
        venue_data = database.get_venue(stadium)
        gates_telemetry = []
        if venue_data:
            for gate in venue_data.get("gates", []):
                gate_name = gate["name"]
                telemetry = database.get_live_crowd(stadium, gate_name)
                gates_telemetry.append({
                    "gate": gate_name,
                    "waiting_time": telemetry["waiting_time"],
                    "density_score": telemetry["density_score"]
                })
        
        # Enforce Rule: Filter out gates with density > 0.8
        valid_gates = [g for g in gates_telemetry if g["density_score"] <= 0.8]
        confidence = 100
        reasons = []

        preferred_gate = user_profile.get("preferred_gate") if user_profile else None
        
        best_telemetry_gate = None
        if valid_gates:
            valid_gates.sort(key=lambda x: x["waiting_time"])
            best_telemetry_gate = valid_gates[0]
            
        preferred_valid_gate = None
        if preferred_gate:
            for g in valid_gates:
                if preferred_gate.lower() in g["gate"].lower() or g["gate"].lower() in preferred_gate.lower():
                    preferred_valid_gate = g
                    break

        if preferred_valid_gate:
            selected_gate = preferred_valid_gate
            warnings = ""
        elif best_telemetry_gate:
            selected_gate = best_telemetry_gate
            warnings = ""
        elif gates_telemetry:
            gates_telemetry.sort(key=lambda x: x["density_score"])
            selected_gate = gates_telemetry[0]
            warnings = "WARNING: All gate entrances are experiencing extreme congestion."
            confidence -= 30
            reasons.append("All gates exceeded 0.8 density limit.")
        else:
            selected_gate = {"gate": "Gate A", "waiting_time": 15, "density_score": 0.5}
            warnings = ""
            confidence -= 20
            reasons.append("No active gate telemetry found in database.")

        gate_name = selected_gate["gate"]
        wait_time = f"{selected_gate['waiting_time']} minutes"
        density = selected_gate["density_score"]

        # Build bulleted reason list
        explanation_reasons = []
        is_lowest_congestion = False
        if best_telemetry_gate and gate_name == best_telemetry_gate["gate"]:
            is_lowest_congestion = True
            
        if is_lowest_congestion:
            explanation_reasons.append("- lowest congestion")
            
        is_preferred = False
        if preferred_gate and (preferred_gate.lower() in gate_name.lower() or gate_name.lower() in preferred_gate.lower()):
            is_preferred = True
            explanation_reasons.append("- preferred by user historically")
            
        if is_lowest_congestion:
            explanation_reasons.append("- shortest queue")
            
        if not explanation_reasons:
            explanation_reasons.append("- comfort-optimized entry path")
            
        # Set gate confidence
        if is_preferred and is_lowest_congestion:
            gate_confidence = 95
        elif is_preferred:
            gate_confidence = 90
        elif is_lowest_congestion:
            gate_confidence = 85
        else:
            gate_confidence = 75
            
        reasons_str = "\n".join(explanation_reasons)

        fallback_res = (
            "## [Gate & Entrance Details]\n"
            "Recommended:\n"
            f"{gate_name}\n"
            "Reason:\n"
            f"{reasons_str}\n"
            "Confidence:\n"
            f"{gate_confidence}%"
        )

        if not self.client:
            return {
                "gate_recommendation": gate_name,
                "waiting_time": wait_time,
                "density_score": density,
                "response": fallback_res,
                "confidence": gate_confidence,
                "reason": reasons + ["Gemini API offline fallback"]
            }

        system_instruction = (
            "ROLE:\n"
            "You are a crowd intelligence specialist.\n\n"
            "GOAL:\n"
            "Recommend safest and lowest congestion gate.\n\n"
            "RULES:\n"
            "- prioritize crowd comfort\n"
            "- prioritize waiting time\n"
            "- predict future congestion\n"
            "- never recommend a gate with density >0.8\n"
            "- explain reasoning briefly\n"
            "- Format output under the '## [Gate & Entrance Details]' header. Use EXACTLY the following structure:\n"
            "## [Gate & Entrance Details]\n"
            "Recommended:\n"
            "[Gate Name]\n"
            "Reason:\n"
            "- [reason bullet 1]\n"
            "- [reason bullet 2]\n"
            "Confidence:\n"
            "[Confidence Score]%"
        )

        user_prompt = (
            f"Analyze the stadium crowd conditions based on this telemetry:\n"
            f"- Recommended Gate: {gate_name}\n"
            f"- Reasons:\n{reasons_str}\n"
            f"- Current Wait Time: {wait_time}\n"
            f"- Density Score: {density}\n"
            f"- Fan Crowd Tolerance: {crowd_tolerance}\n"
            f"- Confidence: {gate_confidence}%\n\n"
            "Generate the gate details section in Markdown following the rules."
        )

        try:
            response = retry_gemini_call(
                self.client.models.generate_content,
                model='gemini-2.5-flash',
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction
                )
            )
            return {
                "gate_recommendation": gate_name,
                "waiting_time": wait_time,
                "density_score": density,
                "response": response.text,
                "confidence": gate_confidence,
                "reason": reasons
            }
        except Exception as e:
            return {
                "gate_recommendation": gate_name,
                "waiting_time": wait_time,
                "density_score": density,
                "response": fallback_res,
                "confidence": gate_confidence,
                "reason": reasons + [f"Gemini error: {str(e)}"]
            }

class RoutePlanningAgent:
    """
    Sub-agent responsible for transit routing, travel time optimization, and departure schedules.
    """
    def __init__(self, client):
        self.client = client

    def run(self, location: str, stadium: str, match_time: str, crowd_tolerance: str) -> dict:
        logger.info("[ROUTE_ENGINE] RoutePlanningAgent calculating travel routes...")
        route_info = calculate_route(location, stadium)
        travel_route = route_info.get("travel_route", "Follow main transit corridors.")
        travel_time = route_info.get("travel_time", "45 minutes")
        
        confidence = 100
        reasons = []

        if "default" in travel_route.lower() or "mock" in travel_route.lower():
            confidence -= 20
            reasons.append("Using mock fallback route details.")
            
        fallback_res = (
            "## [Transit Route & Directions]\n"
            f"- **Route**: {travel_route}\n"
            f"- **Commute duration**: {travel_time}\n"
            "- **Recommended Departure**: Set departure time 2.5 hours before kickoff to ensure safe arrival buffer."
        )

        if not self.client:
            return {
                "travel_route": travel_route,
                "travel_time": travel_time,
                "response": fallback_res,
                "confidence": confidence - 15,
                "reason": reasons + ["Gemini API offline fallback"]
            }

        system_instruction = (
            "ROLE:\n"
            "You are a transportation optimization specialist.\n\n"
            "GOAL:\n"
            "Minimize travel time and late arrivals.\n\n"
            "RULES:\n"
            "- prioritize shortest travel time\n"
            "- include safety buffer\n"
            "- include realistic traffic effects\n"
            "- calculate recommended departure"
        )

        user_prompt = (
            f"Plan the transit route for a fan:\n"
            f"- Starting location: {location}\n"
            f"- Stadium: {stadium}\n"
            f"- Match Start Time: {match_time}\n"
            f"- Raw Maps Commute Path: {travel_route}\n"
            f"- Commute Duration: {travel_time}\n"
            f"- Fan Crowd Tolerance: {crowd_tolerance}\n\n"
            "Generate a transit details section in Markdown starting with '## [Transit Route & Directions]'."
        )

        try:
            response = retry_gemini_call(
                self.client.models.generate_content,
                model='gemini-2.5-flash',
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction
                )
            )
            return {
                "travel_route": travel_route,
                "travel_time": travel_time,
                "response": response.text,
                "confidence": confidence,
                "reason": reasons
            }
        except Exception as e:
            return {
                "travel_route": travel_route,
                "travel_time": travel_time,
                "response": fallback_res,
                "confidence": confidence - 15,
                "reason": reasons + [f"Gemini error: {str(e)}"]
            }

class FoodExperienceAgent:
    """
    Sub-agent responsible for selecting dietary-compatible stadium concessions and recommending local delicacies.
    """
    def __init__(self, client):
        self.client = client

    def run(self, stadium: str, city: str, dietary_preference: str) -> dict:
        logger.info("[Sub-Agent] FoodExperienceAgent analyzing culinary options...")
        food_info = get_food_options(stadium, dietary_preference)
        concessions_list = food_info.get("recommended_restaurants", [])
        
        confidence = 100
        reasons = []

        concessions_str = ""
        if concessions_list:
            for c in concessions_list:
                concessions_str += f"- **{c['name']}**\n  - *Menu description*: {c['menu_description']}\n  - *Popular Items*: {', '.join(c['popular_items'])}\n  - *Dietary Tags*: {', '.join(c['dietary_tags'])}\n"
        else:
            concessions_str = "- No concessions matching your exact dietary tags were found. General refreshments are available.\n"
            confidence -= 20
            reasons.append("No specialized dietary concessions found.")

        fallback_res = (
            "## [Food & Concession Recommendations]\n"
            f"{concessions_str}"
        )

        if not self.client:
            return {
                "recommended_restaurants": concessions_list,
                "response": fallback_res,
                "confidence": confidence - 15,
                "reason": reasons + ["Gemini API offline fallback"]
            }

        system_instruction = (
            "ROLE:\n"
            "You are a local culinary guide.\n\n"
            "GOAL:\n"
            "Recommend food matching user preferences.\n\n"
            "RULES:\n"
            "- prioritize dietary restrictions\n"
            "- prioritize regional foods\n"
            "- avoid incompatible suggestions"
        )

        user_prompt = (
            f"Generate stadium dining suggestions:\n"
            f"- Stadium Name: {stadium}\n"
            f"- City: {city}\n"
            f"- Dietary Preferences: {dietary_preference}\n"
            f"- Compatible Concessions: \n{concessions_str}\n\n"
            "Recommend stadium dining options and city-specific street food (e.g. Vada Pav/Pav Bhaji in Mumbai, Dhokla/Fafda in Ahmedabad, etc.). "
            "Generate a markdown section starting with '## [Food & Concession Recommendations]'."
        )

        try:
            response = retry_gemini_call(
                self.client.models.generate_content,
                model='gemini-2.5-flash',
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction
                )
            )
            return {
                "recommended_restaurants": concessions_list,
                "response": response.text,
                "confidence": confidence,
                "reason": reasons
            }
        except Exception as e:
            return {
                "recommended_restaurants": concessions_list,
                "response": fallback_res,
                "confidence": confidence - 15,
                "reason": reasons + [f"Gemini error: {str(e)}"]
            }

class SafetyAgent:
    """
    Sub-agent responsible for emergency guidelines, medical clinics, and exit mapping.
    """
    def __init__(self, client):
        self.client = client

    def run(self, stadium: str) -> dict:
        logger.info("[Sub-Agent] SafetyAgent building stadium safety coordinates...")
        safety_info = get_safety_info(stadium)
        medical = safety_info.get("medical_booths", [])
        exits = safety_info.get("exit_gates", [])
        tips = safety_info.get("general_tips", [])

        confidence = 100
        reasons = []

        medical_str = ", ".join(medical)
        exits_str = ", ".join(exits)
        tips_str = "\n".join([f"- {t}" for t in tips])

        if not medical or not exits:
            confidence -= 30
            reasons.append("Safety data missing details.")

        fallback_res = (
            "## [Safety & Emergency Info]\n"
            f"- **Nearest Exits**: {exits_str}\n"
            f"- **Medical Support Clinics**: {medical_str}\n"
            f"- **Safety Directives**:\n{tips_str}"
        )

        if not self.client:
            return {
                "medical_booths": medical,
                "exit_gates": exits,
                "response": fallback_res,
                "confidence": confidence - 15,
                "reason": reasons + ["Gemini API offline fallback"]
            }

        system_instruction = (
            "ROLE:\n"
            "You are a stadium safety specialist.\n\n"
            "GOAL:\n"
            "Protect user safety.\n\n"
            "RULES:\n"
            "- always provide nearest exits\n"
            "- include medical support\n"
            "- include emergency instructions"
        )

        user_prompt = (
            f"Formulate stadium safety recommendations:\n"
            f"- Stadium: {stadium}\n"
            f"- Medical facilities: {medical_str}\n"
            f"- Exit Gates: {exits_str}\n"
            f"- Tips list: \n{tips_str}\n\n"
            "Compile exit mapping and first-aid guidelines. "
            "Generate a markdown section starting with '## [Safety & Emergency Info]'."
        )

        try:
            response = retry_gemini_call(
                self.client.models.generate_content,
                model='gemini-2.5-flash',
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction
                )
            )
            return {
                "medical_booths": medical,
                "exit_gates": exits,
                "response": response.text,
                "confidence": confidence,
                "reason": reasons
            }
        except Exception as e:
            return {
                "medical_booths": medical,
                "exit_gates": exits,
                "response": fallback_res,
                "confidence": confidence - 15,
                "reason": reasons + [f"Gemini error: {str(e)}"]
            }

class KhelMitraOrchestrator:
    """
    Main orchestrator agent that manages the user session, delegates commands to specialized sub-agents,
    and synthesizes the unified Markdown match-day itinerary output.
    """
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured in environment or .env file.")
            self.client = None
        else:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize GenAI Client: {e}")
                self.client = None

        # Instantiate sub-agents under config definitions
        self.planner = PlanningAgent(self.client)
        self.verifier = VerificationAgent()
        self.crowd_agent = CrowdIntelligenceAgent(self.client)
        self.route_agent = RoutePlanningAgent(self.client)
        self.food_agent = FoodExperienceAgent(self.client)
        self.safety_agent = SafetyAgent(self.client)
        self.retriever = RAGRetriever(self.client)
        self.learning_agent = PreferenceLearningAgent(self.client)

    def run(self, prompt: str, username: str = "Alex") -> dict:
        """
        Main run loop that coordinates the sub-agents and compiles the final itinerary.
        """
        logger.info(f"[PLANNER] Main Orchestrator: Analyzing request for user {username}...")
        
        # 1. Retrieve user memory from MongoDB/Mock fallback
        user_profile = database.get_fan_profile(username)
        if not user_profile:
            user_profile = {
                "username": username,
                "dietary_preferences": "none",
                "crowd_tolerance": "medium",
                "preferred_transport": "none",
                "favorite_team": "none",
                "previous_routes": [],
                "previous_stadiums": []
            }
        
        # 1b. Run PreferenceLearningAgent to process feedback and update user profile
        user_profile = self.learning_agent.run(username, user_profile)
        if not user_profile:
            user_profile = {
                "username": username,
                "dietary_preferences": "none",
                "crowd_tolerance": "medium",
                "preferred_transport": "none",
                "favorite_team": "none",
                "previous_routes": [],
                "previous_stadiums": []
            }

        extraction_prompt = (
            f"Extract match-day entities from this fan request: \"{prompt}\".\n"
            "Fields to extract:\n"
            "- location\n"
            "- stadium (Ahmedabad matches -> Narendra Modi Stadium Ahmedabad, Mumbai matches -> Wankhede Stadium Mumbai, etc.)\n"
            "- crowd_tolerance (low, medium, high)\n"
            "- dietary_preference (vegetarian, vegan, halal, gluten-free, none)\n"
            "- match_time\n"
            "- preferred_transport (train, metro, cab, walking, none)\n"
            "- favorite_team (MI, CSK, RCB, etc., none)\n"
            "If location is not specified, default to Mumbai and Wankhede Stadium Mumbai."
        )
        
        entities_data = {}
        if self.client:
            try:
                # 2. Structured entity extraction
                response = retry_gemini_call(
                    self.client.models.generate_content,
                    model='gemini-2.5-flash',
                    contents=extraction_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=FanQueryEntities,
                    )
                )
                entities_data = json.loads(response.text)
                logger.info(f"Extracted entities: {entities_data}")
            except Exception as e:
                logger.warning(f"[PLANNER] LLM entity extraction failed: {e}. Bypassing to heuristic entity parser.")
        
        if not entities_data:
            prompt_lower = prompt.lower()
            
            # Determine Stadium & Location
            stadium = "Wankhede Stadium Mumbai"
            if "modi" in prompt_lower or "ahmedabad" in prompt_lower:
                stadium = "Narendra Modi Stadium Ahmedabad"
            elif "wankhede" in prompt_lower or "mumbai" in prompt_lower:
                stadium = "Wankhede Stadium Mumbai"
            elif "chinnaswamy" in prompt_lower or "bengaluru" in prompt_lower or "bangalore" in prompt_lower:
                stadium = "M Chinnaswamy Stadium Bengaluru"
            elif "rajiv" in prompt_lower or "hyderabad" in prompt_lower:
                stadium = "Rajiv Gandhi International Stadium Hyderabad"
            elif "arun" in prompt_lower or "jaitley" in prompt_lower or "delhi" in prompt_lower:
                stadium = "Arun Jaitley Stadium Delhi"
                
            # Determine Match Time (Default: 7:00 PM)
            match_time = "7:00 PM"
            time_match = re.search(r"(\d{1,2}(?::\d{2})?\s*(?:am|pm))", prompt_lower)
            if time_match:
                match_time = time_match.group(1).upper()
                
            # Determine Dietary Preferences
            diet_pref = "none"
            if "vegan" in prompt_lower:
                diet_pref = "vegan"
            elif "halal" in prompt_lower:
                diet_pref = "halal"
            elif "gluten" in prompt_lower:
                diet_pref = "gluten-free"
            elif "vegetarian" in prompt_lower or "veg" in prompt_lower:
                diet_pref = "vegetarian"
                
            # Determine Crowd Tolerance
            crowd_tol = "medium"
            if "hate crowd" in prompt_lower or "avoid crowd" in prompt_lower or "low tolerance" in prompt_lower:
                crowd_tol = "low"
            elif "crowd okay" in prompt_lower or "fine with crowd" in prompt_lower:
                crowd_tol = "high"

            # Determine preferred_transport
            pref_transport = "none"
            if "train" in prompt_lower:
                pref_transport = "train"
            elif "metro" in prompt_lower:
                pref_transport = "metro"
            elif "cab" in prompt_lower or "taxi" in prompt_lower:
                pref_transport = "cab"
            elif "walk" in prompt_lower:
                pref_transport = "walking"
                
            # Determine favorite team
            fav_team = "none"
            if "mi" in prompt_lower or "mumbai indians" in prompt_lower:
                fav_team = "MI"
            elif "csk" in prompt_lower or "chennai" in prompt_lower:
                fav_team = "CSK"
            elif "rcb" in prompt_lower or "bengaluru" in prompt_lower:
                fav_team = "RCB"
                
            location = "Mumbai"
            if "ahmedabad" in stadium.lower():
                location = "Ahmedabad"
            elif "bengaluru" in stadium.lower():
                location = "Bengaluru"
            elif "hyderabad" in stadium.lower():
                location = "Hyderabad"
            elif "delhi" in stadium.lower():
                location = "Delhi"
                
            entities_data = {
                "location": location,
                "stadium": stadium,
                "crowd_tolerance": crowd_tol,
                "dietary_preference": diet_pref,
                "match_time": match_time,
                "preferred_transport": pref_transport,
                "favorite_team": fav_team
            }
            logger.info(f"Extracted entities (heuristic): {entities_data}")

        location = entities_data.get("location", "Mumbai")
        stadium = entities_data.get("stadium", "Wankhede Stadium Mumbai")
        crowd_tolerance = entities_data.get("crowd_tolerance", "medium")
        dietary_preference = entities_data.get("dietary_preference", "none")
        match_time = entities_data.get("match_time", "7:00 PM")
        preferred_transport = entities_data.get("preferred_transport", "none")
        favorite_team = entities_data.get("favorite_team", "none")
        
        # Merge/Load user memory from MongoDB profile if prompt is generic
        if dietary_preference == "none" and user_profile.get("dietary_preferences") and user_profile.get("dietary_preferences") != "none":
            dietary_preference = user_profile["dietary_preferences"]
            logger.info(f"[MEMORY] Retrieved saved dietary preference from MongoDB: {dietary_preference}")
            
        if crowd_tolerance == "medium" and user_profile.get("crowd_tolerance") and user_profile.get("crowd_tolerance") != "medium":
            crowd_tolerance = user_profile["crowd_tolerance"]
            logger.info(f"[MEMORY] Retrieved saved crowd tolerance from MongoDB: {crowd_tolerance}")
            
        if preferred_transport == "none" and user_profile.get("preferred_transport") and user_profile.get("preferred_transport") != "none":
            preferred_transport = user_profile["preferred_transport"]
            logger.info(f"[MEMORY] Retrieved saved preferred transport from MongoDB: {preferred_transport}")
            
        if favorite_team == "none" and user_profile.get("favorite_team") and user_profile.get("favorite_team") != "none":
            favorite_team = user_profile["favorite_team"]
            logger.info(f"[MEMORY] Retrieved saved favorite team from MongoDB: {favorite_team}")
        
        # Standardize stadium name
        stadium_matched = "Wankhede Stadium Mumbai"
        city = "Mumbai"
        if "ahmedabad" in stadium.lower() or "modi" in stadium.lower():
            stadium_matched = "Narendra Modi Stadium Ahmedabad"
            city = "Ahmedabad"
        elif "mumbai" in stadium.lower() or "wankhede" in stadium.lower():
            stadium_matched = "Wankhede Stadium Mumbai"
            city = "Mumbai"
        elif "bengaluru" in stadium.lower() or "chinnaswamy" in stadium.lower():
            stadium_matched = "M Chinnaswamy Stadium Bengaluru"
            city = "Bengaluru"
        elif "hyderabad" in stadium.lower() or "rajiv" in stadium.lower():
            stadium_matched = "Rajiv Gandhi International Stadium Hyderabad"
            city = "Hyderabad"
        elif "delhi" in stadium.lower() or "arun" in stadium.lower() or "jaitley" in stadium.lower():
            stadium_matched = "Arun Jaitley Stadium Delhi"
            city = "Delhi"

        # 3. Invoke PlanningAgent to select required sub-agents
        selected_agents = self.planner.plan(prompt)
        
        # If it is a RAG Q&A query, bypass multi-agent itinerary and run RAGRetriever answering flow
        if selected_agents.get("call_rag_agent", False):
            logger.info("[RAG] Executing Retrieval-Augmented Generation flow...")
            chunks = self.retriever.retrieve(prompt, top_k=3)
            sources = list(set([c["source"] for c in chunks]))
            
            context_str = "\n\n".join([f"[{c['source']}]:\n{c['text']}" for c in chunks])
            rag_prompt = (
                "You are KhelMitra AI, the stadium event assistant.\n"
                "Answer the user query using ONLY the provided stadium rules and transport guidelines context. "
                "Be direct, polite, and helpful. If the answer cannot be found in the context, say that the information is not officially available.\n\n"
                f"Context:\n{context_str}\n\n"
                f"Query: \"{prompt}\""
            )
            
            ans = ""
            confidence = 90 if chunks else 40
            if self.client:
                try:
                    response = retry_gemini_call(
                        self.client.models.generate_content,
                        model='gemini-2.5-flash',
                        contents=rag_prompt
                    )
                    ans = response.text
                except Exception as e:
                    logger.warning(f"[RAG] LLM RAG answering failed: {e}. Bypassing to template extraction.")
                    
            if not ans:
                if chunks:
                    ans = "Based on stadium guidelines:\n" + "\n".join([f"- {c['text']}" for c in chunks])
                else:
                    ans = "This information is not officially available in the stadium records."
                    
            return {
                "response": ans,
                "confidence": confidence,
                "sources": sources
            }
        
        crowd_section = ""
        route_section = ""
        food_section = ""
        safety_section = ""
        
        # Track confidence scores
        verification_reports = []
        crowd_res = {}
        route_res = {}
        food_res = {}
        safety_res = {}

        # 4. Delegate to selected sub-agents
        if selected_agents.get("call_crowd_agent", True):
            crowd_res = self.crowd_agent.run(stadium_matched, crowd_tolerance, user_profile)
            
            # Verification layer
            logger.info("[VERIFICATION] Validating CrowdIntelligenceAgent output...")
            valid, reasons = self.verifier.verify_crowd(stadium_matched, crowd_res)
            if not valid:
                crowd_res["confidence"] = max(0, crowd_res["confidence"] - 40)
                crowd_res["reason"].extend(reasons)
            
            verification_reports.append(f"Crowd Intelligence Verification: {'SUCCESS' if valid else 'WARNING'} (Confidence: {crowd_res['confidence']}%). {', '.join(reasons) if reasons else ''}")
            crowd_section = crowd_res["response"]
            
        if selected_agents.get("call_route_agent", True):
            route_res = self.route_agent.run(location, stadium_matched, match_time, crowd_tolerance)
            
            logger.info("[VERIFICATION] Validating RoutePlanningAgent output...")
            valid, reasons = self.verifier.verify_route(route_res)
            if not valid:
                route_res["confidence"] = max(0, route_res["confidence"] - 40)
                route_res["reason"].extend(reasons)
                
            verification_reports.append(f"Route Planning Verification: {'SUCCESS' if valid else 'WARNING'} (Confidence: {route_res['confidence']}%). {', '.join(reasons) if reasons else ''}")
            route_section = route_res["response"]
            
        if selected_agents.get("call_food_agent", True):
            food_res = self.food_agent.run(stadium_matched, city, dietary_preference)
            
            logger.info("[VERIFICATION] Validating FoodExperienceAgent output...")
            valid, reasons = self.verifier.verify_food(food_res, dietary_preference)
            if not valid:
                food_res["confidence"] = max(0, food_res["confidence"] - 20)
                food_res["reason"].extend(reasons)
                
            verification_reports.append(f"Food Experience Verification: {'SUCCESS' if valid else 'WARNING'} (Confidence: {food_res['confidence']}%). {', '.join(reasons) if reasons else ''}")
            food_section = food_res["response"]
            
        if selected_agents.get("call_safety_agent", True):
            safety_res = self.safety_agent.run(stadium_matched)
            
            logger.info("[VERIFICATION] Validating SafetyAgent output...")
            valid, reasons = self.verifier.verify_safety(safety_res)
            if not valid:
                safety_res["confidence"] = max(0, safety_res["confidence"] - 30)
                safety_res["reason"].extend(reasons)
                
            verification_reports.append(f"Safety Verification: {'SUCCESS' if valid else 'WARNING'} (Confidence: {safety_res['confidence']}%). {', '.join(reasons) if reasons else ''}")
            safety_section = safety_res["response"]

        # Build Profile for personalization tips
        fan_profile = {
            "name": "Alex",
            "language": "en",
            "food_preferences": [dietary_preference] if dietary_preference and dietary_preference != "none" else [],
            "crowd_tolerance": crowd_tolerance,
            "previous_bookings": []
        }
        pers_info = get_personalized_suggestions(fan_profile)
        sugg_list = pers_info.get("personalized_suggestions", [])
        sugg_str = "\n".join([f"- {s}" for s in sugg_list])

        # 5. Master Synthesis & Final Output Compilation
        logger.info("[SYNTHESIS] Main Orchestrator: Compiling final response...")
        
        verification_log_str = "\n".join([f"- {v}" for v in verification_reports])
        if not verification_log_str:
            verification_log_str = "- No sub-agents were executed for verification diagnostics."
        
        synthesis_prompt = (
            "You are KhelMitra AI, the master orchestrator. Your job is to assemble and polish "
            "the specialized reports generated by your sub-agents into a unified, high-fidelity match-day plan.\n\n"
            f"Here are the sub-agent reports:\n"
            f"{route_section}\n\n"
            f"{crowd_section}\n\n"
            f"{food_section}\n\n"
            f"{safety_section}\n\n"
            f"Here are the personalized suggestions:\n"
            f"{sugg_str}\n\n"
            f"Here are the verification logs:\n"
            f"{verification_log_str}\n\n"
            "Format the final itinerary in Markdown. You must use these exact headers, preserving the content from the sub-agents:\n"
            f"# [Personalized Match-Day Itinerary]: {stadium_matched}\n"
            "## [Match-Day Summary]\n"
            "Summarize location, stadium name, kickoff time, and the general plan briefly.\n"
            "## [Transit Route & Directions]\n"
            "## [Gate & Entrance Details]\n"
            "## [Food & Concession Recommendations]\n"
            "## [Safety & Emergency Info]\n"
            "## [Verification Logs & Agent Diagnostics]\n"
            "Output the agent verification log list clearly under this header to prove the verifier validates the system.\n"
            "## [Personalized Suggestions]\n"
            "## [Chronological Timeline] (Suggested Schedule)\n"
            "Generate a logical schedule timeline that integrates departure times, transit durations, gate check times, dining, and match kickoff."
        )

        final_itinerary_text = ""
        if self.client:
            try:
                synthesis_response = retry_gemini_call(
                    self.client.models.generate_content,
                    model='gemini-2.5-flash',
                    contents=synthesis_prompt
                )
                final_itinerary_text = synthesis_response.text
            except Exception as e:
                logger.warning(f"[SYNTHESIS] LLM synthesis failed: {e}. Engaging template synthesis fallback.")

        if not final_itinerary_text:
            # Heuristic / template synthesis fallback
            itinerary = f"# [Personalized Match-Day Itinerary]: {stadium_matched}\n\n"
            itinerary += "## [Match-Day Summary]\n"
            itinerary += f"- **Location**: {city}\n"
            itinerary += f"- **Stadium**: {stadium_matched}\n"
            itinerary += f"- **Kickoff Time**: {match_time}\n"
            itinerary += f"- **Crowd Tolerance**: {crowd_tolerance.capitalize()}\n"
            itinerary += f"- **Dietary Filter**: {dietary_preference.capitalize()}\n\n"
            
            if route_section:
                itinerary += f"{route_section}\n\n"
            if crowd_section:
                itinerary += f"{crowd_section}\n\n"
            if food_section:
                itinerary += f"{food_section}\n\n"
            if safety_section:
                itinerary += f"{safety_section}\n\n"
                
            itinerary += "## [Verification Logs & Agent Diagnostics]\n"
            itinerary += f"{verification_log_str}\n\n"
            
            itinerary += "## [Personalized Suggestions]\n"
            itinerary += f"{sugg_str}\n\n"
            
            itinerary += "## [Chronological Timeline] (Suggested Schedule)\n"
            itinerary += f"- **4:30 PM** - Depart from starting location (Estimated travel: {route_res.get('travel_time', '45 minutes') if selected_agents.get('call_route_agent') else '35 minutes'}).\n"
            if selected_agents.get("call_crowd_agent"):
                itinerary += f"- **5:15 PM** - Arrive at stadium perimeter. Walk towards **{crowd_res.get('gate_recommendation', 'Gate A')}**.\n"
                itinerary += f"- **5:30 PM** - Clear security at **{crowd_res.get('gate_recommendation', 'Gate A')}** (Current wait: {crowd_res.get('waiting_time', '15 minutes')}).\n"
            else:
                itinerary += f"- **5:30 PM** - Clear stadium security check-points.\n"
                
            if selected_agents.get("call_food_agent") and food_res.get("recommended_restaurants"):
                itinerary += f"- **5:50 PM** - Enter stadium. Head to food stall **{food_res['recommended_restaurants'][0]['name']}** for pre-match meal.\n"
            else:
                itinerary += f"- **5:50 PM** - Enter stadium concessions area.\n"
                
            itinerary += f"- **6:30 PM** - Locate your seating block and get settled.\n"
            itinerary += f"- **7:00 PM** - **Kickoff! Enjoy the match!**\n"
            itinerary += f"- **Post-Match** - Exit via directions provided under Transit Route to avoid main crowd choke points."
            final_itinerary_text = itinerary

        # Update user profile with newly extracted/merged preferences in MongoDB
        updated_profile = {
            "username": "Alex",
            "dietary_preferences": dietary_preference,
            "crowd_tolerance": crowd_tolerance,
            "preferred_transport": preferred_transport,
            "favorite_team": favorite_team,
            "previous_routes": user_profile.get("previous_routes", []),
            "previous_stadiums": user_profile.get("previous_stadiums", [])
        }
        
        # Add new stadium to previous_stadiums if not present
        if stadium_matched and stadium_matched not in updated_profile["previous_stadiums"]:
            updated_profile["previous_stadiums"].append(stadium_matched)
            
        # Add route to previous_routes if route_res has travel_route and it's not already in previous_routes
        if selected_agents.get("call_route_agent") and route_res.get("travel_route"):
            route_entry = {
                "stadium": stadium_matched,
                "route": route_res.get("travel_route"),
                "time": route_res.get("travel_time")
            }
            if route_entry not in updated_profile["previous_routes"]:
                updated_profile["previous_routes"].append(route_entry)
                
        database.save_fan_profile("Alex", updated_profile)
        
        # Calculate overall confidence
        sub_confidences = []
        if selected_agents.get("call_crowd_agent"):
            sub_confidences.append(crowd_res.get("confidence", 100))
        if selected_agents.get("call_route_agent"):
            sub_confidences.append(route_res.get("confidence", 100))
        if selected_agents.get("call_food_agent"):
            sub_confidences.append(food_res.get("confidence", 100))
        if selected_agents.get("call_safety_agent"):
            sub_confidences.append(safety_res.get("confidence", 100))
            
        overall_confidence = int(sum(sub_confidences) / len(sub_confidences)) if sub_confidences else 100
        
        return {
            "response": final_itinerary_text,
            "confidence": overall_confidence,
            "sources": ["MongoDB Telemetry", "OpenRouteService API"]
        }

# Instantiate singleton agent to preserve existing API import references
fan_agent = KhelMitraOrchestrator()
