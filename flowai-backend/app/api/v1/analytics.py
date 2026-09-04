from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.analytics import BusinessOverviewRead, ModelCostBreakdown
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=BusinessOverviewRead)
def get_business_overview(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> dict:
    return analytics_service.get_business_overview(db, user)


@router.get("/costs", response_model=list[ModelCostBreakdown])
def get_costs_breakdown(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> list[dict]:
    return analytics_service.get_cost_breakdown(db, user)
