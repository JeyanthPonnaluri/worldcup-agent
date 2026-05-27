import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Connection Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "khelmitra_fan_agent"

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
DEFAULT_MODEL = "gemini-2.5-flash"

# JWT Authentication Config
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "khelmitra-super-secret-key-123456")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 hours

# CORS Allowed Origins
CORS_ORIGINS = [
    origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
]


