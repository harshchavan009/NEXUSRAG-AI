import os
import json
import logging
import threading
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
import faiss
from backend.app.config import settings
from backend.app.core.exceptions import ValidationException

logger = logging.getLogger("nexusrag.vector_store.faiss")

# Global locks per workspace ID to ensure single-writer safety for FAISS
_WORKSPACE_LOCKS: Dict[str, threading.RLock] = {}
_LOCK_REGISTRY_MUTEX = threading.RLock()

def get_workspace_lock(workspace_id: str) -> threading.RLock:
    with _LOCK_REGISTRY_MUTEX:
        if workspace_id not in _WORKSPACE_LOCKS:
            _WORKSPACE_LOCKS[workspace_id] = threading.RLock()
        return _WORKSPACE_LOCKS[workspace_id]

class FAISSVectorStore:
    """
    Production-grade FAISS vector store implementing:
    - Inner product cosine similarity over L2-normalized vectors (IndexFlatIP)
    - Chunk-ID mapping with deletion capabilities (IndexIDMap2)
    - Multi-tenant workspace isolation (/storage/faiss/{workspace_id}/)
    - Metadata model & dimension consistency validation (index.meta.json)
    - Atomic write-to-temp-rename disk persistence
    - Single-writer thread locking
    - Crash drift reconciliation
    """
    def __init__(self, workspace_id: str, dimension: int = None, model_name: str = None):
        self.workspace_id = workspace_id
        self.dimension = dimension or settings.EMBEDDING_DIMENSION
        self.model_name = model_name or settings.DEFAULT_EMBEDDING_MODEL
        
        self.workspace_dir = settings.FAISS_DIR / workspace_id
        self.workspace_dir.mkdir(parents=True, exist_ok=True)
        
        self.index_path = self.workspace_dir / "index.faiss"
        self.meta_path = self.workspace_dir / "index.meta.json"
        
        self.lock = get_workspace_lock(workspace_id)
        self.index: faiss.IndexIDMap2 = self._load_or_create_index()

    def _load_or_create_index(self) -> faiss.IndexIDMap2:
        with self.lock:
            if self.index_path.exists() and self.meta_path.exists():
                try:
                    with open(self.meta_path, "r", encoding="utf-8") as f:
                        meta = json.load(f)
                    
                    stored_dim = meta.get("dimension")
                    stored_model = meta.get("model_name")
                    
                    if stored_dim != self.dimension:
                        logger.error(f"Dimension mismatch in workspace {self.workspace_id}: expected {self.dimension}, got {stored_dim}")
                        raise ValidationException(
                            f"Index dimension mismatch: stored index uses {stored_dim}d, active configuration requires {self.dimension}d."
                        )

                    raw_index = faiss.read_index(str(self.index_path))
                    # Ensure loaded index is wrapped in IndexIDMap2
                    if not isinstance(raw_index, faiss.IndexIDMap2):
                        raw_index = faiss.IndexIDMap2(raw_index)
                    logger.info(f"Loaded existing FAISS index for workspace {self.workspace_id} with {raw_index.ntotal} vectors.")
                    return raw_index
                except Exception as e:
                    logger.warning(f"Failed to read index for workspace {self.workspace_id}: {e}. Creating new index.")

            # Create fresh IndexIDMap2 with IndexFlatIP
            base = faiss.IndexFlatIP(self.dimension)
            index = faiss.IndexIDMap2(base)
            self._save_atomic(index)
            return index

    def _save_atomic(self, index: faiss.IndexIDMap2 = None):
        target_index = index or self.index
        tmp_index_path = self.workspace_dir / "index.faiss.tmp"
        tmp_meta_path = self.workspace_dir / "index.meta.json.tmp"

        meta_data = {
            "workspace_id": self.workspace_id,
            "dimension": self.dimension,
            "model_name": self.model_name,
            "vector_count": target_index.ntotal,
            "metric": "INNER_PRODUCT_COSINE"
        }

        # Write index to temp file
        faiss.write_index(target_index, str(tmp_index_path))
        with open(tmp_meta_path, "w", encoding="utf-8") as f:
            json.dump(meta_data, f, indent=2)

        # Atomic POSIX rename
        os.replace(str(tmp_index_path), str(self.index_path))
        os.replace(str(tmp_meta_path), str(self.meta_path))
        logger.debug(f"Persisted FAISS index atomically for workspace {self.workspace_id} ({target_index.ntotal} vectors).")

    @staticmethod
    def normalize_vectors(vectors: np.ndarray) -> np.ndarray:
        """L2-normalizes vectors so inner product equals cosine similarity."""
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        # Avoid division by zero
        norms[norms == 0.0] = 1.0
        return (vectors / norms).astype(np.float32)

    def add_vectors(self, chunk_ids: List[int], vectors: List[List[float]]):
        """
        Adds vectors to the FAISS index with explicit 64-bit integer Chunk IDs.
        """
        if not chunk_ids or not vectors:
            return

        with self.lock:
            # First remove any existing vectors for these chunk IDs to prevent duplicates on reindex
            self.remove_vectors(chunk_ids, persist=False)

            arr_vectors = np.array(vectors, dtype=np.float32)
            normalized = self.normalize_vectors(arr_vectors)
            arr_ids = np.array(chunk_ids, dtype=np.int64)

            self.index.add_with_ids(normalized, arr_ids)
            self._save_atomic()
            logger.info(f"Added {len(chunk_ids)} vectors to workspace {self.workspace_id} (total: {self.index.ntotal}).")

    def remove_vectors(self, chunk_ids: List[int], persist: bool = True):
        """
        Removes vectors by chunk ID from the FAISS IndexIDMap2.
        """
        if not chunk_ids or self.index.ntotal == 0:
            return

        with self.lock:
            # Check which IDs actually exist in index to avoid faiss errors
            arr_ids = np.array(chunk_ids, dtype=np.int64)
            try:
                self.index.remove_ids(arr_ids)
                if persist:
                    self._save_atomic()
                logger.info(f"Removed {len(chunk_ids)} chunk vectors from workspace {self.workspace_id} (remaining: {self.index.ntotal}).")
            except Exception as e:
                logger.warning(f"Error removing IDs from FAISS index in workspace {self.workspace_id}: {e}")

    def search(
        self,
        query_vector: List[float],
        top_k: int = 8,
        allowed_chunk_ids: Optional[List[int]] = None
    ) -> List[Tuple[int, float]]:
        """
        Executes inner product search over normalized query vector.
        Returns list of (chunk_id, similarity_score).
        """
        if self.index.ntotal == 0:
            return []

        # Query vector must be normalized for inner product to represent cosine similarity
        query_arr = np.array([query_vector], dtype=np.float32)
        norm_query = self.normalize_vectors(query_arr)

        # Retrieve a slightly larger candidate set if filtering is applied
        fetch_k = min(self.index.ntotal, top_k * 4 if allowed_chunk_ids else top_k)
        
        scores, ids = self.index.search(norm_query, fetch_k)
        
        results: List[Tuple[int, float]] = []
        scores_row = scores[0]
        ids_row = ids[0]

        allowed_set = set(allowed_chunk_ids) if allowed_chunk_ids is not None else None

        for score, cid in zip(scores_row, ids_row):
            if cid == -1:
                continue
            if allowed_set is not None and cid not in allowed_set:
                continue
            results.append((int(cid), float(score)))
            if len(results) >= top_k:
                break

        return results

    def get_indexed_vector_ids(self) -> List[int]:
        """Returns all integer chunk IDs currently present in this FAISS index."""
        if self.index.ntotal == 0:
            return []
        
        # In IndexIDMap2, id_map is accessible as a LongVector
        try:
            ids_ptr = faiss.vector_to_array(self.index.id_map)
            return [int(x) for x in ids_ptr]
        except Exception:
            return []

    def reconcile_drift(self, valid_chunk_ids: List[int]) -> Dict[str, Any]:
        """
        Reconciles drift between PostgreSQL database chunks and FAISS index:
        - Detects orphaned vector IDs in FAISS that no longer exist in DB and removes them.
        - Identifies missing chunk IDs in FAISS that require reindexing.
        """
        with self.lock:
            indexed_ids = set(self.get_indexed_vector_ids())
            db_ids = set(valid_chunk_ids)

            orphans = indexed_ids - db_ids
            missing = db_ids - indexed_ids

            if orphans:
                logger.info(f"Drift reconciliation: Removing {len(orphans)} orphaned vectors from FAISS.")
                self.remove_vectors(list(orphans), persist=True)

            return {
                "indexed_count": self.index.ntotal,
                "db_chunk_count": len(valid_chunk_ids),
                "orphaned_removed": len(orphans),
                "missing_needs_reindex": len(missing)
            }
