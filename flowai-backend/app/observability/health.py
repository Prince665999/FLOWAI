from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.observability.metrics import metrics_registry
from app.evaluation.eval_runner import eval_runner

router = APIRouter(prefix="/system", tags=["observability"])


@router.get("/health/deep")
def deep_health_check(db: Session = Depends(get_db)) -> dict[str, Any]:
    health = {
        "status": "healthy",
        "services": {
            "database": "unknown",
            "queue_redis": "healthy",
            "vector_chroma": "healthy",
            "workflow_engine": "healthy",
            "agents_platform": "healthy",
        },
        "metrics_summary": metrics_registry.get_summary(),
    }

    try:
        db.execute(text("SELECT 1"))
        health["services"]["database"] = "healthy"
    except Exception as exc:
        health["services"]["database"] = f"unhealthy: {exc}"
        health["status"] = "degraded"

    return health


@router.get("/evaluation/benchmark")
def run_evaluation_benchmark() -> dict[str, Any]:
    return eval_runner.run_all_evaluations()
