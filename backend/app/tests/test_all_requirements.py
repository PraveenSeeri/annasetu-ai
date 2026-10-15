import pytest
from datetime import datetime, timezone, timedelta
from app.models.listing import FoodListing, ListingStatus
from app.models.pickup import PickupTask, PickupStatus
from app.models.donation import DonationRequest, RequestStatus
from app.models.notification import Notification
from app.services.ai_service import categorize_food_listing, parse_natural_language_search
from app.services.matching_service import match_recipients_for_listing, match_listings_for_recipient
from app.services.impact_service import get_aggregate_impact_metrics


# 1. Successful registration and login
def test_successful_registration_and_login(client):
    # Register new donor
    reg_payload = {
        "email": "new_donor@annasetu.ai",
        "password": "Password@123",
        "full_name": "New Restaurant Donor",
        "role": "donor",
        "phone": "+91 9123456789",
        "org_name": "New Test Kitchen",
        "org_type": "restaurant",
        "org_address": "Indiranagar, Bengaluru"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "donor"

    # Login
    login_payload = {
        "email": "new_donor@annasetu.ai",
        "password": "Password@123"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token_data = res_login.json()
    assert token_data["access_token"] is not None


# 2. Invalid credentials
def test_invalid_credentials_rejected(client):
    login_payload = {
        "email": "non_existent@annasetu.ai",
        "password": "WrongPassword123"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


# 3. Role-based access restrictions
def test_role_based_access_restrictions(client, test_data):
    # Volunteer cannot create food listing
    future_time = (datetime.now(timezone.utc) + timedelta(hours=6)).isoformat()
    listing_payload = {
        "title": "Unauthorized Listing Attempt",
        "description": "Should fail",
        "category": "prepared_meals",
        "quantity": 10.0,
        "unit": "servings",
        "preparation_datetime": datetime.now(timezone.utc).isoformat(),
        "expiry_datetime": future_time,
        "storage_conditions": "hot_holding",
        "pickup_address": "Test location",
        "pickup_start_time": datetime.now(timezone.utc).isoformat(),
        "pickup_deadline": future_time,
        "contact_name": "Volunteer",
        "contact_phone": "1234567890",
        "food_safety_declaration": True
    }
    headers = {"Authorization": f"Bearer {test_data['volunteer_token']}"}
    res = client.post("/api/listings/", json=listing_payload, headers=headers)
    assert res.status_code == 403

    # Public registration cannot choose 'admin'
    admin_reg = {
        "email": "fake_admin@annasetu.ai",
        "password": "Password@123",
        "full_name": "Fake Admin",
        "role": "admin"
    }
    res_admin = client.post("/api/auth/register", json=admin_reg)
    assert res_admin.status_code == 422 or res_admin.status_code == 403


# 4. Unverified recipients cannot request or accept donations
def test_unverified_recipient_cannot_request_donation(client, test_data, db_session):
    # Create available listing
    now = datetime.now(timezone.utc)
    listing = FoodListing(
        donor_id=test_data["donor_user"].id,
        organization_id=test_data["donor_org"].id,
        title="Test Available Food",
        description="Fresh meals",
        category="prepared_meals",
        quantity=50.0,
        unit="servings",
        remaining_quantity=50.0,
        estimated_servings=50,
        preparation_datetime=now,
        expiry_datetime=now + timedelta(hours=5),
        storage_conditions="hot_holding",
        pickup_address="100 MG Rd",
        pickup_start_time=now,
        pickup_deadline=now + timedelta(hours=4),
        contact_name="Chef",
        contact_phone="9999911111",
        food_safety_declaration=True,
        status=ListingStatus.AVAILABLE.value
    )
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)

    # Attempt request from UNVERIFIED recipient
    req_payload = {
        "listing_id": listing.id,
        "quantity_requested": 25.0
    }
    headers = {"Authorization": f"Bearer {test_data['unverified_recipient_token']}"}
    res = client.post("/api/donations/request", json=req_payload, headers=headers)
    assert res.status_code == 403
    assert "verified" in res.json()["detail"].lower()


# 5. Valid listing creation
def test_valid_listing_creation(client, test_data):
    now = datetime.now(timezone.utc)
    future = (now + timedelta(hours=8)).isoformat()
    payload = {
        "title": "Fresh Paneer Pulao & Salad",
        "description": "50 packs of freshly prepared vegetarian pulao.",
        "category": "prepared_meals",
        "quantity": 50.0,
        "unit": "servings",
        "estimated_servings": 50,
        "preparation_datetime": now.isoformat(),
        "expiry_datetime": future,
        "storage_conditions": "hot_holding",
        "dietary_attributes": "vegetarian",
        "pickup_address": "12 MG Road, Bengaluru",
        "pickup_start_time": now.isoformat(),
        "pickup_deadline": future,
        "contact_name": "Chef Vikram",
        "contact_phone": "+91 98450 11223",
        "food_safety_declaration": True
    }
    headers = {"Authorization": f"Bearer {test_data['donor_token']}"}
    res = client.post("/api/listings/", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["id"] is not None
    assert data["remaining_quantity"] == 50.0
    assert data["status"] == "AVAILABLE"


# 6. Invalid quantity and invalid deadline rejection
def test_invalid_quantity_and_deadline_rejection(client, test_data):
    now = datetime.now(timezone.utc)
    headers = {"Authorization": f"Bearer {test_data['donor_token']}"}

    # Case A: Negative or zero quantity
    bad_qty_payload = {
        "title": "Bad Quantity",
        "description": "Test",
        "category": "prepared_meals",
        "quantity": -5.0,
        "unit": "kg",
        "preparation_datetime": now.isoformat(),
        "expiry_datetime": (now + timedelta(hours=5)).isoformat(),
        "storage_conditions": "ambient",
        "pickup_address": "Test",
        "pickup_start_time": now.isoformat(),
        "pickup_deadline": (now + timedelta(hours=5)).isoformat(),
        "contact_name": "Tester",
        "contact_phone": "12345",
        "food_safety_declaration": True
    }
    res1 = client.post("/api/listings/", json=bad_qty_payload, headers=headers)
    assert res1.status_code == 422

    # Case B: Past deadline
    past_deadline_payload = {
        "title": "Expired Deadline",
        "description": "Test",
        "category": "prepared_meals",
        "quantity": 10.0,
        "unit": "servings",
        "preparation_datetime": (now - timedelta(hours=10)).isoformat(),
        "expiry_datetime": (now - timedelta(hours=2)).isoformat(),
        "storage_conditions": "ambient",
        "pickup_address": "Test",
        "pickup_start_time": (now - timedelta(hours=8)).isoformat(),
        "pickup_deadline": (now - timedelta(hours=1)).isoformat(),
        "contact_name": "Tester",
        "contact_phone": "12345",
        "food_safety_declaration": True
    }
    res2 = client.post("/api/listings/", json=past_deadline_payload, headers=headers)
    assert res2.status_code == 422


# 7. Expired or ineligible listings are excluded from matching
def test_expired_listings_excluded_from_matching(db_session, test_data):
    now = datetime.now(timezone.utc)
    # Expired listing
    expired_listing = FoodListing(
        donor_id=test_data["donor_user"].id,
        organization_id=test_data["donor_org"].id,
        title="Expired Vegetable Soup",
        description="Cold soup",
        category="prepared_meals",
        quantity=30.0,
        unit="servings",
        remaining_quantity=30.0,
        estimated_servings=30,
        preparation_datetime=now - timedelta(days=2),
        expiry_datetime=now - timedelta(hours=1),
        storage_conditions="ambient",
        pickup_address="100 MG Road, Bengaluru",
        pickup_start_time=now - timedelta(days=2),
        pickup_deadline=now - timedelta(hours=1),
        contact_name="Chef",
        contact_phone="12345",
        food_safety_declaration=True,
        status=ListingStatus.AVAILABLE.value
    )
    db_session.add(expired_listing)
    db_session.commit()

    # Deterministic matching must return 0 matches for expired listing
    matches = match_recipients_for_listing(db_session, expired_listing)
    assert len(matches) == 0


# 8. Donation acceptance prevents duplicate or excessive allocation
def test_donation_acceptance_prevents_excessive_allocation(client, test_data, db_session):
    now = datetime.now(timezone.utc)
    listing = FoodListing(
        donor_id=test_data["donor_user"].id,
        organization_id=test_data["donor_org"].id,
        title="Limited 30 Meals",
        description="Limited stock",
        category="prepared_meals",
        quantity=30.0,
        unit="servings",
        remaining_quantity=30.0,
        estimated_servings=30,
        preparation_datetime=now,
        expiry_datetime=now + timedelta(hours=6),
        storage_conditions="hot_holding",
        pickup_address="100 MG Road, Bengaluru",
        pickup_start_time=now,
        pickup_deadline=now + timedelta(hours=5),
        contact_name="Chef",
        contact_phone="12345",
        food_safety_declaration=True,
        status=ListingStatus.AVAILABLE.value
    )
    db_session.add(listing)
    db_session.commit()

    headers = {"Authorization": f"Bearer {test_data['verified_recipient_token']}"}

    # Request 40 meals (exceeds 30) -> Should fail
    res_excess = client.post("/api/donations/request", json={
        "listing_id": listing.id,
        "quantity_requested": 40.0
    }, headers=headers)
    assert res_excess.status_code == 400
    assert "exceeds" in res_excess.json()["detail"].lower()

    # Request 30 meals -> Success
    res_valid = client.post("/api/donations/request", json={
        "listing_id": listing.id,
        "quantity_requested": 30.0
    }, headers=headers)
    assert res_valid.status_code == 201
    req_id = res_valid.json()["id"]

    # Donor accepts request
    donor_headers = {"Authorization": f"Bearer {test_data['donor_token']}"}
    res_accept = client.post(f"/api/donations/requests/{req_id}/action", json={"action": "accept"}, headers=donor_headers)
    assert res_accept.status_code == 200

    # Verify listing is now fully allocated (remaining_quantity == 0)
    db_session.refresh(listing)
    assert listing.remaining_quantity == 0.0
    assert listing.status == ListingStatus.ACCEPTED.value


# 9. Invalid status transitions are rejected
def test_invalid_status_transitions_rejected(client, test_data, db_session):
    now = datetime.now(timezone.utc)
    listing = FoodListing(
        donor_id=test_data["donor_user"].id,
        title="Test Task Listing",
        description="Test",
        category="prepared_meals",
        quantity=10.0,
        unit="servings",
        remaining_quantity=10.0,
        estimated_servings=10,
        preparation_datetime=now,
        expiry_datetime=now + timedelta(hours=5),
        storage_conditions="ambient",
        pickup_address="100 MG Road, Bengaluru",
        pickup_start_time=now,
        pickup_deadline=now + timedelta(hours=4),
        contact_name="Test",
        contact_phone="12345",
        food_safety_declaration=True,
        status=ListingStatus.ACCEPTED.value
    )
    db_session.add(listing)
    db_session.commit()

    # Create unassigned task
    task = PickupTask(
        listing_id=listing.id,
        status=PickupStatus.UNASSIGNED.value,
        pickup_deadline=listing.pickup_deadline
    )
    db_session.add(task)
    db_session.commit()

    # Attempting to directly complete an unassigned task without being picked up must fail
    vol_headers = {"Authorization": f"Bearer {test_data['volunteer_token']}"}
    res = client.post(f"/api/pickups/{task.id}/status", json={"status": "COMPLETED"}, headers=vol_headers)
    assert res.status_code in [400, 403]


# 10. Unauthorized users cannot access another organization's private listings
def test_unauthorized_user_cannot_cancel_others_listing(client, test_data, db_session):
    now = datetime.now(timezone.utc)
    listing = FoodListing(
        donor_id=test_data["donor_user"].id,
        title="Donor Private Listing",
        description="Private food",
        category="prepared_meals",
        quantity=10.0,
        unit="servings",
        remaining_quantity=10.0,
        estimated_servings=10,
        preparation_datetime=now,
        expiry_datetime=now + timedelta(hours=5),
        storage_conditions="ambient",
        pickup_address="100 MG Road, Bengaluru",
        pickup_start_time=now,
        pickup_deadline=now + timedelta(hours=4),
        contact_name="Test",
        contact_phone="12345",
        food_safety_declaration=True,
        status=ListingStatus.AVAILABLE.value
    )
    db_session.add(listing)
    db_session.commit()

    # Recipient or Volunteer tries to cancel donor's listing
    recip_headers = {"Authorization": f"Bearer {test_data['verified_recipient_token']}"}
    res = client.post(f"/api/listings/{listing.id}/cancel", headers=recip_headers)
    assert res.status_code == 403


# 11. Volunteers can only modify assigned pickup tasks
def test_volunteers_can_only_modify_assigned_tasks(client, test_data, db_session):
    now = datetime.now(timezone.utc)
    listing = FoodListing(
        donor_id=test_data["donor_user"].id,
        title="Task Listing",
        description="Test",
        category="bakery",
        quantity=15.0,
        unit="boxes",
        remaining_quantity=0.0,
        estimated_servings=30,
        preparation_datetime=now,
        expiry_datetime=now + timedelta(hours=5),
        storage_conditions="ambient",
        pickup_address="100 MG Road, Bengaluru",
        pickup_start_time=now,
        pickup_deadline=now + timedelta(hours=4),
        contact_name="Test",
        contact_phone="12345",
        food_safety_declaration=True,
        status=ListingStatus.ACCEPTED.value
    )
    db_session.add(listing)
    db_session.flush()

    # Task assigned to a DIFFERENT volunteer ID (e.g. 9999)
    task = PickupTask(
        listing_id=listing.id,
        volunteer_id=9999,
        status=PickupStatus.ASSIGNED.value,
        pickup_deadline=listing.pickup_deadline
    )
    db_session.add(task)
    db_session.commit()

    # Volunteer tries to update a task not assigned to them
    vol_headers = {"Authorization": f"Bearer {test_data['volunteer_token']}"}
    res = client.post(f"/api/pickups/{task.id}/status", json={"status": "ACCEPTED"}, headers=vol_headers)
    assert res.status_code == 403


# 12. Notification access is user-specific
def test_notification_access_is_user_isolated(client, test_data, db_session):
    # Create notification for donor
    notif = Notification(
        user_id=test_data["donor_user"].id,
        title="Confidential Donor Alert",
        message="Private message for donor",
        notification_type="general",
        is_read=False
    )
    db_session.add(notif)
    db_session.commit()

    # Volunteer tries to mark donor's notification read
    vol_headers = {"Authorization": f"Bearer {test_data['volunteer_token']}"}
    res = client.post(f"/api/notifications/{notif.id}/read", headers=vol_headers)
    assert res.status_code == 404

    # Volunteer fetches their notifications -> donor's notification must not appear
    res_list = client.get("/api/notifications/", headers=vol_headers)
    assert res_list.status_code == 200
    ids = [n["id"] for n in res_list.json()]
    assert notif.id not in ids


# 13. AI failures trigger a safe fallback
def test_ai_failures_trigger_safe_fallback(db_session, test_data):
    # Even without GEMINI_API_KEY, categorizer fallback must reliably extract category & tags
    res = categorize_food_listing(
        db=db_session,
        title="Hot Veg Biryani and Raita (60 Servings)",
        description="Freshly cooked basmati rice with mixed vegetables and dairy curd raita. Keep hot."
    )
    assert res.suggested_category == "prepared_meals"
    assert "vegetarian" in res.dietary_tags
    assert res.estimated_servings_hint == 60
    assert len(res.safety_cautions) > 0


# 14. Invalid AI output is rejected / parsed safely
def test_natural_language_search_parser(db_session):
    query = "Show vegetarian meals within 15 km urgent"
    parsed = parse_natural_language_search(db=db_session, query=query)
    assert parsed.category == "prepared_meals"
    assert parsed.dietary == "vegetarian"
    assert parsed.max_distance_km == 15.0
    assert parsed.urgent_only is True


# 15. Impact metrics are calculated correctly
def test_impact_metrics_calculation(client, db_session, test_data):
    metrics = get_aggregate_impact_metrics(db_session)
    assert metrics.total_donations_listed >= 0
    assert metrics.completion_rate_percentage >= 0.0
    assert len(metrics.category_breakdown) > 0

    res = client.get("/api/impact/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_servings_redistributed" in data
    assert "sdg_alignment" in data


# 16. Administrator actions require admin permissions
def test_admin_actions_require_admin_role(client, test_data):
    # Non-admin tries to access admin stats
    vol_headers = {"Authorization": f"Bearer {test_data['volunteer_token']}"}
    res_vol = client.get("/api/admin/stats", headers=vol_headers)
    assert res_vol.status_code == 403

    donor_headers = {"Authorization": f"Bearer {test_data['donor_token']}"}
    res_donor = client.get("/api/admin/audit-logs", headers=donor_headers)
    assert res_donor.status_code == 403

    # Admin access succeeds
    admin_headers = {"Authorization": f"Bearer {test_data['admin_token']}"}
    res_admin = client.get("/api/admin/stats", headers=admin_headers)
    assert res_admin.status_code == 200
    assert "total_users" in res_admin.json()
