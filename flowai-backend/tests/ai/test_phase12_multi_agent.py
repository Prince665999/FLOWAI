import pytest
from app.agents.supervisor import supervisor_agent
from app.agents.research_agent import research_agent
from app.agents.customer_agent import customer_agent
from app.agents.reporting_agent import reporting_agent
from app.agents.permissions import RESEARCH_TOOLS, CUSTOMER_TOOLS, REPORTING_TOOLS


def test_specialized_agent_permissions():
    assert "web_search" in RESEARCH_TOOLS
    assert "send_email" not in RESEARCH_TOOLS

    assert "crm" in CUSTOMER_TOOLS
    assert "database" in REPORTING_TOOLS


@pytest.mark.asyncio
async def test_supervisor_agent_decomposition_and_run():
    objective = "Research our competitors, compare them with customer complaints, and generate a management report."
    plan = supervisor_agent.decompose_objective(objective)
    assert len(plan) >= 2

    # Run supervisor orchestration
    result = await supervisor_agent.run(objective=objective, user_id=1, db=None)
    assert result["status"] == "completed"
    assert "delegation_tree" in result
    assert len(result["delegation_tree"]) >= 2
    assert "aggregated_findings" in result
