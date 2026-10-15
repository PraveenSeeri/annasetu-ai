from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_volunteer
from app.models.pickup import PickupTask, PickupStatus
from app.models.listing import FoodListing
from app.models.user import User, UserRole
from app.schemas.pickup import PickupTaskOut, PickupTaskUpdateStatus, PickupAssignPayload
from app.services.pickup_service import assign_volunteer_to_task, update_pickup_status

router = APIRouter(prefix="/api/pickups", tags=["Volunteer Pickups"])


def _enrich_pickup(task: PickupTask) -> dict:
    data = PickupTaskOut.model_validate(task).model_dump()
    if task.volunteer:
        data["volunteer_name"] = task.volunteer.full_name
        data["volunteer_phone"] = task.volunteer.phone
    if task.donation_request and task.donation_request.recipient_org:
        data["recipient_org_name"] = task.donation_request.recipient_org.name
        data["recipient_address"] = task.donation_request.recipient_org.address
    return data


@router.get("/unassigned", response_model=List[PickupTaskOut])
def list_unassigned_pickups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(PickupTask).filter(
        PickupTask.status == PickupStatus.UNASSIGNED.value
    ).order_by(PickupTask.pickup_deadline.asc()).all()
    return [_enrich_pickup(t) for t in tasks]


@router.get("/my-tasks", response_model=List[PickupTaskOut])
def get_my_assigned_pickups(
    current_user: User = Depends(require_volunteer),
    db: Session = Depends(get_db)
):
    tasks = db.query(PickupTask).filter(
        PickupTask.volunteer_id == current_user.id
    ).order_by(PickupTask.created_at.desc()).all()
    return [_enrich_pickup(t) for t in tasks]


@router.get("/{task_id}", response_model=PickupTaskOut)
def get_pickup_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(PickupTask).filter(PickupTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pickup task not found")

    # Access control: volunteer must be assigned or task unassigned; donor or recipient org involved; or admin
    is_authorized = False
    if current_user.role == UserRole.ADMIN.value:
        is_authorized = True
    elif task.volunteer_id == current_user.id or task.status == PickupStatus.UNASSIGNED.value:
        is_authorized = True
    elif task.listing and task.listing.donor_id == current_user.id:
        is_authorized = True
    elif task.donation_request and current_user.organization_id == task.donation_request.recipient_org_id:
        is_authorized = True

    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this pickup task")

    return _enrich_pickup(task)


@router.post("/{task_id}/claim", response_model=PickupTaskOut)
def claim_pickup_task(
    task_id: int,
    current_user: User = Depends(require_volunteer),
    db: Session = Depends(get_db)
):
    """Volunteer self-claims an unassigned pickup task."""
    task = db.query(PickupTask).filter(PickupTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pickup task not found")
    if task.status != PickupStatus.UNASSIGNED.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Task is already assigned")

    res = assign_volunteer_to_task(
        db=db,
        pickup_id=task.id,
        volunteer_id=current_user.id,
        assigner=current_user
    )
    return _enrich_pickup(res)


@router.post("/{task_id}/assign", response_model=PickupTaskOut)
def assign_task(
    task_id: int,
    payload: PickupAssignPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = assign_volunteer_to_task(
        db=db,
        pickup_id=task_id,
        volunteer_id=payload.volunteer_id,
        assigner=current_user,
        pickup_instructions=payload.pickup_instructions,
        delivery_instructions=payload.delivery_instructions
    )
    return _enrich_pickup(res)


@router.post("/{task_id}/status", response_model=PickupTaskOut)
def update_task_status(
    task_id: int,
    payload: PickupTaskUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = update_pickup_status(
        db=db,
        pickup_id=task_id,
        new_status=payload.status,
        user=current_user,
        notes=payload.notes
    )
    return _enrich_pickup(res)
