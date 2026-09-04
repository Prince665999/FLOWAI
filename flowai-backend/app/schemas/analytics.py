from pydantic import BaseModel, Field


class BusinessOverviewRead(BaseModel):
    workflows_executed: int
    successful_workflows: int
    failed_workflows: int
    awaiting_approval: int
    tasks_automated: int
    hours_saved: float
    ai_cost_usd: float
    human_approvals_total: int
    human_approvals_pending: int
    success_rate_percent: float
    human_intervention_rate_percent: float
    customers_processed: int
    average_duration_seconds: float


class ModelCostBreakdown(BaseModel):
    model_name: str
    input_tokens: int
    output_tokens: int
    estimated_cost_usd: float
    calls_count: int
