from pydantic import BaseModel
from typing import List, Dict, Optional


class CategoryImpact(BaseModel):
    category: str
    count: int
    servings: int
    quantity_kg: float


class TrendPoint(BaseModel):
    date: str
    donations_count: int
    servings: int


class ImpactMetricsOut(BaseModel):
    total_donations_listed: int
    donations_completed: int
    donations_in_progress: int
    completion_rate_percentage: float
    total_servings_redistributed: int
    total_quantity_redistributed_kg: float
    average_hours_to_accept: Optional[float] = None
    active_donor_orgs: int
    active_recipient_orgs: int
    volunteers_contributing: int
    category_breakdown: List[CategoryImpact]
    trend_data: List[TrendPoint]
    sdg_alignment: Dict[str, str] = {
        "SDG_2": "Zero Hunger — Surplus meals diverted directly to verified shelters and community kitchens.",
        "SDG_12": "Responsible Consumption — Reduction of edible food waste through real-time redistribution."
    }
