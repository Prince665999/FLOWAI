import pytest
from app.workflow_engine.graph import WorkflowGraph, GraphValidationError
from app.workflow_engine.versioning import workflow_versioning
from app.models.workflow import Workflow


def test_workflow_graph_validation():
    valid_def = {
        "nodes": [
            {"id": "t", "type": "trigger", "config": {}},
            {"id": "a", "type": "ai", "config": {}},
        ],
        "edges": [{"source": "t", "target": "a"}],
    }
    graph = WorkflowGraph(valid_def)
    graph.validate()  # Should not raise

    # Missing trigger should raise
    invalid_def = {
        "nodes": [{"id": "a", "type": "ai", "config": {}}],
        "edges": [],
    }
    with pytest.raises(GraphValidationError):
        WorkflowGraph(invalid_def).validate()


def test_workflow_versioning_publish_and_rollback():
    wf = Workflow(
        user_id=1,
        name="V1 Workflow",
        definition={"nodes": [{"id": "t", "type": "trigger"}], "edges": []},
        version=1,
        status="draft",
        version_history=[],
    )

    # Publish V1 -> increments to V2
    workflow_versioning.publish_version(wf, comment="First release")
    assert wf.version == 2
    assert wf.status == "published"
    assert len(wf.version_history) == 1

    # Modify and rollback
    wf.definition = {"nodes": [{"id": "t2", "type": "trigger"}], "edges": []}
    workflow_versioning.rollback_version(wf, target_version=1)
    assert wf.version == 3
    assert wf.definition["nodes"][0]["id"] == "t"
