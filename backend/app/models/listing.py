from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class ListingStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    PICKUP_ASSIGNED = "PICKUP_ASSIGNED"
    PICKED_UP = "PICKED_UP"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    FLAGGED_FOR_REVIEW = "FLAGGED_FOR_REVIEW"


class FoodCategory(str, enum.Enum):
    PREPARED_MEALS = "prepared_meals"
    BAKERY = "bakery"
    PACKAGED_FOOD = "packaged_food"
    PRODUCE = "produce"
    DAIRY = "dairy"
    OTHER = "other"


class StorageCondition(str, enum.Enum):
    AMBIENT = "ambient"
    REFRIGERATED = "refrigerated"
    FROZEN = "frozen"
    HOT_HOLDING = "hot_holding"


class DietaryAttribute(str, enum.Enum):
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    HALAL = "halal"
    JAIN = "jain"
    GLUTEN_FREE = "gluten_free"
    NON_VEGETARIAN = "non_vegetarian"
    OTHER = "other"


class FoodListing(Base):
    __tablename__ = "food_listings"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default=FoodCategory.PREPARED_MEALS.value, index=True)
    
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False, default="servings")
    remaining_quantity = Column(Float, nullable=False)  # For atomic quantity reservation
    estimated_servings = Column(Integer, nullable=False, default=1)
    
    preparation_datetime = Column(DateTime, nullable=False)
    expiry_datetime = Column(DateTime, nullable=False)
    storage_conditions = Column(String(50), nullable=False, default=StorageCondition.AMBIENT.value)
    
    allergens = Column(String(255), nullable=True)  # Comma separated e.g. "nuts, dairy, soy" or "None known"
    dietary_attributes = Column(String(100), nullable=False, default=DietaryAttribute.VEGETARIAN.value)
    
    pickup_address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    pickup_start_time = Column(DateTime, nullable=False)
    pickup_deadline = Column(DateTime, nullable=False, index=True)
    
    contact_name = Column(String(150), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    
    food_safety_declaration = Column(Boolean, default=True, nullable=False)
    status = Column(String(50), default=ListingStatus.AVAILABLE.value, nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    
    # Matched recipient organization once matched / accepted
    matched_recipient_org_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    donor = relationship("User", back_populates="listings", foreign_keys=[donor_id])
    organization = relationship("Organization", back_populates="listings", foreign_keys=[organization_id])
    matched_recipient_org = relationship("Organization", foreign_keys=[matched_recipient_org_id])
    requests = relationship("DonationRequest", back_populates="listing", cascade="all, delete-orphan")
    pickup_tasks = relationship("PickupTask", back_populates="listing", cascade="all, delete-orphan")
    safety_reports = relationship("SafetyReport", back_populates="listing", cascade="all, delete-orphan")
