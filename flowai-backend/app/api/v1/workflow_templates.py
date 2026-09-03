from fastapi import APIRouter, Depends

from app.dependencies import get_current_active_user
from app.models.user import User
from app.workflow_engine.templates.customer_support import WORKFLOW_TEMPLATE as CUSTOMER_SUPPORT
from app.workflow_engine.templates.daily_sales_report import WORKFLOW_TEMPLATE as DAILY_SALES_REPORT
from app.workflow_engine.templates.document_processing import WORKFLOW_TEMPLATE as DOCUMENT_PROCESSING
from app.workflow_engine.templates.lead_processing import WORKFLOW_TEMPLATE as LEAD_PROCESSING

router = APIRouter(prefix="/workflow-templates", tags=["workflow-templates"])


@router.get("")
def list_templates(user: User = Depends(get_current_active_user)) -> list[dict]:
    return [CUSTOMER_SUPPORT, DAILY_SALES_REPORT, DOCUMENT_PROCESSING, LEAD_PROCESSING]