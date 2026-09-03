from fastapi import APIRouter

from app.api.v1.customers import router as customers_router

api_router = APIRouter()
api_router.include_router(customers_router, prefix="/api/v1")
