from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone
from app.models.pickup import PickupTask, PickupStatus
from app.models.listing import FoodListing, ListingStatus
from app.models.donation import DonationRequest, RequestStatus
from app.models.user import User, UserRole
from app.services.notification_service import create_notification
from app.services.audit_service import log_action


def assign_volunteer_to_task(
    db: Session,
    pickup_id: int,
    volunteer_id: int,
    assigner: User,
    pickup_instructions: str = None,
    delivery_instructions: str = None
) -> PickupTask:
    """Assign or claim a pickup task for a volunteer."""
    task = db.query(PickupTask).filter(PickupTask.id == pickup_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pickup task not found")

    volunteer = db.query(User).filter(User.id == volunteer_id, User.role == UserRole.VOLUNTEER.value).first()
    if not volunteer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer user not found")

    task.volunteer_id = volunteer.id
    task.status = PickupStatus.ASSIGNED.value
    task.assigned_at = datetime.now(timezone.utc)
    if pickup_instructions:
        task.pickup_instructions = pickup_instructions
    if delivery_instructions:
        task.delivery_instructions = delivery_instructions

    # Update listing status to PICKUP_ASSIGNED
    listing = db.query(FoodListing).filter(FoodListing.id == task.listing_id).first()
    if listing:
        listing.status = ListingStatus.PICKUP_ASSIGNED.value

    db.commit()
    db.refresh(task)

    # Notify volunteer
    create_notification(
        db=db,
        user_id=volunteer.id,
        title="New Pickup Task Assigned",
        message=f"You have been assigned to pick up food from {listing.title if listing else 'a donor'}. Please review details.",
        notification_type="pickup_assigned",
        related_pickup_id=task.id,
        related_listing_id=listing.id if listing else None
    )

    log_action(
        db=db,
        user_id=assigner.id,
        action="ASSIGN_PICKUP_VOLUNTEER",
        entity_type="pickup_task",
        entity_id=task.id,
        details=f"Assigned volunteer #{volunteer.id}"
    )

    return task


def update_pickup_status(
    db: Session,
    pickup_id: int,
    new_status: str,
    user: User,
    notes: str = None
) -> PickupTask:
    """
    Update pickup task lifecycle according to strict state transition rules.
    Allowed transitions:
    ASSIGNED -> ACCEPTED or DECLINED
    ACCEPTED -> PICKED_UP
    PICKED_UP -> COMPLETED
    """
    task = db.query(PickupTask).filter(PickupTask.id == pickup_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pickup task not found")

    listing = db.query(FoodListing).filter(FoodListing.id == task.listing_id).first()
    now = datetime.now(timezone.utc)

    # Permission check: must be assigned volunteer, admin, or recipient org member for completion
    is_assigned_volunteer = (task.volunteer_id == user.id)
    is_admin = (user.role == UserRole.ADMIN.value)
    
    # Recipient check
    is_recipient = False
    if task.donation_request:
        if user.organization_id == task.donation_request.recipient_org_id:
            is_recipient = True

    if new_status in [PickupStatus.ACCEPTED.value, PickupStatus.DECLINED.value]:
        if not is_assigned_volunteer and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned volunteer can accept or decline this task"
            )
        if task.status != PickupStatus.ASSIGNED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition to {new_status} from current status {task.status}"
            )

        if new_status == PickupStatus.ACCEPTED.value:
            task.status = PickupStatus.ACCEPTED.value
            task.accepted_at = now
        else:
            # Declined: reset to UNASSIGNED so another volunteer can pick it up
            task.status = PickupStatus.UNASSIGNED.value
            task.volunteer_id = None
            task.notes = f"{task.notes or ''} | Declined by volunteer: {notes}".strip(" |")

    elif new_status == PickupStatus.PICKED_UP.value:
        if not is_assigned_volunteer and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned volunteer can confirm pickup"
            )
        if task.status != PickupStatus.ACCEPTED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot mark picked up when status is {task.status}"
            )
        task.status = PickupStatus.PICKED_UP.value
        task.picked_up_at = now
        if listing:
            listing.status = ListingStatus.PICKED_UP.value

        # Notify recipient that food is in transit
        if task.donation_request:
            create_notification(
                db=db,
                user_id=task.donation_request.recipient_user_id,
                title="Food Picked Up — On the Way",
                message=f"Volunteer has collected '{listing.title if listing else 'food'}' from donor. In transit now.",
                notification_type="pickup_status",
                related_pickup_id=task.id
            )

    elif new_status == PickupStatus.COMPLETED.value:
        if not is_assigned_volunteer and not is_recipient and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned volunteer, recipient, or admin can complete the pickup"
            )
        if task.status != PickupStatus.PICKED_UP.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete delivery when status is {task.status}"
            )
        task.status = PickupStatus.COMPLETED.value
        task.completed_at = now
        if listing:
            listing.status = ListingStatus.COMPLETED.value
        if task.donation_request:
            task.donation_request.status = RequestStatus.COMPLETED.value

        # Notify donor that food reached beneficiaries
        if listing:
            create_notification(
                db=db,
                user_id=listing.donor_id,
                title="Donation Delivered Successfully!",
                message=f"Your donation '{listing.title}' ({listing.estimated_servings} servings) has been safely delivered. Thank you for feeding hope!",
                notification_type="pickup_status",
                related_listing_id=listing.id,
                related_pickup_id=task.id
            )

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid target status {new_status}")

    if notes:
        task.notes = f"{task.notes or ''} | {notes}".strip(" |")

    db.commit()
    db.refresh(task)

    log_action(
        db=db,
        user_id=user.id,
        action="UPDATE_PICKUP_STATUS",
        entity_type="pickup_task",
        entity_id=task.id,
        details=f"Status changed to {task.status}"
    )

    return task
