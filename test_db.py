import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

def test_connection():
    # Load .env variables
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    
    if not mongo_uri:
        print("Error: MONGO_URI environment variable is missing or empty in .env.")
        sys.exit(1)
        
    # Mask connection details in logs for safety
    masked_uri = mongo_uri.split('@')[-1] if '@' in mongo_uri else mongo_uri
    print(f"Connecting to MongoDB Atlas Cluster ({masked_uri})...")
    
    try:
        # Initialize client with timeout settings
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Run ping command on admin database to trigger server connection check
        client.admin.command('ping')
        
        print("\n=========================================")
        print("Success! Successfully connected to MongoDB Atlas.")
        print("Ping command succeeded.")
        print("=========================================\n")
        
        # Verify db list capability
        db = client["worldcup_fan_agent"]
        collections = db.list_collection_names()
        print(f"Active collections in 'worldcup_fan_agent': {collections}")
        
    except (ConnectionFailure, OperationFailure) as e:
        print("\n=========================================")
        print("Connection Error: Failed to connect to MongoDB Atlas.")
        print(f"Details: {e}")
        print("=========================================\n")
        sys.exit(1)
    except Exception as e:
        print("\n=========================================")
        print(f"Unexpected Error occurred: {e}")
        print("=========================================\n")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
