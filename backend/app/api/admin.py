from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User, UserRole
from app.models.organization import Organization, VerificationStatus
from app.models.listing import FoodListing, ListingStatus
from app.models.pickup import PickupTask, PickupStatus
from app.models.safety_report import SafetyReport, SafetyReportStatus
from app.models.audit_log import AuditLog
from app.schemas.admin import AdminDashboardStats, AuditLogOut
from app.schemas.user import UserOut
from app.schemas.organization import OrganizationOut
from app.schemas.safety import SafetyReportOut, SafetyReportReview
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/admin", tags=["Administrator Dashboard"])


@router.get("/stats", response_model=AdminDashboardStats)
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    total_users = db.query(User).count()
    donors = db.query(User).filter(User.role == UserRole.DONOR.value).count()
    recipients = db.query(User).filter(User.role == UserRole.RECIPIENT.value).count()
    volunteers = db.query(User).filter(User.role == UserRole.VOLUNTEER.value).count()
    
    verified_recipients = db.query(Organization).filter(
        Organization.verification_status == VerificationStatus.VERIFIED.value
    ).count()
    pending_verif = db.query(Organization).filter(
        Organization.verification_status == VerificationStatus.PENDING.value
    ).count()

    total_listings = db.query(FoodListing).count()
    active_listings = db.query(FoodListing).filter(
        FoodListing.status.in_([ListingStatus.AVAILABLE.value, ListingStatus.REQUESTED.value])
    ).count()
    completed = db.query(FoodListing).filter(FoodListing.status == ListingStatus.COMPLETED.value).count()
    open_safety = db.query(SafetyReport).filter(SafetyReport.status.in_([SafetyReportStatus.OPEN.value, SafetyReportStatus.INVESTIGATING.value])).count()

    # Pickup completion rate
    total_pickups = db.query(PickupTask).count()
    completed_pickups = db.query(PickupTask).filter(PickupTask.status == PickupStatus.COMPLETED.value).count()
    pickup_rate = round((completed_pickups / total_pickups * 100.0), 1) if total_pickups > 0 else 0.0

    return AdminDashboardStats(
        total_users=total_users,
        donor_count=donors,
        recipient_count=recipients,
        volunteer_count=volunteers,
        verified_recipients=verified_recipients,
        pending_verifications=pending_verif,
        total_listings=total_listings,
        active_listings=active_listings,
        completed_donations=completed,
        open_safety_reports=open_safety,
        pickup_completion_rate=pickup_rate
    )


@router.get("/users", response_model=List[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot deactivate self")

    user.is_active = not user.is_active
    db.commit()

    log_action(
        db=db,
        user_id=admin.id,
        action="TOGGLE_USER_STATUS",
        entity_type="user",
        entity_id=user.id,
        details=f"User active state set to {user.is_active}"
    )

    return {"status": "success", "user_id": user.id, "is_active": user.is_active}


@router.get("/safety-reports", response_model=List[SafetyReportOut])
def list_safety_reports(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    reports = db.query(SafetyReport).order_by(SafetyReport.created_at.desc()).all()
    out = []
    for r in reports:
        item = SafetyReportOut.model_validate(r)
        item.reporter_name = r.reporter.full_name if r.reporter else "Anonymous"
        item.listing_title = r.listing.title if r.listing else "Unknown Listing"
        out.append(item)
    return out


@router.post("/safety-reports/{report_id}/review", response_model=SafetyReportOut)
def review_safety_report(
    report_id: int,
    payload: SafetyReportReview,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    report = db.query(SafetyReport).filter(SafetyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety report not found")

    report.status = payload.status
    if payload.admin_notes:
        report.admin_notes = payload.admin_notes
    report.resolved_by_user_id = admin.id
    report.resolved_at = datetime.now(timezone.utc)

    # If resolved with suspicion, optionally flag listing for review
    if payload.status == "resolved" and report.listing:
        report.listing.status = ListingStatus.FLAGGED_FOR_REVIEW.value

    db.commit()
    db.refresh(report)

    log_action(
        db=db,
        user_id=admin.id,
        action="REVIEW_SAFETY_REPORT",
        entity_type="safety_report",
        entity_id=report.id,
        details=f"Status set to {payload.status}"
    )

    item = SafetyReportOut.model_validate(report)
    item.reporter_name = report.reporter.full_name if report.reporter else "Anonymous"
    item.listing_title = report.listing.title if report.listing else "Unknown Listing"
    return item


@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    out = []
    for l in logs:
        item = AuditLogOut.model_validate(l)
        item.user_email = l.user.email if l.user else "System"
        out.append(item)
    return out
