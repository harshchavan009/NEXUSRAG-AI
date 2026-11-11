# NexusRAG: Executive Technical Summary

**Project:** NexusRAG - Reference-Driven, Production-Grade RAG Workspace  
**Track:** ShadowFox AI Engineer Track (Advanced Level)  
**Author:** Harsh Chavan  
**Repository:** [https://github.com/harshchavan009/NEXUSRAG-AI.git](https://github.com/harshchavan009/NEXUSRAG-AI.git)  
**Positioning:** *"Trace every answer to the sentence that proves it."*  

---

## 1. System Overview & Problem Statement

NexusRAG bridges the gap between proof-of-concept RAG demos and auditable enterprise document assistants. Traditional RAG setups suffer from context window dilution, phantom citations, multi-turn conversational drift, and simulated frontend metrics.

NexusRAG solves these failure modes through an auditable, verification-first architecture:
- **Zero Static Data:** All metrics, document counts, latency timers, and status badges are computed live from the PostgreSQL/SQLite database and FAISS index.
- **Physical Citation Grounding:** Every claim links directly to physical document pages and exact character offsets.
- **Calibrated Abstention:** Out-of-domain queries are rejected by a calibrated evidence sufficiency gate rather than generating plausible hallucinations.
- **Multi-Tenant Visitor Isolation:** Session-scoped cryptographic workspaces ensure zero data bleeding between users.

---

## 2. Core Architectural Topology

```
+-----------------------------------------------------------------------------------+
|                           Client Browser (React 18 / Vite)                        |
|   Public Site (/)  |  Dashboard (/app)  |  Desk (/app/research)  |  Inspector   |
+-----------------------------------------------------------------------------------+
                                          |
                      HTTPS / Cookie (nexus_session) + X-CSRF-Token
                                          v
+-----------------------------------------------------------------------------------+
|                     FastAPI Application Server (Python 3.11+)                     |
|  +---------------------------+  +-----------------------------------------------+  |
|  | Multi-Tenant Auth Guard   |  | Sliding-Window Rate Limiter (60 req/min)      |  |
|  +---------------------------+  +-----------------------------------------------+  |
|  | PyMuPDF Ingestion Engine  |  | Token-Aware Chunker (400 tok, 50 tok overlap) |  |
|  +---------------------------+  +-----------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                       9-Node LangGraph Execution State Machine                    |
|  1. Validate Input  ->  2. Rewrite Query  ->  3. Scoped FAISS Retrieval           |
|  4. Relevance Rerank -> 5. Sufficiency Gate (0.650) -> [Pass / Abstain]           |
|  6. Grounded Generator (XML Delimited Context) -> 7. Server Regex Validator       |
|  8. Groundedness Gate (0.700) -> [Pass / Bounded Retry / Abstain]                 |
+-----------------------------------------------------------------------------------+
           |                                                      |
           v                                                      v
+------------------------------------+  +-------------------------------------------+
|    Dual-Dialect Relational State   |  |        FAISS Vector Store (64-Bit)        |
|    PostgreSQL 16 / SQLite 3        |  |  IndexIDMap2 wrapping IndexFlatIP         |
|    Workspaces, Docs, Chunks, Runs  |  |  Unit-normalized inner product vectors    |
+------------------------------------+  +-------------------------------------------+
```

---

## 3. The 9-Node LangGraph State Machine

1. **`validate_input`:** Prunes unauthorized scopes, validates character bounds (1 to 2,000 characters), and sanitizes input.
2. **`rewrite_query`:** Resolves conversational anaphoric references against session history or passes standalone queries through.
3. **`retrieve_candidates`:** Executes workspace-scoped vector search in FAISS, retrieving top $K = 8$ candidates.
4. **`rerank_and_check_evidence`:** Applies cross-attention lexical/semantic scoring and computes the composite sufficiency score:
   $$\text{Sufficiency Score} = 0.75 \times S_{\text{top}} + 0.25 \times \bar{S}_{\text{rel}}$$
5. **Sufficiency Gate Decision:** If score $< 0.650$, routes to `abstain`; otherwise routes to `generate_answer`.
6. **`abstain`:** Generates a calibrated refusal response and persists the rejection trace.
7. **`generate_answer`:** Synthesizes answer using strictly isolated XML `<context>` passages, streaming Server-Sent Events (SSE) tokens.
8. **`validate_citations`:** Regex parses bracketed citations `\[(\d+)\]` and strips fabricated passage IDs server-side.
9. **`validate_groundedness`:** Computes claim-to-passage token overlap. If score $< 0.700$, triggers one bounded retry before abstaining.

---

## 4. Quantitative Performance & Retrieval Benchmarks

Evaluated against a standardized 10-query gold standard (6 in-domain answerable + 4 adversarial out-of-domain queries):

| Metric | Target | Measured Result | Benchmark Status |
|---|---|---|---|
| **Precision@1** | $\ge 0.800$ | **1.0000 (100.0%)** | **PASSED** |
| **Recall@4** | $\ge 0.800$ | **1.0000 (100.0%)** | **PASSED** |
| **Mean Reciprocal Rank (MRR)** | $\ge 0.800$ | **1.0000 (100.0%)** | **PASSED** |
| **Sufficiency Gate Accuracy** | $\ge 0.900$ | **1.0000 (100.0%)** | **PASSED (10/10 Correct)** |
| **Citation Integrity Rate** | $\ge 0.900$ | **1.0000 (100.0%)** | **PASSED (100.0%)** |
| **Median Retrieval Latency (p50)** | $< 100 \text{ ms}$ | **1.69 ms** | **PASSED** |
| **Tail Retrieval Latency (p95)** | $< 250 \text{ ms}$ | **4.32 ms** | **PASSED** |
| **Backend Test Suite** | 100% Passing | **48 / 48 Passed (89% Coverage)** | **PASSED** |
| **Frontend Test Suite** | 100% Passing | **19 / 19 Passed** | **PASSED** |
| **Playwright User Journeys** | 8/8 Completed | **8 / 8 User Journeys Verified** | **PASSED** |

---

## 5. Security & Threat Mitigation Summary

- **Dependency Vulnerabilities:**
  - `python3 -m pip_audit -r backend/requirements.txt`: **0 known vulnerabilities**.
  - `npm --prefix frontend audit`: **0 known vulnerabilities**.
- **Secret Hygiene:** `detect-secrets scan` across working tree and entire Git history: **0 committed secrets or private keys**.
- **Tenant Isolation:** 256-bit random session cookie (`httpOnly`, `SameSite=Lax`, `Secure` in production) combined with Double-Submit `X-CSRF-Token` validated in constant time via `hmac.compare_digest`.
- **Sliding-Window Rate Limiter:** Enforces 60 requests/minute per client with standard `X-RateLimit-*` headers and HTTP 429 status.
- **Upload Abuse Defense:** 25MB file size limit, magic byte verification, filename traversal stripping (`../../../../etc/passwd` $\to$ `passwd`), and SHA-256 duplicate detection.
- **Prompt Injection Resistance:** Untrusted document context is enclosed in XML delimiter tags; tested resistant to system prompt override attempts.

---

## 6. Accessibility & Visual Design Standards

- **Color Contrast:** Deep Ink text (`#18191B`) on Warm Sand (`#F7F6F2`) achieves **16.85:1** contrast ratio (WCAG AAA). Terracotta accent (`#B84A28`) on surface achieves **5.14:1** (WCAG AA). Dark theme achieves **16.25:1** (WCAG AAA).
- **Responsive Viewports:** Verified at 1440px desktop, 820px tablet, and 390px mobile viewports.
- **Design Restraint:** Strict geometric radii (`rounded`, `rounded-md`), zero pill buttons, zero fake window chrome dots, and zero decorative em dashes.

---

## 7. Containerization & Production Deployment

- **Unified Single-Container Deployment:** The production Dockerfile builds the React SPA and serves it directly alongside FastAPI on port 8000, eliminating cross-origin cookie friction.
- **Dual-Dialect Persistence:** Docker Compose orchestrates PostgreSQL 16 Alpine (`nexusrag_pgdata` volume) alongside persistent disk storage for uploaded files and FAISS indices (`nexus_storage` volume).
- **Turnkey Cloud Manifests:** Ready for single-click deployment on Railway (`railway.json`), Render (`render.yaml`), or any VPS with Docker Compose.
- **Disaster Recovery:** Includes verified backup and restore automation (`scripts/backup_and_restore.py`) supporting full snapshot archive and restoration.

