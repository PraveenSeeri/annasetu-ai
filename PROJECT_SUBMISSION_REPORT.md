# PROJECT SUBMISSION REPORT
## AnnaSetu AI — Smart Surplus Food Redistribution Platform
> **Platform Engineering Report:** Comprehensive Technical & Architectural Documentation  
> **Global Goals Alignment:** **SDG 2** (Zero Hunger) & **SDG 12** (Responsible Consumption and Production)  
> **Live Demonstration URL:** [http://localhost:5173](http://localhost:5173)  
> **Interactive API Documentation:** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)  
> **Submission Date:** October 2026

---

## 1. Executive Summary & Problem Statement

In metropolitan urban centers across India, an estimated **50 million tonnes of edible food is discarded annually**, originating predominantly from commercial hotels, banquet halls, weddings, corporate cafeterias, and educational hostel messes. Concurrently, vulnerable urban populations—including migrant laborers, elderly residents in relief centers, and children in orphanages—face severe daily nutritional deficits.

### The Coordination Failure
Despite the abundance of edible surplus food, traditional redistribution remains inefficient due to:
1. **Lack of Digital Infrastructure:** Donors rely on ad-hoc phone calls with unpredictable collection windows.
2. **Food Safety & Regulatory Liability:** Without FSSAI temperature holding parameters (hot food $\ge 60^\circ\text{C}$, chilled food $\le 5^\circ\text{C}$), donors fear liability for food spoilage.
3. **Mismatched Batch Sizes:** Large banquets overwhelm small local shelters, while large kitchens receive insufficient small donations.
4. **Logistics Bottlenecks:** Lack of route optimization and certified volunteer couriers creates delivery delays that spoil perishable meals.
5. **Lack of Traceability:** Institutional donors receive no verifiable data on meals distributed or carbon footprint reduced.

### The AnnaSetu AI Solution
**AnnaSetu AI** (*अन्न सेतु* — "Bridge of Food") provides a verified, role-gated, and AI-orchestrated platform connecting commercial food donors with accredited community shelters. The platform incorporates:
- **Conservative Food Safety Protocol:** Safety rules and declarations take absolute precedence over algorithmic matching.
- **Transparent Multi-Factor Proximity Matching (0–100):** Geodesic distance (Haversine formula), shelter daily intake capacity, urgency windows, and dietary compatibility.
- **Concurrency-Safe Atomic Inventory Locking:** Prevents double-booking or over-allocation through row-level transactions (`SELECT FOR UPDATE`).
- **Resilient Gemini AI Co-Pilot:** Structured JSON extraction with **100% deterministic rule-based fallbacks** ensuring seamless offline capability.
- **Empirical Impact Metrics:** Real-time database aggregations of plates salvaged, kilograms diverted, and landfill methane prevention.

---

## 2. Sustainable Development Goals (SDG) Alignment

| SDG Indicator | Target Description | AnnaSetu AI Technical Implementation |
| :--- | :--- | :--- |
| **SDG 2: Zero Hunger** *(Target 2.1 & 2.2)* | End hunger and ensure access to safe, nutritious, and sufficient food all year round. | Salvaged meals are channeled directly into verified, capacity-checked shelters, community dining halls, and child relief centers. |
| **SDG 12: Responsible Consumption** *(Target 12.3)* | Halve per capita global food waste at the retail and consumer levels and reduce food losses along production and supply chains. | Redirects edible surplus from commercial kitchens to prevent decomposition in municipal landfills, mitigating methane ($CH_4$) emissions. |

---

## 3. System Architecture & Technology Stack

```
[ Frontend: React 19 + TypeScript + Tailwind CSS v4 + Vite + Recharts ]
                                 │
                         HTTP REST Proxy
                                 ▼
[ Backend: Python FastAPI + Pydantic v2 + Argon2 + PyJWT + Alembic ]
        │                                             │
        ▼                                             ▼
[ Relational DB: SQLite / Postgres ]      [ AI Service: Google Gemini SDK ]
- Row locking (atomic allocations)        - Structured JSON extraction
- Immutable Audit Logs                    - Deterministic rule fallback
```

### Full-Stack Stack Specifications
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, React Router v7.
- **Backend:** Python 3.12 / 3.14, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, Alembic Migrations.
- **Security & Cryptography:** Argon2 password hashing, HS256 JWT access tokens, role-based dependency guards.
- **Database Engine:** SQLite for zero-config local development, configured for 12-factor cloud deployment on PostgreSQL.
- **Artificial Intelligence:** Google Gemini Python SDK (`google-genai`) with offline deterministic rule-based fallbacks.

---

## 4. User Roles & Permission Boundaries (RBAC)

The platform strictly isolates roles through authenticated backend dependencies:

1. **Food Donor (Hotels, Hostels, Restaurants, Caterers):**
   - Create surplus food listings with quantity, servings, dietary tags, and FSSAI declarations.
   - Use AI Smart Suggestions to detect allergens and optimize packaging descriptions.
   - View recommended recipient NGOs with transparent match scores (0–100).
   - Approve or decline incoming NGO reservation requests.
   - Monitor real-time volunteer courier pickup and transit status.

2. **Recipient Organization (Verified Non-Profits, Shelters, Community Kitchens):**
   - Browse active surplus food listings within local geographic radius.
   - Use AI Natural Language Search (e.g. *"Need 50 vegetarian meals for dinner in Indiranagar"*).
   - Reserve whole or partial food batches constrained by registered daily capacity.
   - **Accreditation Gate:** Unverified NGOs cannot claim live donations until their 12A/80G/Darpan accreditation documents are approved by an administrator.

3. **Volunteer Courier (Logistics Transportation):**
   - Browse unassigned pickup runs across city clusters and self-claim tasks.
   - Progress delivery lifecycle through strict state machine: `ASSIGNED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `COMPLETED`.
   - Record courier transit notes (thermal container temperature, hygiene seals intact).
   - Bound by the **Volunteer Food Safety & Hygiene Charter**.

4. **Platform Administrator (Central Governance & Audit):**
   - Review pending NGO accreditation submissions with 1-click Approval or Rejection with notes.
   - Triage and investigate reported food-safety and spoilage complaints.
   - Moderate catalog listings and cancel non-compliant donations.
   - Toggle user accounts between Active and Suspended (self-suspension is blocked).
   - Inspect the tamper-evident, append-only **System Audit Ledger**.

---

## 5. Food Safety & Regulatory Compliance (FSSAI Framework)

AnnaSetu AI operates strictly within the framework of the **Food Safety and Standards Authority of India (FSSAI) Food Safety and Standards (Recovery of Surplus Food) Regulations**:

- **Temperature Holding Parameters:**
  - `hot_holding`: Food must be maintained and transported at $\ge 60^\circ\text{C}$.
  - `refrigerated`: Chilled perishable food must remain at $\le 5^\circ\text{C}$.
  - `frozen`: Maintained at $\le -18^\circ\text{C}$.
  - `ambient`: Stable dry goods (bakery, grains, sealed packaged goods).
- **Mandatory Food Safety Declaration:** Donors must legally affirm hygienic preparation and suitability prior to listing creation.
- **Time Window Safeguards:** Hard pickup deadlines; expired listings automatically drop out of matching.
- **Allergen Disclosures:** Prominent alerts for Dairy, Gluten, Peanuts, Tree Nuts, Eggs, and Soy.

---

## 6. Verification, Testing & Quality Assurance

The platform has been validated through rigorous automated testing covering security boundaries, concurrency, and live end-to-end user lifecycles:

### Automated Test Suite Results (17/17 Passed — 100% Success)

| Test Identifier | Requirement Verified | Status |
| :--- | :--- | :--- |
| `test_successful_registration_and_login` | Argon2 password hashing and JWT token generation | **PASSED** |
| `test_invalid_credentials_rejected` | 401 Unauthorized returned on invalid credentials | **PASSED** |
| `test_role_based_access_restrictions` | Donor blocked from invoking volunteer endpoints | **PASSED** |
| `test_unverified_recipient_cannot_request_donation` | Unverified NGO blocked from reserving donations | **PASSED** |
| `test_valid_listing_creation` | Listing created with FSSAI safety declaration | **PASSED** |
| `test_invalid_quantity_and_deadline_rejection` | Validation blocks negative quantities or past deadlines | **PASSED** |
| `test_expired_listings_excluded_from_matching` | Expired listings excluded from proximity matching | **PASSED** |
| `test_donation_acceptance_prevents_excessive_allocation` | Atomic row locking blocks over-allocation race conditions | **PASSED** |
| `test_invalid_status_transitions_rejected` | Courier state machine blocks illegal status skips | **PASSED** |
| `test_unauthorized_user_cannot_cancel_others_listing` | Tenancy boundaries block cross-donor modifications | **PASSED** |
| `test_volunteers_can_only_modify_assigned_tasks` | Couriers restricted strictly to assigned runs | **PASSED** |
| `test_notification_access_is_user_isolated` | User notifications isolated with zero cross-user leakage | **PASSED** |
| `test_ai_failures_trigger_safe_fallback` | Deterministic fallback works when API key is unset | **PASSED** |
| `test_natural_language_search_parser` | Query parsed into structured database filters | **PASSED** |
| `test_impact_metrics_calculation` | SQL aggregation calculates real meals and kg | **PASSED** |
| `test_admin_actions_require_admin_role` | Non-admin accounts blocked from admin endpoints | **PASSED** |
| `test_e2e_full_platform_lifecycle` | Complete live end-to-end multi-role lifecycle | **PASSED** |

Frontend production compilation (`npm.cmd run build`) completed cleanly with **zero TypeScript errors**.

---

## 7. Pre-Seeded Demonstration Accounts (One-Click Login)

For evaluation, the database includes pre-seeded realistic Bengaluru scenarios:

| Persona | Role | Email | Password | Key Demonstration Flow |
| :--- | :--- | :--- | :--- | :--- |
| **Central Admin** | Administrator | `admin@annasetu.ai` | `Admin@123456` | Review NGO verifications, triage safety alerts, audit trail |
| **Hotel Donor** | Food Donor | `donor.taj@annasetu.ai` | `Demo@123456` | Post surplus with AI co-pilot, check match score, approve request |
| **Hostel Donor** | Food Donor | `donor.hostel@annasetu.ai` | `Demo@123456` | Bulk cafeteria surplus batch management |
| **Verified NGO** | Recipient NGO | `ngo.hope@annasetu.ai` | `Demo@123456` | Natural language search, reserve meal batch |
| **Community Dining** | Recipient NGO | `ngo.annapurna@annasetu.ai` | `Demo@123456` | High-capacity daily meal distribution |
| **Pending NGO** | Recipient NGO | `ngo.samarpan@annasetu.ai` | `Demo@123456` | Accreditation barrier preventing unverified requests |
| **Volunteer Courier** | Courier | `volunteer.rahul@annasetu.ai` | `Demo@123456` | Claim run, update transit stages to completion |

---

## 8. 5-Step Evaluation Walkthrough Script

1. **Step 1: Public Impact & SDG Alignment**
   - Open [http://localhost:5173/](http://localhost:5173/) to review the landing page and mission.
   - Navigate to [http://localhost:5173/impact](http://localhost:5173/impact) to inspect live database metrics (servings redistributed, kg diverted, category breakdown, 7-day trend).

2. **Step 2: Food Donor Surplus Post with AI Co-Pilot**
   - Click **Sign In** and select **"Hotel Donor"** (`donor.taj@annasetu.ai`).
   - Click **"Post Surplus Food"**, enter a meal title, and click **"AI Smart Suggestions"** to demonstrate automated category assignment, allergen detection, and temperature holding recommendations.
   - Submit the listing with the mandatory Food Safety Declaration.

3. **Step 3: Recipient NGO Discovery & Reservation**
   - Log in as **"Verified NGO"** (`ngo.hope@annasetu.ai`).
   - In **Find Food**, demonstrate the **AI Natural Language Filter** (e.g. *"Need 50 vegetarian meals for dinner in Indiranagar"*).
   - Submit a surplus food reservation request.

4. **Step 4: Donor Acceptance & Volunteer Delivery Handover**
   - Switch to Hotel Donor to accept the request.
   - Switch to **Volunteer Courier** (`volunteer.rahul@annasetu.ai`) under **Pickup Tasks** to claim the run.
   - Progress the mission: `ASSIGNED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `PICKED_UP` (verify thermal containers) $\rightarrow$ `COMPLETED`.
   - Observe in-app notifications dispatched to both donor and recipient.

5. **Step 5: Administrator Governance & Audit Trail**
   - Sign in as **Platform Admin** (`admin@annasetu.ai`).
   - Review pending NGO documents in **NGO Verifications** and click **Approve & Verify**.
   - Review reported food issues in **Safety Reports**.
   - Inspect the tamper-evident **Audit Trail** showing timestamped ledger entries of every transaction.

---

## 9. Conclusion & Future Roadmap

**AnnaSetu AI** proves that modern software engineering, robust concurrency controls, and responsible AI can be combined to solve real-world humanitarian logistics challenges. By transforming edible food waste into dignified meals for vulnerable citizens, the platform tangibly accelerates **SDG 2 (Zero Hunger)** and **SDG 12 (Responsible Consumption and Production)**.

### Future Roadmap
- Integration with Open Network for Digital Commerce (ONDC) Logistics protocols.
- IoT temperature sensor logging during transit using BLE beacons.
- Multi-lingual voice interface in regional languages (Kannada, Hindi, Tamil).
