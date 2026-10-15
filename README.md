# AnnaSetu AI — Smart Surplus Food Redistribution Platform
> **“Share More. Waste Less. Feed Hope.”**
> **Engineering Documentation & Architecture Guide**  
> **Global Goals Alignment:** **SDG 2** (Zero Hunger) & **SDG 12** (Responsible Consumption and Production)

---

## 🌟 Executive Summary

**AnnaSetu AI** (*अन्न सेतु* — "Bridge of Food") is a production-grade, full-stack, AI-orchestrated surplus food redistribution platform engineered to bridge the gap between commercial food establishments (restaurants, hotels, college hostels, banquet caterers) and verified community beneficiaries (NGOs, shelters, community kitchens).

Every day, metric tonnes of fresh, wholesome cooked meals and packaged foods are discarded in urban centers, while vulnerable populations face severe food insecurity. AnnaSetu AI solves this logistics and coordination failure by providing:
1. **Conservative Food-Safety Verification:** Strict FSSAI compliance, cold/hot chain storage constraints, and tamper-evident audit trails that prioritize safety over speed.
2. **Deterministic & Transparent Proximity Matching:** Multi-factor scoring incorporating Haversine geodesic distance, recipient daily intake capacity, dietary requirements, and remaining shelf life.
3. **Atomic Reservation & Concurrency Guards:** Row-level inventory locking (`SELECT FOR UPDATE`) preventing overbooking or race conditions.
4. **End-to-End Volunteer Dispatch:** Transparent delivery lifecycle tracking (`ASSIGNED` → `ACCEPTED` → `PICKED_UP` → `COMPLETED`) with thermal container hygiene validation.
5. **Resilient AI Assistance:** Google Gemini Python SDK integration with **100% deterministic rule-based fallbacks** ensuring flawless offline capability when external AI APIs are unconfigured or throttled.
6. **Empirical Impact Dashboards:** Live SQL-aggregated metrics of meals salvaged, kilograms diverted from landfills, and category throughput without fabricated numbers.

---

## 👥 Multi-Role User Matrix & Permissions

| Role | Primary Functions | Access Boundaries & Safeguards |
| :--- | :--- | :--- |
| **Food Donor** | Post surplus listings, view AI category recommendations, review recipient matches, approve reservation requests, monitor pickup transit. | Isolated to own kitchen listings; recipient beneficiary details redacted until match approval. |
| **Recipient Organization (NGO)** | Submit 12A/80G/Darpan accreditation documents, search listings via AI natural language parser, reserve meal batches, receive deliveries. | **Verification Lock:** Only verified NGOs can reserve donations. Unverified NGOs can only browse. |
| **Volunteer Courier** | Claim unassigned runs across city clusters, accept assigned runs, confirm food pickup at donor kitchen, record delivery handover. | Access restricted exclusively to active runs; cannot view private donor financial or unrelated NGO data. |
| **Administrator** | Review pending NGO documents, inspect food safety and spoilage complaints, moderate listings, toggle user access, view immutable audit ledger. | Protected command center. Seeded via environment variables; **public registration as admin is prohibited**. |

---

## 🔑 Pre-Seeded Academic Demo Accounts

The database comes pre-seeded with realistic Bengaluru food redistribution scenarios:

| Role | Email Address | Password | Organization / Details |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin@annasetu.ai` | `Admin@123456` | AnnaSetu Central Governance & Compliance |
| **Food Donor (Hotel)** | `donor.taj@annasetu.ai` | `Demo@123456` | The Grand Palace Hotel & Banquets (MG Road) |
| **Food Donor (Hostel)** | `donor.hostel@annasetu.ai` | `Demo@123456` | Royal Palms University Hostels (Koramangala) |
| **Verified NGO** | `ngo.hope@annasetu.ai` | `Demo@123456` | Hope Foundation Shelter (Indiranagar) — *Capacity: 180 meals/day* |
| **Verified Kitchen** | `ngo.annapurna@annasetu.ai` | `Demo@123456` | Annapurna Community Dining (Jayanagar) — *Capacity: 250 meals/day* |
| **Pending NGO** | `ngo.samarpan@annasetu.ai` | `Demo@123456` | Samarpan Youth Trust — *Pending Document Review in Admin Queue* |
| **Volunteer Courier** | `volunteer.rahul@annasetu.ai` | `Demo@123456` | Rahul Sharma — *Motorcycle Courier with Thermal Box* |
| **Volunteer Courier** | `volunteer.priya@annasetu.ai` | `Demo@123456` | Priya Nair — *Climate-Controlled Four-Wheeler* |

> 💡 **Demo Shortcut:** The web sign-in screen at `/login` provides **1-Click Quick Demo Login buttons** for each role for instant demonstration without typing.

---

## 🏗️ Architecture & Technology Stack

```
[ Frontend: React 19 + TypeScript + Tailwind CSS v4 + Vite + Recharts ]
                                 │
                            HTTP / REST
                                 ▼
[ Backend: Python FastAPI + Pydantic v2 + Argon2 + PyJWT + Alembic ]
        │                                             │
        ▼                                             ▼
[ Relational DB: SQLite / Postgres ]      [ AI Service: Google Gemini SDK ]
- Row locking (atomic allocations)        - Structured JSON extraction
- Immutable Audit Logs                    - Deterministic rule fallback
```

### Frontend
- **Framework:** React 19 with Vite & TypeScript
- **Styling:** Tailwind CSS v4 with modern responsive design and glassmorphism accents
- **Data Visualization:** Recharts for empirical impact statistics and platform distributions
- **Icons:** Lucide React
- **Client Routing:** React Router v7 with role-guarded route trees (`ProtectedRoute`)
- **State & Context:** React Context API (`AuthContext`) with persistent session recovery

### Backend
- **Framework:** FastAPI with Python 3.12 / 3.14
- **Validation:** Pydantic v2 with strict schema validation
- **Database & ORM:** SQLAlchemy ORM with foreign key integrity and Alembic migrations
- **Authentication:** OAuth2 password bearer flow with Argon2 password hashing and signed JWT tokens
- **Safety Engine:** Conservative eligibility rules, allergen checks, and storage temperature constraints (`hot_holding`, `refrigerated`, `ambient`, `frozen`)
- **AI Engine:** Google Gemini Python SDK (`google-genai`) with **robust fallback mechanisms** when `GEMINI_API_KEY` is omitted

---

## 🚀 Step-by-Step Setup & Execution (Windows PowerShell)

### Prerequisites
- Python 3.11+ installed and available on PATH
- Node.js 18+ and npm installed

### Step 1: Open the Project Directory
```powershell
cd C:\Users\prave\.gemini\antigravity\scratch\annasetu-ai
```

### Step 2: Setup and Start the Backend API
In your first PowerShell terminal:
```powershell
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run migrations and seed development data
alembic upgrade head
python -m app.db.seed_data

# Start the FastAPI server on port 8001
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
*The interactive API documentation (Swagger UI) is available at: `http://127.0.0.1:8001/docs`*

### Step 3: Setup and Start the Frontend Application
In a second PowerShell terminal:
```powershell
cd C:\Users\prave\.gemini\antigravity\scratch\annasetu-ai\frontend

# Install dependencies (already installed)
npm.cmd install

# Start Vite development server
npm.cmd run dev
```
*Access the web application at: `http://localhost:5173`*

---

## 🧪 Automated Test Suite

AnnaSetu AI includes a comprehensive test suite covering RBAC security guards, atomicity, safety validations, AI fallbacks, and end-to-end user workflows:

To run all 17 automated tests:
```powershell
cd C:\Users\prave\.gemini\antigravity\scratch\annasetu-ai\backend
.\venv\Scripts\python.exe -m pytest app/tests/ -v
```

### Test Suite Execution Summary:
- `test_successful_registration_and_login`: Validates Argon2 hashing and JWT token generation.
- `test_invalid_credentials_rejected`: Ensures 401 Unauthorized on bad passwords.
- `test_role_based_access_restrictions`: Ensures donors cannot call volunteer endpoints.
- `test_unverified_recipient_cannot_request_donation`: Enforces the NGO accreditation barrier.
- `test_valid_listing_creation`: Tests surplus food posting with mandatory safety declarations.
- `test_invalid_quantity_and_deadline_rejection`: Validates positive quantities and future deadlines.
- `test_expired_listings_excluded_from_matching`: Tests time-boundary matching exclusion.
- `test_donation_acceptance_prevents_excessive_allocation`: Tests atomic inventory constraints.
- `test_invalid_status_transitions_rejected`: Enforces courier state machine rules.
- `test_unauthorized_user_cannot_cancel_others_listing`: Enforces tenancy boundaries.
- `test_volunteers_can_only_modify_assigned_tasks`: Ensures couriers only update assigned deliveries.
- `test_notification_access_is_user_isolated`: Confirms zero notification data leakage across users.
- `test_ai_failures_trigger_safe_fallback`: Guarantees deterministic offline behavior.
- `test_natural_language_search_parser`: Tests semantic query breakdown into query filters.
- `test_impact_metrics_calculation`: Tests SQL-aggregated servings and kilogram calculations.
- `test_admin_actions_require_admin_role`: Prevents privilege escalation to admin features.
- `test_e2e_full_platform_lifecycle`: Complete live end-to-end integration across all 4 roles.

**Result: 17 Passed, 0 Failed (100% Green)**

---

## 🎬 Demonstration & Evaluation Walkthrough

Use this 5-step script during project demonstration and review:

### Step 1: Public Impact & Mission Overview
1. Navigate to `http://localhost:5173/`.
2. Showcase the **Landing Page** highlighting the tagline *"Share More. Waste Less. Feed Hope."* and direct alignment with **SDG 2** (Zero Hunger) & **SDG 12** (Responsible Consumption).
3. Click on **Live Impact Dashboard** (`/impact`) to show live database metrics (servings redistributed, category breakdown by prepared meals, bakery, and produce).

### Step 2: Food Donor Experience & AI Co-Pilot
1. Click **Sign In** and click the **"Hotel Donor"** quick-login button (`donor.taj@annasetu.ai`).
2. Show the **Donor Dashboard** with active listings, matched meals, and history.
3. Click **"Post Surplus Food"**:
   - Enter *"Vegetable Dum Biryani with Cucumber Raita"*.
   - Click **"AI Smart Suggestions"**: demonstrate automatic category selection (`prepared_meals`), allergen detection (`Dairy`), and storage instructions (`hot_holding` > 60°C).
   - Enter quantity (e.g. 20 kg / 60 servings), deadline, and check the mandatory Food Safety Declaration.
   - Submit the listing.
4. Click on the listing detail to view **Intelligent Match Recommendations**: observe transparent match scores (e.g., 85/100) based on Haversine distance, recipient daily capacity, and dietary fit.

### Step 3: Recipient NGO Food Discovery & Reservation
1. Log out, then log in using the **"Verified NGO"** quick-login button (`ngo.hope@annasetu.ai`).
2. Show the **Find Food Catalog** (`/recipient/donations`).
3. Demonstrate the **AI Natural Language Filter**: type *"Need vegetarian meals for dinner in Indiranagar"* and watch the AI co-pilot parse category, dietary attributes, and urgency into structured database filters.
4. Click on an available listing and click **"Request Surplus Food"**.

### Step 4: Donor Acceptance & Volunteer Courier Logistics
1. Switch back to the **Hotel Donor** account; view the incoming reservation and click **"Accept Request"**.
2. Notice the listing status immediately updates to `ACCEPTED` and a dispatch run is created.
3. Log out and log in as **Volunteer Courier** (`volunteer.rahul@annasetu.ai`).
4. In **Pickup Tasks** (`/volunteer/tasks`), view the new run under "Available to Claim" and click **"Claim This Run"**.
5. Open the task detail:
   - Click **"Accept Assignment"** (`ACCEPTED`).
   - Click **"Confirm Food Collected from Donor"** (`PICKED_UP`) and observe the storage temperature verification instructions.
   - Click **"Confirm Safe Handover & Delivery Complete"** (`COMPLETED`).
6. Both Donor and NGO receive in-app notifications acknowledging successful redistribution.

### Step 5: Administrator Governance & Compliance
1. Sign in as **Platform Admin** (`admin@annasetu.ai`).
2. Showcase the **Command Center** (`/admin/dashboard`):
   - View pending NGO verifications, open food safety tickets, user breakdown, and courier completion rates.
3. Navigate to **NGO Verifications** (`/admin/verifications`): review Samarpan Youth Trust's Darpan registration certificate and click **"Approve & Verify"**.
4. Navigate to **Safety Reports** (`/admin/safety-reports`): show the investigation queue for temperature and packaging compliance.
5. Navigate to **Audit Trail** (`/admin/audit-logs`): demonstrate the immutable, tamper-evident security ledger recording every authentication, listing change, and dispatch status transition.

---

## 🔒 Food Safety & Regulatory Compliance Notice

> AnnaSetu AI operates strictly within the framework of the **Food Safety and Standards Authority of India (FSSAI) Food Safety and Standards (Recovery of Surplus Food) Regulations**:
> - Only wholesome, safe food within valid consumption windows may be redistributed.
> - Temperature-controlled holding parameters are strictly enforced: hot foods must remain $\ge 60^\circ\text{C}$ and chilled foods $\le 5^\circ\text{C}$.
> - AnnaSetu AI provides logistic coordination and digital traceability; donors and recipient community organizations maintain final responsibility for sensory evaluation, hygiene verification, and food handling.

---

## 📄 Project Governance & Open Standards
Developed with production-grade engineering principles to advance **UN SDG 2 (Zero Hunger)** and **SDG 12 (Responsible Consumption and Production)**.  
Built with FastAPI, React, TypeScript, and Google Gemini AI.
