import json
import logging
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.app.config import settings

logger = logging.getLogger("nexusrag.reranker")

class CandidateItem(BaseModel):
    chunk_id: int
    document_id: str
    filename: str
    page_number: int
    content: str
    vector_score: float

class RerankedItem(BaseModel):
    chunk_id: int
    document_id: str
    filename: str
    page_number: int
    content: str
    vector_score: float
    rerank_score: float
    rationale: str

class RelevanceReranker:
    """
    Reranks initial vector retrieval candidates using either:
    1. Structured LLM relevance scoring via Gemini when configured, or
    2. Deterministic term-overlap + vector-score hybrid ranking in offline/mock mode.
    """
    STOPWORDS = {
        "what", "is", "the", "how", "much", "did", "do", "does", "in", "of", "for",
        "to", "a", "an", "and", "or", "our", "are", "was", "were", "be", "been",
        "by", "with", "at", "from", "as", "on", "that", "this", "it"
    }

    @staticmethod
    def _lexical_vector_hybrid_rerank(query: str, candidates: List[CandidateItem], top_k: int) -> List[RerankedItem]:
        all_query_words = re.findall(r"\w+", query.lower())
        substantive_query_words = [w for w in all_query_words if w not in RelevanceReranker.STOPWORDS]
        query_words = substantive_query_words if substantive_query_words else all_query_words
        reranked: List[RerankedItem] = []

        for item in candidates:
            chunk_text_lower = item.content.lower()
            matches = 0
            for w in query_words:
                if w in chunk_text_lower or (len(w) >= 4 and w[:4] in chunk_text_lower):
                    matches += 1

            overlap_score = min(1.0, matches / max(1, len(query_words)))

            # If lexical overlap is strong, ensure composite reflects relevance even if mock vector score is low
            if item.vector_score > 0.6:
                composite = float(0.60 * item.vector_score + 0.40 * overlap_score)
            else:
                composite = float(max(overlap_score * 0.90, 0.40 * item.vector_score + 0.60 * overlap_score))
            composite = max(0.0, min(1.0, composite))

            reranked.append(
                RerankedItem(
                    chunk_id=item.chunk_id,
                    document_id=item.document_id,
                    filename=item.filename,
                    page_number=item.page_number,
                    content=item.content,
                    vector_score=item.vector_score,
                    rerank_score=round(composite, 4),
                    rationale=f"Hybrid lexical match ({matches}/{len(query_words)} keywords) with vector inner product {item.vector_score:.3f}"
                )
            )

        reranked.sort(key=lambda x: x.rerank_score, reverse=True)
        return reranked[:top_k]

    @staticmethod
    def rerank(
        query: str,
        candidates: List[CandidateItem],
        top_k: int = settings.DEFAULT_FINAL_CONTEXT_K
    ) -> List[RerankedItem]:
        if not candidates:
            return []

        # If Gemini key is configured, execute LLM relevance evaluation
        if settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                
                formatted_candidates = []
                for idx, c in enumerate(candidates):
                    formatted_candidates.append(f"[Candidate {idx}] (Chunk {c.chunk_id}): {c.content[:400]}...")

                prompt = (
                    f"Evaluate the factual relevance of each candidate passage to answering the query.\n\n"
                    f"Query: {query}\n\n"
                    f"Candidates:\n" + "\n\n".join(formatted_candidates) + "\n\n"
                    "Output a valid JSON array of objects ordered from MOST relevant to LEAST relevant:\n"
                    '[{"candidate_index": <int>, "relevance_score": <float 0.0 to 1.0>, "rationale": "<sentence>"}]'
                )

                response = client.models.generate_content(
                    model=settings.DEFAULT_GENERATION_MODEL,
                    contents=prompt
                )
                
                text_clean = response.text.strip()
                if "```json" in text_clean:
                    text_clean = text_clean.split("```json")[1].split("```")[0].strip()
                elif "```" in text_clean:
                    text_clean = text_clean.split("```")[1].split("```")[0].strip()

                parsed = json.loads(text_clean)
                reranked: List[RerankedItem] = []

                for entry in parsed:
                    c_idx = entry.get("candidate_index")
                    if c_idx is not None and 0 <= c_idx < len(candidates):
                        orig = candidates[c_idx]
                        score = float(entry.get("relevance_score", orig.vector_score))
                        reranked.append(
                            RerankedItem(
                                chunk_id=orig.chunk_id,
                                document_id=orig.document_id,
                                filename=orig.filename,
                                page_number=orig.page_number,
                                content=orig.content,
                                vector_score=orig.vector_score,
                                rerank_score=round(score, 4),
                                rationale=entry.get("rationale", "LLM relevance score")
                            )
                        )

                if reranked:
                    reranked.sort(key=lambda x: x.rerank_score, reverse=True)
                    return reranked[:top_k]

            except Exception as e:
                logger.warning(f"LLM reranking encountered error: {e}. Falling back to hybrid lexical-vector ranker.")

        # Fallback to deterministic hybrid reranker
        return RelevanceReranker._lexical_vector_hybrid_rerank(query, candidates, top_k)
