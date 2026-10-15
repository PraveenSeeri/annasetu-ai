from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class SafetyReportStatus(str, enum.Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class SafetyReport(Base):
    __tablename__ = "safety_reports"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("food_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    reporter_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    reason = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    status = Column(String(50), default=SafetyReportStatus.OPEN.value, nullable=False, index=True)
    
    admin_notes = Column(Text, nullable=True)
    resolved_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    listing = relationship("FoodListing", back_populates="safety_reports")
    reporter = relationship("User", foreign_keys=[reporter_user_id], back_populates="safety_reports")
    resolver = relationship("User", foreign_keys=[resolved_by_user_id])
