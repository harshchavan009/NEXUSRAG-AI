import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_token = Column(String(64), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    last_active_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    collections = relationship("Collection", back_populates="workspace", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")
    chunks = relationship("Chunk", back_populates="workspace", cascade="all, delete-orphan")
    sessions = relationship("ResearchSession", back_populates="workspace", cascade="all, delete-orphan")
    workflow_runs = relationship("WorkflowRun", back_populates="workspace", cascade="all, delete-orphan")

