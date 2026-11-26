# AI-Based Civic Case Management System

A production-ready, autonomous, multi-agent civic case management and grievance redressal platform. Features an intelligent **FastAPI** backend, autonomous **YOLOv8** computer vision and text triage agents with **Safe-Object Segmentation Masking**, a modern **Next.js (App Router)** responsive frontend (with GIS Map & Satellite View and VMS integration), and a **PostgreSQL** database with immutable audit trails.

---

## 🚀 Quick Start Commands

### 1. Start the Backend Server (FastAPI — Port 8000)
From the project root (`D:\Civic_System_agent`), run any of the following:

```powershell
# Recommended (uses project virtual environment)
.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

Or use the helper scripts in the project root (with `.venv` activated):
```powershell
.\start-backend.ps1
# or in Command Prompt:
start-backend.bat
```

* **Swagger API Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc API Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 2. Start the Frontend Application (Next.js — Port 4000)
> **Note:** Always run `npm` commands from inside the `frontend` folder (there is no `package.json` in the repository root).

Open a new terminal and run:
```powershell
cd frontend
npm run dev
```

* **Frontend Application:** [http://localhost:4000](http://localhost:4000)

Other frontend commands (run from `frontend/`):
```powershell
npm run build   # Production build
npm run start   # Start production server on port 4000
npm run lint    # Run ESLint checks
```

---

### 3. Docker & Database Setup

#### A. Start Infrastructure Services (Optional Docker)
Starts PostgreSQL (`5433:5432`), RabbitMQ (`5672`, management UI on `15672`), and the FastAPI service (`8000`):
```powershell
docker-compose up -d
```

#### B. Run Alembic Migrations
```powershell
.venv\Scripts\alembic.exe upgrade head
```

#### C. Seed Database (7 Departments, Employees & Dedicated Profiles)
Creates all tables, 7 municipal departments, employees, and initializes profiles in `citizens`, `department_workers`, and `super_admins`:
```powershell
.venv\Scripts\python.exe init_departments_and_employees.py
```

#### D. Remove All Users (Clean Reset)
Wipes all registered users, profiles, and sessions from the database:
```powershell
.venv\Scripts\python.exe -c "from app.core.database import engine; from sqlalchemy import text; c = engine.connect(); c.execute(text('TRUNCATE TABLE user_sessions, citizens, department_workers, super_admins, user_roles, users CASCADE;')); c.commit(); print('All users and profiles removed!')"
```

---

### 4. AI Vision, Training & Test Commands

Run all Python scripts from the project root (`D:\Civic_System_agent`) using `.venv\Scripts\python.exe`:

#### A. Evaluate & Test the Vision System
```powershell
# False-positive & multi-class vision suite (traffic cones, vehicles, buildings, fire, potholes, waterlogging)
.venv\Scripts\python.exe scripts\test_new_vision_suite.py

# Benchmark accuracy, latency & confusion matrix
.venv\Scripts\python.exe scripts\evaluate_vision_system.py

# End-to-end API complaint workflow test
.venv\Scripts\pytest.exe test_full_complaint.py -v -s
```

#### B. Retrain YOLO Vision Models
```powershell
# Retrain all specialist models (detectors + classifiers)
.venv\Scripts\python.exe scripts\retrain_all_specialists.py all

# Retrain only detectors (garbage, manhole) or only classifiers (waterlogging, pothole)
.venv\Scripts\python.exe scripts\retrain_all_specialists.py detectors
.venv\Scripts\python.exe scripts\retrain_all_specialists.py classifiers

# Train the unified 6-class civic classifier (fire, garbage, waterlogging, pothole, manhole, normal)
.venv\Scripts\python.exe scripts\train_unified_civic.py
```

---

## 🤖 AI Multi-Agent Vision Architecture

1. **Safe-Object Segmentation Masking (`yolov8n-seg.pt`)**: Segments safe urban objects (`person`, `car`, `bus`, `truck`, `motorcycle`, `bicycle`) before color/heuristic inspection so red vehicles or orange clothing do not trigger false emergency alerts.
2. **Parallel Domain Hazard Agents (`app/services/orchestrator.py`)**:
   * **FireHazardAgent** (`fire_emergency_agent` → `Fire Department`)
   * **WaterDrainageAgent** (`water_drainage_agent` → `Water Supply`)
   * **SanitationAgent** (`sanitation_agent` → `Sanitation`)
   * **RoadSafetyAgent** (`road_safety_agent` → `Transportation`)
   * **TrafficCongestionAgent** (`traffic_congestion_agent` → `Transportation`)
3. **Model Weights (`app/models/weights/`)**: Includes `yolov8n-seg.pt`, `yolov8n.pt`, `fire_best.pt`, `garbage_best.pt`, `manhole_best.pt`, `pothole_best.pt`, `waterlogging_best.pt`, and `unified_civic_best.pt`.

---

## 🗄️ Database Architecture & Dedicated Tables

The database is structured with dedicated tables for each user category and audit logging:

1. **`auth_accounts` (`users`)**: Central identity, credentials, bcrypt hashed passwords, and JWT token issuance.
2. **`citizens`**: Dedicated profile for citizens with full name, ward, address, and complaint counts.
3. **`department_workers`**: Dedicated profile for workers linked to their respective municipal department, employee codes, designations, and active ticket counts.
4. **`super_admins`**: Dedicated profile for city administrators with `admin_code`, security clearance, and executive permissions.
5. **`user_sessions`**: Dedicated login & logout audit trail storing `login_at`, `logout_at`, `ip_address`, `user_agent`, and session `status` (`active` vs `logged_out`).

---

## 🔐 Default Login Credentials & Access Portals

| Role / Portal | Login URL | Email / Username | Password | Dedicated Table |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | [`/login/superadmin`](http://localhost:4000/login/superadmin) | `superadmin@civic.gov` | `admin123` | `super_admins` (`ADM-001`) |
| **Transportation Dept** | [`/login/department`](http://localhost:4000/login/department) | `dept.transport@civic.gov` | `admin123` | `department_workers` (`TRA-OFFICER`) |
| **Sanitation Dept** | [`/login/department`](http://localhost:4000/login/department) | `dept.sanitation@civic.gov` | `admin123` | `department_workers` (`SAN-OFFICER`) |
| **Water Supply Dept** | [`/login/department`](http://localhost:4000/login/department) | `dept.water@civic.gov` | `admin123` | `department_workers` (`WAT-OFFICER`) |
| **Electrical Dept** | [`/login/department`](http://localhost:4000/login/department) | `dept.electrical@civic.gov` | `admin123` | `department_workers` (`ELE-OFFICER`) |
| **Citizen Portal** | [`/login/citizen`](http://localhost:4000/login/citizen) | `rajesh.kumar@gmail.com` | `citizen123` | `citizens` (Ward 12) |

### Key Frontend Views
* **Main Command Center:** [http://localhost:4000](http://localhost:4000)
* **Citizen Dashboard & New Complaint:** [`/citizen`](http://localhost:4000/citizen) | [`/citizen/new`](http://localhost:4000/citizen/new)
* **AI Vision Scanner:** [`/ai-vision`](http://localhost:4000/ai-vision)
* **VMS Camera Integrations:** [`/vms`](http://localhost:4000/vms)
* **Super Admin Console:** [`/superadmin`](http://localhost:4000/superadmin)

---

## 🔑 Registration & Authentication APIs (`/docs#/auth`)

* **Citizen Registration:** `POST /api/v1/auth/register/citizen`  
  * Creates record in `users` and a dedicated profile in `citizens`.
* **Department Worker Registration:** `POST /api/v1/auth/register/worker`  
  * Links worker to their department and creates a record in `department_workers`.
* **Super Admin Registration:** `POST /api/v1/auth/register/superadmin`  
  * Creates a city administrator record in `users` and `super_admins`.
* **Login (Session Tracking):** `POST /api/v1/auth/login`  
  * Validates credentials, issues JWT token, and logs entry in `user_sessions` (`status: active`).
* **Logout (Session Termination):** `POST /api/v1/auth/logout`  
  * Updates `user_sessions` with `logout_at` timestamp and marks status as `logged_out`.
* **Session Audit Logs:** `GET /api/v1/auth/sessions`  
  * Lists login/logout history from `user_sessions`.
* **List Profiles:** `GET /api/v1/auth/citizens` and `GET /api/v1/auth/workers`.

---

## 📋 Complaint Ingestion & VMS APIs (`/docs#/cases`, `/docs#/vms`)

Grievance submission is streamlined into **two dedicated endpoints**. In both endpoints, **`priority` is not input by citizens** — priority is autonomously determined by the AI Vision and Text Triage models:

### 1. `POST /api/v1/cases` — Text & Media Complaint
* **Form Parameters:** `title`, `description`, `file` *(optional photo/video)*, `latitude`, `longitude`, `ward`, `notify_me_via`.

### 2. `POST /api/v1/cases/media-only` — Autonomous AI Vision Complaint
* **Form Parameters:** `file` *(required photo/video)*, `latitude`, `longitude`, `ward`, `notify_me_via`.

### 3. Additional Case & VMS Endpoints
* **Public Feed & AI Analysis:** `GET /api/v1/cases/feed/public`, `GET /api/v1/cases/{case_id}/analysis`
* **Active Learning Override:** `PATCH /api/v1/cases/{case_id}/supervisor-override`
* **VMS Camera Management & Snapshots:** `GET/POST /api/v1/vms`, `POST /api/v1/vms/{vms_id}/cameras`, `POST /api/v1/vms/cameras/{camera_id}/snapshot`, `POST /api/v1/vms/webhooks/{vms_id}`

---

## 🏛 Municipal Departments & Routing

| Department | Code | Dedicated Route | Officer-in-Charge |
| :--- | :--- | :--- | :--- |
| **Transportation** | `TRANS` | [`/department/transportation`](http://localhost:4000/department/transportation) | Arun Verma |
| **Sanitation** | `SAN` | [`/department/sanitation`](http://localhost:4000/department/sanitation) | Kavita Rao |
| **Water Supply** | `WATER` | [`/department/water-supply`](http://localhost:4000/department/water-supply) | Siddharth Joshi |
| **Public Works** | `PWD` | [`/department/public-works`](http://localhost:4000/department/public-works) | R. C. Hegde |
| **Electrical & Power** | `ELEC` | [`/department/electrical`](http://localhost:4000/department/electrical) | N. S. Murthy |
| **Public Health** | `HEALTH` | [`/department/public-health`](http://localhost:4000/department/public-health) | Dr. Ananya Sen |
| **Fire Department** | `FIRE` | [`/department/fire`](http://localhost:4000/department/fire) | Vikram Rathore |
