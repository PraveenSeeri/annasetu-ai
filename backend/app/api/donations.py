from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_verified_recipient
from app.models.donation import DonationRequest
from app.models.listing import FoodListing
from app.models.user import User, UserRole
from app.schemas.donation import DonationRequestCreate, DonationRequestOut, DonationActionPayload
from app.services.donation_service import create_donation_request, handle_donation_request_action

router = APIRouter(prefix="/api/donations", tags=["Donations & Allocations"])


@router.post("/request", response_model=DonationRequestOut, status_code=status.HTTP_201_CREATED)
def request_donation(
    payload: DonationRequestCreate,
    current_user: User = Depends(require_verified_recipient),
    db: Session = Depends(get_db)
):
    return create_donation_request(
        db=db,
        listing_id=payload.listing_id,
        user=current_user,
        quantity_requested=payload.quantity_requested,
        notes=payload.notes
    )


@router.get("/requests/incoming", response_model=List[DonationRequestOut])
def get_incoming_requests_for_donor(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Donor sees requests for their listings
    reqs = db.query(DonationRequest).join(FoodListing).filter(
        FoodListing.donor_id == current_user.id
    ).order_by(DonationRequest.created_at.desc()).all()
    return reqs


@router.get("/requests/my", response_model=List[DonationRequestOut])
def get_my_donation_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Recipient sees their own requests
    reqs = db.query(DonationRequest).filter(
        DonationRequest.recipient_user_id == current_user.id
    ).order_by(DonationRequest.created_at.desc()).all()
    return reqs


@router.post("/requests/{request_id}/action", response_model=DonationRequestOut)
def act_on_request(
    request_id: int,
    payload: DonationActionPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return handle_donation_request_action(
        db=db,
        request_id=request_id,
        user=current_user,
        action=payload.action,
        notes=payload.notes
    )
