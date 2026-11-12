import time
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.schemas.system import (
    HealthResponse,
    SystemStatusResponse,
    SystemLimits,
    ProviderProbeResponse
)

logger = logging.getLogger("nexusrag.health")
router = APIRouter(tags=["Health & System"])

# In-memory cache for provider probe (TTL: 60 seconds)
_probe_cache: Dict[str, Any] = {
    "timestamp": 0.0,
    "response": None
}

@router.get("/health", response_model=HealthResponse)
def get_health(db: Session = Depends(get_db)):
    """Health check verifying database connectivity and runtime status."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        app=settings.APP_NAME,
        version=settings.APP_VERSION,
        timestamp=datetime.now(timezone.utc),
        database=db_status,
        vector_store="FAISS (IndexIDMap2 + FlatIP)"
    )

@router.get("/system/status", response_model=SystemStatusResponse)
def get_system_status():
    """Returns runtime parameters, limits, and configurations for frontend UI."""
    return SystemStatusResponse(
        status="healthy",
        app=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        ai_provider=settings.AI_PROVIDER,
        embedding_model=settings.DEFAULT_EMBEDDING_MODEL,
        generation_model=settings.DEFAULT_GENERATION_MODEL,
        embedding_dimension=settings.EMBEDDING_DIMENSION,
        vector_store="FAISS",
        limits=SystemLimits(
            max_file_size_bytes=settings.MAX_FILE_SIZE_BYTES,
            max_pdf_pages=settings.MAX_PDF_PAGES,
            allowed_extensions=settings.ALLOWED_EXTENSIONS
        ),
        rag_defaults={
            "chunk_size": settings.DEFAULT_CHUNK_SIZE,
            "chunk_overlap": settings.DEFAULT_CHUNK_OVERLAP,
            "top_k": settings.DEFAULT_TOP_K,
            "final_context_k": settings.DEFAULT_FINAL_CONTEXT_K,
            "sufficiency_threshold": settings.EVIDENCE_SUFFICIENCY_THRESHOLD,
            "groundedness_threshold": settings.GROUNDEDNESS_THRESHOLD
        },
        retention_days=7
    )

@router.get("/system/probe", response_model=ProviderProbeResponse)
def probe_ai_provider():
    """
    Live AI Provider Probe.
    Executes a real lightweight embedding and generation call against configured AI endpoints,
    cached for 60 seconds to avoid unnecessary token consumption.
    Surfaces real status, exact error diagnostics, or clear missing-key guidance.
    """
    now = time.time()
    if _probe_cache["response"] is not None and (now - _probe_cache["timestamp"]) < 60.0:
        return _probe_cache["response"]

    tested_at = datetime.now(timezone.utc)

    # 1. Check if API Key is configured
    if not settings.GEMINI_API_KEY:
        res = ProviderProbeResponse(
            status="missing_key",
            provider=settings.AI_PROVIDER,
            embedding_model=settings.DEFAULT_EMBEDDING_MODEL,
            generation_model=settings.DEFAULT_GENERATION_MODEL,
            latency_ms=None,
            message="Gemini API key is not configured. Set GEMINI_API_KEY in your environment to enable live AI generation and embeddings.",
            error=None,
            tested_at=tested_at
        )
        _probe_cache["timestamp"] = now
        _probe_cache["response"] = res
        return res

    # 2. Probe Provider with small test embedding & generation
    t0 = time.perf_counter()
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Probe embedding
        client.models.embed_content(
            model=settings.DEFAULT_EMBEDDING_MODEL,
            contents="NexusRAG provider probe",
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY",
                output_dimensionality=settings.EMBEDDING_DIMENSION
            )
        )

        # Probe generation (1-token ping)
        client.models.generate_content(
            model=settings.DEFAULT_GENERATION_MODEL,
            contents="Respond with 'ok'"
        )

        latency = round((time.perf_counter() - t0) * 1000, 2)
        res = ProviderProbeResponse(
            status="online",
            provider=settings.AI_PROVIDER,
            embedding_model=settings.DEFAULT_EMBEDDING_MODEL,
            generation_model=settings.DEFAULT_GENERATION_MODEL,
            latency_ms=latency,
            message=f"API online and responsive. Live probe completed in {latency}ms.",
            error=None,
            tested_at=tested_at
        )
    except Exception as e:
        latency = round((time.perf_counter() - t0) * 1000, 2)
        err_msg = str(e)
        res = ProviderProbeResponse(
            status="error",
            provider=settings.AI_PROVIDER,
            embedding_model=settings.DEFAULT_EMBEDDING_MODEL,
            generation_model=settings.DEFAULT_GENERATION_MODEL,
            latency_ms=latency,
            message=f"Provider call failed: {err_msg[:120]}",
            error=f"{type(e).__name__}: {err_msg}",
            tested_at=tested_at
        )

    _probe_cache["timestamp"] = now
    _probe_cache["response"] = res
    return res
