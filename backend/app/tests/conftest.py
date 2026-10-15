import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone, timedelta

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.database import Base, get_db
from app.main import app
from app.core.security import hash_password, create_access_token
from app.models.user import User, UserRole
from app.models.organization import Organization, OrgType, VerificationStatus

# Isolated Test Database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_annasetu.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_data(db_session):
    """Seed test entities for unit and integration testing."""
    pwd = hash_password("Password@123")
    
    # 1. Admin
    admin = User(
        email="test_admin@annasetu.ai",
        password_hash=pwd,
        full_name="Test Admin",
        role=UserRole.ADMIN.value,
        is_active=True
    )
    
    # 2. Donor Org & User
    donor_org = Organization(
        name="Test Donor Kitchen",
        org_type=OrgType.RESTAURANT.value,
        address="100 Test St",
        city="Bengaluru",
        latitude=12.9716,
        longitude=77.5946,
        capacity_servings_per_day=200,
        service_radius_km=15.0,
        contact_email="test_donor@org.com",
        contact_phone="9999911111",
        verification_status=VerificationStatus.VERIFIED.value
    )
    db_session.add_all([admin, donor_org])
    db_session.flush()

    donor_user = User(
        email="test_donor@annasetu.ai",
        password_hash=pwd,
        full_name="Test Donor",
        role=UserRole.DONOR.value,
        organization_id=donor_org.id,
        is_active=True
    )

    # 3. Verified Recipient Org & User
    verified_org = Organization(
        name="Test Verified Shelter",
        org_type=OrgType.SHELTER.value,
        address="200 Test St",
        city="Bengaluru",
        latitude=12.9784,
        longitude=77.6408,
        capacity_servings_per_day=150,
        service_radius_km=20.0,
        contact_email="test_verified@org.com",
        contact_phone="9999922222",
        verification_status=VerificationStatus.VERIFIED.value
    )
    db_session.add(verified_org)
    db_session.flush()

    verified_recipient = User(
        email="test_verified_recipient@annasetu.ai",
        password_hash=pwd,
        full_name="Test Verified Recipient",
        role=UserRole.RECIPIENT.value,
        organization_id=verified_org.id,
        is_active=True
    )

    # 4. Unverified Recipient Org & User
    unverified_org = Organization(
        name="Test Unverified NGO",
        org_type=OrgType.NGO.value,
        address="300 Test St",
        city="Bengaluru",
        latitude=12.9250,
        longitude=77.5938,
        capacity_servings_per_day=100,
        service_radius_km=10.0,
        contact_email="test_unverified@org.com",
        contact_phone="9999933333",
        verification_status=VerificationStatus.PENDING.value
    )
    db_session.add(unverified_org)
    db_session.flush()

    unverified_recipient = User(
        email="test_unverified_recipient@annasetu.ai",
        password_hash=pwd,
        full_name="Test Unverified Recipient",
        role=UserRole.RECIPIENT.value,
        organization_id=unverified_org.id,
        is_active=True
    )

    # 5. Volunteer User
    volunteer = User(
        email="test_volunteer@annasetu.ai",
        password_hash=pwd,
        full_name="Test Volunteer",
        role=UserRole.VOLUNTEER.value,
        is_active=True
    )

    db_session.add_all([donor_user, verified_recipient, unverified_recipient, volunteer])
    db_session.commit()

    return {
        "admin": admin,
        "donor_user": donor_user,
        "donor_org": donor_org,
        "verified_recipient": verified_recipient,
        "verified_org": verified_org,
        "unverified_recipient": unverified_recipient,
        "unverified_org": unverified_org,
        "volunteer": volunteer,
        "admin_token": create_access_token(admin.id, admin.role),
        "donor_token": create_access_token(donor_user.id, donor_user.role),
        "verified_recipient_token": create_access_token(verified_recipient.id, verified_recipient.role),
        "unverified_recipient_token": create_access_token(unverified_recipient.id, unverified_recipient.role),
        "volunteer_token": create_access_token(volunteer.id, volunteer.role),
    }
