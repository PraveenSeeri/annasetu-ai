from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from app.models.listing import FoodListing, ListingStatus
from app.models.organization import Organization, OrgType, VerificationStatus
from app.models.user import User, UserRole
from app.models.pickup import PickupTask, PickupStatus
from app.models.donation import DonationRequest, RequestStatus
from app.schemas.impact import ImpactMetricsOut, CategoryImpact, TrendPoint


def get_aggregate_impact_metrics(db: Session) -> ImpactMetricsOut:
    """
    Calculate platform impact metrics dynamically from real database records.
    Documented methodology:
    - 1 serving is standardized at ~0.4 kg (400g) when unit is kg or liters, or explicit estimated_servings when provided.
    - Completion rate is (COMPLETED donations / (Total donations - CANCELLED)) * 100.
    """
    # 1. Total counts
    total_listed = db.query(FoodListing).count()
    completed_listings = db.query(FoodListing).filter(FoodListing.status == ListingStatus.COMPLETED.value).count()
    in_progress = db.query(FoodListing).filter(
        FoodListing.status.in_([
            ListingStatus.REQUESTED.value,
            ListingStatus.ACCEPTED.value,
            ListingStatus.PICKUP_ASSIGNED.value,
            ListingStatus.PICKED_UP.value
        ])
    ).count()
    cancelled_expired = db.query(FoodListing).filter(
        FoodListing.status.in_([ListingStatus.CANCELLED.value, ListingStatus.EXPIRED.value])
    ).count()

    # Completion rate
    eligible_denominator = (total_listed - cancelled_expired)
    completion_rate = 0.0
    if eligible_denominator > 0:
        completion_rate = round((completed_listings / eligible_denominator) * 100.0, 1)

    # 2. Servings and Quantity redistributed (from completed and in-progress collections)
    completed_items = db.query(FoodListing).filter(
        FoodListing.status.in_([ListingStatus.COMPLETED.value, ListingStatus.PICKED_UP.value])
    ).all()

    total_servings = 0
    total_kg = 0.0

    for item in completed_items:
        allocated = max(0.0, item.quantity - item.remaining_quantity)
        if item.status == ListingStatus.COMPLETED.value:
            allocated = item.quantity  # Fully completed

        total_servings += item.estimated_servings

        # Standard conversion to kg if unit is known
        if item.unit.lower() in ["kg", "kilograms"]:
            total_kg += allocated
        elif item.unit.lower() in ["liters", "l"]:
            total_kg += allocated * 1.0
        elif item.unit.lower() in ["servings", "plates", "meals"]:
            total_kg += allocated * 0.4  # Standard nutritional serving benchmark: 400g
        elif item.unit.lower() in ["boxes", "trays"]:
            total_kg += allocated * 2.5
        else:
            total_kg += allocated * 0.5

    # 3. Active Organizations
    donor_orgs_count = db.query(Organization).filter(
        Organization.org_type.in_(["restaurant", "hostel", "caterer", "event_organizer"])
    ).count()
    
    recipient_orgs_count = db.query(Organization).filter(
        Organization.verification_status == VerificationStatus.VERIFIED.value,
        Organization.org_type.in_(["ngo", "community_kitchen", "shelter", "community_pantry"])
    ).count()

    volunteers_count = db.query(User).filter(
        User.role == UserRole.VOLUNTEER.value,
        User.is_active == True
    ).count()

    # 4. Average hours to match / accept
    # Calculate difference between listing.created_at and request.accepted_at
    accepted_requests = db.query(DonationRequest).filter(
        DonationRequest.status.in_([RequestStatus.ACCEPTED.value, RequestStatus.COMPLETED.value])
    ).all()
    
    avg_hours = None
    if accepted_requests:
        total_seconds = 0
        valid_pairs = 0
        for r in accepted_requests:
            if r.listing and r.updated_at and r.listing.created_at:
                diff = (r.updated_at - r.listing.created_at).total_seconds()
                if diff > 0:
                    total_seconds += diff
                    valid_pairs += 1
        if valid_pairs > 0:
            avg_hours = round(total_seconds / (valid_pairs * 3600.0), 1)

    # 5. Category Breakdown
    categories = ["prepared_meals", "bakery", "packaged_food", "produce", "dairy", "other"]
    category_breakdown = []
    for cat in categories:
        cat_items = db.query(FoodListing).filter(FoodListing.category == cat).all()
        cat_count = len(cat_items)
        cat_servings = sum(i.estimated_servings for i in cat_items)
        cat_kg = sum(i.quantity * (0.4 if i.unit in ["servings", "meals"] else 1.0) for i in cat_items)
        category_breakdown.append(CategoryImpact(
            category=cat.replace("_", " ").title(),
            count=cat_count,
            servings=cat_servings,
            quantity_kg=round(cat_kg, 1)
        ))

    # 6. Trend data (Last 7 days or grouped by date)
    now = datetime.now(timezone.utc)
    trend_data = []
    for days_ago in range(6, -1, -1):
        target_day = (now - timedelta(days=days_ago)).date()
        day_start = datetime.combine(target_day, datetime.min.time())
        day_end = datetime.combine(target_day, datetime.max.time())
        
        day_listings = db.query(FoodListing).filter(
            FoodListing.created_at >= day_start,
            FoodListing.created_at <= day_end
        ).all()
        
        day_servings = sum(l.estimated_servings for l in day_listings)
        trend_data.append(TrendPoint(
            date=target_day.strftime("%b %d"),
            donations_count=len(day_listings),
            servings=day_servings
        ))

    return ImpactMetricsOut(
        total_donations_listed=total_listed,
        donations_completed=completed_listings,
        donations_in_progress=in_progress,
        completion_rate_percentage=completion_rate,
        total_servings_redistributed=total_servings,
        total_quantity_redistributed_kg=round(total_kg, 1),
        average_hours_to_accept=avg_hours,
        active_donor_orgs=donor_orgs_count,
        active_recipient_orgs=recipient_orgs_count,
        volunteers_contributing=volunteers_count,
        category_breakdown=category_breakdown,
        trend_data=trend_data
    )
