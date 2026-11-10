import io
import fitz
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.document import Document
from backend.app.models.chunk import Chunk
from backend.app.services.document_service import DocumentService
from backend.app.services.ingestion_service import IngestionService
from backend.app.rag.vector_store import FAISSVectorStore

def test_end_to_end_ingestion_pipeline(client, db_session, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])

    # 1. Create a 2-page academic PDF
    doc_fitz = fitz.open()
    p1 = doc_fitz.new_page()
    p1.insert_text((50, 72), "Retrieval-Augmented Generation architectures combine dense vector retrieval with foundation language models.")
    p2 = doc_fitz.new_page()
    p2.insert_text((50, 72), "Evaluation metrics include Precision at K, Recall at K, and Mean Reciprocal Rank over ground-truth context spans.")
    pdf_bytes = doc_fitz.write()
    doc_fitz.close()

    # 2. Upload document
    upload_res = client.post(
        "/api/v1/documents/upload",
        files={"files": ("rag_paper.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["uploaded"][0]["document_id"]

    # 3. Process ingestion pipeline with mock embeddings
    processed_doc = IngestionService.process_document(
        document_id=doc_id,
        db=db_session,
        mock_embeddings=True
    )

    # 4. Verify Document record state
    assert processed_doc.status == "indexed"
    assert processed_doc.page_count == 2
    assert processed_doc.chunk_count >= 2
    assert processed_doc.summary is not None
    assert len(processed_doc.summary) > 10

    # 5. Verify Chunk records in database
    chunks = db_session.query(Chunk).filter(Chunk.document_id == doc_id).all()
    assert len(chunks) == processed_doc.chunk_count
    for c in chunks:
        assert c.token_count > 0
        assert c.start_page in (1, 2)
        assert c.end_page in (1, 2)
        assert c.start_char >= 0
        assert c.end_char > c.start_char
        assert c.embedding_model is not None

    # 6. Verify vectors indexed in FAISS
    vector_store = FAISSVectorStore(workspace_id=processed_doc.workspace_id)
    indexed_vector_ids = vector_store.get_indexed_vector_ids()
    db_chunk_ids = [c.id for c in chunks]
    for cid in db_chunk_ids:
        assert cid in indexed_vector_ids

    # 7. Reindexing: execute reindexing and confirm no duplicate vectors
    reindexed_doc = IngestionService.process_document(
        document_id=doc_id,
        db=db_session,
        mock_embeddings=True
    )
    assert reindexed_doc.status == "indexed"
    new_chunks = db_session.query(Chunk).filter(Chunk.document_id == doc_id).all()
    assert len(new_chunks) == reindexed_doc.chunk_count

    # Vector count in FAISS must match exactly chunk count (NO duplicates)
    assert vector_store.index.ntotal == len(new_chunks)

    # 8. Delete document via API and confirm cleanup
    del_res = client.delete(
        f"/api/v1/documents/{doc_id}",
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert del_res.status_code == 200

    # Verify FAISS vectors removed
    vector_store_after = FAISSVectorStore(workspace_id=processed_doc.workspace_id)
    assert vector_store_after.index.ntotal == 0
    # Verify DB chunks removed
    remaining_chunks = db_session.query(Chunk).filter(Chunk.document_id == doc_id).count()
    assert remaining_chunks == 0
