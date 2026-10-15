from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.listing import FoodListing
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.services.matching_service import match_recipients_for_listing, match_listings_for_recipient

router = APIRouter(prefix="/api/matching", tags=["Smart Matching Engine"])


@router.get("/recipients-for-listing/{listing_id}", response_model=List[Dict[str, Any]])
def get_recommended_recipients(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food listing not found")

    # Only listing donor or admin can view matches for this listing
    if listing.donor_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view matches for this listing")

    return match_recipients_for_listing(db=db, listing=listing)


@router.get("/recommended-listings", response_model=List[Dict[str, Any]])
def get_recommended_donations_for_recipient(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not associated with an organization")

    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    return match_listings_for_recipient(db=db, recipient_org=org)
