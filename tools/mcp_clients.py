import subprocess
import json
import os
import logging
import sys

logger = logging.getLogger("MCPClients")

class LightweightMCPClient:
    """
    Lightweight, dependency-free JSON-RPC standard-input/output messenger 
    to interact with local Model Context Protocol (MCP) servers.
    """
    def __init__(self, command: str, args: list, env: dict = None):
        self.command = command
        self.args = args
        self.env = env or os.environ.copy()
        
    def call_tool(self, tool_name: str, arguments: dict) -> dict:
        try:
            # On Windows, we must use shell=True to execute node/npx command wrappers correctly
            use_shell = sys.platform == "win32"
            
            process = subprocess.Popen(
                [self.command] + self.args,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,  # Capture stderr for logging
                env=self.env,
                text=True,
                bufsize=1,
                shell=use_shell
            )
            
            # Helper to write JSON-RPC messages
            def write_msg(msg):
                process.stdin.write(json.dumps(msg) + "\n")
                process.stdin.flush()
                
            # Helper to read JSON-RPC messages
            def read_msg():
                line = process.stdout.readline()
                if not line:
                    return None
                return json.loads(line)

            # 1. Send Initialize Request
            write_msg({
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {"name": "WorldCupAgentClient", "version": "1.0.0"}
                }
            })
            
            init_resp = read_msg()
            if not init_resp:
                stderr_output = process.stderr.read()
                raise RuntimeError(f"No response from MCP server. Stderr: {stderr_output}")
                
            # 2. Send Initialized Notification
            write_msg({
                "jsonrpc": "2.0",
                "method": "notifications/initialized"
            })
            
            # 3. Send Call Tool Request
            write_msg({
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": tool_name,
                    "arguments": arguments
                }
            })
            
            tool_resp = read_msg()
            
            # Terminate process cleanly
            process.stdin.close()
            process.terminate()
            process.wait()
            
            if tool_resp and "result" in tool_resp:
                return tool_resp["result"]
            return {"error": "Invalid JSON-RPC response", "raw": tool_resp}
            
        except Exception as e:
            logger.error(f"Error calling MCP tool {tool_name} on {self.command}: {e}")
            return {"error": str(e)}

class MCPGoogleMaps:
    """
    MCP Client wrapper for Google Maps Platform routing services.
    """
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
        # Run Google Maps MCP server via npx
        self.client = LightweightMCPClient(
            command="npx",
            args=["-y", "@modelcontextprotocol/server-google-maps"],
            env={**os.environ, "GOOGLE_MAPS_API_KEY": self.api_key}
        )
        
    def directions(self, origin: str, destination: str) -> dict:
        """
        Calculates directions and routes between two points.
        """
        if not self.api_key:
            return {"error": "GOOGLE_MAPS_API_KEY environment variable is not configured."}
            
        result = self.client.call_tool("get_directions", {
            "origin": origin,
            "destination": destination
        })
        return result

class MCPMongoDB:
    """
    MCP Client wrapper for MongoDB query services.
    """
    def __init__(self):
        self.uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.db_name = "worldcup_fan_agent"
        # Run MongoDB MCP server via npx
        self.client = LightweightMCPClient(
            command="npx",
            args=["-y", "mongodb-mcp-server"],
            env={**os.environ, "MONGODB_URI": self.uri}
        )
        
    def aggregate(self, collection: str, pipeline: list) -> dict:
        """
        Runs an aggregation pipeline on a specific database collection.
        """
        # Call aggregate tool
        result = self.client.call_tool("aggregate", {
            "db": self.db_name,
            "collection": collection,
            "pipeline": pipeline
        })
        return result

    def find(self, collection: str, filter_query: dict, limit: int = 10) -> dict:
        """
        Runs a find query on a collection.
        """
        result = self.client.call_tool("find", {
            "db": self.db_name,
            "collection": collection,
            "filter": filter_query,
            "limit": limit
        })
        return result
