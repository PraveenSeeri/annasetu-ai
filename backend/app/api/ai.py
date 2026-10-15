from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models.user import User
from app.schemas.ai import (
    AICategorizeRequest,
    AICategorizeResponse,
    AIListingImproveRequest,
    AIListingImproveResponse,
    AISmartSearchRequest,
    AISmartSearchResponse,
    AICoordinationChatRequest,
    AICoordinationChatResponse
)
from app.services.ai_service import (
    categorize_food_listing,
    improve_food_listing,
    parse_natural_language_search,
    chat_coordination_assistant
)

router = APIRouter(prefix="/api/ai", tags=["AI Assistance & NLP"])


@router.post("/categorize", response_model=AICategorizeResponse)
def ai_categorize(
    payload: AICategorizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return categorize_food_listing(
        db=db,
        title=payload.title,
        description=payload.description,
        user_id=current_user.id
    )


@router.post("/improve", response_model=AIListingImproveResponse)
def ai_improve(
    payload: AIListingImproveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return improve_food_listing(
        db=db,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        storage_conditions=payload.storage_conditions,
        allergens=payload.allergens,
        pickup_deadline=payload.pickup_deadline,
        user_id=current_user.id
    )


@router.post("/search-parse", response_model=AISmartSearchResponse)
def ai_search_parse(
    payload: AISmartSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    user_id = current_user.id if current_user else None
    return parse_natural_language_search(
        db=db,
        query=payload.query,
        user_id=user_id
    )


@router.post("/chat", response_model=AICoordinationChatResponse)
def ai_chat(
    payload: AICoordinationChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return chat_coordination_assistant(
        db=db,
        message=payload.message,
        user=current_user
    )
