from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.organization import Organization, VerificationStatus
from app.models.user import User
from app.schemas.organization import OrganizationOut, OrganizationUpdate

router = APIRouter(prefix="/api/organizations", tags=["Organizations"])


@router.get("/my-org", response_model=OrganizationOut)
def get_my_organization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User is not affiliated with an organization")
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return org


@router.put("/my-org", response_model=OrganizationOut)
def update_my_organization(
    payload: OrganizationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User is not affiliated with an organization")
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(org, field, val)
        
    db.commit()
    db.refresh(org)
    return org


@router.get("/", response_model=List[OrganizationOut])
def list_organizations(
    org_type: Optional[str] = None,
    verification_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Organization)
    if org_type:
        query = query.filter(Organization.org_type == org_type)
    if verification_status:
        query = query.filter(Organization.verification_status == verification_status)
    return query.all()
