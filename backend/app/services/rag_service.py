"""
High-level RAG orchestration service for NexusRAG.
Handles synchronous execution and asynchronous Server-Sent Events (SSE) streaming.
"""
import asyncio
import json
import logging
import threading
import time
from typing import Dict, Any, Optional, List, AsyncGenerator
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import SessionLocal
from backend.app.rag.engine.state import RAGGraphState
from backend.app.rag.engine.graph import rag_graph
from backend.app.models.session import ResearchSession, Message
from backend.app.schemas.query import QueryResponse, CitationResponse

logger = logging.getLogger("nexusrag.rag_service")

class RAGService:
    @staticmethod
    def get_chat_history(db: Session, session_id: str, workspace_id: str) -> List[Dict[str, str]]:
        """Retrieves past messages in this session formatted as chat history."""
        session = db.query(ResearchSession).filter(
            ResearchSession.id == session_id,
            ResearchSession.workspace_id == workspace_id
        ).first()

        if not session or not session.messages:
            return []

        history: List[Dict[str, str]] = []
        for msg in session.messages:
            history.append({
                "role": msg.role,
                "content": msg.content
            })
        return history

    @staticmethod
    def execute_query(
        db: Session,
        workspace_id: str,
        query: str,
        session_id: Optional[str] = None,
        scope_collection_ids: Optional[List[str]] = None,
        scope_document_ids: Optional[List[str]] = None,
        top_k: Optional[int] = None
    ) -> QueryResponse:
        """Executes full RAG workflow synchronously and returns formatted QueryResponse."""
        chat_history = []
        if session_id:
            chat_history = RAGService.get_chat_history(db, session_id, workspace_id)

        initial_state: RAGGraphState = {
            "workspace_id": workspace_id,
            "session_id": session_id,
            "original_query": query,
            "chat_history": chat_history,
            "scope_collection_ids": scope_collection_ids or [],
            "scope_document_ids": scope_document_ids or [],
            "top_k": top_k or settings.DEFAULT_TOP_K,
            "db": db,
            "node_timings": {},
            "retry_count": 0
        }

        # Run the compiled LangGraph workflow
        final_state = rag_graph.invoke(initial_state)

        citations_out = [
            CitationResponse(
                index=c["citation_index"],
                chunk_id=c.get("chunk_id"),
                document_id=c["document_id"],
                filename=c["filename"],
                page_number=c.get("page_number", 1),
                excerpt=c["excerpt"],
                relevance_score=c.get("relevance_score", 0.0)
            )
            for c in final_state.get("validated_citations", [])
        ]

        return QueryResponse(
            answer=final_state.get("generated_text", ""),
            session_id=final_state.get("session_id") or session_id or "",
            workflow_run_id=final_state.get("workflow_run_id", ""),
            citations=citations_out,
            is_abstention=final_state.get("is_abstention", False),
            sufficiency_score=final_state.get("evidence_sufficiency_score", 0.0),
            groundedness_score=final_state.get("groundedness_score", 0.0),
            timings_ms=final_state.get("node_timings", {})
        )

    @staticmethod
    async def execute_query_stream(
        workspace_id: str,
        query: str,
        session_id: Optional[str] = None,
        scope_collection_ids: Optional[List[str]] = None,
        scope_document_ids: Optional[List[str]] = None,
        top_k: Optional[int] = None
    ) -> AsyncGenerator[str, None]:
        """
        Executes RAG workflow in a worker thread and streams Server-Sent Events:
        - event: stage
        - event: token
        - event: final
        - event: error
        """
        queue: asyncio.Queue = asyncio.Queue()
        loop = asyncio.get_running_loop()

        def stage_callback(node_name: str, status: str):
            payload = {
                "node": node_name,
                "status": status,
                "timestamp": time.time()
            }
            loop.call_soon_threadsafe(queue.put_nowait, ("stage", payload))

        def token_callback(token_delta: str):
            if token_delta:
                loop.call_soon_threadsafe(queue.put_nowait, ("token", token_delta))

        def worker():
            db_thread = SessionLocal()
            try:
                chat_history = []
                if session_id:
                    chat_history = RAGService.get_chat_history(db_thread, session_id, workspace_id)

                initial_state: RAGGraphState = {
                    "workspace_id": workspace_id,
                    "session_id": session_id,
                    "original_query": query,
                    "chat_history": chat_history,
                    "scope_collection_ids": scope_collection_ids or [],
                    "scope_document_ids": scope_document_ids or [],
                    "top_k": top_k or settings.DEFAULT_TOP_K,
                    "db": db_thread,
                    "node_timings": {},
                    "retry_count": 0,
                    "stage_callback": stage_callback,
                    "token_callback": token_callback
                }

                final_state = rag_graph.invoke(initial_state)

                final_payload = {
                    "workflow_run_id": final_state.get("workflow_run_id", ""),
                    "session_id": final_state.get("session_id") or session_id or "",
                    "answer": final_state.get("generated_text", ""),
                    "citations": [
                        {
                            "index": c["citation_index"],
                            "chunk_id": c.get("chunk_id"),
                            "document_id": c["document_id"],
                            "filename": c["filename"],
                            "page_number": c.get("page_number", 1),
                            "excerpt": c["excerpt"],
                            "score": c.get("relevance_score", 0.0)
                        }
                        for c in final_state.get("validated_citations", [])
                    ],
                    "is_abstention": final_state.get("is_abstention", False),
                    "sufficiency_score": final_state.get("evidence_sufficiency_score", 0.0),
                    "groundedness_score": final_state.get("groundedness_score", 0.0),
                    "timings": final_state.get("node_timings", {})
                }
                loop.call_soon_threadsafe(queue.put_nowait, ("final", final_payload))
            except Exception as e:
                logger.error(f"Error in RAG stream worker thread: {e}", exc_info=True)
                loop.call_soon_threadsafe(queue.put_nowait, ("error", str(e)))
            finally:
                db_thread.close()
                loop.call_soon_threadsafe(queue.put_nowait, ("done", None))

        # Launch worker in daemon thread
        threading.Thread(target=worker, daemon=True).start()

        # Stream SSE events to client
        while True:
            msg_type, payload = await queue.get()
            if msg_type == "done":
                break
            elif msg_type == "stage":
                yield f"event: stage\ndata: {json.dumps(payload)}\n\n"
            elif msg_type == "token":
                yield f"event: token\ndata: {json.dumps({'delta': payload})}\n\n"
            elif msg_type == "final":
                yield f"event: final\ndata: {json.dumps(payload)}\n\n"
            elif msg_type == "error":
                yield f"event: error\ndata: {json.dumps({'error': payload})}\n\n"

