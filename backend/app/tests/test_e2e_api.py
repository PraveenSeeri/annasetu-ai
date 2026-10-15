"""
End-to-End Live Integration Verification Test Script
Tests all user roles and lifecycle workflows on the live seeded SQLite database.
"""
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.listing import FoodListing, ListingStatus

client = TestClient(app)

def test_e2e_full_platform_lifecycle():
    print("\n--- 1. Testing Admin Authentication & Dashboard Stats ---")
    admin_login_res = client.post("/api/auth/login", json={"email": "admin@annasetu.ai", "password": "Admin@123456"})
    assert admin_login_res.status_code == 200, admin_login_res.text
    admin_token = admin_login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    stats_res = client.get("/api/admin/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    print("Admin stats retrieved:", stats)
    assert stats["total_users"] >= 8
    assert stats["donor_count"] >= 2
    assert stats["recipient_count"] >= 2
    assert stats["volunteer_count"] >= 2

    # Check pending verifications
    pending_res = client.get("/api/verifications/pending", headers=admin_headers)
    assert pending_res.status_code == 200
    print(f"Pending NGO verifications in queue: {len(pending_res.json())}")

    print("\n--- 2. Testing AI Endpoints (Resilient Fallbacks) ---")
    cat_res = client.post("/api/ai/categorize", json={
        "title": "Fresh Paneer Butter Masala and Jeera Rice",
        "description": "Cooked 2 hours ago from corporate banquet in thermal pots"
    }, headers=admin_headers)
    assert cat_res.status_code == 200
    cat_data = cat_res.json()
    print("AI categorization result:", cat_data)
    assert cat_data["suggested_category"] == "prepared_meals"

    nl_res = client.post("/api/ai/search-parse", json={
        "query": "Need 50 vegetarian meals for tonight in Indiranagar"
    }, headers=admin_headers)
    assert nl_res.status_code == 200
    nl_data = nl_res.json()
    print("AI Natural Language search parsed:", nl_data)
    assert nl_data["dietary"] == "vegetarian"
    assert nl_data["category"] == "prepared_meals"

    print("\n--- 3. Testing Food Donor Listing Creation & AI Improvement ---")
    donor_login_res = client.post("/api/auth/login", json={"email": "donor.taj@annasetu.ai", "password": "Demo@123456"})
    assert donor_login_res.status_code == 200
    donor_token = donor_login_res.json()["access_token"]
    donor_headers = {"Authorization": f"Bearer {donor_token}"}

    # AI Improvement helper
    improve_res = client.post("/api/ai/improve", json={
        "title": "Vegetable Biryani with Raita",
        "description": "Excess food from lunch buffet",
        "category": "prepared_meals"
    }, headers=donor_headers)
    assert improve_res.status_code == 200
    print("AI listing improve suggestion:", improve_res.json()["enhanced_description"][:80], "...")

    # Create new listing with dynamic future timestamps
    now = datetime.now(timezone.utc)
    new_listing_payload = {
        "title": "Surplus Dal Makhani & Tandoori Roti",
        "description": "Hygienically maintained in hot bain-marie at 68C from dinner buffet.",
        "category": "prepared_meals",
        "quantity": 15.0,
        "unit": "kg",
        "estimated_servings": 45,
        "preparation_datetime": (now - timedelta(hours=1)).isoformat(),
        "expiry_datetime": (now + timedelta(hours=8)).isoformat(),
        "storage_conditions": "hot_holding",
        "allergens": "Dairy, Gluten",
        "dietary_attributes": "vegetarian",
        "pickup_address": "41/1 MG Road, Bengaluru, Karnataka 560001",
        "latitude": 12.9738,
        "longitude": 77.6119,
        "pickup_start_time": now.isoformat(),
        "pickup_deadline": (now + timedelta(hours=4)).isoformat(),
        "contact_name": "Executive Chef Ramesh",
        "contact_phone": "+91 98450 12345",
        "food_safety_declaration": True
    }
    create_res = client.post("/api/listings/", json=new_listing_payload, headers=donor_headers)
    assert create_res.status_code == 201, create_res.text
    listing_id = create_res.json()["id"]
    print(f"Created listing #{listing_id}: {create_res.json()['title']}")

    # Check recipient matching for this listing
    matches_res = client.get(f"/api/matching/recipients-for-listing/{listing_id}", headers=donor_headers)
    assert matches_res.status_code == 200
    matches = matches_res.json()
    print(f"Matching recommendations found: {len(matches)}")
    assert len(matches) > 0
    top_match = matches[0]
    print(f"Top match recipient: {top_match['recipient_name']} (Score: {top_match['match_score']}, Reasons: {top_match['reasons']})")

    print("\n--- 4. Testing Recipient Organization Donation Request ---")
    ngo_login_res = client.post("/api/auth/login", json={"email": "ngo.hope@annasetu.ai", "password": "Demo@123456"})
    assert ngo_login_res.status_code == 200
    ngo_token = ngo_login_res.json()["access_token"]
    ngo_headers = {"Authorization": f"Bearer {ngo_token}"}

    # Request donation
    req_payload = {
        "listing_id": listing_id,
        "quantity_requested": 15.0,
        "notes": "Hope Community Kitchen request for evening dinner distribution."
    }
    req_res = client.post("/api/donations/request", json=req_payload, headers=ngo_headers)
    assert req_res.status_code == 201, req_res.text
    request_id = req_res.json()["id"]
    print(f"Created donation request #{request_id}")

    print("\n--- 5. Testing Donor Accepts Request (Creates Pickup Task) ---")
    action_res = client.post(f"/api/donations/requests/{request_id}/action", json={
        "action": "accept",
        "notes": "Approved. Pickup ready at main kitchen dispatch gate."
    }, headers=donor_headers)
    assert action_res.status_code == 200
    print(f"Donation request accepted: {action_res.json()['status']}")

    # Verify listing is now ACCEPTED
    chk_listing = client.get(f"/api/listings/{listing_id}", headers=donor_headers).json()
    assert chk_listing["status"] in ["ACCEPTED", "MATCHED", "PICKUP_ASSIGNED"]

    print("\n--- 6. Testing Volunteer Claims and Executes Safe Transport Lifecycle ---")
    vol_login_res = client.post("/api/auth/login", json={"email": "volunteer.rahul@annasetu.ai", "password": "Demo@123456"})
    assert vol_login_res.status_code == 200
    vol_token = vol_login_res.json()["access_token"]
    vol_headers = {"Authorization": f"Bearer {vol_token}"}

    # Find unassigned pickups
    unassigned_res = client.get("/api/pickups/unassigned", headers=vol_headers)
    assert unassigned_res.status_code == 200
    unassigned_tasks = unassigned_res.json()
    matching_task = next((t for t in unassigned_tasks if t["listing_id"] == listing_id), None)
    assert matching_task is not None, f"Expected unassigned pickup for listing #{listing_id}"
    task_id = matching_task["id"]
    print(f"Volunteer found unassigned pickup run #{task_id}")

    # Volunteer claims run
    claim_res = client.post(f"/api/pickups/{task_id}/claim", headers=vol_headers)
    assert claim_res.status_code == 200
    assert claim_res.json()["status"] == "ASSIGNED"
    print("Task claimed. Current status: ASSIGNED")

    # Step: ACCEPTED
    accept_task_res = client.post(f"/api/pickups/{task_id}/status", json={
        "status": "ACCEPTED",
        "notes": "En route with thermal carriers."
    }, headers=vol_headers)
    assert accept_task_res.status_code == 200
    assert accept_task_res.json()["status"] == "ACCEPTED"
    print("Current status: ACCEPTED")

    # Step: PICKED_UP
    pickup_step_res = client.post(f"/api/pickups/{task_id}/status", json={
        "status": "PICKED_UP",
        "notes": "Food verified hot at 66C and sealed in 3 insulated thermal containers."
    }, headers=vol_headers)
    assert pickup_step_res.status_code == 200
    assert pickup_step_res.json()["status"] == "PICKED_UP"
    print("Current status: PICKED_UP (In transit)")

    # Step: COMPLETED (Delivered)
    deliver_res = client.post(f"/api/pickups/{task_id}/status", json={
        "status": "COMPLETED",
        "notes": "Safely delivered to Hope Community Kitchen receiving bay. Verified intact."
    }, headers=vol_headers)
    assert deliver_res.status_code == 200
    assert deliver_res.json()["status"] == "COMPLETED"
    print("Current status: COMPLETED (Delivered)")

    print("\n--- 7. Testing Platform Impact Aggregation Metrics ---")
    impact_res = client.get("/api/impact/summary")
    assert impact_res.status_code == 200
    impact = impact_res.json()
    print("Live platform impact summary:", impact)
    assert impact["total_servings_redistributed"] > 0
    assert impact["total_quantity_redistributed_kg"] > 0
    assert impact["donations_completed"] > 0

    print("\n--- 8. Testing Admin Review of Organization Verification ---")
    pending_list = client.get("/api/verifications/pending", headers=admin_headers).json()
    if pending_list:
        test_verif = pending_list[0]
        review_res = client.post(f"/api/verifications/{test_verif['id']}/review", json={
            "status": "verified",
            "review_notes": "All DARPAN documents and 12A registration approved during verification audit."
        }, headers=admin_headers)
        assert review_res.status_code == 200
        print(f"Verified NGO #{test_verif['organization_id']}: status is now '{review_res.json()['status']}'")

    print("\n--- 9. Testing System Audit Trail Persistence ---")
    audit_res = client.get("/api/admin/audit-logs?limit=10", headers=admin_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    print(f"Audit log entries verified: {len(logs)} entries retrieved.")
    assert len(logs) >= 5

    print("\n=======================================================")
    print("SUCCESS: 100% of End-to-End Workflows Passed Flawlessly!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_e2e_full_platform_lifecycle()
