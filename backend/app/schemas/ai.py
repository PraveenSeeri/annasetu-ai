from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class AICategorizeRequest(BaseModel):
    title: str
    description: str


class AICategorizeResponse(BaseModel):
    suggested_category: str
    short_summary: str
    estimated_servings_hint: Optional[int] = None
    dietary_tags: List[str] = []
    allergens_detected: List[str] = []
    missing_fields: List[str] = []
    safety_cautions: List[str] = []
    model_used: str = "gemini"


class AIListingImproveRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    storage_conditions: Optional[str] = None
    allergens: Optional[str] = None
    pickup_deadline: Optional[str] = None


class AIListingImproveResponse(BaseModel):
    completeness_score: int  # 0 to 100
    suggestions: List[str] = []
    enhanced_description: Optional[str] = None
    safety_recommendations: List[str] = []


class AISmartSearchRequest(BaseModel):
    query: str


class AISmartSearchResponse(BaseModel):
    interpreted_filters: Dict[str, Any]
    explanation: str
    category: Optional[str] = None
    dietary: Optional[str] = None
    max_distance_km: Optional[float] = None
    urgent_only: Optional[bool] = None


class AICoordinationChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []


class AICoordinationChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    data_context_used: bool = True
