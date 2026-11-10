from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.query import CitationResponse

class WorkflowRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    query: str
    rewritten_query: Optional[str] = None
    retrieved_candidates: Optional[List[Dict[str, Any]]] = None
    reranked_results: Optional[List[Dict[str, Any]]] = None
    sufficiency_score: float
    groundedness_score: float
    stage_durations: Optional[Dict[str, float]] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    citations: List[CitationResponse] = []

