#!/usr/bin/env python3
"""
Standalone CLI Retrieval Benchmark Evaluator for NexusRAG.
Executes the calibrated evaluation benchmark suite and writes verified metrics to docs/benchmark-evaluation-results.json.
"""
import json
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.app.database import SessionLocal
from backend.app.evaluation.runner import run_benchmark_evaluation

def main():
    print("=" * 60)
    print("NEXUSRAG CALIBRATED RETRIEVAL BENCHMARK EVALUATOR")
    print("=" * 60)

    db = SessionLocal()
    try:
        print("[1/3] Provisioning isolated evaluation workspace & ingesting reference corpora...")
        summary = run_benchmark_evaluation(db)

        print("[2/3] Processing benchmark queries across evidence gates...")
        total = summary.get("total_queries_evaluated", 0)
        in_domain = summary.get("in_domain_count", 0)
        out_of_domain = summary.get("out_of_domain_count", 0)

        retrieval = summary.get("retrieval_performance", {})
        p1 = retrieval.get("mean_precision_at_1", 0.0)
        p4 = retrieval.get("mean_precision_at_4", 0.0)
        r4 = retrieval.get("mean_recall_at_4", 0.0)
        mrr = retrieval.get("mean_reciprocal_rank", 0.0)

        gate = summary.get("gate_calibration", {})
        gate_acc = gate.get("accuracy", 0.0)
        tn = gate.get("true_negatives", 0)
        fn = gate.get("false_negatives", 0)

        grounding = summary.get("grounding_and_citations", {})
        faithfulness = grounding.get("faithfulness_compliance_rate", 0.0)
        groundedness = grounding.get("mean_groundedness_score", 0.0)

        latencies = summary.get("latency_percentiles_ms", {}).get("total", {})
        p50 = latencies.get("p50", 0.0)
        p95 = latencies.get("p95", 0.0)

        print("\n" + "-" * 60)
        print("EVALUATION SCORECARD (MEASURED NUMBERS ONLY):")
        print("-" * 60)
        print(f"Total Queries Evaluated:       {total} ({in_domain} In-Domain, {out_of_domain} Adversarial Out-of-Domain)")
        print(f"Mean Precision@1:              {p1 * 100:.1f}%")
        print(f"Mean Precision@4:              {p4 * 100:.1f}%")
        print(f"Mean Recall@4:                 {r4 * 100:.1f}%")
        print(f"Mean Reciprocal Rank (MRR):    {mrr:.4f}")
        print(f"Evidence Gate Accuracy:        {gate_acc * 100:.1f}%")
        print(f"Abstention True Negatives:     {tn} / {out_of_domain}")
        print(f"Citation Faithfulness Rate:    {faithfulness * 100:.1f}%")
        print(f"Mean Groundedness Overlap:     {groundedness * 100:.1f}%")
        print(f"Total Pipeline Latency (p50):  {p50:.1f} ms")
        print(f"Total Pipeline Latency (p95):  {p95:.1f} ms")
        print("-" * 60)

        out_path = Path(__file__).parent.parent / "docs" / "benchmark-evaluation-results.json"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w") as f:
            json.dump(summary, f, indent=2)

        print(f"[3/3] Verified evaluation summary successfully exported to {out_path}")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    main()

