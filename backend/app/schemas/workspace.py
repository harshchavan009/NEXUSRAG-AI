from datetime import datetime
from pydantic import BaseModel, ConfigDict

class WorkspaceStatsResponse(BaseModel):
    document_count: int
    collection_count: int
    chunk_count: int
    session_count: int

class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    created_at: datetime
    last_active_at: datetime
    stats: WorkspaceStatsResponse

