from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.verification import OrganizationVerification
from app.models.organization import Organization, VerificationStatus
from app.models.user import User
from app.schemas.organization import VerificationSubmit, VerificationReview, VerificationOut
from app.services.notification_service import create_notification
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/verifications", tags=["Verifications"])


@router.post("/submit", response_model=VerificationOut, status_code=status.HTTP_201_CREATED)
def submit_verification(
    payload: VerificationSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No organization associated with this account")

    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    docs = payload.documents_description
    if payload.certificate_id:
        docs = f"Certificate/Registration: {payload.certificate_id} | {docs}"

    verif = OrganizationVerification(
        organization_id=org.id,
        status="pending",
        submitted_documents=docs
    )
    db.add(verif)
    org.verification_status = VerificationStatus.PENDING.value
    db.commit()
    db.refresh(verif)

    log_action(
        db=db,
        user_id=current_user.id,
        action="SUBMIT_VERIFICATION",
        entity_type="organization_verification",
        entity_id=verif.id,
        details=f"Submitted verification for org #{org.id}"
    )

    return verif


@router.get("/pending", response_model=List[VerificationOut])
def list_pending_verifications(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(OrganizationVerification).filter(
        OrganizationVerification.status == "pending"
    ).order_by(OrganizationVerification.created_at.desc()).all()


@router.post("/{verification_id}/review", response_model=VerificationOut)
def review_verification(
    verification_id: int,
    payload: VerificationReview,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    verif = db.query(OrganizationVerification).filter(OrganizationVerification.id == verification_id).first()
    if not verif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification request not found")

    org = db.query(Organization).filter(Organization.id == verif.organization_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated organization not found")

    now = datetime.now(timezone.utc)
    verif.status = payload.status
    verif.review_notes = payload.review_notes
    verif.reviewed_by_user_id = admin.id
    verif.reviewed_at = now

    org.verification_status = payload.status
    db.commit()
    db.refresh(verif)

    # Notify all members of this organization
    org_users = db.query(User).filter(User.organization_id == org.id).all()
    status_title = "Organization Verified!" if payload.status == "verified" else f"Verification Update: {payload.status.title()}"
    msg = f"Your organization '{org.name}' verification status was updated to '{payload.status}' by an administrator."
    if payload.review_notes:
        msg += f" Note: {payload.review_notes}"

    for member in org_users:
        create_notification(
            db=db,
            user_id=member.id,
            title=status_title,
            message=msg,
            notification_type="verification_status"
        )

    log_action(
        db=db,
        user_id=admin.id,
        action="REVIEW_VERIFICATION",
        entity_type="organization_verification",
        entity_id=verif.id,
        details=f"Status set to {payload.status} for org #{org.id}"
    )

    return verif
