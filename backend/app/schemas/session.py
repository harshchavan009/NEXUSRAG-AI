from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from backend.app.schemas.query import CitationResponse

class SessionCreate(BaseModel):
    title: Optional[str] = Field(default="New Research Session", max_length=200)

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    role: str
    content: str
    workflow_run_id: Optional[str] = None
    created_at: datetime
    citations: List[CitationResponse] = []

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

class SessionDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
