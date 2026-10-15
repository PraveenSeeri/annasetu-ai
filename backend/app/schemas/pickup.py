from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.listing import FoodListingOut


class PickupTaskCreate(BaseModel):
    listing_id: int
    donation_request_id: Optional[int] = None
    volunteer_id: Optional[int] = None
    pickup_instructions: Optional[str] = None
    delivery_instructions: Optional[str] = None


class PickupTaskUpdateStatus(BaseModel):
    status: str = Field(..., pattern="^(ACCEPTED|PICKED_UP|COMPLETED|DECLINED|CANCELLED)$")
    notes: Optional[str] = None


class PickupAssignPayload(BaseModel):
    volunteer_id: int
    pickup_instructions: Optional[str] = None
    delivery_instructions: Optional[str] = None


class PickupTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    donation_request_id: Optional[int] = None
    volunteer_id: Optional[int] = None
    status: str
    pickup_deadline: datetime
    pickup_instructions: Optional[str] = None
    delivery_instructions: Optional[str] = None
    notes: Optional[str] = None
    assigned_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    picked_up_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    listing: Optional[FoodListingOut] = None
    volunteer_name: Optional[str] = None
    volunteer_phone: Optional[str] = None
    recipient_org_name: Optional[str] = None
    recipient_address: Optional[str] = None
