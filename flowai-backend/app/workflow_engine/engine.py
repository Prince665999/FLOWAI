from sqlalchemy.orm import Session

from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.workflow_engine.executor import execute_workflow
from app.workflow_engine.graph import WorkflowGraph


class WorkflowEngine:
	def validate(self, definition: dict) -> None:
		WorkflowGraph(definition).validate()

	async def run(self, workflow: Workflow, run: WorkflowRun, db: Session) -> WorkflowRun:
		return await execute_workflow(workflow, run, db)


workflow_engine = WorkflowEngine()
