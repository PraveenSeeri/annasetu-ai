from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    related_listing_id: Optional[int] = None
    related_pickup_id: Optional[int] = None
    is_read: bool
    created_at: datetime
