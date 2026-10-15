from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class PickupStatus(str, enum.Enum):
    UNASSIGNED = "UNASSIGNED"
    ASSIGNED = "ASSIGNED"
    ACCEPTED = "ACCEPTED"
    PICKED_UP = "PICKED_UP"
    COMPLETED = "COMPLETED"
    DECLINED = "DECLINED"
    CANCELLED = "CANCELLED"


class PickupTask(Base):
    __tablename__ = "pickup_tasks"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("food_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    donation_request_id = Column(Integer, ForeignKey("donation_requests.id", ondelete="CASCADE"), nullable=True)
    volunteer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status = Column(String(50), default=PickupStatus.UNASSIGNED.value, nullable=False, index=True)
    pickup_deadline = Column(DateTime, nullable=False)
    
    pickup_instructions = Column(Text, nullable=True)
    delivery_instructions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    assigned_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    picked_up_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    listing = relationship("FoodListing", back_populates="pickup_tasks")
    donation_request = relationship("DonationRequest", back_populates="pickup_tasks")
    volunteer = relationship("User", back_populates="assigned_pickups", foreign_keys=[volunteer_id])
