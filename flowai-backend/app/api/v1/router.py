from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.customers import router as customers_router
from app.api.v1.customer_profile import router as customer_profile_router
from app.api.v1.customer_addresses import router as customer_addresses_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.documents import router as documents_router
from app.api.v1.agents import router as agents_router
from app.api.v1.users import router as users_router
from app.api.v1.workflows import router as workflows_router
from app.api.v1.workflow_templates import router as workflow_templates_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.schedules import router as schedules_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.admin_categories import router as admin_categories_router
from app.api.v1.admin_products import router as admin_products_router
from app.api.v1.admin_inventory import router as admin_inventory_router
from app.api.v1.store_products import router as store_products_router
from app.api.v1.store_categories import router as store_categories_router
from app.api.v1.webhooks import router as webhooks_router
from app.observability.health import router as health_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/api/v1")
api_router.include_router(customers_router, prefix="/api/v1")
api_router.include_router(customer_profile_router, prefix="/api/v1")
api_router.include_router(customer_addresses_router, prefix="/api/v1")
api_router.include_router(conversations_router, prefix="/api/v1")
api_router.include_router(documents_router, prefix="/api/v1")
api_router.include_router(agents_router, prefix="/api/v1")
api_router.include_router(users_router, prefix="/api/v1")
api_router.include_router(workflows_router, prefix="/api/v1")
api_router.include_router(workflow_templates_router, prefix="/api/v1")
api_router.include_router(jobs_router, prefix="/api/v1")
api_router.include_router(approvals_router, prefix="/api/v1")
api_router.include_router(schedules_router, prefix="/api/v1")
api_router.include_router(analytics_router, prefix="/api/v1")
api_router.include_router(notifications_router, prefix="/api/v1")
api_router.include_router(admin_categories_router, prefix="/api/v1")
api_router.include_router(admin_products_router, prefix="/api/v1")
api_router.include_router(admin_inventory_router, prefix="/api/v1")
api_router.include_router(store_products_router, prefix="/api/v1")
api_router.include_router(store_categories_router, prefix="/api/v1")
api_router.include_router(webhooks_router, prefix="/api/v1")
api_router.include_router(health_router, prefix="/api/v1")
