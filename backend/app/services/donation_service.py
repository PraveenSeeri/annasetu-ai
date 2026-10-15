from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from datetime import datetime, timezone
from app.models.listing import FoodListing, ListingStatus
from app.models.donation import DonationRequest, RequestStatus
from app.models.pickup import PickupTask, PickupStatus
from app.models.user import User, UserRole
from app.models.organization import Organization, VerificationStatus
from app.services.notification_service import create_notification
from app.services.audit_service import log_action


def create_donation_request(
    db: Session,
    listing_id: int,
    user: User,
    quantity_requested: float,
    notes: str = None
) -> DonationRequest:
    """
    Atomically request a donation allocation with inventory checks.
    """
    if not user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with an organization to request food donations"
        )

    # Check recipient organization verification status
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org or org.verification_status != VerificationStatus.VERIFIED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified recipient organizations can request food donations"
        )

    # Lock listing record for atomic reservation update
    listing = db.query(FoodListing).with_for_update().filter(FoodListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food listing not found")

    if listing.status not in [ListingStatus.AVAILABLE.value, ListingStatus.REQUESTED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Donation is currently {listing.status} and cannot accept new requests"
        )

    now = datetime.now(timezone.utc)
    deadline = listing.pickup_deadline if listing.pickup_deadline.tzinfo else listing.pickup_deadline.replace(tzinfo=timezone.utc)
    if deadline <= now:
        listing.status = ListingStatus.EXPIRED.value
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This listing has passed its pickup deadline and is expired"
        )

    if quantity_requested <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity requested must be greater than zero"
        )

    if quantity_requested > listing.remaining_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity ({quantity_requested} {listing.unit}) exceeds remaining available quantity ({listing.remaining_quantity} {listing.unit})"
        )

    # Calculate proportionate servings
    servings = max(1, round((quantity_requested / listing.quantity) * listing.estimated_servings)) if listing.quantity > 0 else 1

    donation_req = DonationRequest(
        listing_id=listing.id,
        recipient_user_id=user.id,
        recipient_org_id=user.organization_id,
        quantity_requested=quantity_requested,
        servings_requested=servings,
        status=RequestStatus.PENDING.value,
        notes=notes
    )
    db.add(donation_req)

    # Update listing status to REQUESTED if still AVAILABLE
    if listing.status == ListingStatus.AVAILABLE.value:
        listing.status = ListingStatus.REQUESTED.value

    db.commit()
    db.refresh(donation_req)
    db.refresh(listing)

    # Notify donor
    create_notification(
        db=db,
        user_id=listing.donor_id,
        title="New Donation Request Received",
        message=f"{org.name} has requested {quantity_requested} {listing.unit} of '{listing.title}'.",
        notification_type="request_received",
        related_listing_id=listing.id
    )

    log_action(
        db=db,
        user_id=user.id,
        action="CREATE_DONATION_REQUEST",
        entity_type="donation_request",
        entity_id=donation_req.id,
        details=f"Requested {quantity_requested} {listing.unit} for listing #{listing.id}"
    )

    return donation_req


def handle_donation_request_action(
    db: Session,
    request_id: int,
    user: User,
    action: str,  # accept, decline, cancel
    notes: str = None
) -> DonationRequest:
    """
    Process acceptance or rejection of a donation request by donor or recipient.
    """
    req = db.query(DonationRequest).with_for_update().filter(DonationRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation request not found")

    listing = db.query(FoodListing).with_for_update().filter(FoodListing.id == req.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated listing not found")

    is_donor = (listing.donor_id == user.id or user.role == UserRole.ADMIN.value)
    is_recipient = (req.recipient_user_id == user.id or user.role == UserRole.ADMIN.value)

    if action == "accept":
        if not is_donor:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the donor can accept this request")
        if req.status != RequestStatus.PENDING.value:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Request is already {req.status}")

        # Check remaining quantity
        if req.quantity_requested > listing.remaining_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough remaining quantity to accept this request"
            )

        # Atomic decrement
        listing.remaining_quantity = max(0.0, listing.remaining_quantity - req.quantity_requested)
        req.status = RequestStatus.ACCEPTED.value
        listing.status = ListingStatus.ACCEPTED.value
        listing.matched_recipient_org_id = req.recipient_org_id

        # Automatically create Pickup Task for coordination
        pickup = PickupTask(
            listing_id=listing.id,
            donation_request_id=req.id,
            status=PickupStatus.UNASSIGNED.value,
            pickup_deadline=listing.pickup_deadline,
            pickup_instructions=f"Pickup location: {listing.pickup_address}. Contact {listing.contact_name} at {listing.contact_phone}.",
            delivery_instructions=f"Deliver to recipient organization (ID #{req.recipient_org_id})."
        )
        db.add(pickup)
        db.flush()

        # Update listing status to PICKUP_ASSIGNED or stay ACCEPTED until volunteer assigned
        db.commit()
        db.refresh(req)
        db.refresh(listing)

        # Notify recipient
        create_notification(
            db=db,
            user_id=req.recipient_user_id,
            title="Donation Request Accepted!",
            message=f"Your request for '{listing.title}' ({req.quantity_requested} {listing.unit}) has been accepted. Pickup task created.",
            notification_type="request_accepted",
            related_listing_id=listing.id,
            related_pickup_id=pickup.id
        )

        log_action(
            db=db,
            user_id=user.id,
            action="ACCEPT_DONATION_REQUEST",
            entity_type="donation_request",
            entity_id=req.id,
            details=f"Accepted request #{req.id}. Remaining quantity: {listing.remaining_quantity}"
        )
        return req

    elif action == "decline":
        if not is_donor:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the donor can decline this request")
        if req.status != RequestStatus.PENDING.value:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Request is already {req.status}")

        req.status = RequestStatus.DECLINED.value
        if notes:
            req.notes = f"{req.notes or ''} | Declined: {notes}".strip(" |")

        # Re-check other pending requests on listing; if none and remaining > 0, set back to AVAILABLE
        active_requests = db.query(DonationRequest).filter(
            DonationRequest.listing_id == listing.id,
            DonationRequest.id != req.id,
            DonationRequest.status.in_([RequestStatus.PENDING.value, RequestStatus.ACCEPTED.value])
        ).count()
        if active_requests == 0 and listing.remaining_quantity > 0:
            listing.status = ListingStatus.AVAILABLE.value

        db.commit()
        db.refresh(req)

        # Notify recipient
        create_notification(
            db=db,
            user_id=req.recipient_user_id,
            title="Donation Request Declined",
            message=f"Your request for '{listing.title}' was declined by the donor.",
            notification_type="request_declined",
            related_listing_id=listing.id
        )

        log_action(
            db=db,
            user_id=user.id,
            action="DECLINE_DONATION_REQUEST",
            entity_type="donation_request",
            entity_id=req.id
        )
        return req

    elif action == "cancel":
        if not is_recipient and not is_donor:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this request")
        if req.status not in [RequestStatus.PENDING.value, RequestStatus.ACCEPTED.value]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel request in status {req.status}")

        if req.status == RequestStatus.ACCEPTED.value:
            # Restore quantity
            listing.remaining_quantity += req.quantity_requested
            listing.status = ListingStatus.AVAILABLE.value
            listing.matched_recipient_org_id = None
            # Cancel pickup task if uncompleted
            db.query(PickupTask).filter(
                PickupTask.donation_request_id == req.id,
                PickupTask.status.in_([PickupStatus.UNASSIGNED.value, PickupStatus.ASSIGNED.value, PickupStatus.ACCEPTED.value])
            ).update({"status": PickupStatus.CANCELLED.value})

        req.status = RequestStatus.CANCELLED.value
        db.commit()
        db.refresh(req)

        log_action(
            db=db,
            user_id=user.id,
            action="CANCEL_DONATION_REQUEST",
            entity_type="donation_request",
            entity_id=req.id
        )
        return req

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported action: {action}")
