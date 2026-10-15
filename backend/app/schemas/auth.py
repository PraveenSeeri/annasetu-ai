from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=150)
    role: str = Field(..., pattern="^(donor|recipient|volunteer)$")  # Never allow admin from public registration!
    phone: Optional[str] = None
    
    # Optional Organization Details for Onboarding
    org_name: Optional[str] = None
    org_type: Optional[str] = None
    org_address: Optional[str] = None
    org_city: Optional[str] = "Bengaluru"
    org_registration_number: Optional[str] = None
    org_capacity: Optional[int] = 100
    org_service_radius_km: Optional[float] = 15.0
    org_latitude: Optional[float] = None
    org_longitude: Optional[float] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    organization_id: Optional[int] = None
    verification_status: Optional[str] = None


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None
