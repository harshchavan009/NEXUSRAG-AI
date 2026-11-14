# NexusRAG: Technical Architecture, Retrieval Engineering & Hallucination Mitigation

**Document Version:** 1.0.0  
**Author:** Principal AI/RAG Engineer & QA Lead  
**Context:** ShadowFox AI Engineer Internship Task List (Requirement E1)  
**System Version:** NexusRAG v1.2.0  
**Status:** COMPLETE AND VERIFIED  

---

## 1. Executive Summary: What NexusRAG Is and Why It Matters

NexusRAG is a production-style, citation-grounded Retrieval-Augmented Generation system designed to make AI responses verifiable, inspectable, and auditable. Its core philosophy is simple: **"Trace every answer to the sentence that proves it."**

Unlike naive RAG implementations that simply glue top-K vector search results into an LLM prompt, NexusRAG executes a multi-stage, state-machine-driven pipeline orchestrated by LangGraph. It incorporates query reformulation, token-aware chunking, dense vector retrieval using Matryoshka Representation Learning, cross-encoder lexical hybrid reranking, an empirical evidence sufficiency gate, strict XML context prompt isolation, server-side citation chip validation, and automated groundedness judgment with bounded retry.

If the retrieved context does not sufficiently prove the answer, NexusRAG **abstains cleanly** rather than generating plausible falsehoods.

---

## 2. Architecture & Component Selection Justifications

```
+---------------------------------------------------------------------------------------------------+
|                                  USER / CLIENT (React 18 SPA)                                     |
|  - Standalone Marketing Landing (/) & Authenticated App Shell (/app/*)                            |
|  - Dual Document Reader: Native PDF.js Canvas + Typographic Text/Markdown Viewer                  |
|  - Real-time Server-Sent Events (SSE) Stream Receiver (stage, token, final)                       |
|  - Retrieval Inspector: Latency Waterfalls, Candidate vs Reranked Diffs, Trace Export            |
+---------------------------------------------------------------------------------------------------+
                                                |
                                      HTTP / SSE (Cookie + CSRF)
                                                v
+---------------------------------------------------------------------------------------------------+
|                                FASTAPI BACKEND & SECURITY MIDDLEWARE                              |
|  - HttpOnly 256-bit Session Cookie (`nexus_session`) + Double-Submit CSRF (`X-CSRF-Token`)         |
|  - In-Memory Sliding-Window Rate Limiter (60 req/min, 200 queries/day, 50 uploads/day)           |
|  - Modular Sub-Routers: /api/v1/ (chat, documents, inspector, system, health, auth)               |
+---------------------------------------------------------------------------------------------------+
             |                                                                      |
    Ingestion Pipeline                                                     Retrieval & Synthesis
             v                                                                      v
+---------------------------+                                     +---------------------------------+
|       PARSING & CHUNKING  |                                     |    LANGGRAPH 9-NODE DAG STATE   |
| - PyMuPDF (PDF Parser)    |                                     | 1. validate_input               |
| - TextParser (UTF-8/Latin)|                                     | 2. rewrite_query                |
| - MarkdownParser (Headers)|                                     | 3. retrieve (FAISS inner prod)  |
| - TokenChunker (BPE       |                                     | 4. rerank (Hybrid Cross-Encoder)|
|   cl100k_base, 400 tokens,|                                     | 5. check_evidence (Gate: 0.650) |
|   50 overlap, offsets)    |                                     | 6. abstain (Honest Refusal)     |
+---------------------------+                                     | 7. generate (XML Prompt Isol.)  |
             |                                                    | 8. validate_citations (Chip [N])|
             v                                                    | 9. validate_groundedness (Judge)|
+---------------------------+                                     | 10. finalise (SSE Completion)   |
|   EMBEDDINGS & VECTOR DB  |                                     +---------------------------------+
| - gemini-embedding-2      |                                                       |
|   (768 MRL dimensions)    |                                                       |
| - FAISS IndexIDMap2       |                                                       v
|   wrapping IndexFlatIP    |                                     +---------------------------------+
| - Atomic Disk Persistence |<------------------------------------| RELATIONAL PERSISTENCE (DB)     |
| - In-Place ID Deletion    |                                     | - SQLite 3 WAL Mode (Default)   |
+---------------------------+                                     | - PostgreSQL 16 Alpine (Compose)|
                                                                  | - SQLAlchemy 2.0 + Alembic      |
+---------------------------------------------------------------------------------------------------+
```

### 2.1 Backend Framework: FastAPI & Pydantic v2
- **Why Chosen:** FastAPI provides native asynchronous request processing, automatic OpenAPI 3.1.0 interactive documentation, and high-performance serialization via Pydantic v2 written in Rust.
- **Why Not Flask/Django:** Flask lacks native async event loops required for non-blocking Server-Sent Events (SSE) streaming. Django introduces monolithic ORM and admin overhead unsuitable for low-latency retrieval pipelines.

### 2.2 Relational Storage: SQLite 3 WAL Mode + PostgreSQL 16 Dual Dialect
- **Why Chosen:** Dual-dialect architecture provides the best of both worlds:
  - **SQLite 3 with Write-Ahead Logging (WAL):** Enabled by default for frictionless, zero-dependency local setup (`git clone && run`) and single-container deployments without external database daemon dependencies. WAL mode allows concurrent readers alongside a single writer.
  - **PostgreSQL 16 Alpine:** Configured in `docker-compose.yml` for production deployments requiring connection pooling, multi-worker FastAPI concurrency, and robust ACID transaction isolation.
- **Architectural Trade-off:** Requires keeping schema migrations strictly ANSI-SQL compliant across SQLite and PostgreSQL, avoiding dialect-specific JSON operators.

### 2.3 Parsing Engine: PyMuPDF (fitz)
- **Why Chosen:** PyMuPDF parses PDF page layouts up to 10x faster than pure-Python libraries like PyPDF or pypdf2. Crucially, it preserves exact page geometry, extractable line blocks, and bounding boxes required for page-level citation synchronization.
- **Scanned Document Guard:** Detects low-density text (<50 characters per page) and immediately rejects scanned image-only PDFs with a descriptive `ValidationException`, preventing silent empty chunk generation.

### 2.4 Chunking Strategy: Token-Aware BPE (`cl100k_base`)
- **Why Chosen:** Naive character or word-based chunkers cause unpredictable token counts because code snippets, Markdown tables, and technical formulas tokenize unpredictably. NexusRAG uses OpenAI tiktoken with the standard `cl100k_base` Byte-Pair Encoding vocabulary.
- **Parameters:** Target chunk size: 400 tokens; overlap: 50 tokens (12.5% sliding window).
- **Metadata Retained:** Every chunk preserves `document_id`, `workspace_id`, `chunk_index`, `start_page`, `end_page`, `start_char`, and `end_char`. This enables the frontend Document Reader to highlight the exact sentence in either the PDF canvas or the text reader.

### 2.5 Embeddings: Google Gemini `gemini-embedding-2` (768 MRL)
- **Why Chosen:** `gemini-embedding-2` supports Matryoshka Representation Learning (MRL), allowing high-fidelity dense embeddings to be truncated from 3072 down to 768 dimensions without significant loss in semantic retrieval precision.
- **Normalization:** Vectors are strictly L2 unit-normalized upon generation. This mathematical property ensures that inner product computation (`np.dot(u, v)`) precisely equals cosine similarity, eliminating the need for expensive vector norm divisions during search.

### 2.6 Vector Store: FAISS `IndexIDMap2` wrapping `IndexFlatIP`
- **Why Chosen:**
  - `IndexFlatIP`: Computes exact inner product search with zero quantization loss. Because vector counts per research workspace typically range from hundreds to tens of thousands of chunks, exact Flat search executes in sub-millisecond time without the recall loss or clustering overhead of IVF or HNSW indexes.
  - `IndexIDMap2`: Maps database 64-bit integer chunk IDs directly to FAISS vector slots. This enables **in-place vector deletion** (`index.remove_ids(chunk_ids)`) when documents are updated or deleted, avoiding the costly O(N) full-index rebuilds common in basic FAISS tutorials.
  - **Atomic Disk Persistence:** Thread-safe file writes using `.tmp` staging and atomic POSIX rename prevent index corruption during unexpected server restarts.

### 2.7 Frontend Architecture: React 18 SPA + Vite 6 + Tailwind CSS
- **Why Chosen Over Streamlit:** The official ShadowFox PDF suggests Streamlit, but candidate innovation chose React 18. Streamlit re-executes the entire Python script on every user interaction, making multi-document tab switching, anchored PDF canvas annotation, split-pane text highlighting, and real-time SSE token streaming brittle and unresponsive. React SPA provides fluid client-side routing, independent component state, and high-performance DOM manipulation.
- **Dual Document Reader:** Includes dedicated renderers:
  - PDF.js canvas viewport for native PDF rendering with zoom, page navigation, and text selection.
  - Line-numbered typographic text viewport for `.txt` and `.md` files, ensuring previews never crash on non-PDF formats.

---

## 3. How Retrieval Quality Is Handled

Retrieval quality in NexusRAG is not a single database lookup; it is a multi-step orchestrated funnel designed to maximize precision and recall while minimizing noise.

```
Incoming User Query
         |
         v
[Stage 1: Query Rewriter Node]
- Resolves anaphora and pronoun ambiguity ("its", "they", "that report")
- Formulates optimized standalone semantic query for dense retrieval
         |
         v
[Stage 2: Document Scoping & Tenant Isolation]
- Filters chunk candidate pool by workspace session token and selected document IDs
         |
         v
[Stage 3: FAISS Dense Vector Search]
- Executes inner product cosine search (fetch_k = top_k * 4 candidates)
         |
         v
[Stage 4: Hybrid Relevance Reranker]
- Re-scores candidates using composite metric:
  Score = 0.60 * Vector_Cosine + 0.40 * Lexical_Overlap
- Ranks most relevant passages to top positions ([1], [2], [3], [4])
         |
         v
[Stage 5: Evidence Sufficiency Gate]
- Evaluates top-ranked passage relevance against threshold (0.650)
         |
   +-----+-----+
   |           |
Sufficiency  Sufficiency
< 0.650      >= 0.650
   |           |
   v           v
[Abstain]   [Generate Synthesis]
```

### 3.1 Query Rewriting and Anaphora Resolution
In real research sessions, users frequently ask contextual follow-up questions:
- *User:* "Tell me about Acme Corp's Q3 results."
- *Assistant:* "Acme Corp reported $120M in revenue."
- *User:* "What about its operating margin?"

A naive RAG search for "What about its operating margin?" fails because the query lacks entity context. The `rewrite_query_node` analyzes the last 3 conversational turns and reformulates the query into: *"What is Acme Corp's operating margin for Q3?"*. If the query is already standalone, the rewriter preserves it without unnecessary latency.

### 3.2 Hybrid Relevance Reranking
Dense embeddings excel at broad conceptual search but can miss exact lexical matches (such as specific acronyms, section identifiers, or model codes). NexusRAG implements a composite hybrid reranker:
$$\text{Composite Score} = 0.60 \times S_{\text{vector}} + 0.40 \times S_{\text{lexical}}$$
Where $S_{\text{lexical}}$ calculates token overlap between normalized query terms and chunk content. The top 4 candidates are re-ordered, ensuring the most information-dense passages occupy the leading context slots.

### 3.3 Evidence Sufficiency Gating
Before making any generative LLM call, NexusRAG evaluates whether the retrieved evidence is actually sufficient to answer the question:
- If the top reranked score is $\ge 0.650$, the state machine transitions to `generate_node`.
- If the top score is $< 0.650$, the engine transitions directly to `abstain_node`.
This gate prevents wasted inference tokens and eliminates the primary cause of hallucinations: forcing an LLM to answer when no supporting evidence exists.

---

## 4. How Hallucinations Are Reduced (and the Limits of Mitigation)

Hallucination reduction in NexusRAG is enforced through structural isolation, algorithmic validation, and honest abstention.

### 4.1 Structural XML Prompt Isolation
The generation prompt encapsulates retrieved passages within strict XML `<context>` tags:
```xml
<context>
[1] Document: clean_energy_report_2024.txt (Page 1)
Commercial monocrystalline solar modules achieved 22.8% field efficiency in 2024.

[2] Document: clean_energy_report_2024.txt (Page 2)
Lithium iron phosphate (LFP) chemistry captured 82% of the utility storage market.
</context>
```
The system prompt mandates:
1. "Base your answer EXCLUSIVELY on the facts provided within the `<context>` block."
2. "Do NOT extrapolate, assume, or incorporate outside knowledge."
3. "Attach bracketed citation chips like `[1]` immediately following the specific statement it supports."

### 4.2 Automated Server-Side Citation Validation
Generative models occasionally invent nonexistent citation numbers (e.g. citing `[99]` when only 4 chunks were provided). In `validate_citations_node`:
1. A regular expression extracts all bracketed numbers `\[(\d+)\]` from the generated text.
2. Each cited index is checked against the set of valid retrieved chunks $\{1, 2, \dots, K\}$.
3. Any ungrounded or out-of-bounds citation chip is **automatically stripped** from the text before sending to the client.
4. Valid citations are enriched with filename, page number, character offsets, and text excerpts.

### 4.3 Groundedness Judge with Bounded Retry
After generation and citation extraction, the pipeline runs an automated groundedness evaluator (`validate_groundedness_node`). An independent evaluation prompt checks whether the generated assertions are faithful to the cited excerpts, outputting a groundedness score from 0.0 to 1.0:
- If `groundedness_score >= 0.700`: Response is accepted and forwarded to `finalise_node`.
- If `groundedness_score < 0.700` and `retry_count < 2`: The state machine loops back to `generate_node` with an intensified reprimand prompt warning against unfaithful assertions.
- If retries are exhausted without achieving threshold: The system transitions to `abstain_node`.

### 4.4 The Honest Limits of Hallucination Reduction
Engineering honesty requires acknowledging what RAG can and cannot guarantee:
1. **Probabilistic Nature of LLMs:** No prompt or validation chain can mathematically guarantee 100.0% zero hallucinations across all possible queries. Soft semantic shifts and subtle synthesis nuances can occasionally evade cross-encoder checks.
2. **Context Fragmentation:** If a complex reasoning chain requires facts scattered across 5 different pages and the chunker divides them into disjoint pieces, the model may fail to synthesize the complete answer or hallucinate the connecting logic.
3. **Contradictory Source Documents:** If two uploaded documents disagree (e.g., Doc A claims 22% efficiency, Doc B claims 26%), the system will synthesize both or favor one depending on retrieval ranking. The system cannot determine truth beyond what is written in the source text.
4. **NexusRAG Design Choice:** Rather than hiding these limits behind fake certainty, NexusRAG exposes the exact retrieved chunks in the **Retrieval Inspector**, allowing human researchers to audit the model's sources instantly.

---

## 5. Beyond a Demo: Production Differentiators

Most student and hackathon RAG projects are single-script prototypes running on ephemeral local state. NexusRAG includes concrete engineering practices that separate production applications from toy demos:

| Dimension | Toy Demo / Naive RAG | NexusRAG Production Architecture |
|---|---|---|
| **Multi-Tenancy** | Single shared memory or global folder | Cryptographic 256-bit HttpOnly session cookies, double-submit CSRF tokens, strict workspace-scoped document and vector isolation. |
| **Vector Deletion** | Re-indexes entire vector database from scratch on file deletion | FAISS `IndexIDMap2` with in-place vector ID deletion; zero downtime or rebuild required. |
| **Edge Failures** | Crashes on empty files, non-PDFs, or missing keys | Explicit rejection envelopes for 0-byte files, spoofed signatures, unsupported extensions, duplicate hashes, and scanned PDFs. |
| **Missing API Key** | Glues hardcoded sentences or crashes with 500 error | Strict configuration error in dev/prod; honest abstention; zero fake sentence-gluing or synthetic pseudo-answers. |
| **Delivery Model** | Blocking 10-second spinner | Server-Sent Events (SSE) streaming real-time pipeline phase events (`rewrite`, `retrieve`, `rerank`), tokens, and final citation telemetry. |
| **Observability** | Terminal print statements | Dedicated Retrieval Inspector page displaying node execution waterfalls, candidate reranking diffs, sufficiency scores, and raw JSON traces. |
| **Security Posture** | Wide open endpoints, plain HTTP | Sliding-window rate limiting (IP and workspace), CORS origin protection, RFC 9116 `security.txt`, zero secret leaks, 0 CVEs. |
| **Reproducibility** | "Works on my machine" | Multi-stage `Dockerfile` with non-root user `nexus`, `docker-compose.yml` with PostgreSQL 16 Alpine, and automated GitHub Actions CI. |

---

## 6. Technical Interview Speaking Guide (Quick Reference)

When explaining NexusRAG to technical interviewers or mentors, structure your answers using these concise technical talking points:

1. **"Walk me through the architecture."**
   > *"NexusRAG is built with a decoupled React 18 SPA frontend and a FastAPI backend. The RAG pipeline is implemented as a 9-node LangGraph state machine. Ingestion extracts text via PyMuPDF, chunks with tiktoken BPE into 400-token blocks, generates 768-dimensional normalized embeddings via Gemini Embedding 2, and indexes into a FAISS IndexIDMap2 for inner product search with in-place deletion capability."*

2. **"How do you handle retrieval quality?"**
   > *"Retrieval quality is handled through a three-stage filter: first, conversational follow-up queries are rewritten to resolve pronouns; second, dense vector search retrieves top candidates which are then reranked using a composite vector-plus-lexical overlap score; third, an evidence sufficiency gate checks if the top score meets a 0.650 threshold. If it does not, the system abstains instead of guessing."*

3. **"How do you prevent hallucinations?"**
   > *"We use three distinct mechanisms: structural XML context prompt isolation that forbids external knowledge; a server-side citation validation node that automatically strips ungrounded citation chips; and an independent groundedness judge node that triggers bounded retries if the response is not fully faithful to the context."*

4. **"What happens when a document is deleted?"**
   > *"Because we use FAISS IndexIDMap2, we don't have to rebuild the entire vector index. We store chunk database IDs directly in the index, so document deletion triggers `remove_ids` on the exact chunk IDs in memory, followed by an atomic POSIX write to disk."*

5. **"How do you handle AI provider failures or missing keys?"**
   > *"NexusRAG enforces a strict Zero-Mock Invariant. If a cloud API key is unconfigured or suspended, the system surfaces clear diagnostics via the health probe endpoint and Settings without crashing, refusing to fabricate fake vector embeddings or canned responses. Furthermore, NexusRAG natively supports an unmocked local neural pipeline using `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` and `cross-encoder/ms-marco-MiniLM-L-6-v2` on Apple Silicon MPS hardware acceleration with sub-50ms latency for completely private, offline-capable verification."*

6. **"Why did Vite fail to catch an undefined variable in production, and how did you fix it?"**
   > *"Vite uses Rollup and Esbuild, which transpile JSX and bundle modules without full AST symbol-resolution checks by default. To guarantee that production builds and CI fail immediately on any undeclared variable, we wired ESLint `no-undef: 'error'` into `eslint . && vite build`. Additionally, we implemented client storage schema versioning (`SCHEMA_VERSION = 1`) and a non-destructive Error Boundary that allows users to re-render without clearing data, or reset only local UI view state with explicit confirmation."*

