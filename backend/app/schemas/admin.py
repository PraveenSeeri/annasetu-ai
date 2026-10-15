from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class AdminDashboardStats(BaseModel):
    total_users: int
    donor_count: int
    recipient_count: int
    volunteer_count: int
    verified_recipients: int
    pending_verifications: int
    total_listings: int
    active_listings: int
    completed_donations: int
    open_safety_reports: int
    pickup_completion_rate: float


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    user_email: Optional[str] = None
