# KhelMitra AI - Indian Stadium & Sports Event Companion

**KhelMitra AI** is an interactive, real-time web application engineered to guide sports fans on match days for Indian sporting events (IPL, Cricket World Cup India, ISL, Kabaddi League, etc.). By combining a modern React dashboard with a Gemini 2.5 Flash agent back-end, a local MongoDB telemetry layer, Nominatim geocoding, and OpenRouteService directions, it provides fans with crowd-free itineraries, transit guidance, and personalized regional concession recommendations.

For deep technical details, database schemas, and system architecture, check out the [Technical Documentation](file:///C:/Users/HP/.gemini/antigravity-ide/brain/d4b8bb5c-3f20-4cef-b69c-ce16cd0b275a/project_documentation.md) artifact.

---

## Quick Start Setup

To spin up the complete local environment, run the following steps:

### 1. Install Dependencies
```bash
# Install frontend & dev server modules
npm install

# Install python packages
pip install fastapi uvicorn pymongo dnspython google-genai python-dotenv requests
```

### 2. Start Services
Open three separate terminal windows/sessions and run:

- **Session 1: MongoDB Server**
  ```bash
  npm run db
  ```
- **Session 2: FastAPI Backend Server**
  ```bash
  python -m uvicorn server:app --host 127.0.0.1 --port 8000
  ```
- **Session 3: React Development Client**
  ```bash
  npm run dev
  ```

Once all services are running, navigate to `http://localhost:5173/` in your browser.

---

## Features
- **Live Stadium Intelligence Dashboard:** Real-time gate crowd hotspots and status updates color-coded dynamically (Green = low crowd, Yellow = medium crowd, Red = high crowd).
- **Reactive WebSocket Telemetry:** Replaced old polling intervals with a FastAPI WebSocket stream at `/ws/crowd` pushing telemetry updates reactively.
- **Upgraded Free Routing Engine:** Integrated Nominatim address geocoding and the OpenRouteService driving directions API to map transit directions, distances, and recommended departure schedules.
- **Operations Telemetry Simulator:** Adjust wait times manually on the Stats page to broadcast queue wait times dynamically to all active subscribers.
- **Agent Chat & Streaming Logs:** Ask KhelMitra AI questions about match-day plans, transit routes, or local concessions (e.g. *Vada Pav* in Mumbai or *Biryani* in Hyderabad) and watch the agent's structured reasoning logs stream live in the chat.
- **Premium Alexandria Design:** Modern, responsive dark-mode editorial layout built using Noto Serif typography and pulsing interactive overlays.
