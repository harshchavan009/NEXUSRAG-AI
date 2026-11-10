import shutil
import numpy as np
from pathlib import Path
from backend.app.rag.vector_store import FAISSVectorStore
from backend.app.rag.embeddings import MockEmbeddingProvider
from backend.app.config import settings

def test_faiss_vector_store_crud_and_persistence(tmp_path):
    workspace_id = "test_ws_faiss_crud"
    embedder = MockEmbeddingProvider(dimension=64)

    # Clean up directory if exists
    ws_dir = settings.FAISS_DIR / workspace_id
    shutil.rmtree(ws_dir, ignore_errors=True)

    store = FAISSVectorStore(workspace_id=workspace_id, dimension=64, model_name=embedder.model_name)
    assert store.index.ntotal == 0

    # 1. Add vectors for 3 distinct chunk IDs
    chunk_ids = [101, 102, 103]
    texts = [
        "Vector search using inner product cosine similarity.",
        "Deep learning architectures and transformer attention heads.",
        "Financial reporting standards and quarterly revenue audits."
    ]
    vectors = embedder.embed_documents(texts)
    store.add_vectors(chunk_ids, vectors)

    assert store.index.ntotal == 3
    assert store.index_path.exists()
    assert store.meta_path.exists()

    # 2. Search query matches closest chunk
    query_vec = embedder.embed_query(texts[0])
    results = store.search(query_vec, top_k=2)
    assert len(results) == 2
    # Chunk 101 should be the exact match
    assert results[0][0] == 101
    assert results[0][1] >= 0.99  # Cosine similarity score close to 1.0

    # 3. Reindexing: adding chunk 101 with updated vector should not increase ntotal
    store.add_vectors([101], [query_vec])
    assert store.index.ntotal == 3  # Overwritten, not duplicated!

    # 4. Deletion: remove chunk 102
    store.remove_vectors([102])
    assert store.index.ntotal == 2
    indexed_ids = store.get_indexed_vector_ids()
    assert 102 not in indexed_ids
    assert 101 in indexed_ids
    assert 103 in indexed_ids

    # 5. Reload from disk into a fresh instance
    store_reloaded = FAISSVectorStore(workspace_id=workspace_id, dimension=64, model_name=embedder.model_name)
    assert store_reloaded.index.ntotal == 2

    # 6. Drift reconciliation: DB has chunks [101], but FAISS has [101, 103]
    reconcile_report = store_reloaded.reconcile_drift(valid_chunk_ids=[101])
    assert reconcile_report["orphaned_removed"] == 1
    assert store_reloaded.index.ntotal == 1
    assert store_reloaded.get_indexed_vector_ids() == [101]

    # Teardown
    shutil.rmtree(ws_dir, ignore_errors=True)
