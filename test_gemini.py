import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai.errors import APIError

def test_gemini():
    # Load .env variables
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is missing or empty in .env.")
        sys.exit(1)
        
    # Mask key in logs for safety
    masked_key = api_key[:6] + "..." + api_key[-4:] if len(api_key) > 10 else api_key
    print(f"Connecting to Gemini API using key: {masked_key}...")
    
    try:
        # Initialize the official Client
        client = genai.Client(api_key=api_key)
        
        # Test basic prompt call with gemini-2.5-flash
        print("Sending test request to model 'gemini-2.5-flash'...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents='Hello, say "Connection Success" if you can hear me.',
        )
        
        print("\n=========================================")
        print("Success! Successfully connected to Gemini API.")
        print(f"Response: {response.text.strip()}")
        print("=========================================\n")
        
    except APIError as e:
        print("\n=========================================")
        print("API Error: Failed to generate content from Gemini API.")
        print(f"Details: {e}")
        print("=========================================\n")
        sys.exit(1)
    except Exception as e:
        print("\n=========================================")
        print(f"Unexpected Error occurred: {e}")
        print("=========================================\n")
        sys.exit(1)

if __name__ == "__main__":
    test_gemini()
