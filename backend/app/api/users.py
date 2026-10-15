from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User, UserRole
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/volunteers", response_model=List[UserOut])
def list_available_volunteers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only donors, recipients, or admins can view available volunteers for coordination
    volunteers = db.query(User).filter(
        User.role == UserRole.VOLUNTEER.value,
        User.is_active == True
    ).all()
    return volunteers
