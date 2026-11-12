# Changelog

All notable changes to NexusRAG are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

