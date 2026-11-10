import pytest
from backend.app.evaluation.runner import run_benchmark_evaluation

def test_calibrated_benchmark_evaluation(db_session):
    """
    Executes the end-to-end benchmark evaluation suite across clean energy,
    distributed consensus, and corporate governance documents.
    Asserts rigorous quantitative thresholds on retrieval accuracy, abstention calibration,
    and citation faithfulness.
    """
    summary = run_benchmark_evaluation(db_session)

    # 1. Total counts
    assert summary["total_queries_evaluated"] == 10
    assert summary["in_domain_count"] == 6
    assert summary["out_of_domain_count"] == 4

    # 2. Gate Calibration
    gate = summary["gate_calibration"]
    assert gate["accuracy"] >= 0.90, f"Gate calibration accuracy {gate['accuracy']} is below 0.90"
    assert gate["true_negatives"] >= 3, "At least 3/4 out-of-domain adversarial queries must abstain"

    # 3. Retrieval Performance
    retrieval = summary["retrieval_performance"]
    assert retrieval["mean_precision_at_1"] >= 0.80, f"Mean Precision@1 {retrieval['mean_precision_at_1']} below 0.80"
    assert retrieval["mean_recall_at_4"] >= 0.80, f"Mean Recall@4 {retrieval['mean_recall_at_4']} below 0.80"
    assert retrieval["mean_reciprocal_rank"] >= 0.80, f"MRR {retrieval['mean_reciprocal_rank']} below 0.80"

    # 4. Grounding and Faithfulness
    grounding = summary["grounding_and_citations"]
    assert grounding["faithfulness_compliance_rate"] >= 0.80, f"Faithfulness rate {grounding['faithfulness_compliance_rate']} below 0.80"
    assert grounding["mean_groundedness_score"] >= 0.70

    # 5. Latency Percentiles
    latencies = summary["latency_percentiles_ms"]
    assert "total" in latencies
    assert latencies["total"]["p50"] > 0
    assert latencies["total"]["p95"] >= latencies["total"]["p50"]
