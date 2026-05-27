import database
from tools.mcp_clients import MCPMongoDB

def get_crowd_status(venue: str) -> dict:
    """
    Query the crowd density, queue waiting times, and recommend the best entrance gate for a stadium,
    utilizing the MongoDB MCP aggregate tool.
    
    Args:
        venue: Name of the stadium (e.g. 'AT&T Stadium', 'SoFi Stadium').
        
    Returns:
        A dictionary containing:
          - density_score: General crowd density score (0.0 to 1.0).
          - waiting_time: Recommended gate wait time in minutes.
          - gate_recommendation: The best gate name to enter through.
    """
    # 1. Instantiate the MCP MongoDB client
    mongo_client = MCPMongoDB()
    
    # Define aggregation pipeline to extract the latest wait times per gate
    pipeline = [
        { "$sort": { "timestamp": -1 } },
        { 
            "$group": {
                "_id": "$gate",
                "waiting_time": { "$first": "$waiting_time" },
                "density_score": { "$first": "$density_score" }
            }
        }
    ]
    
    # 2. Call the aggregate tool on the crowd_live collection
    result = mongo_client.aggregate(collection="crowd_live", pipeline=pipeline)
    
    # If MCP aggregate operation is successful
    if isinstance(result, dict) and "error" not in result:
        docs = result.get("documents", [])
        if docs:
            # Sort the results by waiting time ascending
            # MongoDB MCP returns a list of matched aggregation result documents
            docs.sort(key=lambda x: x.get("waiting_time", 999))
            best_gate = docs[0]
            return {
                "density_score": best_gate.get("density_score", 0.5),
                "waiting_time": f"{best_gate.get('waiting_time', 15)} minutes",
                "gate_recommendation": best_gate.get("_id", "Gate A")
            }

    # Fallback to local python queries/mocks if MCP server is not active or fails
    venue_data = database.get_venue(venue)
    if not venue_data:
        return {
            "density_score": 0.5,
            "waiting_time": "15 minutes",
            "gate_recommendation": "Main Entrance"
        }
        
    gates = venue_data.get("gates", [])
    recommendations = []
    
    for gate in gates:
        gate_name = gate["name"]
        telemetry = database.get_live_crowd(venue, gate_name)
        recommendations.append({
            "gate": gate_name,
            "waiting_time": telemetry["waiting_time"],
            "density_score": telemetry["density_score"]
        })
        
    if not recommendations:
        return {
            "density_score": 0.5,
            "waiting_time": "15 minutes",
            "gate_recommendation": "Main Entrance"
        }
        
    recommendations.sort(key=lambda x: x["waiting_time"])
    best_gate = recommendations[0]
    
    return {
        "density_score": best_gate["density_score"],
        "waiting_time": f"{best_gate['waiting_time']} minutes",
        "gate_recommendation": best_gate["gate"]
    }
