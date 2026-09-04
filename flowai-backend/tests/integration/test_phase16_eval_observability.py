import pytest
from app.evaluation.llm_eval import llm_evaluator
from app.evaluation.rag_eval import rag_evaluator
from app.evaluation.tool_eval import tool_evaluator
from app.evaluation.agent_eval import agent_evaluator
from app.evaluation.workflow_eval import workflow_evaluator
from app.evaluation.eval_runner import eval_runner
from app.observability.metrics import metrics_registry
from app.observability.tracing import trace_span


def test_evaluators_suite():
    # LLM Eval
    llm_res = llm_evaluator.evaluate_response(
        question="What is the refund policy?",
        response="The refund policy allows full returns within 30 days.",
        ground_truth="Full refund within 30 days.",
    )
    assert llm_res["passed"] is True
    assert llm_res["overall_score"] >= 0.7

    # RAG Eval
    rag_res = rag_evaluator.evaluate_rag(
        query="Refund policy timeline",
        retrieved_chunks=[{"id": "doc_1", "text": "30 days return window"}],
        generated_answer="Refunds are accepted within 30 days of purchase.",
    )
    assert rag_res["passed"] is True

    # Tool Eval
    tool_res = tool_evaluator.evaluate_tool_call(
        objective="Find customer",
        selected_tool="crm",
        arguments={"action": "find", "query": "Acme"},
        expected_tool="crm",
    )
    assert tool_res["passed"] is True

    # Agent & Workflow Eval
    agent_res = agent_evaluator.evaluate_agent_run(
        objective="Process customer complaints",
        plan=[{"step": 1}, {"step": 2}],
        steps=[{"status": "succeeded"}, {"status": "succeeded"}],
        final_status="succeeded",
    )
    assert agent_res["passed"] is True

    wf_res = workflow_evaluator.evaluate_workflow_run(
        workflow_name="Customer Support",
        steps=[{"node": "t"}, {"node": "a"}],
        final_status="succeeded",
    )
    assert wf_res["passed"] is True


def test_golden_benchmark_runner():
    bench_results = eval_runner.run_all_evaluations()
    assert bench_results["total_test_cases"] >= 4
    assert bench_results["average_benchmark_score"] >= 0.8


def test_observability_tracing_and_metrics():
    with trace_span("test_workflow_execution") as span:
        metrics_registry.increment("test_counter", 1)
        assert span.trace_id is not None

    summary = metrics_registry.get_summary()
    assert "test_counter" in summary["counters"]
    assert "span.test_workflow_execution" in summary["average_latencies_ms"]
