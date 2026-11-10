from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.schemas.system import HealthResponse, SystemStatusResponse, SystemLimits

router = APIRouter(tags=["Health & System"])

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
