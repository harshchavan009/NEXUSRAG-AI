import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id = Column(String(36), primary_key=True, default=lambda: f"run_{uuid.uuid4().hex[:16]}")
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    
    query = Column(Text, nullable=False)
    rewritten_query = Column(Text, nullable=True)
    
    # Trace telemetry stored as JSON structures
    retrieved_candidates = Column(JSON, nullable=True)
    reranked_results = Column(JSON, nullable=True)
    sufficiency_score = Column(Float, default=0.0, nullable=False)
    groundedness_score = Column(Float, default=0.0, nullable=False)
    stage_durations = Column(JSON, nullable=True)
    
    status = Column(String(30), default="completed", nullable=False)  # completed, abstained, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    workspace = relationship("Workspace", back_populates="workflow_runs")
    messages = relationship("Message", back_populates="workflow_run")
    citations = relationship("Citation", back_populates="workflow_run", cascade="all, delete-orphan")
