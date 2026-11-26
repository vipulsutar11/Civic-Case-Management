# CivicSense AI Frontend (Next.js)

Production-ready frontend for the Autonomous Multi-Agent Civic Grievance & Case Management System.

## Features
- **Grievance Ingestion Portal:** File municipal complaints with description, GPS coordinates, priority slider, and photo/video evidence.
- **Deep AI Triage Inspector:** View real-time findings from the Text Agent, Vision Agent, Geo Agent, and Master Orchestrator.
- **Department Queue Dashboard:** Filter tickets by Department (Sanitation, Transportation, Water, etc.) and Status with real-time statistics.
- **Integrated Backend Proxy:** Next.js proxies `/api/backend/*` requests directly to FastAPI (`http://127.0.0.1:8000/api/v1/*`).

## Getting Started

### 1. Ensure Backend is Running
From the root project directory:
```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend
From the `frontend` folder:
```bash
cd frontend
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.
