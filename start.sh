#!/bin/bash

# Start FastAPI backend server in the background on port 8000
echo "Starting FastAPI backend server..."
python -m uvicorn server:app --host 127.0.0.1 --port 8000 &

# Substitute the listen port in Nginx config with Cloud Run $PORT (default to 80 if not set)
PORT_TO_USE=${PORT:-80}
echo "Configuring Nginx to listen on port ${PORT_TO_USE}..."
sed -i "s/listen 80;/listen ${PORT_TO_USE};/g" /etc/nginx/sites-available/default

# Start Nginx in the foreground to keep the container running
echo "Starting Nginx reverse proxy..."
nginx -g "daemon off;"

