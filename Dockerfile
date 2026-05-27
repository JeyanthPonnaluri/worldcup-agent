# Stage 1: Build React Frontend
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build static assets
COPY . .
RUN npm run build

# Stage 2: Serve Backend & Frontend
FROM python:3.12-slim
WORKDIR /backend

# Install system dependencies: Nginx and utilities
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    sed \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy FastAPI application source files
COPY server.py database.py config.py main.py orchestrator.py ./
COPY agents/ ./agents/
COPY tools/ ./tools/
COPY utils/ ./utils/
COPY knowledge/ ./knowledge/
COPY mock_fans.json mock_feedback.json mock_users.json ./

# Copy custom Nginx configuration to default site config location
COPY nginx.conf /etc/nginx/sites-available/default

# Copy compiled frontend from Stage 1
COPY --from=build /app/dist /var/www/html

# Copy entrypoint startup script
COPY start.sh ./
RUN chmod +x start.sh && sed -i -e 's/\r$//' start.sh

# Expose HTTP port 80
EXPOSE 80

# Execute entrypoint
ENTRYPOINT ["/backend/start.sh"]
