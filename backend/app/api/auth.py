from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.organization import Organization, OrgType, VerificationStatus
from app.schemas.auth import UserLogin, UserRegister, Token
from app.schemas.user import UserOut
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # 1. Enforce no admin registration from public endpoint
    if payload.role == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative accounts cannot be registered publicly."
        )

    # 2. Check email uniqueness
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # 3. Create Organization if specified or relevant
    org_id = None
    verification_stat = None
    if payload.role in [UserRole.DONOR.value, UserRole.RECIPIENT.value]:
        org_name = payload.org_name or f"{payload.full_name}'s Organization"
        org_type = payload.org_type or (OrgType.RESTAURANT.value if payload.role == UserRole.DONOR.value else OrgType.NGO.value)
        # Recipients require admin verification before accepting food; Donors start with basic verified or pending
        initial_status = VerificationStatus.PENDING.value
        
        org = Organization(
            name=org_name,
            org_type=org_type,
            registration_number=payload.org_registration_number,
            address=payload.org_address or "Bengaluru, Karnataka",
            city=payload.org_city or "Bengaluru",
            latitude=payload.org_latitude,
            longitude=payload.org_longitude,
            capacity_servings_per_day=payload.org_capacity or 100,
            service_radius_km=payload.org_service_radius_km or 15.0,
            contact_email=payload.email.lower(),
            contact_phone=payload.phone or "9876543210",
            verification_status=initial_status
        )
        db.add(org)
        db.flush()
        org_id = org.id
        verification_stat = initial_status

    # 4. Create User
    new_user = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        phone=payload.phone,
        organization_id=org_id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_action(
        db=db,
        user_id=new_user.id,
        action="USER_REGISTRATION",
        entity_type="user",
        entity_id=new_user.id,
        details=f"Registered as role: {payload.role}"
    )

    access_token = create_access_token(subject=new_user.id, role=new_user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        role=new_user.role,
        user_id=new_user.id,
        full_name=new_user.full_name,
        organization_id=new_user.organization_id,
        verification_status=verification_stat
    )


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    verification_stat = None
    if user.organization:
        verification_stat = user.organization.verification_status

    access_token = create_access_token(subject=user.id, role=user.role)

    log_action(
        db=db,
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="user",
        entity_id=user.id
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        organization_id=user.organization_id,
        verification_status=verification_stat
    )


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
