from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class CollectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120, description="Collection name")
    description: Optional[str] = Field(default=None, max_length=500)

class CollectionUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)

class CollectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    workspace_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    document_count: int = 0

class CollectionListResponse(BaseModel):
    collections: List[CollectionResponse]
    total: int
