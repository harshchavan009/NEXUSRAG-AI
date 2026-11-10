from datetime import datetime
from typing import Dict, Any, List
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    timestamp: datetime
    database: str
    vector_store: str

class SystemLimits(BaseModel):
    max_file_size_bytes: int
    max_pdf_pages: int
    allowed_extensions: List[str]

class SystemStatusResponse(BaseModel):
    app: str
    version: str
    environment: str
    ai_provider: str
    embedding_model: str
    generation_model: str
    embedding_dimension: int
    vector_store: str
    limits: SystemLimits
    rag_defaults: Dict[str, Any]
    retention_days: int
