import os
import sys
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.organization import Organization, OrgType, VerificationStatus
from app.models.verification import OrganizationVerification
from app.models.listing import FoodListing, ListingStatus, FoodCategory, StorageCondition, DietaryAttribute
from app.models.donation import DonationRequest, RequestStatus
from app.models.pickup import PickupTask, PickupStatus
from app.models.notification import Notification
from app.models.safety_report import SafetyReport, SafetyReportStatus
from app.models.audit_log import AuditLog


def seed_database():
    db = SessionLocal()
    print("Checking and seeding development demo data for AnnaSetu AI...")

    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == "admin@annasetu.ai").first()
    if existing_admin:
        print("Database already seeded with demo data.")
        db.close()
        return

    now = datetime.now(timezone.utc)

    # 1. Organizations
    # Donors
    org_taj = Organization(
        name="The Grand Taj Kitchen [Demo Donor]",
        org_type=OrgType.RESTAURANT.value,
        registration_number="FSSAI-21223049100234",
        address="12 MG Road, Ashok Nagar",
        city="Bengaluru",
        latitude=12.9716,
        longitude=77.5946,
        capacity_servings_per_day=300,
        service_radius_km=15.0,
        contact_email="taj.kitchen@annasetu.ai",
        contact_phone="+91 98450 11223",
        verification_status=VerificationStatus.VERIFIED.value
    )
    org_hostel = Organization(
        name="Apex University Hostel Mess [Demo Donor]",
        org_type=OrgType.HOSTEL.value,
        registration_number="INST-BLR-88219",
        address="Campus Sector 4, Koramangala",
        city="Bengaluru",
        latitude=12.9352,
        longitude=77.6245,
        capacity_servings_per_day=500,
        service_radius_km=12.0,
        contact_email="apex.hostel@annasetu.ai",
        contact_phone="+91 98450 44556",
        verification_status=VerificationStatus.VERIFIED.value
    )
    # Recipients
    org_hope = Organization(
        name="Hope Foundation Shelter [Demo NGO - Verified]",
        org_type=OrgType.SHELTER.value,
        registration_number="DARPAN-KA-2019-00912",
        address="45 8th Main, Indiranagar",
        city="Bengaluru",
        latitude=12.9784,
        longitude=77.6408,
        capacity_servings_per_day=180,
        service_radius_km=20.0,
        contact_email="hope.shelter@annasetu.ai",
        contact_phone="+91 98450 77889",
        verification_status=VerificationStatus.VERIFIED.value
    )
    org_care = Organization(
        name="Care Community Kitchen [Demo Kitchen - Verified]",
        org_type=OrgType.COMMUNITY_KITCHEN.value,
        registration_number="DARPAN-KA-2021-03481",
        address="18 1st Cross, Wilson Garden",
        city="Bengaluru",
        latitude=12.9520,
        longitude=77.5980,
        capacity_servings_per_day=250,
        service_radius_km=15.0,
        contact_email="care.kitchen@annasetu.ai",
        contact_phone="+91 98450 99001",
        verification_status=VerificationStatus.VERIFIED.value
    )
    org_pending = Organization(
        name="Annapoorna Seva Trust [Demo NGO - Pending]",
        org_type=OrgType.NGO.value,
        registration_number="DARPAN-KA-2024-99120",
        address="92 5th Block, Jayanagar",
        city="Bengaluru",
        latitude=12.9250,
        longitude=77.5938,
        capacity_servings_per_day=120,
        service_radius_km=10.0,
        contact_email="annapoorna.trust@annasetu.ai",
        contact_phone="+91 98450 33221",
        verification_status=VerificationStatus.PENDING.value
    )

    db.add_all([org_taj, org_hostel, org_hope, org_care, org_pending])
    db.flush()

    # 2. Users
    pwd_hash = hash_password("Demo@123456")
    admin_pwd_hash = hash_password("Admin@123456")

    admin = User(
        email="admin@annasetu.ai",
        password_hash=admin_pwd_hash,
        full_name="System Administrator (Academic Demo)",
        role=UserRole.ADMIN.value,
        phone="+91 90000 00001",
        is_active=True
    )
    donor_taj = User(
        email="donor.taj@annasetu.ai",
        password_hash=pwd_hash,
        full_name="Chef Vikram Sengupta (Grand Taj)",
        role=UserRole.DONOR.value,
        phone="+91 98450 11223",
        organization_id=org_taj.id,
        is_active=True
    )
    donor_hostel = User(
        email="donor.hostel@annasetu.ai",
        password_hash=pwd_hash,
        full_name="Hostel Warden Ramesh Kumar (Apex Mess)",
        role=UserRole.DONOR.value,
        phone="+91 98450 44556",
        organization_id=org_hostel.id,
        is_active=True
    )
    recipient_hope = User(
        email="ngo.hope@annasetu.ai",
        password_hash=pwd_hash,
        full_name="Priya Sharma (Hope Foundation)",
        role=UserRole.RECIPIENT.value,
        phone="+91 98450 77889",
        organization_id=org_hope.id,
        is_active=True
    )
    recipient_care = User(
        email="ngo.care@annasetu.ai",
        password_hash=pwd_hash,
        full_name="Anand Kulkarni (Care Community Kitchen)",
        role=UserRole.RECIPIENT.value,
        phone="+91 98450 99001",
        organization_id=org_care.id,
        is_active=True
    )
    recipient_pending = User(
        email="ngo.pending@annasetu.ai",
        password_hash=pwd_hash,
        full_name="Suresh Rao (Annapoorna Seva Trust)",
        role=UserRole.RECIPIENT.value,
        phone="+91 98450 33221",
        organization_id=org_pending.id,
        is_active=True
    )
    volunteer_rahul = User(
        email="volunteer.rahul@annasetu.ai",
        password_hash=pwd_hash,
        full_name="Rahul Varma [Volunteer]",
        role=UserRole.VOLUNTEER.value,
        phone="+91 98450 55667",
        is_active=True
    )
    volunteer_sneha = User(
        email="volunteer.sneha@annasetu.ai",
        password_hash=pwd_hash,
        full_name="Sneha Patil [Volunteer]",
        role=UserRole.VOLUNTEER.value,
        phone="+91 98450 66778",
        is_active=True
    )

    db.add_all([admin, donor_taj, donor_hostel, recipient_hope, recipient_care, recipient_pending, volunteer_rahul, volunteer_sneha])
    db.flush()

    # 3. Organization Verifications
    verif_hope = OrganizationVerification(
        organization_id=org_hope.id,
        status="verified",
        submitted_documents="NGO DARPAN registration, 12A 80G tax certificate, sanitary kitchen inspection audit 2025",
        review_notes="Verified against official records. Certified for prepared meal distribution.",
        reviewed_by_user_id=admin.id,
        reviewed_at=now - timedelta(days=20)
    )
    verif_care = OrganizationVerification(
        organization_id=org_care.id,
        status="verified",
        submitted_documents="FSSAI Basic registration, NGO DARPAN certificate",
        review_notes="Approved for community kitchen bulk intake.",
        reviewed_by_user_id=admin.id,
        reviewed_at=now - timedelta(days=15)
    )
    verif_pending = OrganizationVerification(
        organization_id=org_pending.id,
        status="pending",
        submitted_documents="Registration application submitted on portal. Awaiting secondary utility bill proof.",
        review_notes=None
    )
    db.add_all([verif_hope, verif_care, verif_pending])

    # 4. Food Listings
    # Listing 1: Available Vegetarian Biryani (Urgent: 3.5 hrs left)
    l1 = FoodListing(
        donor_id=donor_taj.id,
        organization_id=org_taj.id,
        title="Royal Vegetable Biryani & Cucumber Raita [50 Servings]",
        description="Freshly prepared aromatic Basmati rice biryani with garden vegetables, paneer cubes, and mint raita. Leftover from executive luncheon buffet. Stored hot in insulated food-grade cambros.",
        category=FoodCategory.PREPARED_MEALS.value,
        quantity=50.0,
        unit="servings",
        remaining_quantity=50.0,
        estimated_servings=50,
        preparation_datetime=now - timedelta(hours=2),
        expiry_datetime=now + timedelta(hours=4),
        storage_conditions=StorageCondition.HOT_HOLDING.value,
        allergens="Dairy (in raita)",
        dietary_attributes=DietaryAttribute.VEGETARIAN.value,
        pickup_address="12 MG Road, Ashok Nagar, Bengaluru (Loading Bay 2)",
        latitude=12.9716,
        longitude=77.5946,
        pickup_start_time=now - timedelta(hours=1),
        pickup_deadline=now + timedelta(hours=3, minutes=30),
        contact_name="Chef Vikram Sengupta",
        contact_phone="+91 98450 11223",
        food_safety_declaration=True,
        status=ListingStatus.AVAILABLE.value
    )

    # Listing 2: Available Fresh Bakery Loaves & Buns (8 hrs left)
    l2 = FoodListing(
        donor_id=donor_taj.id,
        organization_id=org_taj.id,
        title="Assorted Multigrain Bread Loaves, Buns & Croissants",
        description="Day-baked artisanal multigrain loaves, burger buns, dinner rolls, and plain croissants. Individually packed in food-grade kraft bags.",
        category=FoodCategory.BAKERY.value,
        quantity=80.0,
        unit="pieces",
        remaining_quantity=80.0,
        estimated_servings=60,
        preparation_datetime=now - timedelta(hours=5),
        expiry_datetime=now + timedelta(hours=18),
        storage_conditions=StorageCondition.AMBIENT.value,
        allergens="Gluten (wheat)",
        dietary_attributes=DietaryAttribute.VEGETARIAN.value,
        pickup_address="12 MG Road, Ashok Nagar, Bengaluru (Bakery Dispatch)",
        latitude=12.9716,
        longitude=77.5946,
        pickup_start_time=now,
        pickup_deadline=now + timedelta(hours=8),
        contact_name="Bakery Mgr Sunil",
        contact_phone="+91 98450 11224",
        food_safety_declaration=True,
        status=ListingStatus.AVAILABLE.value
    )

    # Listing 3: Available Farm Fresh Mixed Vegetables
    l3 = FoodListing(
        donor_id=donor_hostel.id,
        organization_id=org_hostel.id,
        title="Fresh Mixed Vegetables (Cabbage, Carrots, Potatoes, Tomatoes)",
        description="Uncooked, fresh farm produce surplus from campus mess bulk delivery. Inspected and crated in ventilated crates.",
        category=FoodCategory.PRODUCE.value,
        quantity=45.0,
        unit="kg",
        remaining_quantity=45.0,
        estimated_servings=90,
        preparation_datetime=now - timedelta(hours=12),
        expiry_datetime=now + timedelta(days=2),
        storage_conditions=StorageCondition.AMBIENT.value,
        allergens="None",
        dietary_attributes=DietaryAttribute.VEGAN.value,
        pickup_address="Campus Sector 4, Koramangala, Bengaluru (Mess Gate 3)",
        latitude=12.9352,
        longitude=77.6245,
        pickup_start_time=now,
        pickup_deadline=now + timedelta(hours=12),
        contact_name="Hostel Warden Ramesh",
        contact_phone="+91 98450 44556",
        food_safety_declaration=True,
        status=ListingStatus.AVAILABLE.value
    )

    # Listing 4: In Progress (PICKED_UP / In Transit)
    l4 = FoodListing(
        donor_id=donor_hostel.id,
        organization_id=org_hostel.id,
        title="Steamed Rice, Sambar & Mixed Veg Poriyal [70 Servings]",
        description="Freshly prepared lunch surplus from hostel block B. Cooked at 11:30 AM. Stored in covered stainless steel vessels.",
        category=FoodCategory.PREPARED_MEALS.value,
        quantity=70.0,
        unit="servings",
        remaining_quantity=0.0,
        estimated_servings=70,
        preparation_datetime=now - timedelta(hours=3),
        expiry_datetime=now + timedelta(hours=3),
        storage_conditions=StorageCondition.HOT_HOLDING.value,
        allergens="Mustard seeds",
        dietary_attributes=DietaryAttribute.VEGETARIAN.value,
        pickup_address="Campus Sector 4, Koramangala, Bengaluru",
        latitude=12.9352,
        longitude=77.6245,
        pickup_start_time=now - timedelta(hours=2),
        pickup_deadline=now + timedelta(hours=2),
        contact_name="Hostel Warden Ramesh",
        contact_phone="+91 98450 44556",
        food_safety_declaration=True,
        status=ListingStatus.PICKED_UP.value,
        matched_recipient_org_id=org_care.id
    )

    # Listing 5: Historical Completed Donation
    l5 = FoodListing(
        donor_id=donor_taj.id,
        organization_id=org_taj.id,
        title="South Indian Idli, Vada, Chutney & Sambar Feast [120 Servings]",
        description="Morning banquet surplus breakfast items. Successfully collected and distributed.",
        category=FoodCategory.PREPARED_MEALS.value,
        quantity=120.0,
        unit="servings",
        remaining_quantity=0.0,
        estimated_servings=120,
        preparation_datetime=now - timedelta(days=2, hours=4),
        expiry_datetime=now - timedelta(days=2),
        storage_conditions=StorageCondition.HOT_HOLDING.value,
        allergens="Coconut, mustard",
        dietary_attributes=DietaryAttribute.VEGETARIAN.value,
        pickup_address="12 MG Road, Ashok Nagar, Bengaluru",
        latitude=12.9716,
        longitude=77.5946,
        pickup_start_time=now - timedelta(days=2, hours=3),
        pickup_deadline=now - timedelta(days=2, hours=1),
        contact_name="Chef Vikram Sengupta",
        contact_phone="+91 98450 11223",
        food_safety_declaration=True,
        status=ListingStatus.COMPLETED.value,
        matched_recipient_org_id=org_hope.id
    )

    db.add_all([l1, l2, l3, l4, l5])
    db.flush()

    # 5. Donation Requests
    req_care = DonationRequest(
        listing_id=l4.id,
        recipient_user_id=recipient_care.id,
        recipient_org_id=org_care.id,
        quantity_requested=70.0,
        servings_requested=70,
        status=RequestStatus.ACCEPTED.value,
        notes="Urgent meal provision for our Wilson Garden daily dinner line."
    )
    req_hist = DonationRequest(
        listing_id=l5.id,
        recipient_user_id=recipient_hope.id,
        recipient_org_id=org_hope.id,
        quantity_requested=120.0,
        servings_requested=120,
        status=RequestStatus.COMPLETED.value,
        notes="Distributed to 120 shelter residents."
    )
    db.add_all([req_care, req_hist])
    db.flush()

    # 6. Pickup Tasks
    pickup_active = PickupTask(
        listing_id=l4.id,
        donation_request_id=req_care.id,
        volunteer_id=volunteer_rahul.id,
        status=PickupStatus.PICKED_UP.value,
        pickup_deadline=l4.pickup_deadline,
        pickup_instructions="Report to Koramangala Mess Gate 3. Contact Warden Ramesh. Bring large insulated carriers.",
        delivery_instructions="Deliver directly to Care Community Kitchen, 18 1st Cross Wilson Garden.",
        notes="Collected from donor at 12:45 PM in good warm condition. En route via scooter.",
        assigned_at=now - timedelta(hours=1, minutes=45),
        accepted_at=now - timedelta(hours=1, minutes=30),
        picked_up_at=now - timedelta(minutes=25)
    )

    pickup_completed = PickupTask(
        listing_id=l5.id,
        donation_request_id=req_hist.id,
        volunteer_id=volunteer_sneha.id,
        status=PickupStatus.COMPLETED.value,
        pickup_deadline=l5.pickup_deadline,
        pickup_instructions="Pickup from Grand Taj kitchen bay.",
        delivery_instructions="Deliver to Hope Foundation Indiranagar.",
        notes="Delivered on time. Verified hot and fresh by shelter supervisor.",
        assigned_at=now - timedelta(days=2, hours=2, minutes=30),
        accepted_at=now - timedelta(days=2, hours=2, minutes=15),
        picked_up_at=now - timedelta(days=2, hours=1, minutes=40),
        completed_at=now - timedelta(days=2, hours=1)
    )
    db.add_all([pickup_active, pickup_completed])

    # 7. Notifications
    n1 = Notification(
        user_id=donor_taj.id,
        title="Welcome to AnnaSetu AI",
        message="Your food donor profile is set up. Post surplus food listings anytime to connect with verified shelters.",
        notification_type="general",
        is_read=True
    )
    n2 = Notification(
        user_id=recipient_care.id,
        title="Pickup In Transit",
        message="Volunteer Rahul Varma has collected the Steamed Rice & Sambar and is on the way to your kitchen.",
        notification_type="pickup_status",
        related_pickup_id=pickup_active.id,
        is_read=False
    )
    n3 = Notification(
        user_id=volunteer_rahul.id,
        title="Pickup Task Assigned",
        message="You are assigned to transport surplus meals from Apex University Mess to Care Community Kitchen.",
        notification_type="pickup_assigned",
        related_pickup_id=pickup_active.id,
        is_read=True
    )
    db.add_all([n1, n2, n3])

    # 8. Safety Reports
    sr = SafetyReport(
        listing_id=l5.id,
        reporter_user_id=recipient_hope.id,
        reason="Packaging inspection check",
        details="Standard protocol inspection conducted upon delivery: temperature verified at 64°C, tamper-evident seals intact.",
        status=SafetyReportStatus.RESOLVED.value,
        admin_notes="Routine food safety spot check verified clean and compliant with safe handling rules.",
        resolved_by_user_id=admin.id,
        resolved_at=now - timedelta(days=1)
    )
    db.add(sr)

    # 9. Audit Logs
    audit1 = AuditLog(
        user_id=admin.id,
        action="SEED_DEVELOPMENT_ENVIRONMENT",
        entity_type="system",
        details="Initialized development demo data with 5 organizations, 8 users, and historical listings."
    )
    db.add(audit1)

    db.commit()
    db.close()
    print("Database successfully seeded with realistic demo data for presentation!")


if __name__ == "__main__":
    seed_database()
