import os
import json
import time
import re
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.ai_log import AIInteractionLog
from app.models.user import User, UserRole
from app.models.listing import FoodListing, ListingStatus
from app.models.donation import DonationRequest
from app.models.pickup import PickupTask
from app.schemas.ai import (
    AICategorizeResponse,
    AIListingImproveResponse,
    AISmartSearchResponse,
    AICoordinationChatResponse
)

# Optional Gemini client
_genai_client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
    try:
        from google import genai
        _genai_client = genai.Client(api_key=settings.GEMINI_API_KEY.strip())
    except Exception as e:
        _genai_client = None


def _log_ai(db: Session, feature: str, user_id: Optional[int], success: bool, fallback_used: bool, start_time: float):
    latency = int((time.time() - start_time) * 1000)
    try:
        log_entry = AIInteractionLog(
            user_id=user_id,
            feature=feature,
            tokens_used=150 if success and not fallback_used else 0,
            success=success,
            fallback_used=fallback_used,
            latency_ms=latency
        )
        db.add(log_entry)
        db.commit()
    except Exception:
        db.rollback()


# ============================================================================
# 1. Food Categorization & Extraction
# ============================================================================

def categorize_food_listing(
    db: Session,
    title: str,
    description: str,
    user_id: Optional[int] = None
) -> AICategorizeResponse:
    start_time = time.time()
    
    # Try Gemini if configured
    if _genai_client:
        prompt = f"""
You are an expert food logistics assistant for AnnaSetu AI surplus food redistribution.
Analyze the following surplus food donation details:
Title: {title}
Description: {description}

Return ONLY valid JSON matching this schema:
{{
  "suggested_category": "prepared_meals" | "bakery" | "packaged_food" | "produce" | "dairy" | "other",
  "short_summary": "1-2 sentence clean summary",
  "estimated_servings_hint": integer or null,
  "dietary_tags": ["vegetarian" | "vegan" | "halal" | "jain" | "gluten_free" | "non_vegetarian"],
  "allergens_detected": ["list of known common allergens mentioned or null"],
  "missing_fields": ["list of critical missing details e.g. storage temperature, exact expiry, packing state"],
  "safety_cautions": ["safety considerations such as temperature sensitivity or perishability"]
}}
Do NOT declare or certify that the food is safe. Strictly identify missing data or perishability.
"""
        try:
            response = _genai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            raw_text = response.text.strip()
            # Clean possible markdown block
            if raw_text.startswith("```"):
                raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)
            parsed = json.loads(raw_text)
            _log_ai(db, "categorize_food_listing", user_id, True, False, start_time)
            return AICategorizeResponse(
                suggested_category=parsed.get("suggested_category", "prepared_meals"),
                short_summary=parsed.get("short_summary", title),
                estimated_servings_hint=parsed.get("estimated_servings_hint"),
                dietary_tags=parsed.get("dietary_tags", []),
                allergens_detected=parsed.get("allergens_detected", []),
                missing_fields=parsed.get("missing_fields", []),
                safety_cautions=parsed.get("safety_cautions", ["Perishable food requires timely pickup and proper temperature maintenance"]),
                model_used="gemini-2.5-flash"
            )
        except Exception:
            pass  # Fall through to deterministic fallback

    # Deterministic Rule-Based Fallback
    text = f"{title} {description}".lower()
    
    # Category detection
    if any(k in text for k in ["rice", "biryani", "curry", "dal", "roti", "gravy", "meal", "buffet", "thali", "pasta", "pulao", "cooked"]):
        category = "prepared_meals"
    elif any(k in text for k in ["bread", "cake", "pastry", "croissant", "buns", "muffin", "loaf", "bakery"]):
        category = "bakery"
    elif any(k in text for k in ["apple", "banana", "vegetable", "tomato", "potato", "onion", "fruit", "lettuce", "produce"]):
        category = "produce"
    elif any(k in text for k in ["milk", "cheese", "paneer", "curd", "yogurt", "butter", "dairy"]):
        category = "dairy"
    elif any(k in text for k in ["packaged", "canned", "biscuit", "noodles", "cereal", "chips", "tetra"]):
        category = "packaged_food"
    else:
        category = "prepared_meals"

    # Dietary tags
    dietary = []
    if "vegan" in text:
        dietary.append("vegan")
    elif "jain" in text:
        dietary.append("jain")
    elif any(k in text for k in ["veg", "vegetarian"]) and not any(k in text for k in ["non-veg", "chicken", "meat", "fish", "egg"]):
        dietary.append("vegetarian")
    elif any(k in text for k in ["chicken", "mutton", "fish", "meat", "egg"]):
        dietary.append("non_vegetarian")
    else:
        dietary.append("vegetarian")

    # Allergens detection
    allergens = []
    if "peanut" in text or "nut" in text:
        allergens.append("peanuts / tree nuts")
    if "dairy" in text or "milk" in text or "cheese" in text or "paneer" in text:
        allergens.append("dairy")
    if "gluten" in text or "wheat" in text:
        allergens.append("gluten")
    if "soy" in text:
        allergens.append("soy")

    # Missing fields checklist
    missing = []
    if not any(k in text for k in ["refrigerat", "cold", "ambient", "hot", "frozen", "temp", "celsius"]):
        missing.append("Specific storage temperature instructions")
    if not any(k in text for k in ["prepared at", "cooked at", "am", "pm", "today", "freshly"]):
        missing.append("Exact preparation timestamp")
    if not any(k in text for k in ["container", "box", "pack", "tray"]):
        missing.append("Packaging/container details")

    # Servings hint regex
    servings_hint = None
    servings_match = re.search(r'(\d+)\s*(?:servings|people|persons|plates|pax|meals)', text)
    if servings_match:
        servings_hint = int(servings_match.group(1))

    _log_ai(db, "categorize_food_listing", user_id, True, True, start_time)

    return AICategorizeResponse(
        suggested_category=category,
        short_summary=f"Surplus {category.replace('_', ' ')}: {title}",
        estimated_servings_hint=servings_hint,
        dietary_tags=dietary,
        allergens_detected=allergens if allergens else ["None explicitly specified in text"],
        missing_fields=missing,
        safety_cautions=[
            "Food safety declaration is mandatory before listing",
            "Maintain hot foods above 60°C or refrigerated foods below 4°C during staging"
        ],
        model_used="deterministic_rules_fallback"
    )


# ============================================================================
# 2. Smart Listing Improvement
# ============================================================================

def improve_food_listing(
    db: Session,
    title: str,
    description: str,
    category: Optional[str] = None,
    storage_conditions: Optional[str] = None,
    allergens: Optional[str] = None,
    pickup_deadline: Optional[str] = None,
    user_id: Optional[int] = None
) -> AIListingImproveResponse:
    start_time = time.time()
    suggestions = []
    score = 100

    if len(description.strip()) < 30:
        suggestions.append("Add more details about ingredients, dish components, and how food is packaged.")
        score -= 25

    if not storage_conditions:
        suggestions.append("Select precise storage conditions (e.g., Hot Holding, Refrigerated, Ambient).")
        score -= 20

    if not allergens or allergens.strip().lower() in ["", "none", "unknown"]:
        suggestions.append("Clarify allergen status (e.g., contains nuts/dairy or 'certified nut-free').")
        score -= 15

    if not pickup_deadline:
        suggestions.append("Set a clear pickup cutoff time to ensure prompt distribution before degradation.")
        score -= 20

    if len(title.strip()) < 8:
        suggestions.append("Use a descriptive food title specifying cuisine or items (e.g., 'Fresh Veg Biryani & Raita (50 Servings)').")
        score -= 15

    enhanced_desc = description.strip()
    if len(enhanced_desc) > 0 and len(suggestions) > 0:
        enhanced_desc = f"{enhanced_desc}\n\n[Auto-Suggested Note: Packaged in food-grade insulated containers. Handled under sanitary conditions.]"

    _log_ai(db, "improve_food_listing", user_id, True, True, start_time)

    return AIListingImproveResponse(
        completeness_score=max(20, score),
        suggestions=suggestions if suggestions else ["Listing details are comprehensive and clear!"],
        enhanced_description=enhanced_desc,
        safety_recommendations=[
            "Ensure sealed food-grade containers are used for transport.",
            "Double-check that cold items remain chilled and hot items remain steaming until handoff."
        ]
    )


# ============================================================================
# 3. Natural Language Search Filter Parser
# ============================================================================

def parse_natural_language_search(
    db: Session,
    query: str,
    user_id: Optional[int] = None
) -> AISmartSearchResponse:
    start_time = time.time()
    q = query.lower()
    
    category = None
    if "meal" in q or "curry" in q or "rice" in q or "cooked" in q:
        category = "prepared_meals"
    elif "bakery" in q or "bread" in q or "pastry" in q:
        category = "bakery"
    elif "produce" in q or "vegetable" in q or "fruit" in q:
        category = "produce"
    elif "packaged" in q or "dry" in q:
        category = "packaged_food"
    elif "dairy" in q or "milk" in q or "cheese" in q:
        category = "dairy"

    dietary = None
    if "vegan" in q:
        dietary = "vegan"
    elif "jain" in q:
        dietary = "jain"
    elif "veg" in q or "vegetarian" in q:
        dietary = "vegetarian"
    elif "non-veg" in q:
        dietary = "non_vegetarian"

    # Distance extraction
    dist_match = re.search(r'within\s*(\d+(?:\.\d+)?)\s*km', q)
    max_dist = float(dist_match.group(1)) if dist_match else None

    # Urgency extraction
    urgent = ("urgent" in q or "asap" in q or "immediate" in q or "today" in q or "tonight" in q)

    interpreted = {}
    if category: interpreted["category"] = category
    if dietary: interpreted["dietary"] = dietary
    if max_dist: interpreted["max_distance_km"] = max_dist
    if urgent: interpreted["urgent_only"] = True

    explanation_parts = []
    if category: explanation_parts.append(f"Category: {category.replace('_', ' ')}")
    if dietary: explanation_parts.append(f"Dietary: {dietary.capitalize()}")
    if max_dist: explanation_parts.append(f"Max distance: {max_dist} km")
    if urgent: explanation_parts.append("Expiring soon / urgent pickup prioritized")

    explanation = "Filtering by " + ", ".join(explanation_parts) if explanation_parts else f"Keyword search matching '{query}'"

    _log_ai(db, "parse_natural_language_search", user_id, True, True, start_time)

    return AISmartSearchResponse(
        interpreted_filters=interpreted,
        explanation=explanation,
        category=category,
        dietary=dietary,
        max_distance_km=max_dist,
        urgent_only=urgent
    )


# ============================================================================
# 4. Role-Aware AI Coordination Assistant
# ============================================================================

def chat_coordination_assistant(
    db: Session,
    message: str,
    user: User
) -> AICoordinationChatResponse:
    start_time = time.time()
    msg = message.lower()

    # Role-scoped data retrieval (Narrowly scoped; never sends entire database)
    context_info = []
    suggested_actions = []

    if user.role == UserRole.DONOR.value:
        my_listings_count = db.query(FoodListing).filter(FoodListing.donor_id == user.id).count()
        active_listings = db.query(FoodListing).filter(
            FoodListing.donor_id == user.id,
            FoodListing.status.in_([ListingStatus.AVAILABLE.value, ListingStatus.REQUESTED.value])
        ).all()
        context_info.append(f"You have {my_listings_count} total listings ({len(active_listings)} currently active).")
        for l in active_listings[:3]:
            context_info.append(f"Active listing #{l.id}: '{l.title}' ({l.remaining_quantity} {l.unit}, status: {l.status})")
        suggested_actions = ["List Surplus Food", "View My Active Listings", "Review Pending Requests"]

    elif user.role == UserRole.RECIPIENT.value:
        org_status = "unverified"
        if user.organization:
            org_status = user.organization.verification_status
        context_info.append(f"Your organization verification status is: '{org_status}'.")
        my_requests = db.query(DonationRequest).filter(DonationRequest.recipient_user_id == user.id).all()
        context_info.append(f"You have made {len(my_requests)} donation requests.")
        avail_count = db.query(FoodListing).filter(FoodListing.status == ListingStatus.AVAILABLE.value).count()
        context_info.append(f"There are currently {avail_count} available surplus food donations in the network.")
        suggested_actions = ["Browse Available Donations", "Check Request Status", "Update Organization Profile"]

    elif user.role == UserRole.VOLUNTEER.value:
        assigned = db.query(PickupTask).filter(
            PickupTask.volunteer_id == user.id,
            PickupTask.status.in_(["ASSIGNED", "ACCEPTED", "PICKED_UP"])
        ).all()
        context_info.append(f"You currently have {len(assigned)} active pickup task(s) in progress.")
        suggested_actions = ["View My Assigned Tasks", "Update Pickup Status", "View Task History"]

    elif user.role == UserRole.ADMIN.value:
        total_users = db.query(User).count()
        pending_verif = db.query(FoodListing).count()
        context_info.append(f"Platform administrative view: {total_users} registered users.")
        suggested_actions = ["Review Organization Verifications", "Triage Safety Reports", "Platform Impact Overview"]

    # Try Gemini if key is provided
    if _genai_client:
        system_instruction = f"""
You are the AnnaSetu AI Coordination Assistant.
User role: {user.role}.
User name: {user.full_name}.
Authorized contextual state: {'; '.join(context_info)}.

Guidelines:
1. Answer the user's operational question concisely and professionally.
2. Only use the authorized contextual state provided. Do NOT fabricate numbers, listings, or guarantee food safety.
3. If they ask how to list food, explain navigating to Donor Listings -> Create.
4. If they ask about donation statuses:
   - AVAILABLE: Open for verified recipient requests.
   - REQUESTED: Recipient has submitted a reservation.
   - ACCEPTED: Donor approved; pickup assigned.
   - PICKED_UP: Volunteer in transit with food.
   - COMPLETED: Verified safe delivery to community kitchen / shelter.
5. Emphasize compliance with local food safety rules and prompt collection.
"""
        try:
            res = _genai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"{system_instruction}\n\nUser Question: {message}"
            )
            _log_ai(db, "chat_coordination_assistant", user.id, True, False, start_time)
            return AICoordinationChatResponse(
                reply=res.text.strip(),
                suggested_actions=suggested_actions,
                data_context_used=True
            )
        except Exception:
            pass  # Fall through to deterministic response

    # Deterministic Intelligent Response
    reply_lines = []
    if any(k in msg for k in ["how to list", "create listing", "donate food", "surplus"]):
        reply_lines.append("To list surplus food on AnnaSetu AI:")
        reply_lines.append("1. Navigate to 'New Listing' in your Donor Dashboard.")
        reply_lines.append("2. Enter the food title, quantity, category, and storage conditions.")
        reply_lines.append("3. You can click 'AI Enhance' to automatically extract dietary tags and verify completeness.")
        reply_lines.append("4. Confirm the mandatory Food Safety Declaration and submit.")
    elif any(k in msg for k in ["status", "lifecycle", "meaning", "progress"]):
        reply_lines.append("Here is the AnnaSetu surplus food lifecycle:")
        reply_lines.append("• AVAILABLE: Food is staged and open for verified recipients.")
        reply_lines.append("• REQUESTED: A verified recipient requested an allocation.")
        reply_lines.append("• ACCEPTED: Donor confirmed; pickup task is generated.")
        reply_lines.append("• PICKED_UP: Volunteer has collected food and is in transit.")
        reply_lines.append("• COMPLETED: Delivery verified at recipient shelter or kitchen.")
    elif any(k in msg for k in ["my status", "what do i have", "my listings", "my tasks", "my requests"]):
        reply_lines.append(f"Here is your real-time platform summary ({user.role.title()}):")
        for c in context_info:
            reply_lines.append(f"• {c}")
    elif any(k in msg for k in ["safety", "expired", "hygiene", "fssai"]):
        reply_lines.append("Food safety is AnnaSetu's highest priority:")
        reply_lines.append("• AnnaSetu coordinates redistribution but does not independently certify food safety.")
        reply_lines.append("• Donors must confirm all food meets local sanitation and handling rules before listing.")
        reply_lines.append("• Listings past their pickup deadline are automatically expired and excluded from matching.")
    else:
        reply_lines.append(f"Hello {user.full_name}! I am your AnnaSetu AI Coordinator.")
        reply_lines.append(f"Currently: {'; '.join(context_info)}")
        reply_lines.append("You can ask me about listing surplus food, tracking pickups, understanding donation lifecycles, or checking your account status.")

    _log_ai(db, "chat_coordination_assistant", user.id, True, True, start_time)

    return AICoordinationChatResponse(
        reply="\n".join(reply_lines),
        suggested_actions=suggested_actions,
        data_context_used=True
    )
