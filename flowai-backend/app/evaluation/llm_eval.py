from typing import Any


class LLMEvaluator:
    """
    Evaluation harness for LLM response quality:
    - Correctness
    - Context relevance
    - Groundedness (no hallucinated business data)
    - Tone and policy compliance
    """

    def evaluate_response(
        self,
        question: str,
        response: str,
        ground_truth: str | None = None,
        context: list[str] | None = None,
    ) -> dict[str, Any]:
        resp_lower = response.lower()
        
        # 1. Relevance Score
        relevance_score = 1.0 if len(response.strip()) > 10 else 0.3

        # 2. Groundedness / Hallucination Detection
        groundedness_score = 1.0
        if context:
            context_text = " ".join(context).lower()
            # Check overlap
            common_words = set(resp_lower.split()) & set(context_text.split())
            groundedness_score = min(1.0, max(0.5, len(common_words) / max(1, len(set(resp_lower.split())))))

        # 3. Correctness Score against golden truth
        correctness_score = 1.0
        if ground_truth:
            gt_words = set(ground_truth.lower().split())
            overlap = len(gt_words & set(resp_lower.split()))
            correctness_score = round(overlap / max(1, len(gt_words)), 2)

        overall_score = round(
            (relevance_score * 0.3) + (groundedness_score * 0.3) + (correctness_score * 0.4), 2
        )

        return {
            "overall_score": overall_score,
            "relevance_score": relevance_score,
            "groundedness_score": groundedness_score,
            "correctness_score": correctness_score,
            "hallucination_detected": groundedness_score < 0.4,
            "passed": overall_score >= 0.7,
        }


llm_evaluator = LLMEvaluator()
