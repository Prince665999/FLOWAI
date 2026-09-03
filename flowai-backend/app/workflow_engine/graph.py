from collections import defaultdict

from app.schemas.workflow import WorkflowDefinition, WorkflowEdge, WorkflowNode


class GraphValidationError(ValueError):
	pass


class WorkflowGraph:
	def __init__(self, definition: WorkflowDefinition | dict) -> None:
		self.definition = definition if isinstance(definition, WorkflowDefinition) else WorkflowDefinition.model_validate(definition)
		self.nodes = {node.id: node for node in self.definition.nodes}
		self.outgoing: dict[str, list[WorkflowEdge]] = defaultdict(list)
		for edge in self.definition.edges:
			self.outgoing[edge.source].append(edge)

	def validate(self) -> None:
		triggers = [node for node in self.definition.nodes if node.type == "trigger"]
		if len(triggers) != 1:
			raise GraphValidationError("A workflow must contain exactly one trigger node")
		if len(self.nodes) != len(self.definition.nodes):
			raise GraphValidationError("Workflow node IDs must be unique")
		for edge in self.definition.edges:
			if edge.source not in self.nodes or edge.target not in self.nodes:
				raise GraphValidationError("Workflow edges must reference existing nodes")
		reachable = set()
		pending = [triggers[0].id]
		while pending:
			node_id = pending.pop()
			if node_id in reachable:
				continue
			reachable.add(node_id)
			pending.extend(edge.target for edge in self.outgoing[node_id])
		if reachable != set(self.nodes):
			raise GraphValidationError("Workflow contains unreachable nodes")

	def start_node(self) -> WorkflowNode:
		return next(node for node in self.definition.nodes if node.type == "trigger")

	def next_edges(self, node_id: str, output: dict | None = None) -> list[WorkflowEdge]:
		edges = self.outgoing.get(node_id, [])
		if not output or "branch" not in output:
			return edges[:1]
		matching = [edge for edge in edges if edge.condition in {None, output["branch"]}]
		return matching[:1] or edges[:1]
