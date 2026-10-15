from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class SafetyReportCreate(BaseModel):
    listing_id: int
    reason: str = Field(..., min_length=3, max_length=255)
    details: str = Field(..., min_length=10)


class SafetyReportReview(BaseModel):
    status: str = Field(..., pattern="^(investigating|resolved|dismissed)$")
    admin_notes: Optional[str] = None


class SafetyReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    reporter_user_id: int
    reason: str
    details: str
    status: str
    admin_notes: Optional[str] = None
    resolved_by_user_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    reporter_name: Optional[str] = None
    listing_title: Optional[str] = None
