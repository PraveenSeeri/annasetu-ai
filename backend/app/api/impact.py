from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.impact import ImpactMetricsOut
from app.services.impact_service import get_aggregate_impact_metrics

router = APIRouter(prefix="/api/impact", tags=["Impact & Sustainability Metrics"])


@router.get("/summary", response_model=ImpactMetricsOut)
def get_impact_summary(db: Session = Depends(get_db)):
    """Retrieve public aggregate impact metrics computed from actual database records."""
    return get_aggregate_impact_metrics(db=db)
