from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_donor
from app.models.listing import FoodListing, ListingStatus
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.models.donation import DonationRequest, RequestStatus
from app.schemas.listing import FoodListingCreate, FoodListingUpdate, FoodListingOut
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/listings", tags=["Food Listings"])


def _enrich_listing_out(item: FoodListing) -> dict:
    data = FoodListingOut.model_validate(item).model_dump()
    data["donor_org_name"] = item.organization.name if item.organization else (item.donor.full_name if item.donor else "Donor")
    data["matched_recipient_org_name"] = item.matched_recipient_org.name if item.matched_recipient_org else None
    return data


@router.post("/", response_model=FoodListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: FoodListingCreate,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    # Conservative food safety check
    now = datetime.now(timezone.utc)
    deadline = payload.pickup_deadline if payload.pickup_deadline.tzinfo else payload.pickup_deadline.replace(tzinfo=timezone.utc)
    if deadline <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pickup deadline must be set in the future"
        )

    if not payload.food_safety_declaration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Food safety declaration confirmation is mandatory to list surplus food"
        )

    listing = FoodListing(
        donor_id=current_user.id,
        organization_id=current_user.organization_id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        quantity=payload.quantity,
        unit=payload.unit,
        remaining_quantity=payload.quantity,  # Initially full
        estimated_servings=payload.estimated_servings,
        preparation_datetime=payload.preparation_datetime,
        expiry_datetime=payload.expiry_datetime,
        storage_conditions=payload.storage_conditions,
        allergens=payload.allergens,
        dietary_attributes=payload.dietary_attributes,
        pickup_address=payload.pickup_address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        pickup_start_time=payload.pickup_start_time,
        pickup_deadline=payload.pickup_deadline,
        contact_name=payload.contact_name,
        contact_phone=payload.contact_phone,
        food_safety_declaration=payload.food_safety_declaration,
        status=ListingStatus.AVAILABLE.value,
        image_url=payload.image_url
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    log_action(
        db=db,
        user_id=current_user.id,
        action="CREATE_FOOD_LISTING",
        entity_type="food_listing",
        entity_id=listing.id,
        details=f"Created '{listing.title}' ({listing.quantity} {listing.unit})"
    )

    return _enrich_listing_out(listing)


@router.get("/", response_model=List[FoodListingOut])
def list_food_donations(
    category: Optional[str] = None,
    dietary: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    urgent_only: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    query = db.query(FoodListing)

    if status_filter:
        query = query.filter(FoodListing.status == status_filter)
    else:
        # By default, show available or active listings
        query = query.filter(FoodListing.status.in_([ListingStatus.AVAILABLE.value, ListingStatus.REQUESTED.value]))

    if category:
        query = query.filter(FoodListing.category == category)
    if dietary:
        query = query.filter(FoodListing.dietary_attributes.ilike(f"%{dietary}%"))
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (FoodListing.title.ilike(search_filter)) |
            (FoodListing.description.ilike(search_filter)) |
            (FoodListing.pickup_address.ilike(search_filter))
        )

    now = datetime.now(timezone.utc)
    # Check if not expired
    query = query.filter(FoodListing.pickup_deadline > now)

    listings = query.order_by(FoodListing.pickup_deadline.asc()).all()
    return [_enrich_listing_out(item) for item in listings]


@router.get("/my-listings", response_model=List[FoodListingOut])
def get_donor_listings(
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    items = db.query(FoodListing).filter(
        FoodListing.donor_id == current_user.id
    ).order_by(FoodListing.created_at.desc()).all()
    return [_enrich_listing_out(item) for item in items]


@router.get("/{listing_id}", response_model=FoodListingOut)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    item = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food listing not found")
    return _enrich_listing_out(item)


@router.put("/{listing_id}", response_model=FoodListingOut)
def update_listing(
    listing_id: int,
    payload: FoodListingUpdate,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    item = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food listing not found")

    if item.donor_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this listing")

    if item.status == ListingStatus.COMPLETED.value and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot edit a completed donation")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)

    log_action(
        db=db,
        user_id=current_user.id,
        action="UPDATE_FOOD_LISTING",
        entity_type="food_listing",
        entity_id=item.id
    )

    return _enrich_listing_out(item)


@router.post("/{listing_id}/cancel", response_model=FoodListingOut)
def cancel_listing(
    listing_id: int,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    item = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food listing not found")

    if item.donor_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this listing")

    if item.status == ListingStatus.COMPLETED.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Completed donation cannot be cancelled")

    item.status = ListingStatus.CANCELLED.value
    db.commit()
    db.refresh(item)

    log_action(
        db=db,
        user_id=current_user.id,
        action="CANCEL_FOOD_LISTING",
        entity_type="food_listing",
        entity_id=item.id
    )

    return _enrich_listing_out(item)
