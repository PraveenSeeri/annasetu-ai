from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class OrgType(str, enum.Enum):
    RESTAURANT = "restaurant"
    HOSTEL = "hostel"
    CATERER = "caterer"
    EVENT_ORGANIZER = "event_organizer"
    NGO = "ngo"
    COMMUNITY_KITCHEN = "community_kitchen"
    SHELTER = "shelter"
    COMMUNITY_PANTRY = "community_pantry"
    OTHER = "other"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    org_type = Column(String(50), nullable=False, default=OrgType.RESTAURANT.value)
    registration_number = Column(String(100), nullable=True)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False, default="Bengaluru")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    capacity_servings_per_day = Column(Integer, default=150, nullable=False)
    service_radius_km = Column(Float, default=15.0, nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    verification_status = Column(String(50), default=VerificationStatus.PENDING.value, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    members = relationship("User", back_populates="organization")
    verifications = relationship("OrganizationVerification", back_populates="organization", cascade="all, delete-orphan")
    listings = relationship("FoodListing", back_populates="organization", foreign_keys="FoodListing.organization_id")
    donation_requests = relationship("DonationRequest", back_populates="recipient_org")
