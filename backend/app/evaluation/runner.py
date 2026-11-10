"""
Automated Evaluation Runner for NexusRAG.
Ingests benchmark documents and runs the calibrated evaluation suite.
"""
import os
import shutil
import uuid
from pathlib import Path
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session

from backend.app.config import settings, BASE_DIR
from backend.app.models.workspace import Workspace
from backend.app.models.document import Document
from backend.app.core.security import calculate_sha256
from backend.app.services.ingestion_service import IngestionService
from backend.app.services.rag_service import RAGService
from backend.app.evaluation.benchmark_dataset import BENCHMARK_QUERIES, BenchmarkQuery
from backend.app.evaluation.metrics import (
    compute_precision_at_k,
    compute_recall_at_k,
    compute_mrr,
    EvaluationMetricsCollector
)

SAMPLE_DOCS_DIR = BASE_DIR / "data" / "sample_documents"

def setup_benchmark_workspace(db: Session) -> Tuple[Workspace, Dict[str, Document]]:
    """Provisions a clean evaluation workspace and ingests the 3 benchmark reference documents."""
    ws = Workspace(session_token=f"eval_bench_{uuid.uuid4().hex[:16]}")
    db.add(ws)
    db.commit()
    db.refresh(ws)

    sample_files = [
        "clean_energy_report_2024.txt",
        "distributed_systems_consensus_brief.md",
        "corporate_governance_report.txt",
    ]

    ingested_docs = {}

    for fname in sample_files:
        src_path = SAMPLE_DOCS_DIR / fname
        if not src_path.exists():
            raise FileNotFoundError(f"Benchmark document '{fname}' not found in {SAMPLE_DOCS_DIR}")

        # Copy to uploads directory
        stored_name = f"eval_{fname}"
        dest_path = settings.UPLOADS_DIR / stored_name
        shutil.copy2(src_path, dest_path)

        file_size = dest_path.stat().st_size
        file_ext = src_path.suffix.lstrip(".").lower()
        if file_ext == "markdown":
            file_ext = "md"

        # Create Document record
        doc = Document(
            workspace_id=ws.id,
            filename=stored_name,
            original_filename=fname,
            storage_path=str(dest_path),
            file_type=file_ext,
            file_size_bytes=file_size,
            sha256_hash=calculate_sha256(dest_path.read_bytes()),
            status="uploaded"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Process document through the full ingestion pipeline
        IngestionService.process_document(doc.id, db)
        db.refresh(doc)
        ingested_docs[fname] = doc

    return ws, ingested_docs

def run_benchmark_evaluation(db: Session) -> Dict[str, Any]:
    """Executes all 10 benchmark queries against the indexed benchmark documents."""
    ws, docs = setup_benchmark_workspace(db)
    collector = EvaluationMetricsCollector()

    for item in BENCHMARK_QUERIES:
        # Run query through RAG Service
        response = RAGService.execute_query(
            db=db,
            workspace_id=ws.id,
            query=item.query,
            session_id=None,
            top_k=4
        )

        retrieved_doc_names = [c.filename for c in response.citations]

        # In-domain metrics
        if item.expected_answerable:
            p1 = compute_precision_at_k(retrieved_doc_names, item.target_document_filename, k=1)
            p4 = compute_precision_at_k(retrieved_doc_names, item.target_document_filename, k=4)
            r4 = compute_recall_at_k(retrieved_doc_names, item.target_document_filename, k=4)
            mrr = compute_mrr(retrieved_doc_names, item.target_document_filename)

            # Check key facts contained in answer
            answer_lower = response.answer.lower()
            facts_found = sum(1 for fact in item.key_facts if fact.lower() in answer_lower)
            actual_answerable = not response.is_abstention
        else:
            p1 = 0.0
            p4 = 0.0
            r4 = 0.0
            mrr = 0.0
            facts_found = 0
            actual_answerable = not response.is_abstention

        collector.record_query_result(
            query_id=item.id,
            query_text=item.query,
            expected_answerable=item.expected_answerable,
            actual_answerable=actual_answerable,
            is_abstention=response.is_abstention,
            sufficiency_score=response.sufficiency_score,
            groundedness_score=response.groundedness_score,
            precision_at_1=p1,
            precision_at_4=p4,
            recall_at_4=r4,
            mrr=mrr,
            key_facts_found=facts_found,
            total_key_facts=len(item.key_facts),
            valid_citations_count=len(response.citations),
            timings=response.timings_ms
        )

    summary = collector.aggregate_summary()
    summary["detailed_query_results"] = collector.results
    return summary
