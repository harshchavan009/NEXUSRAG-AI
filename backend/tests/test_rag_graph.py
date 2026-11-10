import pytest
from datetime import datetime, timezone

from backend.app.rag.engine.state import RAGGraphState
from backend.app.rag.engine.nodes import (
    validate_input_node,
    rewrite_query_node,
    rerank_node,
    check_evidence_node,
    abstain_node,
    generate_node,
    validate_citations_node,
    validate_groundedness_node,
    finalise_node
)
from backend.app.rag.engine.graph import rag_graph
from backend.app.models.workspace import Workspace
from backend.app.models.collection import Collection
from backend.app.models.document import Document
from backend.app.models.chunk import Chunk
from backend.app.models.workflow_run import WorkflowRun
from backend.app.rag.vector_store.faiss_store import FAISSVectorStore
from backend.app.rag.embeddings.factory import get_embedding_provider

def test_validate_input_node_bounds_and_sanitization(db_session):
    # Valid input
    state: RAGGraphState = {
        "original_query": "   What is the revenue growth?   \x00",
        "scope_collection_ids": [],
        "scope_document_ids": []
    }
    res = validate_input_node(state)
    assert res["original_query"] == "What is the revenue growth?"
    assert "validate_input" in res["node_timings"]

    # Short query fails
    with pytest.raises(ValueError, match="at least 2 characters"):
        validate_input_node({"original_query": "a"})

    # Long query fails
    with pytest.raises(ValueError, match="maximum limit of 1,500"):
        validate_input_node({"original_query": "x" * 1501})

def test_validate_input_scope_pruning_cross_tenant(db_session):
    ws_a = Workspace(session_token="token_a_123")
    ws_b = Workspace(session_token="token_b_456")
    db_session.add_all([ws_a, ws_b])
    db_session.flush()

    coll_a = Collection(workspace_id=ws_a.id, name="Coll A")
    coll_b = Collection(workspace_id=ws_b.id, name="Coll B")
    db_session.add_all([coll_a, coll_b])
    db_session.commit()

    # Workspace A tries to query Collection A and Collection B
    state: RAGGraphState = {
        "workspace_id": ws_a.id,
        "original_query": "Summary of report",
        "scope_collection_ids": [coll_a.id, coll_b.id, "fake_id"],
        "scope_document_ids": [],
        "db": db_session
    }
    res = validate_input_node(state)
    # Only Coll A belongs to Workspace A; Coll B and fake_id must be pruned
    assert res["scope_collection_ids"] == [coll_a.id]

def test_rewrite_query_node_standalone_and_conversational():
    # Standalone query remains unchanged
    state_standalone: RAGGraphState = {
        "original_query": "What were the Q3 financial results?",
        "chat_history": []
    }
    res1 = rewrite_query_node(state_standalone)
    assert res1["rewritten_query"] == "What were the Q3 financial results?"

    # Conversational query with pronouns and history gets expanded
    state_conversational: RAGGraphState = {
        "original_query": "What about its operating margin?",
        "chat_history": [
            {"role": "user", "content": "Tell me about Acme Corp Q3 performance."},
            {"role": "assistant", "content": "Acme Corp reported strong Q3 revenue."}
        ]
    }
    res2 = rewrite_query_node(state_conversational)
    assert "Acme Corp" in res2["rewritten_query"] or "Q3" in res2["rewritten_query"]

def test_rerank_and_check_evidence_node():
    candidates = [
        {
            "chunk_id": 1,
            "document_id": "doc_1",
            "filename": "report.pdf",
            "page_number": 1,
            "content": "Quarterly net revenue increased by 15% due to enterprise growth.",
            "vector_score": 0.85
        },
        {
            "chunk_id": 2,
            "document_id": "doc_1",
            "filename": "report.pdf",
            "page_number": 2,
            "content": "Operating expenses rose 5% driven by research and development.",
            "vector_score": 0.72
        }
    ]

    rerank_res = rerank_node({
        "original_query": "revenue growth",
        "retrieved_candidates": candidates
    })
    assert len(rerank_res["reranked_chunks"]) == 2
    top_chunk = rerank_res["reranked_chunks"][0]
    assert top_chunk["chunk_id"] == 1
    assert "rerank_score" in top_chunk

    # Check evidence sufficiency
    chk_res = check_evidence_node({"reranked_chunks": rerank_res["reranked_chunks"]})
    assert chk_res["evidence_sufficiency_score"] > 0.65
    assert chk_res["evidence_is_sufficient"] is True

    # Empty candidates produce zero sufficiency
    chk_empty = check_evidence_node({"reranked_chunks": []})
    assert chk_empty["evidence_sufficiency_score"] == 0.0
    assert chk_empty["evidence_is_sufficient"] is False

def test_abstain_node():
    tokens = []
    res = abstain_node({
        "original_query": "Quantum gravity teleportation facts",
        "token_callback": lambda t: tokens.append(t)
    })
    assert res["is_abstention"] is True
    assert "could not find sufficient information" in res["generated_text"]
    assert len(tokens) > 0

def test_validate_citations_node_strips_hallucinations():
    reranked = [
        {
            "chunk_id": 101,
            "document_id": "doc_abc",
            "filename": "file1.txt",
            "page_number": 1,
            "content": "Server uptime reached 99.99% throughout the quarter.",
            "rerank_score": 0.91
        }
    ]

    # Model emitted valid [1] but hallucinated [2] and [99]
    generated_text = "Server uptime was 99.99% [1]. Security incidents were zero [2][99]."
    res = validate_citations_node({
        "generated_text": generated_text,
        "reranked_chunks": reranked
    })

    # Hallucinated citations [2] and [99] must be stripped
    assert "[2]" not in res["generated_text"]
    assert "[99]" not in res["generated_text"]
    assert "[1]" in res["generated_text"]
    assert 2 in res["stripped_citations"]
    assert 99 in res["stripped_citations"]

    # Valid citation [1] must be recorded
    assert len(res["validated_citations"]) == 1
    c1 = res["validated_citations"][0]
    assert c1["citation_index"] == 1
    assert c1["chunk_id"] == 101
    assert c1["filename"] == "file1.txt"

def test_validate_groundedness_node():
    # Abstention is automatically 1.0 grounded
    res_abs = validate_groundedness_node({"is_abstention": True})
    assert res_abs["groundedness_score"] == 1.0

    # Grounded answer with lexical overlap
    reranked = [
        {"content": "Alpha Corp acquired Beta Systems for 50 million dollars."}
    ]
    answer = "Alpha Corp completed the acquisition of Beta Systems for 50 million dollars."
    res_grounded = validate_groundedness_node({
        "is_abstention": False,
        "generated_text": answer,
        "reranked_chunks": reranked
    })
    assert res_grounded["groundedness_score"] >= 0.70

def test_end_to_end_graph_indexed_retrieval(db_session):
    # Setup workspace, document, chunk, and index
    ws = Workspace(session_token="e2e_graph_ws_token")
    db_session.add(ws)
    db_session.flush()

    doc = Document(
        workspace_id=ws.id,
        filename="stored_fin.txt",
        original_filename="financial_summary.txt",
        storage_path="/tmp/stored_fin.txt",
        file_type="txt",
        file_size_bytes=500,
        page_count=1,
        chunk_count=1,
        sha256_hash="e2e_doc_hash_1",
        status="indexed"
    )
    db_session.add(doc)
    db_session.flush()

    chunk_text = "In fiscal year 2024, our cloud infrastructure division generated 120 million in profit."
    chunk = Chunk(
        document_id=doc.id,
        workspace_id=ws.id,
        chunk_index=0,
        content=chunk_text,
        token_count=18,
        start_page=1,
        end_page=1,
        start_char=0,
        end_char=len(chunk_text),
        embedding_model="mock"
    )
    db_session.add(chunk)
    db_session.commit()

    # Index into FAISS
    embedder = get_embedding_provider()
    vector = embedder.embed_documents([chunk_text])[0]
    vstore = FAISSVectorStore(workspace_id=ws.id)
    vstore.add_vectors([chunk.id], [vector])

    # Run LangGraph workflow
    state: RAGGraphState = {
        "workspace_id": ws.id,
        "original_query": "How much profit did cloud infrastructure generate?",
        "scope_collection_ids": [],
        "scope_document_ids": [],
        "top_k": 4,
        "db": db_session,
        "node_timings": {},
        "retry_count": 0
    }

    final_state = rag_graph.invoke(state)

    assert final_state["is_abstention"] is False
    assert final_state["status"] == "completed"
    assert "profit" in final_state["generated_text"].lower() or "120 million" in final_state["generated_text"]
    assert len(final_state["validated_citations"]) > 0
    assert final_state["validated_citations"][0]["filename"] == "financial_summary.txt"

    # Verify workflow run persisted to DB
    run_record = db_session.query(WorkflowRun).filter(WorkflowRun.id == final_state["workflow_run_id"]).first()
    assert run_record is not None
    assert run_record.status == "completed"
    assert "validate_input" in run_record.stage_durations
    assert "generate" in run_record.stage_durations

def test_end_to_end_graph_abstention_on_unindexed_workspace(db_session):
    ws = Workspace(session_token="empty_ws_token")
    db_session.add(ws)
    db_session.commit()

    state: RAGGraphState = {
        "workspace_id": ws.id,
        "original_query": "What is the company mission?",
        "scope_collection_ids": [],
        "scope_document_ids": [],
        "top_k": 4,
        "db": db_session,
        "node_timings": {},
        "retry_count": 0
    }

    final_state = rag_graph.invoke(state)

    assert final_state["is_abstention"] is True
    assert final_state["status"] == "abstained"
    assert "could not find sufficient information" in final_state["generated_text"]
    assert len(final_state["validated_citations"]) == 0

    # Verify run persisted as abstained
    run_record = db_session.query(WorkflowRun).filter(WorkflowRun.id == final_state["workflow_run_id"]).first()
    assert run_record is not None
    assert run_record.status == "abstained"
