"""
Typed state definition for the NexusRAG LangGraph State Machine.
"""
from typing import TypedDict, Optional, List, Dict, Any, Callable
from pydantic import BaseModel, Field

class RetrievedCandidate(BaseModel):
    chunk_id: int
    document_id: str
    filename: str
    page_number: int
    content: str
    vector_score: float

class RerankedCandidate(BaseModel):
    chunk_id: int
    document_id: str
    filename: str
    page_number: int
    content: str
    vector_score: float
    rerank_score: float
    rationale: str

class CitationSpan(BaseModel):
    citation_index: int
    chunk_id: Optional[int] = None
    document_id: str
    filename: str
    page_number: int
    excerpt: str
    relevance_score: float

class RAGGraphState(TypedDict, total=False):
    # Tenant & Session
    workspace_id: str
    session_id: Optional[str]
    
    # Query Data
    original_query: str
    rewritten_query: Optional[str]
    chat_history: List[Dict[str, str]]
    
    # Scope Constraints
    scope_collection_ids: List[str]
    scope_document_ids: List[str]
    top_k: int
    
    # Retrieval & Reranking
    retrieved_candidates: List[Dict[str, Any]]
    reranked_chunks: List[Dict[str, Any]]
    evidence_sufficiency_score: float
    evidence_is_sufficient: bool
    
    # Generation & Evaluation
    generated_text: str
    validated_citations: List[Dict[str, Any]]
    stripped_citations: List[int]
    groundedness_score: float
    is_abstention: bool
    retry_count: int
    
    # Telemetry & Output
    node_timings: Dict[str, float]
    workflow_run_id: str
    status: str
    error: Optional[str]
    
    # Runtime context (excluded from serialization)
    db: Any
    token_callback: Optional[Callable[[str], None]]
    stage_callback: Optional[Callable[[str, str], None]]

