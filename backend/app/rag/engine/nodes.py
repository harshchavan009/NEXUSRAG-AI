"""
Typed node implementations for the NexusRAG LangGraph State Machine.
Contains all 9 nodes + finalise, with runtime timing telemetry, DB persistence, and citation verification.
"""
import re
import time
import json
import logging
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.rag.engine.state import RAGGraphState
from backend.app.rag.embeddings.factory import get_embedding_provider
from backend.app.rag.vector_store.faiss_store import FAISSVectorStore
from backend.app.rag.reranking.reranker import RelevanceReranker, CandidateItem
from backend.app.rag.prompts.rag_prompts import (
    SYSTEM_RAG_PROMPT,
    QUERY_REWRITER_PROMPT,
    GROUNDEDNESS_JUDGE_PROMPT
)
from backend.app.models.chunk import Chunk
from backend.app.models.document import Document
from backend.app.models.collection import Collection
from backend.app.models.workflow_run import WorkflowRun
from backend.app.models.session import ResearchSession, Message
from backend.app.models.citation import Citation

logger = logging.getLogger("nexusrag.nodes")

# Helper to report stages
def _notify_stage(state: RAGGraphState, node_name: str, status: str = "running"):
    cb = state.get("stage_callback")
    if cb and callable(cb):
        try:
            cb(node_name, status)
        except Exception as e:
            logger.warning(f"Failed to invoke stage callback in {node_name}: {e}")

# 1. validate_input
def validate_input_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "validate_input", "running")
    timings = dict(state.get("node_timings", {}))

    raw_query = state.get("original_query", "").strip()
    # Remove null bytes and dangerous control chars
    sanitized_query = raw_query.replace("\x00", "").strip()

    if len(sanitized_query) < 2:
        raise ValueError("Search query must be at least 2 characters long.")
    if len(sanitized_query) > 1500:
        raise ValueError("Search query exceeds maximum limit of 1,500 characters.")

    workspace_id = state.get("workspace_id")
    db: Optional[Session] = state.get("db")

    verified_coll_ids = list(state.get("scope_collection_ids", []))
    verified_doc_ids = list(state.get("scope_document_ids", []))

    # Verify scope IDs belong to workspace if db is provided
    if db and workspace_id:
        if verified_coll_ids:
            valid_colls = db.query(Collection.id).filter(
                Collection.id.in_(verified_coll_ids),
                Collection.workspace_id == workspace_id
            ).all()
            verified_coll_ids = [c[0] for c in valid_colls]

        if verified_doc_ids:
            valid_docs = db.query(Document.id).filter(
                Document.id.in_(verified_doc_ids),
                Document.workspace_id == workspace_id
            ).all()
            verified_doc_ids = [d[0] for d in valid_docs]

    timings["validate_input"] = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "original_query": sanitized_query,
        "scope_collection_ids": verified_coll_ids,
        "scope_document_ids": verified_doc_ids,
        "node_timings": timings
    }

# 2. rewrite_query
def rewrite_query_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "rewrite_query", "running")
    timings = dict(state.get("node_timings", {}))

    query = state.get("original_query", "")
    chat_history = state.get("chat_history", [])

    # Check for conversational pronouns or references
    pronoun_pattern = r"\b(it|its|they|them|their|this|that|these|those|former|latter|above|previous)\b"
    has_pronouns = bool(re.search(pronoun_pattern, query, re.IGNORECASE))
    is_conversational = len(chat_history) > 0 and (has_pronouns or len(query.split()) < 4)

    rewritten_query = query
    if is_conversational and settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            history_text = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in chat_history[-4:]])
            prompt = QUERY_REWRITER_PROMPT.format(chat_history=history_text, query=query)
            
            response = client.models.generate_content(
                model=settings.DEFAULT_GENERATION_MODEL,
                contents=prompt
            )
            candidate = response.text.strip()
            if candidate and len(candidate) > 2:
                rewritten_query = candidate
        except Exception as e:
            logger.warning(f"Query rewriting LLM call failed: {e}. Keeping original query.")
            rewritten_query = query
    elif is_conversational and chat_history:
        # Offline deterministic rewrite: extract substantive nouns from previous turn
        last_turn = chat_history[-1].get("content", "")
        # Keep original query intact with context hint
        rewritten_query = f"{query} ({last_turn[:60].strip()})"

    timings["rewrite_query"] = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "rewritten_query": rewritten_query,
        "node_timings": timings
    }

# 3. retrieve
def retrieve_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "retrieve", "running")
    timings = dict(state.get("node_timings", {}))

    workspace_id = state.get("workspace_id")
    search_query = state.get("rewritten_query") or state.get("original_query", "")
    top_k = state.get("top_k") or settings.DEFAULT_TOP_K
    db: Optional[Session] = state.get("db")
    
    scope_coll_ids = state.get("scope_collection_ids", [])
    scope_doc_ids = state.get("scope_document_ids", [])

    candidates: List[Dict[str, Any]] = []

    try:
        # Load embedding provider & vector store
        embedding_provider = get_embedding_provider()
        vector_store = FAISSVectorStore(workspace_id=workspace_id)

        if vector_store.index.ntotal > 0:
            query_vector = embedding_provider.embed_query(search_query)
            # Retrieve 2x top_k to allow headroom for scope filtering
            raw_hits = vector_store.search(query_vector, top_k=top_k * 2)

            if raw_hits and db:
                hit_chunk_ids = [h[0] for h in raw_hits]
                scores_by_id = {h[0]: h[1] for h in raw_hits}

                # Query chunk records joined with documents
                query_filter = [
                    Chunk.id.in_(hit_chunk_ids),
                    Chunk.workspace_id == workspace_id,
                    Document.status == "indexed"
                ]

                if scope_coll_ids:
                    query_filter.append(Document.collection_id.in_(scope_coll_ids))
                if scope_doc_ids:
                    query_filter.append(Chunk.document_id.in_(scope_doc_ids))

                chunks_db = (
                    db.query(Chunk, Document.original_filename)
                    .join(Document, Chunk.document_id == Document.id)
                    .filter(*query_filter)
                    .all()
                )

                for chunk_row, filename in chunks_db:
                    candidates.append({
                        "chunk_id": chunk_row.id,
                        "document_id": chunk_row.document_id,
                        "filename": filename,
                        "page_number": chunk_row.start_page,
                        "content": chunk_row.content,
                        "vector_score": round(float(scores_by_id.get(chunk_row.id, 0.0)), 4)
                    })

                # Sort by vector_score descending and prune to top_k
                candidates.sort(key=lambda x: x["vector_score"], reverse=True)
                candidates = candidates[:top_k]

    except Exception as e:
        logger.error(f"Error during vector retrieval: {e}", exc_info=True)

    timings["retrieve"] = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "retrieved_candidates": candidates,
        "node_timings": timings
    }

# 4. rerank
def rerank_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "rerank", "running")
    timings = dict(state.get("node_timings", {}))

    query = state.get("rewritten_query") or state.get("original_query", "")
    candidates_raw = state.get("retrieved_candidates", [])
    
    candidate_items = [
        CandidateItem(
            chunk_id=c["chunk_id"],
            document_id=c["document_id"],
            filename=c["filename"],
            page_number=c["page_number"],
            content=c["content"],
            vector_score=c["vector_score"]
        )
        for c in candidates_raw
    ]

    reranked_items = RelevanceReranker.rerank(
        query=query,
        candidates=candidate_items,
        top_k=settings.DEFAULT_FINAL_CONTEXT_K
    )

    reranked_dicts = [item.model_dump() for item in reranked_items]
    timings["rerank"] = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "reranked_chunks": reranked_dicts,
        "node_timings": timings
    }

# 5. check_evidence (Sufficiency Gate)
def check_evidence_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "check_evidence", "running")
    timings = dict(state.get("node_timings", {}))

    reranked = state.get("reranked_chunks", [])
    
    if not reranked:
        score = 0.0
        sufficient = False
    else:
        top_score = reranked[0]["rerank_score"]
        # Relevant candidates with score >= 0.50 reinforce the top evidence
        relevant_candidates = [c["rerank_score"] for c in reranked if c["rerank_score"] >= 0.50]
        if relevant_candidates:
            avg_rel = sum(relevant_candidates) / len(relevant_candidates)
            score = round(0.75 * top_score + 0.25 * avg_rel, 4)
        else:
            # When only weak/unrelated candidates exist, discount by 15%
            score = round(top_score * 0.85, 4)
        sufficient = score >= settings.EVIDENCE_SUFFICIENCY_THRESHOLD

    timings["check_evidence"] = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "evidence_sufficiency_score": score,
        "evidence_is_sufficient": sufficient,
        "node_timings": timings
    }

# 6. abstain (Calibrated Refusal)
def abstain_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "abstain", "running")
    timings = dict(state.get("node_timings", {}))

    refusal_text = (
        "I could not find sufficient information in the selected documents to answer this question. "
        "The indexed passages do not contain adequate relevant facts on this topic. "
        "Please select additional documents or refine your search query."
    )

    token_cb = state.get("token_callback")
    if token_cb and callable(token_cb):
        try:
            token_cb(refusal_text)
        except Exception as e:
            logger.warning(f"Error in token callback during abstain: {e}")

    timings["abstain"] = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "generated_text": refusal_text,
        "is_abstention": True,
        "groundedness_score": 1.0,
        "validated_citations": [],
        "stripped_citations": [],
        "node_timings": timings
    }

# 7. generate (Grounded Synthesis)
def generate_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "generate", "streaming")
    timings = dict(state.get("node_timings", {}))

    query = state.get("original_query", "")
    reranked = state.get("reranked_chunks", [])
    token_cb = state.get("token_callback")

    # Format untrusted document context
    context_blocks = []
    for idx, c in enumerate(reranked, start=1):
        context_blocks.append(
            f"[Source {idx}] (File: {c['filename']}, Page: {c['page_number']})\n{c['content']}"
        )

    formatted_context = "\n\n".join(context_blocks)
    full_prompt = (
        f"{SYSTEM_RAG_PROMPT}\n\n"
        f"<<<UNTRUSTED_DOCUMENT_CONTENT>>>\n"
        f"{formatted_context}\n"
        f"<<<END_UNTRUSTED_DOCUMENT_CONTENT>>>\n\n"
        f"Question: {query}\n\n"
        f"Answer:"
    )

    generated_text = ""
    if settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            if token_cb and callable(token_cb):
                stream_response = client.models.generate_content_stream(
                    model=settings.DEFAULT_GENERATION_MODEL,
                    contents=full_prompt
                )
                for chunk in stream_response:
                    delta = chunk.text or ""
                    generated_text += delta
                    token_cb(delta)
            else:
                response = client.models.generate_content(
                    model=settings.DEFAULT_GENERATION_MODEL,
                    contents=full_prompt
                )
                generated_text = response.text or ""
        except Exception as e:
            logger.error(f"Error during Gemini LLM generation: {e}", exc_info=True)
            generated_text = ""

    # Offline / deterministic grounded generation fallback
    if not generated_text:
        # Construct factual synthesis using retrieved context passages
        synthesis_lines = []
        for idx, chunk in enumerate(reranked, start=1):
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", chunk["content"]) if len(s.strip()) > 20]
            lead_sentence = sentences[0] if sentences else chunk["content"][:180]
            synthesis_lines.append(f"{lead_sentence} [{idx}]")
        
        grounded_answer = " ".join(synthesis_lines)
        if token_cb and callable(token_cb):
            # Stream words with small spacing
            words = grounded_answer.split(" ")
            for w in words:
                token_cb(w + " ")
        generated_text = grounded_answer

    timings["generate"] = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "generated_text": generated_text,
        "is_abstention": False,
        "node_timings": timings
    }

# 8. validate_citations
def validate_citations_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "validate_citations", "running")
    timings = dict(state.get("node_timings", {}))

    text = state.get("generated_text", "")
    reranked = state.get("reranked_chunks", [])
    max_valid_index = len(reranked)

    # Find all citation chips: [1], [2], [99], etc.
    citations_found = re.findall(r"\[(\d+)\]", text)
    stripped_citations: List[int] = []
    validated_citations: List[Dict[str, Any]] = []
    seen_indices = set()

    for match in citations_found:
        idx = int(match)
        if idx < 1 or idx > max_valid_index:
            # Hallucinated citation index! Strip it from text
            stripped_citations.append(idx)
            text = re.sub(rf"\[{idx}\]", "", text)
        else:
            if idx not in seen_indices:
                seen_indices.add(idx)
                source_chunk = reranked[idx - 1]
                excerpt = source_chunk["content"].strip()
                if len(excerpt) > 280:
                    excerpt = excerpt[:280] + "..."
                validated_citations.append({
                    "citation_index": idx,
                    "chunk_id": source_chunk["chunk_id"],
                    "document_id": source_chunk["document_id"],
                    "filename": source_chunk["filename"],
                    "page_number": source_chunk["page_number"],
                    "excerpt": excerpt,
                    "relevance_score": source_chunk["rerank_score"]
                })

    # Clean double spaces caused by stripped citations
    cleaned_text = re.sub(r" +", " ", text).strip()

    timings["validate_citations"] = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "generated_text": cleaned_text,
        "validated_citations": validated_citations,
        "stripped_citations": stripped_citations,
        "node_timings": timings
    }

# 9. validate_groundedness
def validate_groundedness_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "validate_groundedness", "running")
    timings = dict(state.get("node_timings", {}))

    if state.get("is_abstention"):
        timings["validate_groundedness"] = round((time.perf_counter() - t0) * 1000, 2)
        return {
            "groundedness_score": 1.0,
            "node_timings": timings
        }

    answer = state.get("generated_text", "")
    reranked = state.get("reranked_chunks", [])
    
    score = 0.85
    if settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            passages_text = "\n\n".join([f"[{i+1}] {c['content']}" for i, c in enumerate(reranked)])
            prompt = GROUNDEDNESS_JUDGE_PROMPT.format(passages=passages_text, answer=answer)
            
            response = client.models.generate_content(
                model=settings.DEFAULT_GENERATION_MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()
            
            data = json.loads(raw)
            score = float(data.get("groundedness_score", 0.85))
        except Exception as e:
            logger.warning(f"Groundedness LLM verification failed: {e}. Calculating lexical overlap.")
            score = 0.85

    # Fallback lexical verification if not LLM verified
    if score == 0.85 and answer and reranked:
        ans_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", answer.lower()))
        src_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", " ".join(c["content"] for c in reranked).lower()))
        if ans_words:
            overlap = len(ans_words.intersection(src_words))
            ratio = overlap / len(ans_words)
            score = round(max(0.0, min(1.0, 0.4 + 0.6 * ratio)), 2)

    retry_count = state.get("retry_count", 0)
    timings["validate_groundedness"] = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "groundedness_score": score,
        "retry_count": retry_count,
        "node_timings": timings
    }

# 10. finalise
def finalise_node(state: RAGGraphState) -> Dict[str, Any]:
    t0 = time.perf_counter()
    _notify_stage(state, "finalise", "running")
    timings = dict(state.get("node_timings", {}))

    workspace_id = state.get("workspace_id")
    session_id = state.get("session_id")
    query = state.get("original_query", "")
    rewritten_query = state.get("rewritten_query")
    db: Optional[Session] = state.get("db")

    is_abstention = state.get("is_abstention", False)
    status = "abstained" if is_abstention else "completed"
    run_id = f"run_{uuid.uuid4().hex[:16]}"

    timings["finalise"] = round((time.perf_counter() - t0) * 1000, 2)
    total_ms = sum(timings.values())
    timings["total"] = round(total_ms, 2)

    if db and workspace_id:
        try:
            # 1. Create WorkflowRun
            workflow_run = WorkflowRun(
                id=run_id,
                workspace_id=workspace_id,
                query=query,
                rewritten_query=rewritten_query,
                retrieved_candidates=state.get("retrieved_candidates", []),
                reranked_results=state.get("reranked_chunks", []),
                sufficiency_score=state.get("evidence_sufficiency_score", 0.0),
                groundedness_score=state.get("groundedness_score", 0.0),
                stage_durations=timings,
                status=status
            )
            db.add(workflow_run)
            db.flush()

            # 2. If session_id provided, ensure session exists and persist messages
            if session_id:
                session = db.query(ResearchSession).filter(
                    ResearchSession.id == session_id,
                    ResearchSession.workspace_id == workspace_id
                ).first()

                if not session:
                    session = ResearchSession(
                        id=session_id,
                        workspace_id=workspace_id,
                        title=query[:60]
                    )
                    db.add(session)
                    db.flush()

                # User message
                user_msg = Message(
                    session_id=session.id,
                    role="user",
                    content=query,
                    workflow_run_id=None
                )
                db.add(user_msg)
                db.flush()

                # Assistant message
                assistant_msg = Message(
                    session_id=session.id,
                    role="assistant",
                    content=state.get("generated_text", ""),
                    workflow_run_id=workflow_run.id
                )
                db.add(assistant_msg)
                db.flush()

                # 3. Create Citations
                for c in state.get("validated_citations", []):
                    citation = Citation(
                        message_id=assistant_msg.id,
                        workflow_run_id=workflow_run.id,
                        chunk_id=c.get("chunk_id"),
                        document_id=c["document_id"],
                        citation_index=c["citation_index"],
                        filename=c["filename"],
                        page_number=c.get("page_number", 1),
                        excerpt=c["excerpt"],
                        relevance_score=c.get("relevance_score", 0.0)
                    )
                    db.add(citation)

                session.updated_at = datetime.now(timezone.utc)

            db.commit()

        except Exception as e:
            db.rollback()
            logger.error(f"Error persisting trace and citations: {e}", exc_info=True)

    return {
        "workflow_run_id": run_id,
        "status": status,
        "node_timings": timings
    }
