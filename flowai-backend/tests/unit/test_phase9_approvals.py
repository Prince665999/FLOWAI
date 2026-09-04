import pytest
from app.models.user import User
from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.services.approval_service import approval_service
from app.workflow_engine.executor import execute_workflow


@pytest.mark.asyncio
async def test_approval_workflow_pause_and_resume(db_session):
    definition = {
        "nodes": [
            {"id": "n1", "type": "trigger", "config": {"event": "manual"}},
            {"id": "n2", "type": "approval", "config": {"message": "Please review payment"}},
            {"id": "n3", "type": "notification", "config": {"message": "All done"}},
        ],
        "edges": [
            {"source": "n1", "target": "n2"},
            {"source": "n2", "target": "n3"},
        ],
    }
    wf = Workflow(
        user_id=1,
        name="Approval Test Workflow",
        definition=definition,
        status="published",
    )
    db_session.add(wf)
    db_session.commit()

    run = WorkflowRun(
        workflow_id=wf.id,
        user_id=1,
        input_data={"amount": 500},
        status="queued",
    )
    db_session.add(run)
    db_session.commit()

    # Step 1: Execute workflow until approval node pauses it
    executed_run = await execute_workflow(wf, run, db_session)
    assert executed_run.status == "awaiting_approval"

    # Step 2: Verify approval record was created
    user = db_session.query(User).filter(User.id == 1).first()
    approvals = approval_service.get_approvals(db_session, user)
    assert len(approvals) == 1
    assert approvals[0].status == "pending"

    # Step 3: Human approves action
    approved = await approval_service.process_approval_action(
        db=db_session,
        user=user,
        approval_id=approvals[0].id,
        action="approve",
        comment="Approved by manager",
    )
    assert approved.status == "approved"

    # Step 4: Verify workflow resumed and succeeded
    db_session.refresh(executed_run)
    assert executed_run.status == "succeeded"
