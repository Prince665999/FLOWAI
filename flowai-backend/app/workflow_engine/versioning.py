from datetime import datetime, timezone
from typing import Any
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.workflow import Workflow


class WorkflowVersioningService:
    def save_draft(
        self,
        workflow: Workflow,
        definition: dict[str, Any],
        name: str | None = None,
        description: str | None = None,
        db: Session = None,
    ) -> Workflow:
        if name:
            workflow.name = name
        if description:
            workflow.description = description
        workflow.definition = definition
        workflow.status = "draft"
        if db:
            db.commit()
            db.refresh(workflow)
        return workflow

    def publish_version(
        self,
        workflow: Workflow,
        comment: str = "Published new version",
        db: Session = None,
    ) -> Workflow:
        history = list(workflow.version_history or [])
        # Snapshot current version before bumping
        history.append({
            "version": workflow.version,
            "definition": workflow.definition,
            "name": workflow.name,
            "published_at": datetime.now(timezone.utc).isoformat(),
            "comment": comment,
        })
        workflow.version_history = history
        workflow.version += 1
        workflow.status = "published"
        if db:
            db.commit()
            db.refresh(workflow)
        return workflow

    def rollback_version(
        self,
        workflow: Workflow,
        target_version: int,
        db: Session = None,
    ) -> Workflow:
        history = list(workflow.version_history or [])
        matched = next((h for h in history if h.get("version") == target_version), None)
        if not matched:
            raise HTTPException(status_code=404, detail=f"Version {target_version} not found in history")

        # Save current as snapshot, then restore target
        history.append({
            "version": workflow.version,
            "definition": workflow.definition,
            "name": workflow.name,
            "published_at": datetime.now(timezone.utc).isoformat(),
            "comment": f"Rollback to version {target_version}",
        })
        workflow.version_history = history
        workflow.version += 1
        workflow.definition = matched["definition"]
        workflow.name = matched.get("name", workflow.name)
        workflow.status = "published"
        if db:
            db.commit()
            db.refresh(workflow)
        return workflow


workflow_versioning = WorkflowVersioningService()
