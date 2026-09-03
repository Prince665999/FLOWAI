from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.customers import router as customers_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.users import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/api/v1")
api_router.include_router(customers_router, prefix="/api/v1")
api_router.include_router(conversations_router, prefix="/api/v1")
api_router.include_router(users_router, prefix="/api/v1")
