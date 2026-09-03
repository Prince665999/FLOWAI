from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.api.v1.ws import router as websocket_router
from app.config import settings
from app.db.init_db import init_db

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="FLOWAI backend foundation for AI-powered business operations and workflows.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(websocket_router, prefix="/api/v1")


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/")
def read_root() -> dict:
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "ok",
    }


@app.get("/health")
def health_check() -> dict:
    return {"status": "healthy"}
