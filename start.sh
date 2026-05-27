#!/bin/bash

# Start FastAPI backend server in the background on port 8000
echo "Starting FastAPI backend server..."
python -m uvicorn server:app --host 127.0.0.1 --port 8000 &

# Start Nginx in the foreground to keep the container running
echo "Starting Nginx reverse proxy..."
nginx -g "daemon off;"
