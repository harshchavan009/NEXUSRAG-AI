import json
import pytest
import asyncio
from backend.app.services.rag_service import RAGService
from backend.app.models.workspace import Workspace
from backend.app.models.document import Document
from backend.app.models.chunk import Chunk
from backend.app.models.session import ResearchSession
from backend.app.rag.vector_store.faiss_store import FAISSVectorStore
from backend.app.rag.embeddings.factory import get_embedding_provider
from backend.app.config import settings

def _setup_indexed_document(db_session, workspace_token: str):
    ws = Workspace(session_token=workspace_token)
    db_session.add(ws)
    db_session.flush()

    doc = Document(
        workspace_id=ws.id,
        filename="solar_energy.txt",
        original_filename="solar_energy.txt",
        storage_path="/tmp/solar_energy.txt",
        file_type="txt",
        file_size_bytes=800,
        page_count=1,
        chunk_count=1,
        sha256_hash=f"hash_{workspace_token}",
        status="indexed"
    )
    db_session.add(doc)
    db_session.flush()

    content = "Photovoltaic solar panels convert sunlight directly into electrical energy with modern commercial efficiency exceeding 22%."
    chunk = Chunk(
        document_id=doc.id,
        workspace_id=ws.id,
        chunk_index=0,
        content=content,
        token_count=18,
        start_page=1,
        end_page=1,
        start_char=0,
        end_char=len(content),
        embedding_model="mock"
    )
    db_session.add(chunk)
    db_session.commit()

    # Index into FAISS
    embedder = get_embedding_provider()
    vec = embedder.embed_documents([content])[0]
    vstore = FAISSVectorStore(workspace_id=ws.id)
    vstore.add_vectors([chunk.id], [vec])

    return ws, doc, chunk

def test_rag_service_execute_query_sync(db_session):
    ws, doc, chunk = _setup_indexed_document(db_session, "token_sync_rag_service")

    response = RAGService.execute_query(
        db=db_session,
        workspace_id=ws.id,
        query="What is the commercial efficiency of photovoltaic panels?",
        session_id=None,
        top_k=4
    )

    assert response.is_abstention is False
    assert len(response.citations) > 0
    assert response.citations[0].filename == "solar_energy.txt"
    assert response.citations[0].page_number == 1
    assert "photovoltaic" in response.answer.lower() or "efficiency" in response.answer.lower()
    assert response.workflow_run_id.startswith("run_")
    assert response.sufficiency_score > 0.65
    assert response.groundedness_score >= 0.70
    assert "retrieve" in response.timings_ms
    assert "generate" in response.timings_ms

@pytest.mark.asyncio
async def test_rag_service_execute_query_stream(db_session):
    ws, doc, chunk = _setup_indexed_document(db_session, "token_stream_rag_service")

    events = []
    async for sse_chunk in RAGService.execute_query_stream(
        workspace_id=ws.id,
        query="How efficient are solar panels?",
        session_id=None,
        top_k=4
    ):
        events.append(sse_chunk)

    full_output = "".join(events)
    assert "event: stage" in full_output
    assert "event: final" in full_output

    # Parse the final event payload
    final_lines = [e for e in events if e.startswith("event: final")]
    assert len(final_lines) > 0
    data_line = final_lines[0].split("data: ")[1].strip()
    final_payload = json.loads(data_line)

    assert "workflow_run_id" in final_payload
    assert final_payload["is_abstention"] is False
    assert len(final_payload["citations"]) > 0
    assert final_payload["citations"][0]["filename"] == "solar_energy.txt"

def test_chat_and_session_api_endpoints(client, workspace_a_auth, db_session):
    headers = {
        "X-Session-Token": workspace_a_auth["token"],
        "X-CSRF-Token": workspace_a_auth["csrf"]
    }

    # 1. Create a session explicitly
    create_res = client.post("/api/v1/sessions", json={"title": "Renewable Energy Study"}, headers=headers)
    assert create_res.status_code == 201
    session_data = create_res.json()
    session_id = session_data["id"]
    assert session_data["title"] == "Renewable Energy Study"

    # 2. List sessions
    list_res = client.get("/api/v1/sessions", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Setup document in this workspace
    ws = db_session.query(Workspace).filter(Workspace.session_token == workspace_a_auth["token"]).first()
    doc = Document(
        workspace_id=ws.id,
        filename="solar.txt",
        original_filename="solar.txt",
        storage_path="/tmp/solar.txt",
        file_type="txt",
        file_size_bytes=500,
        page_count=1,
        chunk_count=1,
        sha256_hash="hash_api_test",
        status="indexed"
    )
    db_session.add(doc)
    db_session.flush()

    content = "Solar panels exhibit 22% conversion efficiency under standard test conditions."
    chunk = Chunk(
        document_id=doc.id,
        workspace_id=ws.id,
        chunk_index=0,
        content=content,
        token_count=12,
        start_page=1,
        end_page=1,
        start_char=0,
        end_char=len(content),
        embedding_model="mock"
    )
    db_session.add(chunk)
    db_session.commit()

    embedder = get_embedding_provider()
    vec = embedder.embed_documents([content])[0]
    vstore = FAISSVectorStore(workspace_id=ws.id)
    vstore.add_vectors([chunk.id], [vec])

    # 4. Issue Query API call
    query_payload = {
        "query": "What is the solar panel conversion efficiency?",
        "session_id": session_id,
        "scope": {"collection_ids": [], "document_ids": []},
        "top_k": 4
    }
    query_res = client.post("/api/v1/query", json=query_payload, headers=headers)
    assert query_res.status_code == 200
    q_data = query_res.json()
    assert q_data["is_abstention"] is False
    assert len(q_data["citations"]) > 0
    assert q_data["workflow_run_id"] != ""

    # 5. Get Session detail (must have user and assistant messages + citations)
    detail_res = client.get(f"/api/v1/sessions/{session_id}", headers=headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert len(detail_data["messages"]) == 2
    assert detail_data["messages"][0]["role"] == "user"
    assert detail_data["messages"][1]["role"] == "assistant"
    assert len(detail_data["messages"][1]["citations"]) > 0

    # 6. Inspector API endpoints
    run_id = q_data["workflow_run_id"]
    inspector_run_res = client.get(f"/api/v1/inspector/runs/{run_id}", headers=headers)
    assert inspector_run_res.status_code == 200
    run_info = inspector_run_res.json()
    assert run_info["id"] == run_id
    assert run_info["status"] == "completed"
    assert len(run_info["retrieved_candidates"]) > 0
    assert len(run_info["reranked_results"]) > 0
    assert run_info["sufficiency_score"] > 0.65

    # 6b. Test streaming endpoint over HTTP
    stream_res = client.post("/api/v1/query/stream", json=query_payload, headers=headers)
    assert stream_res.status_code == 200
    assert "text/event-stream" in stream_res.headers["content-type"]
    stream_text = stream_res.text
    assert "event: stage" in stream_text
    assert "event: final" in stream_text

    # List inspector runs
    runs_list_res = client.get("/api/v1/inspector/runs", headers=headers)
    assert runs_list_res.status_code == 200
    assert len(runs_list_res.json()) >= 1

    # 7. Delete session
    del_res = client.delete(f"/api/v1/sessions/{session_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Detail now 404
    assert client.get(f"/api/v1/sessions/{session_id}", headers=headers).status_code == 404
