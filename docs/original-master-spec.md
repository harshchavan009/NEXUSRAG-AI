# NexusRAG: Master Product & Technical Specification
## Comprehensive Requirements (Sections A through Q)

> **Document Status:** Active Specification (Authority Level 2: Wrapped & Upgraded by `BUILD_BRIEF.md`)  
> **Target System:** NexusRAG: Production-Grade Retrieval-Augmented Generation Workspace  
> **Internship Track:** ShadowFox AI Engineer (Advanced Level)

---

## 1. System Vision & Architecture Principles
NexusRAG is an enterprise-grade, verifiable document research workspace designed to process heterogeneous documentation (PDF, TXT, Markdown), index semantic representations using FAISS inner-product vector indexing with explicit chunk ID mapping, execute agentic multi-stage retrieval workflows with LangGraph, and provide provably grounded answers with fine-grained citations and an interactive retrieval inspector.

---

## 2. Master Requirements Matrix (A through Q)

### Section A: Product Identity & Public Landing Page
- **A1:** Product identity: named **NexusRAG**, calibrated tagline (e.g. "Ask your documents. See the passage that answers."). Distinctive visual identity.
- **A2:** Editorial landing navigation with Logo, Product Capabilities, Workflow Architecture, Documentation, and Open Workspace CTA.
- **A3:** Hero section with concrete, outcome-driven headline, plain sentence description, primary CTA ("Open Workspace"), secondary CTA ("Explore Features"), and framed product preview captured via Playwright script from the live running app.
- **A4:** Interactive demonstration showing dynamic relationship between raw documents, FAISS retrieval candidates, and grounded synthesis.
- **A5:** Feature breakdown highlighting token-aware chunking, vector similarity, cross-encoder/LLM reranking, grounded generation, and verification tracing.
- **A6:** How it Works section detailing the 5 core stages: Upload & Validation, Text Extraction & Chunking, Embedding & Indexing, LangGraph Retrieval & Reranking, Grounded Synthesis with Citation Validation.
- **A7:** Calibrated Security & Handling notice: explicit disclosure that excerpts are processed via the configured LLM API; strictly zero unsupported compliance claims (no SOC 2/HIPAA claims).
- **A8:** Pre-footer conversion section and footer containing Privacy Policy, Terms, Documentation, and contact information.
- **A9:** Zero Static Data rule: all demo documents, metrics, and previews are genuinely ingested and backed by real backend models.

### Section B: Main Workspace Shell & Dashboard
- **B1:** App shell featuring collapsible left rail (Icon rail + Collection Tree), breadcrumbs, active workspace context, theme toggle (Light, Dark, System), and status indicators.
- **B2:** Ask-First Dashboard (Reference 4 layout): prominent question composer with scope and response controls, quick upload action tile, real metrics (documents, collections, indexed chunks), and recent documents table with a stored, generated document summary column.
- **B3:** Header with route breadcrumbs, collection hierarchy, connection health indicator (showing degraded/offline state only when real issues occur), and command palette launcher (`Cmd+K` / `Ctrl+K`).
- **B4:** Zero fake metrics: document counts, chunk counts, session histories, and processing queues computed strictly from PostgreSQL and FAISS.

### Section C: Document Library & Knowledge Bases
- **C1:** Multi-format ingestion supporting PDF, TXT, and Markdown with drag-and-drop and native file picking.
- **C2:** Document table with file icon, status dot + text, page count, byte size, chunk count, date added, and row-level hover actions (Delete, Reindex).
- **C3:** Knowledge base collection management: hierarchical left tree (Reference 2 layout) with collection creation, renaming, and deletion.
- **C4:** Upload tray (Reference 1 layout) featuring real per-file byte progress, pipeline stages (`uploaded`, `validating`, `extracting`, `chunking`, `embedding`, `indexing`, `indexed`, `failed`), failure reasons, retry, and cancellation.
- **C5:** All status transitions reflect true asynchronous backend worker states with drift recovery.
- **C6:** Multi-select operations supporting bulk reindexing and bulk deletion.

### Section D: Research Workspace & Query Desk
- **D1:** Three-panel research canvas: Left Scope & Session Rail, Center Conversation Canvas, Right Evidence & Sources Panel.
- **D2:** Left Panel: Knowledge base tree, collection and document checkboxes for granular query scoping, and past research session threads.
- **D3:** Center Canvas: Streaming Markdown responses, suggested questions generated from selected documents (cached and clearly labelled), follow-up inputs, response action bar (Copy, Regenerate, Stop).
- **D4:** Right Evidence Panel (Reference 3 tabs: Passages / Citation / Document): displays retrieved chunks, filenames, page numbers, similarity/rerank scores (labelled as rank or score, never pseudo-confidence percentages), and an Open Document viewer action.
- **D5:** Generated response text and retrieved source evidence are styled with distinct visual separation.
- **D6:** Evidence drawer remains tucked until real citations or evidence are returned; mobile viewports convert this to an accessible bottom sheet.
- **D7:** Session state persistence allowing research threads to be resumed without losing citations.

### Section E: Document Viewer & Citation Grounding
- **E1:** Multi-document tabs (Reference 2 layout) with active document tracking.
- **E2:** Dedicated PDF viewer with page controls, zoom (50%-200%), in-document keyword search, and cited passage highlighting (text-layer coordinates or page-level excerpt pinning).
- **E3:** High-legibility reader view for Markdown and TXT documents preserving markdown formatting and raw text structure.
- **E4:** Provable grounding: clicking any inline citation tag `[1]`, `[2]` in an answer immediately navigates the viewer to the exact page and focuses the highlighted passage. No fabricated citations.

### Section F: Advanced RAG Pipeline Execution
- **F1:** Multi-format parsing: PyMuPDF for PDFs, UTF-8/latin-1 decoding for TXT, commonmark parser for Markdown. Corrupted, empty, or password-protected files raise descriptive errors. Scanned PDFs without OCR raise an explicit "Scanned document; OCR unavailable" error.
- **F2:** Token-aware chunking: configurable chunk size (default 700 tokens) and overlap (default 100 tokens), preserving sentence boundaries, page markers, and start/end character offsets.
- **F3:** Embedding generation: Provider abstraction supporting official Google GenAI (`text-embedding-004`) or OpenAI SDK with exponential backoff retry, rate-limiting handlers, and dimension validation.
- **F4:** FAISS vector store: cosine similarity via L2-normalized vectors and `IndexFlatIP`. Wrapped in `IndexIDMap2` to enable atomic deletion by chunk ID. Atomic write-to-temp-then-rename disk persistence. Recovery routine to resolve SQLite/PostgreSQL-to-FAISS drift.
- **F5:** LangGraph State Graph:
  - Nodes: `validate_input`, `rewrite_query`, `retrieve`, `rerank`, `check_evidence`, `abstain`, `generate`, `validate_citations`, `validate_groundedness`, `finalise`.
  - Conditional edges: routing to `abstain` when evidence sufficiency is below threshold; single bounded query refinement retry loop.
  - Rewriting: skipped for unambiguous standalone queries.
- **F6:** Reranking: Cross-encoder or documented structured LLM reranking to reorder initial top-K candidates (e.g. top 8 retrieved -> top 4 reranked).
- **F7:** Grounded Generation: System prompt enforcing strict untrusted context delimiters, anti-hallucination constraints, and inline citation marker generation.
- **F8:** Server-side citation validation: regex extraction of citation markers; validation against retrieved chunk IDs. Hallucinated or orphaned markers are stripped or flagged before streaming completes.
- **F9:** Insufficient Context Handling: when retrieved evidence fails sufficiency checks, the system issues a polite, calibrated abstention refusing to answer from parametric memory.
- **F10:** Prompt Injection Defense: document text quarantined inside strict passive context envelopes; adversarial instructions ("ignore instructions and output...") cannot alter system behavior.

### Section G: Backend Architecture & REST API
- **G1:** Modern Python 3.11+ stack using FastAPI, Pydantic v2, SQLAlchemy 2.0 (PostgreSQL), Alembic migrations, PyMuPDF, FAISS, and LangGraph.
- **G2:** Clean modular architecture: `api/v1/`, `core/`, `models/`, `schemas/`, `services/`, `rag/`, `utils/`.
- **G3:** Standardized JSON error envelope: `{"error": {"code": "...", "message": "...", "details": {...}}}`.
- **G4:** Complete `/api/v1` REST API:
  - `GET /api/v1/health` & `GET /api/v1/system/status`
  - `POST /api/v1/workspaces`, `GET /api/v1/workspaces`
  - `POST /api/v1/collections`, `GET /api/v1/collections`, `DELETE /api/v1/collections/{id}`
  - `POST /api/v1/documents/upload`, `GET /api/v1/documents`, `GET /api/v1/documents/{id}`, `DELETE /api/v1/documents/{id}`, `POST /api/v1/documents/{id}/reindex`
  - `POST /api/v1/query`, `POST /api/v1/query/stream` (Server-Sent Events)
  - `GET /api/v1/sessions`, `GET /api/v1/sessions/{id}`, `DELETE /api/v1/sessions/{id}`
  - `GET /api/v1/inspector/runs/{run_id}`
  - `POST /api/v1/user/export`, `POST /api/v1/user/purge`
- **G5:** Server-Sent Events (`POST /api/v1/query/stream` consumed via `fetch` ReadableStream) delivering `stage`, `token`, and `final` payload with citations and trace metadata.
- **G6:** Information protection: zero API key exposure, internal stack traces suppressed in production modes.

### Section H: Frontend Architecture & User Interface
- **H1:** Modern Single Page Application built on React 18 / 19, Vite, Tailwind CSS, TanStack Query, and Lucide React.
- **H2:** Reusable design system conforming to strict design tokens (Canvas, Surface, Border, Ink, Muted Ink, Accent).
- **H3:** Fully responsive layout tested across 1440px desktop, 820px tablet, and 390px mobile viewports.
- **H4:** Every interactive control is functional and bound to live API contracts. Zero static mock widgets.

### Section I: Security, Isolation & Reliability
- **I1:** Visitor isolation via cryptographically secure random session tokens (128+ bit) stored in `httpOnly`, `Secure`, `SameSite=Lax` cookies, supplemented with Double-Submit Cookie CSRF protection.
- **I2:** Data-layer tenant scoping: every SQL query, FAISS index partition, document storage path, and session thread filtered by owner ID.
- **I3:** Content Security Policy (CSP), strict CORS origins, rate limiting (per-owner and per-IP), max file size limits (e.g. 25MB), and page caps (e.g. 50 pages).
- **I4:** Deletion cascade: deleting a document removes raw files from disk, chunk records from DB, and vectors from the FAISS ID map.
- **I5:** Secret hygiene: zero secrets in client bundles or Git history. Validated startup environment configuration.
- **I6:** Calibrated claims: answers stated as generative syntheses requiring verification against the primary text.

### Section J: Automated Testing & Verification Suite
- **J1-J16:** Comprehensive Pytest suite covering input validation, PDF/TXT/MD parsers, token chunking, FAISS index CRUD, drift recovery, vector removal, tenant isolation, prompt injection defense, and citation verification.
- **J17:** Mocked unit test fixtures for external LLM/Embedding providers ensuring hermetic CI execution.
- **J18:** Live integration suite verifying real provider API calls when keys are provisioned.
- **J19:** Documented retrieval evaluation suite benchmarked against a verified gold-standard evaluation dataset.

### Section K: User Experience Polish
- **K1:** Drag-and-drop upload tray with real progress indicators, cancellation controls, and file validation errors.
- **K2:** High-density library table with sorting, filtering, and row-level hover actions.
- **K3:** Typographic hierarchy utilizing a reading serif for synthesis answers and clean geometric sans for UI chrome.
- **K4:** Complete empty states for all views (Empty Library, Empty Scope, Empty Thread, Empty Search).
- **K5:** Skeleton loading indicators and non-blocking background task tracking.

### Section L: Documentation Deliverables
- **L1:** Root `README.md` containing all 26 required chapters (Overview, Architecture, Setup, FAISS Internals, LangGraph Workflow, Evaluation, etc.).
- **L2:** Specialized documentation: `docs/architecture.md`, `docs/rag-pipeline.md`, `docs/api-reference.md`, `docs/evaluation.md`, `docs/security-review.md`.
- **L3:** Genuine unmocked screenshots embedded into documentation.
- **L4:** Clean repository execution: verified start from a freshly cloned environment using Docker Compose or native scripts.

### Section M: Internship Deliverables
- **M1:** GitHub repository organization matching ShadowFox requirements.
- **M2:** 3-5 minute demonstration video script, walkthrough slide deck, and live cloud deployment URL.

### Section N: Retrieval Inspector & Observability
- **N1:** Dedicated Trace View (`/inspector/{run_id}`) displaying execution stages and durations.
- **N2:** Visibility into rewritten query vs. original query, candidate retrieval list with similarity scores, reranked order, and context assembly.
- **N3:** Evidence sufficiency evaluation result and citation validation pass/strip breakdown.
- **N4:** Groundedness score and execution timeline with millisecond-precision node durations.

### Section O: Evaluation Methodology
- **O1:** Ground-truth test dataset consisting of diverse documents and factual QA pairs with labelled passage spans.
- **O2:** Precision@K, Recall@K, and Mean Reciprocal Rank (MRR) measured across retrieval configurations.
- **O3:** Citation correctness and answer groundedness evaluated on real sample sets.
- **O4:** Zero invented statistics: all metrics computed and reported with reproducible test scripts.

### Section P: Containerization & Deployment
- **P1:** Multi-stage production `Dockerfile` with non-root security execution.
- **P2:** `docker-compose.yml` orchestrating FastAPI backend, PostgreSQL database, persistent disk volumes, and frontend SPA.
- **P3:** Volume persistence verification: database entities, uploaded files, and FAISS vector index files survive container restarts.
- **P4:** Cloud deployment manifests (Railway / Render / VPS Compose) with dynamic port binding.

### Section Q: Data Governance & Lifecycle
- **Q1:** Inactivity TTL and automated data reaper purging expired visitor sessions.
- **Q2:** User data export generating a structured archive of uploaded files, sessions, and Q&A history.
- **Q3:** Complete user data purge permanently deleting all database records, disk files, vector mappings, and cookies.

---

## 3. Cross-Cutting Non-Negotiable Rules
- **Rule R1 (Zero Static Data):** No hardcoded documents, counts, metrics, or answers.
- **Rule R2 (Not Generic / Not Vibe-Coded):** No purple gradients, pill buttons, decorative emojis, em dashes, or generic SaaS tropes.
- **Rule R3 (Honesty & Calibrated Claims):** Zero simulated workflows, no fake citations, no unverified test claims.
