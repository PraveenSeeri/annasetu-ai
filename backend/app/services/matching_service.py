import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.listing import FoodListing, ListingStatus
from app.models.organization import Organization, VerificationStatus
from app.models.user import User


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def match_recipients_for_listing(
    db: Session,
    listing: FoodListing,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Hybrid matching engine:
    1. Deterministic filter: only verified recipients, valid capacity, within service radius.
    2. Transparent multi-factor ranking score (0-100).
    """
    now = datetime.now(timezone.utc)
    deadline = listing.pickup_deadline if listing.pickup_deadline.tzinfo else listing.pickup_deadline.replace(tzinfo=timezone.utc)
    
    # Deterministic exclusion: expired or inactive listing
    if listing.status != ListingStatus.AVAILABLE.value or deadline <= now:
        return []

    # Get verified recipient organizations
    recipients = db.query(Organization).filter(
        Organization.verification_status == VerificationStatus.VERIFIED.value,
        Organization.org_type.in_(["ngo", "community_kitchen", "shelter", "community_pantry", "other"])
    ).all()

    matches = []
    hours_left = max(0.1, (deadline - now).total_seconds() / 3600.0)

    for rec in recipients:
        reasons = []
        score = 0.0

        # 1. Geographic proximity (max 30 points)
        distance_km = None
        if listing.latitude is not None and listing.longitude is not None and rec.latitude is not None and rec.longitude is not None:
            distance_km = haversine_distance(listing.latitude, listing.longitude, rec.latitude, rec.longitude)
            # Service area check
            if distance_km > rec.service_radius_km:
                continue  # Exclude: outside recipient service radius
            proximity_score = max(0.0, 30.0 * (1.0 - (distance_km / rec.service_radius_km)))
            score += proximity_score
            reasons.append(f"Located {distance_km:.1f} km away (within {rec.service_radius_km:.0f} km service radius)")
        else:
            # Coordinates not both present, give moderate proximity if same city
            if rec.city.lower() == "bengaluru":
                score += 18.0
                reasons.append("Both located in the Bengaluru operational cluster")
            else:
                score += 10.0
                reasons.append("Location proximity estimate based on city bounds")

        # 2. Capacity suitability (max 25 points)
        needed_servings = listing.estimated_servings
        if rec.capacity_servings_per_day > 0:
            if needed_servings <= rec.capacity_servings_per_day:
                capacity_ratio = needed_servings / float(rec.capacity_servings_per_day)
                capacity_score = 25.0 if capacity_ratio <= 1.0 else max(5.0, 25.0 * (1.0 - capacity_ratio + 1.0))
                score += capacity_score
                reasons.append(f"Capacity fit: organization can handle {rec.capacity_servings_per_day} servings/day ({needed_servings} needed)")
            else:
                score += 8.0
                reasons.append(f"Partial capacity fit: {needed_servings} servings exceeds single-day capacity ({rec.capacity_servings_per_day})")
        else:
            score += 10.0

        # 3. Urgency factor (max 25 points)
        # Closer to deadline -> higher score to prioritize quick dispatch
        if hours_left < 4.0:
            urgency_score = 25.0
            reasons.append(f"High urgency: pickup deadline in {hours_left:.1f} hours")
        elif hours_left < 12.0:
            urgency_score = 18.0
            reasons.append(f"Moderate urgency: pickup deadline in {hours_left:.1f} hours")
        else:
            urgency_score = 10.0
            reasons.append(f"Normal schedule: {hours_left:.1f} hours remaining before deadline")
        score += urgency_score

        # 4. Food category & org type match (max 20 points)
        category_score = 15.0
        if rec.org_type == "community_kitchen" and listing.category in ["prepared_meals", "produce", "dairy"]:
            category_score = 20.0
            reasons.append(f"High suitability: {listing.category.replace('_', ' ').title()} matches community kitchen distribution")
        elif rec.org_type == "shelter" and listing.category in ["prepared_meals", "bakery"]:
            category_score = 20.0
            reasons.append("Direct meal match: ready-to-eat food suited for resident shelter distribution")
        else:
            reasons.append(f"Eligible food category: {listing.category.replace('_', ' ').title()}")
        score += category_score

        normalized_score = min(100, max(1, round(score)))

        matches.append({
            "recipient_org_id": rec.id,
            "recipient_name": rec.name,
            "org_type": rec.org_type,
            "address": rec.address,
            "city": rec.city,
            "contact_email": rec.contact_email,
            "contact_phone": rec.contact_phone,
            "capacity_servings_per_day": rec.capacity_servings_per_day,
            "service_radius_km": rec.service_radius_km,
            "distance_km": distance_km,
            "match_score": normalized_score,
            "reasons": reasons
        })

    # Sort descending by match_score
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches[:limit]


def match_listings_for_recipient(
    db: Session,
    recipient_org: Organization,
    limit: int = 15
) -> List[Dict[str, Any]]:
    """
    Find and rank available food listings for a specific verified recipient organization.
    """
    now = datetime.now(timezone.utc)
    
    # Query only AVAILABLE listings with future pickup deadlines
    listings = db.query(FoodListing).filter(
        FoodListing.status == ListingStatus.AVAILABLE.value,
        FoodListing.pickup_deadline > now,
        FoodListing.remaining_quantity > 0
    ).all()

    recommendations = []
    for item in listings:
        deadline = item.pickup_deadline if item.pickup_deadline.tzinfo else item.pickup_deadline.replace(tzinfo=timezone.utc)
        if deadline <= now:
            continue
            
        hours_left = max(0.1, (deadline - now).total_seconds() / 3600.0)
        score = 0.0
        reasons = []

        # 1. Distance
        distance_km = None
        if item.latitude is not None and item.longitude is not None and recipient_org.latitude is not None and recipient_org.longitude is not None:
            distance_km = haversine_distance(item.latitude, item.longitude, recipient_org.latitude, recipient_org.longitude)
            if distance_km > recipient_org.service_radius_km:
                continue  # Skip listings outside recipient service area
            score += max(0.0, 30.0 * (1.0 - (distance_km / recipient_org.service_radius_km)))
            reasons.append(f"{distance_km:.1f} km away (within your {recipient_org.service_radius_km:.0f} km service zone)")
        else:
            score += 15.0
            reasons.append("Within local operational zone")

        # 2. Capacity
        needed = item.estimated_servings
        if needed <= recipient_org.capacity_servings_per_day:
            score += 25.0
            reasons.append(f"Matches your daily distribution capacity ({needed} of {recipient_org.capacity_servings_per_day} servings)")
        else:
            score += 10.0
            reasons.append(f"Large donation ({needed} servings) — can request partial quantity")

        # 3. Urgency
        if hours_left < 4.0:
            score += 25.0
            reasons.append(f"Urgent: {hours_left:.1f} hours remaining before pickup cutoff")
        elif hours_left < 12.0:
            score += 18.0
            reasons.append(f"{hours_left:.1f} hours remaining for collection")
        else:
            score += 10.0
            reasons.append(f"Standard schedule: {hours_left:.1f} hours window")

        # 4. Suitability
        if recipient_org.org_type == "community_kitchen" and item.category in ["prepared_meals", "produce"]:
            score += 20.0
            reasons.append("High priority category for kitchen operations")
        elif recipient_org.org_type == "shelter" and item.category in ["prepared_meals", "bakery"]:
            score += 20.0
            reasons.append("Direct meal distribution ready")
        else:
            score += 15.0
            reasons.append(f"Fresh {item.category.replace('_', ' ')} donation")

        normalized = min(100, max(1, round(score)))

        donor_name = item.organization.name if item.organization else (item.donor.full_name if item.donor else "Verified Donor")

        recommendations.append({
            "listing_id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "quantity": item.remaining_quantity,
            "unit": item.unit,
            "estimated_servings": item.estimated_servings,
            "dietary_attributes": item.dietary_attributes,
            "storage_conditions": item.storage_conditions,
            "pickup_address": item.pickup_address,
            "pickup_deadline": item.pickup_deadline.isoformat(),
            "donor_name": donor_name,
            "distance_km": distance_km,
            "match_score": normalized,
            "reasons": reasons
        })

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations[:limit]
