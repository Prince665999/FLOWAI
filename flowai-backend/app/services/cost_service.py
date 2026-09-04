from typing import Any
from sqlalchemy.orm import Session

from app.models.cost_record import CostRecord

# Estimated rates per 1k tokens
MODEL_PRICING_USD_PER_1K = {
    "gemini-1.5-flash": {"input": 0.000075, "output": 0.0003},
    "gemini-1.5-pro": {"input": 0.00125, "output": 0.005},
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "gpt-4o": {"input": 0.0025, "output": 0.01},
}


class CostService:
    def calculate_cost(
        self,
        model_name: str,
        input_tokens: int,
        output_tokens: int,
    ) -> float:
        pricing = MODEL_PRICING_USD_PER_1K.get(
            model_name, MODEL_PRICING_USD_PER_1K["gemini-1.5-flash"]
        )
        in_cost = (input_tokens / 1000.0) * pricing["input"]
        out_cost = (output_tokens / 1000.0) * pricing["output"]
        return round(in_cost + out_cost, 6)

    def record_cost(
        self,
        db: Session,
        user_id: int,
        model_name: str,
        input_tokens: int = 0,
        output_tokens: int = 0,
        tool_calls_count: int = 0,
        execution_time_ms: float = 0.0,
        workflow_run_id: int | None = None,
        agent_run_id: int | None = None,
    ) -> CostRecord:
        cost = self.calculate_cost(model_name, input_tokens, output_tokens)
        record = CostRecord(
            user_id=user_id,
            workflow_run_id=workflow_run_id,
            agent_run_id=agent_run_id,
            model_name=model_name,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            tool_calls_count=tool_calls_count,
            estimated_cost_usd=cost,
            execution_time_ms=execution_time_ms,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record


cost_service = CostService()
