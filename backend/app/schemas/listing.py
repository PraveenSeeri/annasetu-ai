from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone


class FoodListingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    category: str = Field(..., pattern="^(prepared_meals|bakery|packaged_food|produce|dairy|other)$")
    quantity: float = Field(..., gt=0, description="Quantity must be greater than zero")
    unit: str = Field(..., min_length=1, max_length=50)
    estimated_servings: int = Field(default=1, gt=0)
    preparation_datetime: datetime
    expiry_datetime: datetime
    storage_conditions: str = Field(..., pattern="^(ambient|refrigerated|frozen|hot_holding)$")
    allergens: Optional[str] = None
    dietary_attributes: str = Field(default="vegetarian")
    pickup_address: str = Field(..., min_length=5)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pickup_start_time: datetime
    pickup_deadline: datetime
    contact_name: str = Field(..., min_length=2)
    contact_phone: str = Field(..., min_length=5)
    food_safety_declaration: bool = Field(..., description="Must confirm food safety compliance")
    image_url: Optional[str] = None

    @field_validator("food_safety_declaration")
    @classmethod
    def validate_safety_declaration(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must confirm the food safety declaration to create a listing")
        return v


class FoodListingCreate(FoodListingBase):
    @field_validator("pickup_deadline")
    @classmethod
    def validate_deadline_future(cls, v: datetime) -> datetime:
        now = datetime.now(timezone.utc)
        # Handle naive datetimes by assuming UTC
        compare_v = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        if compare_v <= now:
            raise ValueError("Pickup deadline must be in the future")
        return v


class FoodListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    estimated_servings: Optional[int] = Field(None, gt=0)
    preparation_datetime: Optional[datetime] = None
    expiry_datetime: Optional[datetime] = None
    storage_conditions: Optional[str] = None
    allergens: Optional[str] = None
    dietary_attributes: Optional[str] = None
    pickup_address: Optional[str] = None
    pickup_start_time: Optional[datetime] = None
    pickup_deadline: Optional[datetime] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    image_url: Optional[str] = None

    @field_validator("pickup_deadline")
    @classmethod
    def validate_update_deadline_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return v
        now = datetime.now(timezone.utc)
        compare_v = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        if compare_v <= now:
            raise ValueError("Pickup deadline must be in the future")
        return v


class FoodListingOut(FoodListingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    donor_id: int
    organization_id: Optional[int] = None
    remaining_quantity: float
    status: str
    matched_recipient_org_id: Optional[int] = None
    donor_org_name: Optional[str] = None
    matched_recipient_org_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class FoodListingFilter(BaseModel):
    category: Optional[str] = None
    dietary_attributes: Optional[str] = None
    max_distance_km: Optional[float] = None
    min_quantity: Optional[float] = None
    search: Optional[str] = None
    status: Optional[str] = None
