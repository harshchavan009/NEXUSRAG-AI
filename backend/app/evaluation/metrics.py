"""
Quantitative Information Retrieval (IR) and RAG Evaluation Metrics.
Computes Precision@K, Recall@K, MRR, Gate Calibration, Faithfulness, and Latency Percentiles.
"""
import numpy as np
from typing import List, Dict, Any, Optional

def compute_precision_at_k(retrieved_doc_names: List[str], target_doc_name: str, k: int) -> float:
    """Computes Precision@K: fraction of top-K retrieved items that are relevant."""
    if not retrieved_doc_names or k <= 0:
        return 0.0
    top_k = retrieved_doc_names[:k]
    relevant_hits = sum(1 for name in top_k if name == target_doc_name)
    return relevant_hits / len(top_k)

def compute_recall_at_k(retrieved_doc_names: List[str], target_doc_name: str, k: int) -> float:
    """Computes Recall@K: 1.0 if target document is retrieved within top-K, else 0.0."""
    if not retrieved_doc_names or k <= 0:
        return 0.0
    top_k = retrieved_doc_names[:k]
    return 1.0 if target_doc_name in top_k else 0.0

def compute_mrr(retrieved_doc_names: List[str], target_doc_name: str) -> float:
    """Computes Reciprocal Rank for a query: 1 / rank of first relevant result."""
    for rank, name in enumerate(retrieved_doc_names, start=1):
        if name == target_doc_name:
            return 1.0 / rank
    return 0.0

def compute_percentiles(values: List[float]) -> Dict[str, float]:
    """Computes p50, p90, p95, and p99 percentiles for a list of numeric timings."""
    if not values:
        return {"p50": 0.0, "p90": 0.0, "p95": 0.0, "p99": 0.0, "mean": 0.0}
    arr = np.array(values)
    return {
        "p50": round(float(np.percentile(arr, 50)), 2),
        "p90": round(float(np.percentile(arr, 90)), 2),
        "p95": round(float(np.percentile(arr, 95)), 2),
        "p99": round(float(np.percentile(arr, 99)), 2),
        "mean": round(float(np.mean(arr)), 2),
    }

class EvaluationMetricsCollector:
    def __init__(self):
        self.results: List[Dict[str, Any]] = []

    def record_query_result(
        self,
        query_id: str,
        query_text: str,
        expected_answerable: bool,
        actual_answerable: bool,
        is_abstention: bool,
        sufficiency_score: float,
        groundedness_score: float,
        precision_at_1: float,
        precision_at_4: float,
        recall_at_4: float,
        mrr: float,
        key_facts_found: int,
        total_key_facts: int,
        valid_citations_count: int,
        timings: Dict[str, float]
    ):
        self.results.append({
            "query_id": query_id,
            "query_text": query_text,
            "expected_answerable": expected_answerable,
            "actual_answerable": actual_answerable,
            "is_abstention": is_abstention,
            "gate_correct": expected_answerable == actual_answerable,
            "sufficiency_score": sufficiency_score,
            "groundedness_score": groundedness_score,
            "precision_at_1": precision_at_1,
            "precision_at_4": precision_at_4,
            "recall_at_4": recall_at_4,
            "mrr": mrr,
            "key_facts_found": key_facts_found,
            "total_key_facts": total_key_facts,
            "valid_citations_count": valid_citations_count,
            "timings": timings,
        })

    def aggregate_summary(self) -> Dict[str, Any]:
        """Calculates global aggregate metrics across all evaluated queries."""
        in_domain = [r for r in self.results if r["expected_answerable"]]
        out_of_domain = [r for r in self.results if not r["expected_answerable"]]

        # 1. Gate Calibration
        tp = sum(1 for r in in_domain if r["actual_answerable"])
        fn = sum(1 for r in in_domain if not r["actual_answerable"])
        tn = sum(1 for r in out_of_domain if not r["actual_answerable"])
        fp = sum(1 for r in out_of_domain if r["actual_answerable"])
        total_queries = len(self.results)
        gate_accuracy = (tp + tn) / total_queries if total_queries else 0.0

        # 2. Information Retrieval Metrics (for answerable queries)
        avg_p1 = np.mean([r["precision_at_1"] for r in in_domain]) if in_domain else 0.0
        avg_p4 = np.mean([r["precision_at_4"] for r in in_domain]) if in_domain else 0.0
        avg_r4 = np.mean([r["recall_at_4"] for r in in_domain]) if in_domain else 0.0
        avg_mrr = np.mean([r["mrr"] for r in in_domain]) if in_domain else 0.0

        # 3. Faithfulness & Citations
        faithfulness_rate = np.mean([1.0 if r["groundedness_score"] >= 0.70 else 0.0 for r in in_domain]) if in_domain else 0.0
        mean_groundedness = np.mean([r["groundedness_score"] for r in self.results]) if self.results else 0.0

        # 4. Latency Percentiles
        total_latencies = [r["timings"].get("total", 0.0) for r in self.results]
        retrieve_latencies = [r["timings"].get("retrieve", 0.0) for r in self.results]
        rerank_latencies = [r["timings"].get("rerank", 0.0) for r in self.results]
        generate_latencies = [r["timings"].get("generate", 0.0) for r in self.results]

        return {
            "total_queries_evaluated": total_queries,
            "in_domain_count": len(in_domain),
            "out_of_domain_count": len(out_of_domain),
            "gate_calibration": {
                "true_positives": tp,
                "false_negatives": fn,
                "true_negatives": tn,
                "false_positives": fp,
                "accuracy": round(float(gate_accuracy), 4),
            },
            "retrieval_performance": {
                "mean_precision_at_1": round(float(avg_p1), 4),
                "mean_precision_at_4": round(float(avg_p4), 4),
                "mean_recall_at_4": round(float(avg_r4), 4),
                "mean_reciprocal_rank": round(float(avg_mrr), 4),
            },
            "grounding_and_citations": {
                "faithfulness_compliance_rate": round(float(faithfulness_rate), 4),
                "mean_groundedness_score": round(float(mean_groundedness), 4),
            },
            "latency_percentiles_ms": {
                "total": compute_percentiles(total_latencies),
                "retrieve": compute_percentiles(retrieve_latencies),
                "rerank": compute_percentiles(rerank_latencies),
                "generate": compute_percentiles(generate_latencies),
            }
        }

