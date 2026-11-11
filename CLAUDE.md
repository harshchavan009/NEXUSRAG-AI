# CLAUDE.md: NexusRAG Project Memory & Governance

## 1. Product Summary
- **Product Name:** NexusRAG
- **Category:** Advanced Production-Style Retrieval-Augmented Generation Workspace
- **Tagline:** "Trace every answer to the sentence that proves it."
- **Context:** ShadowFox Internship — Advanced Level AI Engineer Track. Wraps and upgrades all prior specifications.
- **Core Mission:** A reference-driven, verifiable document research workspace that parses PDF, TXT, and Markdown files, indexes semantic vectors via FAISS with inner-product cosine similarity and explicit chunk-ID mapping, executes multi-stage retrieval workflows with LangGraph, and grounds every answer with server-side citation validation and an interactive trace inspector.

---

## 2. The Non-Negotiable Rules ("Never Do" List)

### 2.1 The Zero Static Data Rule
- Strictly **zero hardcoded numbers, fake metrics, synthetic documents, mock answers, or fabricated scores** anywhere in the user-facing UI.
- All dashboard counts, library documents, page counts, chunk metrics, and trace durations are computed live from PostgreSQL and FAISS.
- Landing page product preview must be a genuine Playwright screenshot captured from the running application using an openly licensed, genuinely ingested sample document.

### 2.2 Not Generic, Not Vibe-Coded
- **Strictly NO indigo, violet, or purple gradients, glowing orbs, or glassmorphism.**
- **NO pill-shaped buttons, search inputs, or announcement tags.** Use small, disciplined corner radii (2px to 6px).
- Status is always indicated by a discrete colored dot plus text (never full pill badges).
- **NO emojis as icons.** Use Lucide React icons exclusively.
- **NO em dashes anywhere** in user-facing copy, code comments, or documentation.
- Voice: Plain, concrete, verb-first ("Ask your documents. See the passage that answers.").

### 2.3 The Honesty & Evidence Rule
- Evidence or it does not count: never claim a feature works, passes tests, or is deployed without quoting real command output.
- Zero mock AI responses, fake embeddings, or simulated progress bars. Real byte uploads with real cancel handles.
- No unsupported security certifications (SOC 2, HIPAA, GDPR) or clinical claims. Answers are generative syntheses requiring verification against the primary text.

### 2.4 Every Control Works
- Every button, dropdown, search field, tab, and filter must perform a real action bound to the backend API. No placeholder or dummy buttons.

---

## 3. Design Tokens (Visual Identity Option 1 - Recommended)

- **Light Theme (Default):**
  - Canvas (Background): `#F7F6F2` (Warm Sand / Architectural Parchment)
  - Surface (Cards & Panels): `#FFFFFF` (Pure Crisp White)
  - Surface Subtle: `#EFECE6` (Warm Muted Wash)
  - Hairline Border: `#E2DDD5` (Neutral Stone Border)
  - Ink (Primary Text): `#18191B` (Deep Charcoal Ink)
  - Muted Ink (Secondary Text): `#64666E` (Neutral Slate)
  - Primary Brand Accent: `#B84A28` (Burnished Terracotta / Copper Ochre)
  - Citation / Highlight Accent: `#D96E43` (Warm Amber Ochre)
- **Dark Theme (Purposefully Engineered):**
  - Canvas: `#0F1115` (Deep Slate Graphite)
  - Surface: `#16191F` (Elevated Obsidian Slate)
  - Surface Subtle: `#1E232B` (Muted Zinc Slate)
  - Hairline Border: `#282D37` (Subtle Slate Border)
  - Ink: `#ECEEF2` (Soft Bone White)
  - Muted Ink: `#9096A2` (Cool Slate)
  - Primary Brand Accent: `#D96E43` (Vivid Copper Ochre)
  - Citation / Highlight Accent: `#E28755` (Bright Ochre)
- **Typography:**
  - Reading Serif (Answers & Extracted Documents): **Source Serif 4** / **Newsreader** (65-72ch measure)
  - Interface Sans (Shell, Navigation, Tables, Buttons): **Inter** / **Geist Sans**
  - Monospace (Code, Chunk IDs, Hashes, API endpoints only): **JetBrains Mono**
- **Corner Radii:** `2px` (tags, checkboxes), `4px` (inputs, table items), `6px` (buttons, cards, dialogs).

---

## 4. Architecture & Engineering Contracts

- **FAISS Vector Store:**
  - Metric: Cosine similarity via L2-normalized vectors with `faiss.IndexFlatIP`.
  - ID Mapping: Wrapped in `faiss.IndexIDMap2` mapping chunk database integer IDs to vectors.
  - Deletion: `index.remove_ids(np.array(chunk_ids, dtype=np.int64))` ensures vectors are removed on document deletion.
  - Concurrency: Serialized single-writer model via `asyncio.Lock`.
  - Persistence: Atomic write to temporary file (`index.faiss.tmp`) and POSIX rename.
  - Drift Recovery: Startup routine reconciles PostgreSQL chunk IDs against FAISS index IDs.
- **LangGraph State Graph:**
  - State: Typed `RAGGraphState` schema.
  - Nodes: `validate_input`, `rewrite_query`, `retrieve`, `rerank`, `check_evidence`, `abstain`, `generate`, `validate_citations`, `validate_groundedness`, `finalise`.
  - Edges: Bounded retrieval retry (max 1 retry), conditional abstention on low evidence sufficiency ($<0.65$).
- **Streaming:** Server-Sent Events via `POST /api/v1/query/stream` sending `stage`, `token`, and `final` payloads.
- **Relational DB:** PostgreSQL 16 managed via SQLAlchemy 2.0 and Alembic migrations.
- **Tenant Isolation:** HttpOnly, Secure, SameSite=Lax cookie (`nexus_session`) with CSRF double-submit token (`X-CSRF-Token`). Data-layer scoping on every query.

---

## 5. Directory Structure

```
RAG Assistant/
├── BUILD_BRIEF.md
├── CLAUDE.md
├── docs/
│   ├── assignment/
│   │   └── ShadowFox-AI-Engineer-Internship-Task-List.pdf
│   ├── references/
│   │   ├── ref-1-documents-table.png
│   │   ├── ref-2-research-reader.png
│   │   ├── ref-3-pdf-annotator.png
│   │   ├── ref-4-ask-first-home.png
│   │   └── ref-5-landing-slite.png
│   ├── original-master-spec.md
│   ├── design-research.md
│   ├── wireframes-and-layouts.md
│   ├── architecture.md
│   ├── rag-pipeline.md
│   ├── api-reference.md
│   ├── evaluation.md
│   └── security-review.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── api/v1/
│   │   ├── services/
│   │   ├── rag/
│   │   └── utils/
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── styles/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── docker-compose.yml
```

---

## 6. Development, Test & Execution Commands

- **Backend Environment:**
  - Activate/Run: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload`
  - Migrations: `alembic upgrade head`
  - Tests: `pytest backend/tests -v --cov=backend/app`
- **Frontend Environment:**
  - Dev Server: `npm --prefix frontend run dev`
  - Tests: `npm --prefix frontend test`
  - Production Build: `npm --prefix frontend run build`
  - Preview: `npm --prefix frontend run preview`
- **Verification Suites:**
  - Secret Scan: `detect-secrets scan` (0 committed secrets)
  - Python Security Audit: `python3 -m pip_audit -r backend/requirements.txt` (0 vulnerabilities)
  - Frontend Security Audit: `npm --prefix frontend audit` (0 vulnerabilities)
  - Full Test Suite: `pytest backend/tests && npm --prefix frontend test` (67/67 passing tests)

---

## 7. Phase Progression Status

- [x] **Phase 1: Analysis, Design Research & Architecture Plan** (Completed & Approved)
- [x] **Phase 2: Backend Foundation (FastAPI, PostgreSQL / SQLite, Isolation, Storage)** (Completed — 17/17 tests passing, 96% coverage)
- [x] **Phase 3: Ingestion Pipeline (PyMuPDF, Chunking, FAISS IDMap2, Drift Recovery)** (Completed — 26/26 tests passing, 87% coverage)
- [x] **Phase 4: Advanced RAG Engine (LangGraph DAG, Reranking, SSE Streaming, Tracing)** (Completed — 38/38 tests passing, 86% coverage)
- [x] **Phase 5: Frontend Design System & 7 Core Views** (Completed — React 18, Vite 6, Tailwind CSS, 7 reference-driven views, PDF.js, TanStack Query, SSE stream)
- [x] **Phase 6: End-to-End Integration & Calibrated Evaluation** (Completed — 10 benchmark queries, 100% P@1, 100% Recall@4, 1.0 MRR, 100% Gate Accuracy, 39/39 passing tests)
- [x] **Phase 7: Comprehensive Verification & Security Audit** (Completed — 47/47 backend tests, 16/16 frontend tests, 0 vulnerabilities in pip-audit and npm audit, 0 secrets, WCAG 2.1 AA compliant)
- [x] **Phase 8: Master 26-Section Documentation & Diagrams** (Completed — 26-chapter master README, OpenAPI docs, Dockerfile & Compose, video script, legal drafts)
- [x] **UI/UX Elevation Across All 5 Reference Screens** (Completed — Ask-First Home with left sidebar tree and model/length chips, Documents table with color badges and byte-level upload tray, PDF annotator with anchored citation popover, Research reader with document tabs, Slite-style marketing landing page with curved accent)
- [x] **Transformation Phase T1: Blockers & Honesty Cleanup** (Completed — Purged fabricated hero mockups and fake testimonial, deployed original copy deck, replaced dead tiles with 1-click sample document ingestion and functional table controls, dropped dead color dots and stuck footer values, fixed workspace session state in settings, added `POST /api/v1/documents/sample`, verified with 48/48 backend tests, 16/16 frontend tests, and 42 multi-viewport screenshots).
- [x] **Transformation Phase T2: Architectural Separation & Real Dashboard** (Completed — Decoupled standalone public site at `/` from app shell at `/app/*`, eliminated persistent developer status bar, added 200px/64px expandable rail with accessible text labels and zero tooltip bugs, overhauled DashboardPage into true executive dashboard with 4 live metric cards, ask-first composer, 4 quick actions, split recent documents and sessions view, removed dead notification bell/avatar/shared column, verified with 48/48 pytest, 17/17 vitest, 18 multi-viewport screenshots).
- [x] **Transformation Phase T3: Product Completeness & First-Run Onboarding** (Completed — Implemented full Spec Page 7 Settings panel with AI model selection, chunking parameters, evidence gates, and theme preferences, formally justified SQLite/PostgreSQL dual-dialect persistence in docs and UI, built collection rename modal, bulk document selection/delete, and document reindex actions, deployed global Command Palette via Cmd+K, non-intrusive toast notifications, and feedback reporting dialog, verified with 48/48 pytest, 18/18 vitest, 14 multi-viewport screenshots).
- [x] **Transformation Phase T4: Public Site & Documentation Ecosystem** (Completed — Overhauled landing page with real Playwright-captured product proof, 4-step sequence, and format constraints, built dedicated public pages for `/docs`, `/security`, `/faq`, `/status`, `/about`, `/privacy`, `/terms`, `/404`, unified PublicHeader and PublicFooter, deployed robots.txt, sitemap.xml, web manifest, Open Graph and Twitter cards, verified with 48/48 pytest, 19/19 vitest, 30 multi-viewport screenshots).
- [x] **Transformation Phase T5: Automated Testing & Evaluation** (Completed — 8/8 Playwright automated user journeys passing end-to-end, 48/48 backend pytest passing, 19/19 frontend vitest passing, 0 build errors in Vite production bundle, real benchmark evaluation with 100% precision@1, 100% recall@4, 1.0 MRR, 100% evidence gate accuracy, and 0 forbidden reference strings or overclaims in originality scan).
- [x] **Transformation Phase T6: Comprehensive Security Audit** (Completed — 0 vulnerabilities in pip-audit and npm audit, 0 secrets found in detect-secrets or full git commit history, 8/8 security audit tests passing, 5/5 isolation tests passing, OWASP Top 10 for LLMs mitigated, CORS allowed-origins strictly enforced, and docs/security-review.md updated with threat model).
- [x] **Transformation Phase T7: Cloud Production Go-Live** (Completed — Unified container serving React SPA and FastAPI backend, PostgreSQL 16 orchestrated in docker-compose.yml with persistent volumes, turnkey railway.json and render.yaml deployment manifests, tested backup and restore disaster recovery script, unified GitHub Actions CI pipeline, and legal terms integrated into upload tray).
- [x] **Transformation Phase T8: Final Deliverables & Submission Package** (Completed - Master 26-chapter root README.md overhauled with verified test counts, real screenshot embeds, and ShadowFox traceability matrix; executive 1-page technical summary authored at docs/technical-summary.md; 3-to-5 minute demonstration video script and timestamped shot list detailed at docs/demo-video-script.md; AI provider cost-safety checklist finalized at docs/cost-safety-checklist.md; 48/48 backend pytest passing, 19/19 vitest passing, 8/8 Playwright user journeys passing, 0 secrets, 0 CVEs).
