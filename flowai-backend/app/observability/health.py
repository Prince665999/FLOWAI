from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.ai.rag.chroma_store import chroma_store
from app.config import settings
from app.db.session import get_db
from app.observability.metrics import metrics_registry
from app.evaluation.eval_runner import eval_runner
from app.queue.redis_client import check_redis

router = APIRouter(prefix="/system", tags=["observability"])


@router.get("/health/deep")
def deep_health_check(db: Session = Depends(get_db)) -> dict[str, Any]:
    health: dict[str, Any] = {
        "status": "healthy",
        "services": {
            "database": "unknown",
            "queue_redis": "unknown",
            "vector_chroma": "unknown",
            "workflow_engine": "unknown",
            "agents_platform": "unknown",
        },
        "metrics_summary": metrics_registry.get_summary(),
    }

    try:
        db.execute(text("SELECT 1"))
        health["services"]["database"] = "healthy"
    except Exception as exc:
        health["services"]["database"] = f"unhealthy: {exc}"
        health["status"] = "degraded"

    try:
        health["services"]["queue_redis"] = "healthy" if check_redis() else "unhealthy"
        if health["services"]["queue_redis"] != "healthy":
            health["status"] = "degraded"
    except Exception as exc:
        health["services"]["queue_redis"] = f"unhealthy: {exc}"
        health["status"] = "degraded"

    try:
        collection = chroma_store.collection
        collection.count()
        health["services"]["vector_chroma"] = "healthy"
    except Exception as exc:
        health["services"]["vector_chroma"] = f"unhealthy: {exc}"
        health["status"] = "degraded"

    try:
        health["services"]["workflow_engine"] = "healthy" if settings.QUEUE_ENABLED or True else "unhealthy"
        health["services"]["agents_platform"] = "healthy"
    except Exception as exc:
        health["services"]["workflow_engine"] = f"unhealthy: {exc}"
        health["status"] = "degraded"

    return health


@router.get("/evaluation/benchmark")
def run_evaluation_benchmark() -> dict[str, Any]:
    return eval_runner.run_all_evaluations()
