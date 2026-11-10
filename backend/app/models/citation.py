import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, BigInteger, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Citation(Base):
    __tablename__ = "citations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String(36), ForeignKey("messages.id", ondelete="CASCADE"), nullable=True, index=True)
    workflow_run_id = Column(String(36), ForeignKey("workflow_runs.id", ondelete="CASCADE"), nullable=True, index=True)
    chunk_id = Column(Integer, ForeignKey("chunks.id", ondelete="SET NULL"), nullable=True, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    
    citation_index = Column(Integer, nullable=False)  # 1, 2, ...
    filename = Column(String(255), nullable=False)
    page_number = Column(Integer, nullable=False, default=1)
    excerpt = Column(Text, nullable=False)
    relevance_score = Column(Float, nullable=False, default=0.0)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    message = relationship("Message", back_populates="citations")
    workflow_run = relationship("WorkflowRun", back_populates="citations")
    chunk = relationship("Chunk", back_populates="citations")
    document = relationship("Document", back_populates="citations")

    __table_args__ = (
        Index("ix_citations_run_index", "workflow_run_id", "citation_index"),
    )

