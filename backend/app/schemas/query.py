from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class QueryScope(BaseModel):
    collection_ids: List[str] = Field(default_factory=list)
    document_ids: List[str] = Field(default_factory=list)

class QueryRequest(BaseModel):
    query: str = Field(min_length=2, max_length=1500, description="User question")
    session_id: Optional[str] = Field(default=None, description="Optional existing session to continue")
    scope: QueryScope = Field(default_factory=QueryScope)
    top_k: Optional[int] = Field(default=None, ge=1, le=20)

class CitationResponse(BaseModel):
    index: int
    chunk_id: Optional[int] = None
    document_id: str
    filename: str
    page_number: int
    excerpt: str
    relevance_score: float

class QueryResponse(BaseModel):
    answer: str
    session_id: str
    workflow_run_id: str
    citations: List[CitationResponse]
    is_abstention: bool
    sufficiency_score: float
    groundedness_score: float
    timings_ms: Dict[str, float]

