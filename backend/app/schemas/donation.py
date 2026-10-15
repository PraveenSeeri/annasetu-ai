from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.listing import FoodListingOut
from app.schemas.organization import OrganizationOut


class DonationRequestCreate(BaseModel):
    listing_id: int
    quantity_requested: float = Field(..., gt=0)
    servings_requested: Optional[int] = Field(default=None, gt=0)
    notes: Optional[str] = None


class DonationRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    recipient_user_id: int
    recipient_org_id: int
    quantity_requested: float
    servings_requested: int
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    listing: Optional[FoodListingOut] = None
    recipient_org: Optional[OrganizationOut] = None


class DonationActionPayload(BaseModel):
    action: str = Field(..., pattern="^(accept|decline|cancel)$")
    notes: Optional[str] = None
