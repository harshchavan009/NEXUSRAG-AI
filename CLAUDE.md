# CLAUDE.md: NexusRAG Project Memory & Governance

## 1. Product Summary
- **Product Name:** NexusRAG
- **Category:** Advanced Production-Style Retrieval-Augmented Generation Workspace
- **Tagline:** "Ask your documents. See the passage that answers."
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
  - Production Build: `npm --prefix frontend run build`
  - Preview: `npm --prefix frontend run preview`
- **Verification Suites:**
  - Secret Scan: `detect-secrets scan` / `gitleaks detect`
  - Accessibility: `axe-core` Playwright audit (Zero WCAG 2.1 AA violations)
  - Security Audit: `pip-audit` & `npm audit`

---

## 7. Phase Progression Status

- [x] **Phase 1: Analysis, Design Research & Architecture Plan** (Completed & Approved)
- [x] **Phase 2: Backend Foundation (FastAPI, PostgreSQL / SQLite, Isolation, Storage)** (Completed — 17/17 tests passing, 96% coverage)
- [x] **Phase 3: Ingestion Pipeline (PyMuPDF, Chunking, FAISS IDMap2, Drift Recovery)** (Completed — 26/26 tests passing, 87% coverage)
- [x] **Phase 4: Advanced RAG Engine (LangGraph DAG, Reranking, SSE Streaming, Tracing)** (Completed — 38/38 tests passing, 86% coverage)
- [x] **Phase 5: Frontend Design System & 7 Core Views** (Completed — React 18, Vite, Tailwind CSS, 7 reference-driven views, PDF.js, TanStack Query, SSE stream)
- [ ] **Phase 6: End-to-End Integration & Calibrated Evaluation**
- [ ] **Phase 6: End-to-End Integration & Calibrated Evaluation**
- [ ] **Phase 7: Comprehensive Verification & Security Audit**
- [ ] **Phase 8: Master 26-Section Documentation & Diagrams**
- [ ] **Phase 9: Production Go-Live Deployment & Submission Pack**

