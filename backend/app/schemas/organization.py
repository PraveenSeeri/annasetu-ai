from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class OrganizationBase(BaseModel):
    name: str
    org_type: str
    registration_number: Optional[str] = None
    address: str
    city: str = "Bengaluru"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_servings_per_day: int = Field(default=100, ge=1)
    service_radius_km: float = Field(default=15.0, ge=0.5)
    contact_email: EmailStr
    contact_phone: str


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    org_type: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_servings_per_day: Optional[int] = None
    service_radius_km: Optional[float] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class OrganizationOut(OrganizationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    verification_status: str
    created_at: datetime
    updated_at: datetime


class VerificationSubmit(BaseModel):
    documents_description: str
    certificate_id: Optional[str] = None


class VerificationReview(BaseModel):
    status: str = Field(..., pattern="^(verified|rejected|suspended)$")
    review_notes: Optional[str] = None


class VerificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    status: str
    submitted_documents: Optional[str] = None
    review_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
