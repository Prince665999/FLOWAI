from datetime import datetime, timezone
from types import SimpleNamespace

from sqlalchemy.orm import Session

from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.models.workflow_step import WorkflowStep
from app.workflow_engine.graph import WorkflowGraph
from app.workflow_engine.nodes.action_node import ActionNode
from app.workflow_engine.nodes.ai_node import AINode
from app.workflow_engine.nodes.approval_node import ApprovalNode
from app.workflow_engine.nodes.condition_node import ConditionNode
from app.workflow_engine.nodes.notification_node import NotificationNode
from app.workflow_engine.nodes.tool_node import ToolNode
from app.workflow_engine.nodes.trigger_node import TriggerNode
from app.workflow_engine.state import WorkflowState


HANDLERS = {"trigger": TriggerNode, "ai": AINode, "condition": ConditionNode, "tool": ToolNode, "action": ActionNode, "approval": ApprovalNode, "notification": NotificationNode}


async def execute_workflow(workflow: Workflow, run: WorkflowRun, db: Session) -> WorkflowRun:
	graph = WorkflowGraph(workflow.definition)
	graph.validate()
	state = WorkflowState(run_id=run.id, data=run.input_data or {}, status="running")
	run.status = "running"
	run.started_at = datetime.now(timezone.utc)
	db.commit()
	node = graph.start_node()
	context = SimpleNamespace(user_id=run.user_id, db=db)
	try:
		while node:
			state.current_node_id = node.id
			run.current_node_id = node.id
			step = WorkflowStep(run_id=run.id, node_id=node.id, node_type=node.type, status="running", input_data=state.data, started_at=datetime.now(timezone.utc))
			db.add(step)
			db.commit()
			result = await HANDLERS[node.type]().execute(node.config, state.data, context)
			state.data = {**state.data, **result.output}
			state.visited_nodes.append(node.id)
			step.output_data = result.output
			step.status = result.status
			step.completed_at = datetime.now(timezone.utc)
			db.commit()
			if result.status == "awaiting_approval":
				run.status = "awaiting_approval"
				run.output_data = state.data
				db.commit()
				return run
			edges = graph.next_edges(node.id, result.output)
			node = graph.nodes[edges[0].target] if edges else None
		run.status = "succeeded"
		run.output_data = state.data
	except Exception as exc:
		run.status = "failed"
		run.error = str(exc)
		if 'step' in locals():
			step.status = "failed"
			step.error = str(exc)
			db.commit()
	run.current_node_id = None
	run.completed_at = datetime.now(timezone.utc)
	db.commit()
	db.refresh(run)
	return run
