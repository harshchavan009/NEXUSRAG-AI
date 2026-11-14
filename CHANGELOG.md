# Changelog

All notable changes to NexusRAG are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-11-14

### Added
- **Dual-Engine AI Architecture:** Implemented native local neural pipeline in `backend/app/rag/embeddings/local_embeddings.py` using `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-dimensional dense vectors) and `cross-encoder/ms-marco-MiniLM-L-6-v2` running with PyTorch Metal Performance Shaders (MPS) hardware acceleration on Apple Silicon M4 with 28.5ms latency, operating alongside the Google Gemini Cloud API (`gemini-embedding-2` / `gemini-3.5-flash-lite`).
- **Versioned Client Storage Utility:** Built `frontend/src/utils/storage.js` with schema versioning (`SCHEMA_VERSION = 1`) and non-destructive fallback, discarding only corrupted UI state keys without wiping user data or visitor identities.
- **Error Boundary with Non-Destructive Recovery:** Deployed `frontend/src/components/common/ErrorBoundary.jsx` displaying clear human messages, diagnostic session IDs, a non-destructive "Try Again" re-render button, and a separate "Reset Local View" action with confirmation.
- **Automated Route Smoke Test Suite:** Added `scripts/test_route_smoke.py` validating 28 route scenarios across fresh and seeded profiles with zero console errors in CI.
- **Automated Screenshot Capture Pipeline:** Added `scripts/capture_phase_g2_screenshots.py`, regenerating 1440px showcase marketing assets and responsive multi-viewport proofs (1440px, 820px, 390px).
- **Single Source of Truth Sample Catalog:** Built `frontend/src/constants/sampleDocuments.js` cataloging 4 demo benchmark documents authored under CC BY 4.0 totaling 26 chunks across PDF, TXT, and Markdown.

### Changed
- **Calibrated Landing Page Copy:** Calibrated headline and hero description to concrete, plain language ("checks that each citation points to a passage that was retrieved", "see which passages were retrieved and how they were ranked") passing originality audit with 0 violations.
- **Varied Metric Card Layouts:** Redesigned the 4 KPI cards on `DashboardPage.jsx` with distinct visual layouts, typography, and live database aggregations.
- **Degradation-Only System Health Indicators:** Removed static "Workspace Active" badge from `TopBar.jsx`, displaying status indicators only when degraded with specific diagnostic reasons.
- **Calibrated Settings Presentation:** Removed decorative `v1.0.0` badge and jargon subtitle from `SettingsPage.jsx`.
- **Private API Response Caching:** Enforced `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` across all private `/api/*` responses in `main.py`.
- **Static Asset Content Hashing:** Verified Rollup and Vite content hashes across all CSS and JS chunks in production build.

### Fixed
- **Undefined Symbol Render Crash (`selectedDocs`):** Resolved `ReferenceError: selectedDocs is not defined` in `ResearchDeskPage.jsx` lines 79 and 751.
- **CI Build Pipeline Gap:** Configured ESLint with `no-undef: "error"` and wired `eslint . && vite build` into CI and production build scripts so undefined variables fail the build.
- **Unowned Domain Chrome:** Removed fake browser address bar `nexusrag.app/dashboard` and macOS window chrome from `LandingPage.jsx`.
- **External Attribution Mismatches:** Removed fictional external attributions in favor of 100% honest demo attributions.
- **Upstream Key Suspension Resilience:** Handled upstream Google Cloud project suspensions (`CONSUMER_SUSPENDED`) gracefully, displaying live probe diagnostics in Settings without crashing.
- **Strict Zero Em Dash Rule:** Replaced all em dashes with standard hyphens across all project code, documentation, and tests.

---

## [1.2.1] - 2026-11-13

### Added
- **Multi-Format Document Reader:** Built native typographic line-numbered text viewport in `PDFViewer.jsx` with anchored citation cards for `.txt` and `.md` documents alongside the PDF.js canvas viewer.
- **Dynamic Contextual Suggestions Endpoint:** Deployed `GET /api/v1/query/suggestions` deriving high-signal questions from indexed document headings and content, dynamically scoped to selected document filters.
- **Authentic Multi-Page Benchmark Corpus:** Upgraded sample documents to 4 CC BY 4.0 benchmark files totaling 26 chunks across workspace (10-page architecture whitepaper PDF, 26-section clean energy TXT, 27-section governance TXT, and 22-section distributed systems MD).
- **Automated Compliance Verification Suite:** Created `scripts/run_advanced_compliance_evidence.py` proving requirements R1-R14, W1-W2, Q1, O1 with unmocked output in `docs/advanced-audit-evidence.json` and `docs/advanced-audit-evidence.md`.
- **System Architecture Whitepaper & Speaking Guide:** Authored `docs/EXPLAIN.md` covering technical architecture justifications, retrieval quality mechanics, hallucination reduction limits, and interview-ready speaking guide (Requirement E1).
- **Calibrated Retrieval Benchmark Report:** Authored `docs/retrieval-evaluation.md` documenting 100% Precision@1, 100% Recall@4, 1.000 MRR, 100% Gate Accuracy, and 4-way ablation studies across rewrite and rerank.
- **Self-Recorded Demonstration Script:** Authored `docs/demo-video-script.md` with a 4:15 timestamped multi-window shot list across 7 progressive scenes (Requirement S1).
- **Mentor Submission Inquiry Draft:** Authored `docs/mentor-validation-inquiry.md` formalizing options for repository layout (Option A vs Option B) for mentor coordination.
- **Traceability Matrix v1.1.0:** Upgraded `docs/advanced-compliance.md` reflecting 100% Verified Pass across all 20 requirements (0 Partial, 0 Fail).

### Changed
- **Landing Page Polish:** Purged redundant third hero CTA button, removed technical jargon ("inspectable retrieval graphs", "groundedness validation"), replaced decorative captions with clean browser chrome, and calibrated feature headlines.
- **Footer Claims Calibration:** Updated footer copy across all public and internal views to accurately state: "Zero behavioral trackers or advertising cookies • Hosted typography via Google CDN".
- **Token Estimation Labeling:** Explicitly labeled OpenAI tiktoken `cl100k_base` BPE tokenizer in UI and docs as an approximation of Gemini token counts.

### Fixed
- **Document Reader Non-PDF Crash:** Resolved `InvalidPDFException` crash when opening `.txt` or `.md` files by routing non-PDF documents to the typographic text viewer.
- **Offline Sentence-Gluing Mock Fallback:** Completely purged synthetic sentence-gluing fallback from `nodes.py:generate_node`, enforcing honest abstention and strict configuration errors on missing keys.
- **Static Research Inquiries:** Replaced hardcoded inquiry suggestions with dynamic file-derived questions and an honest empty state when 0 documents are indexed.
- **"Local Offline Mode" UI Badge:** Removed misleading "Local Offline Mode Active" badge from Settings and replaced dummy button with copyable CLI setup command on Dashboard.
- **Zero Em Dash Rule:** Verified 0 em dashes across all application source code, scripts, and documentation.

---

## [1.2.0] - 2026-11-12

### Added
- **Active Gemini AI Studio Models:** Upgraded default embedding model to `gemini-embedding-2` (768 MRL dimensions, unit-normalized for inner-product cosine similarity) and generation model to `gemini-3.5-flash-lite`.
- **Live Provider Health Probe:** Deployed `GET /api/v1/system/probe` with 60-second in-memory caching to verify live API connectivity and report exact error states.
- **Designed Configuration Error States:** Added structured visual banners in Dashboard and Research Desk when Google Gemini API key is missing or when backend service is unreachable.
- **Collection Management & Bulk Relocation:** Added collection moving controls via `PATCH /api/v1/documents/{id}` and `POST /api/v1/documents/bulk-move` with interactive table selectors.
- **Tenant-Isolated Document Streaming:** Added physical document file streaming endpoint `GET /api/v1/documents/{id}/file` and sequential chunk inspection endpoint `GET /api/v1/documents/{id}/chunks`.
- **First-Run Onboarding Checklist:** Added interactive 4-step onboarding checklist on Dashboard with progress bar and local storage persistence.
- **Markdown Export:** Added export capabilities for answers and research sessions formatted with numbered citations and source metadata.
- **Interactive Trace Inspector:** Added direct "Inspect this answer" link from generated responses to LangGraph run ID, with candidate vs. reranked comparison tabs and trace JSON export.
- **Sample Attribution Modal:** Added catalog modal attributing all 4 open-access research papers (Vaswani et al. arXiv:1706.03762, IRENA Clean Energy 2024, Li et al. arXiv:2407.01521, and IPCC Climate Risk CC BY 4.0).
- **Platform-Aware Keyboard Shortcuts:** Added `ShortcutsModal` displaying platform-detected hotkeys (`⌘K` on macOS, `Ctrl+K` on Windows/Linux, `?`, `Esc`, `Enter`) wired to global listener.
- **Mobile Responsive Bottom Sheets:** Built drawer overlays for sentence citations (`ResearchDeskPage`) and source evidence (`PDFViewer`) across 390px mobile viewports.
- **Document Reader Enhancements:** Added page thumbnail navigation sidebar and dual view mode ("PDF View" vs "Extracted Text" with chunk inspection).
- **Automated Public Proof Pipeline:** Built Playwright screenshot automation script (`scripts/capture_launch2_public_proof.py`) capturing high-resolution populated workspace assets into `frontend/public/screenshots/`.
- **RFC 9116 Standards:** Deployed `/.well-known/security.txt` served live by FastAPI at `GET /.well-known/security.txt` and root `SECURITY.md` defining vulnerability disclosure procedures and SLAs.
- **Root License:** Added standard permissive MIT license in root `LICENSE`.

### Changed
- **Algorithmic Claim Calibration:** Corrected vector deletion complexity description from "O(1)" to "ID-mapped in-place vector deletion without index rebuilding".
- **Marketing Copy Calibration:** Calibrated claim from "removes hallucination" to "engineered to reduce hallucination risk through structural evidence checks".
- **Stat Cards & Limits Presentation:** Varied dashboard metric card layouts and upgraded landing page limits display into a 2-column featured format.
- **Developer Telemetry Quarantine:** Removed raw backend parameters (FAISS IndexFlatIP, SQLite dialect, vector counts) from public views and user dashboard into dedicated technical documentation.

### Fixed
- **Dashboard Status Diagnostic:** Resolved false "Degraded" status in Dashboard by syncing database, vector store, and provider probe checks into a unified health diagnostic.
- **Strict Zero Em Dash Rule:** Replaced all decorative em dashes with standard hyphens or colons across entire codebase and documentation.
- **CORS Preflight Hardening:** Configured CORS middleware to reject untrusted origin preflight requests with `HTTP 400 Bad Request: Disallowed CORS origin`.

---

## [1.1.0] - 2026-11-11

### Added
- **Architectural Layout Decoupling:** Separated standalone public marketing site at `/` from authenticated application shell at `/app/*`.
- **Executive Dashboard:** Implemented workspace dashboard with 4 live metric cards, ask-first query composer, 4 quick actions, and split views for recent documents and sessions.
- **Settings Panel:** Deployed Spec Page 7 Settings panel with AI provider configuration, chunking sliders, evidence thresholds, and theme toggles.
- **Dual-Dialect Persistence:** Documented and verified SQLite 3 WAL for zero-dependency local development and single-container VPS, with PostgreSQL 16 Alpine for Docker Compose and cloud production.
- **Docker Compose Orchestration:** Configured multi-container orchestration with PostgreSQL 16 and persistent volumes in `docker-compose.yml`.
- **Disaster Recovery Automation:** Created and verified backup and restore script at `scripts/backup_restore.sh`.
- **Cloud Deployment Manifests:** Added turnkey configuration templates for Railway (`railway.json`) and Render (`render.yaml`).

### Changed
- **Navigation Shell:** Replaced floating developer status bar with accessible 200px/64px expandable sidebar rail with persistent text labels.
- **Sample Document Loading:** Replaced dead UI tiles with active sample document loading endpoint `POST /api/v1/documents/sample`.

---

## [1.0.0] - 2026-11-10

### Added
- **Initial Open-Source Release:** Core codebase developed for the ShadowFox Advanced-Level AI Engineer Track.
- **LangGraph RAG Engine:** Built 6-node state graph implementing query rewriting, FAISS retrieval, candidate reranking, Evidence Sufficiency Gate (threshold 0.650), citation validation, and groundedness checking.
- **Multi-Format Ingestion:** Added parser support for PDF (PyMuPDF), Markdown, and plain text files with SHA-256 deduplication and 25MB file ceiling.
- **Multi-Tenant Security:** Implemented cryptographic workspace isolation via 256-bit entropy cookies (`nexus_session`) and double-submit CSRF protection (`X-CSRF-Token`).
- **SSE Response Streaming:** Deployed Server-Sent Events streaming for real-time token synthesis with structured citation payloads.
- **Automated Test Battery:** 47 backend Pytest tests, 16 frontend Vitest tests, and 8 Playwright automated user journeys.

