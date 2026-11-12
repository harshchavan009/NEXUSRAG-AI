# NexusRAG Launch 2 Transformation Plan & Defect Prioritization

**Document Version:** 1.0.0  
**Date:** 2026-11-12  
**Author:** AI Systems Architect & Full-Stack Security Engineer  
**Reference Document:** `LAUNCH2_BRIEF.md`, `CLAUDE.md`, `docs/launch2-audit.md`  

---

## 1. Defect Priority Ranking

### Blockers (Must Fix in Phase L1)
- **B1: Deprecated Embedding Model:** `text-embedding-004` shut down on January 14, 2026. Upgrade to official active model **`gemini-embedding-2`** configured with 768 MRL output dimensions and automatic unit normalization.
- **B2: Deprecated Generation Model:** `gemini-2.5-flash` restricted on Google AI Studio with automatic transition to `gemini-3.5-flash-lite` on Dec 1, 2026. Upgrade default to **`gemini-3.5-flash-lite`** ($0.30 / 1M in, $2.50 / 1M out) with **`gemini-3.8-flash`** as high-reasoning alternative.
- **B3: Static "API Online" Label:** Replace static HTML badge in Settings and Dashboard with a real dynamic provider probe (`GET /api/v1/system/probe`) executing cached 60s test calls and surfacing real error diagnostics when keys are missing or invalid.
- **B4: False "Degraded" Dashboard Status:** Fix property mismatch where `DashboardPage.jsx` evaluated `statusData?.status === 'healthy'` on an endpoint that returned no `.status` key. Wire to `GET /api/v1/health` with diagnostic tooltip.
- **B5: Inaccurate "O(1) Vector Deletions" Claim:** Correct all instances of "O(1) deletions" across 8 files to algorithmic truth: "ID-mapped vector removal without index rebuilds" ($O(k \cdot d)$ with array compaction).
- **B6: Missing Root License File:** Add valid `LICENSE` (MIT License) with copyright and third-party notices to back up "Open Source Research Engine" claims.

### High Priority (Phases L1 & L2)
- **H1: Overreaching & Inaccurate UI Claims:**
  - Remove "Authenticated" from landing preview tag ("1440x900 Authenticated Canvas" $\to$ "1440x900 Workspace Preview").
  - Calibrate "remove hallucination risk" $\to$ "reduce hallucination risk through evidence gates and calibrated abstention".
  - Remove "pass 100% of automated tests" from Settings UI.
- **H2: Font Tracker Claim Calibration:** Calibrate "Zero third-party trackers" to "Zero behavioral ad trackers", acknowledging Google Fonts CDN in `index.html` (or bundle fonts locally).
- **H3: Fake Hero Announcement Banner:** Remove the artificial "UPDATED Transparent Document Synthesis" pill above the landing hero.
- **H4: Unsupported Format in Dashboard Tile:** Remove "DOCX" from the Dashboard upload tile (`DashboardPage.jsx:334`); sync with backend configuration (`.pdf`, `.txt`, `.md`).
- **H5: Incorrect Splitter Label:** Correct `SettingsPage.jsx:149` from "PyMuPDF splitter" to "tiktoken (cl100k_base) sentence-boundary chunker".
- **H6: Public Screenshot Proof Deficit:** Script Playwright to capture high-resolution screenshots of the live system with ingested documents, cited answers, reader passage highlights, and inspector traces, replacing empty preview images in `frontend/public/screenshots/`.
- **H7: Real Try-It Entrypoint:** Add a primary "Try Sample Research" CTA on the landing page that launches directly into a pre-populated workspace with sample documents ingested.
- **H8: Developer Telemetry Removal:** Strip raw implementation strings (`faiss_vectors: 0`, `dialect: sqlite`, `FAISS IndexFlatIP`) from the public hero and main dashboard view.

### Medium Priority (Phases L2, L3 & L4)
- **M1: Collections Management:** Add Collection Rename modal dialog and document transfer between collections.
- **M2: Research Desk Depth:** Add "Export Session / Answer as Markdown with Citations" and an "Inspect this answer" button linking directly to the Inspector trace.
- **M3: Retrieval Inspector Enhancements:** Add "Copy Run ID" and "Export Trace JSON" buttons.
- **M4: Platform-Aware Keyboard Shortcuts:** Detect user platform (`navigator.platform`) to show `⌘K` on macOS and `Ctrl+K` on Windows/Linux.
- **M5: Dynamic Placeholder Queries:** Adapt the Ask box placeholder based on actually uploaded document titles rather than hardcoding a static clean energy query.
- **M6: Relocate Technical Essays:** Move hex color palettes and the dual-dialect essay from Settings to `/docs/architecture`.
- **M7: Sample Document Attribution:** Display source, license, and author attribution chips for all 4 bundled sample documents.

### Low Priority (Phases L4 & L7)
- **L1: Governance Documents:** Add `SECURITY.md`, `CHANGELOG.md`, and `/.well-known/security.txt`.
- **L2: UI Grammar:** Fix "Documents Type" to "Document Type" in Knowledge Base table.
- **L3: Cleanup Dead Visuals:** Remove non-functional "Favorites" section headers.

---

## 2. Model & Embedding Specification

### 2.1 Embedding Model Upgrade
- **Configured Model ID:** `gemini-embedding-2`
- **Output Dimensionality:** `768` (configured via `types.EmbedContentConfig(output_dimensionality=768, task_type=task_type)`).
- **Normalization:** `gemini-embedding-2` automatically outputs unit $L_2$-normalized vectors when `output_dimensionality` is specified.
- **Similarity Compatibility:** Inner Product (`IndexFlatIP`) remains mathematically identical to Cosine Similarity ($\mathbf{u} \cdot \mathbf{v} = \cos \theta$).
- **Reindex Strategy:**
  - Upon updating the model ID, a startup verification checks `index_metadata.json`.
  - If the stored model ID or dimension does not match `settings.DEFAULT_EMBEDDING_MODEL` or `settings.EMBEDDING_DIMENSION`, the engine triggers an automatic re-embedding of existing documents, preventing vector space contamination.

### 2.2 Generation Model Upgrade
- **Default Generation Model:** `gemini-3.5-flash-lite`
  - Cost: **$0.30 per 1M input tokens**, **$2.50 per 1M output tokens**.
  - Context Window: 1,048,576 tokens.
- **High-Reasoning Alternative:** `gemini-3.8-flash`
  - Cost: **$0.75 per 1M input tokens**, **$3.75 per 1M output tokens**.

---

## 3. Database Architecture & Production Decision

### Proposed Dual-Dialect Production Policy
1. **Local Development (Default):** SQLite 3 with Write-Ahead Logging (`WAL` mode). Zero background service dependencies, instant test suite execution, and friction-free onboarding.
2. **Docker Compose Production:** PostgreSQL 16 Alpine containerized with persistent named volume `nexusrag_pgdata`. Alembic applies production migrations on startup.
3. **Single-Container Cloud Deployments (Railway / VPS):**
   - Option A (Single-Container Full-Stack): SQLite on persistent volume mount (`/app/storage/nexus_prod.db`), providing zero-maintenance, zero-network-latency ACID persistence for single-instance workloads.
   - Option B (Multi-Service Managed DB): PostgreSQL provisioned via Railway Managed Postgres or Render Postgres with `DATABASE_URL` injection.
4. **Approval Request:** Confirm approval for running SQLite locally / single-container VPS with PostgreSQL 16 Alpine orchestrated for Docker Compose environments.

---

## 4. Copy Deck & Originality Alignment

| Location | Existing String | Proposed Original String | Originality Justification |
|---|---|---|---|
| **Landing Hero Preview** | "1440x900 Authenticated Canvas" | "1440x900 Interactive Research Canvas" | Accurate; no accounts exist. |
| **Landing Subhead** | "Engineered to remove hallucination risk through structural evidence checks." | "Engineered to reduce hallucination risk through structural evidence gates and calibrated abstention." | Honest; no system removes 100% of risk. |
| **Landing Announcement** | "UPDATED Transparent Document Synthesis with LangGraph Traces →" | *(Removed entirely)* | Eliminates fake marketing pill. |
| **Landing Proof Telemetry** | "Live Vectors: 0 · Model: gemini-2.5-flash · Evidence Gate: 0.650 · Dialect: sqlite" | *(Removed from hero; moved to System Status view)* | Clean presentation without raw developer tokens. |
| **Dashboard Status** | "Pipeline Status: Degraded" | "Pipeline Status: Ready" (with live health popover) | Fixes false outage reporting. |
| **Dashboard Upload Tile** | "PDF, MD, TXT, DOCX" | "PDF, MD, TXT (up to 25MB)" | Reflects true accepted file formats. |
| **Settings Chunking** | "PyMuPDF splitter" | "tiktoken (cl100k_base) sentence-boundary chunker" | Accurately describes chunking tokenizer. |
| **Vector Deletion Docs** | "O(1) deletions via IndexIDMap2" | "ID-mapped vector removals without full index rebuilds" | Correct algorithmic complexity. |
| **Footer Tracker Claim** | "Zero third-party trackers" | "Zero behavioral trackers • Self-contained workspace" | Accurately accounts for CDN fonts. |

---

## 5. Public Screenshot Regeneration Plan

We will execute an automated Playwright script that prepares a real workspace and captures crisp, unmocked 1440px screenshots for the public website:
1. **`dashboard.png`:** Live dashboard showing 4 ingested research papers, live computed chunk counts (18+ chunks), dynamic LLM document summaries, and recent research sessions.
2. **`research.png`:** Research Desk displaying a grounded, streamed answer to *"What are the primary performance advantages of renewable microgrids?"* with interactive bracketed citations `[1]`, `[2]`.
3. **`reader.png`:** Document Reader displaying the exact PDF page with the source excerpt highlighted in warm amber ochre (`#D96E43`).
4. **`inspector.png`:** Retrieval Inspector visualizing the 9-node LangGraph execution trace, raw vs. rewritten query, candidate similarity scores, evidence sufficiency gate (0.812 score vs 0.650 threshold), and millisecond duration waterfall.
5. **`library.png`:** High-density Knowledge Base table displaying collections, status badges, and processing telemetry.

---

## 6. Hosting Provider Comparison (Verified Limits & Pricing)

| Hosting Provider | Pricing Structure | Persistent Volume Support | Custom Domain & SSL | Recommended Fit |
|---|---|---|---|---|
| **Railway** | **$5.00 / month** Hobby Plan (includes $5 compute credit; storage at **$0.15 / GB / month**) | Native persistent volume (`/app/storage`) mounted to Docker container | Single custom domain with automatic Let's Encrypt SSL and path routing | **RECOMMENDED**. Turnkey deployment with zero configuration, seamless volume persistence, and automatic GitHub CI integration. |
| **Render** | **$7.00 / month** Starter Web Service + **$7.00 / month** Managed PostgreSQL | Persistent disk at **$0.25 / GB / month** (locks service to 1 instance) | Supported with automatic SSL | **VIABLE**. Slightly higher disk costs and scaling constraints with attached disk. |
| **Hetzner / DO VPS** | **$4.50 - $6.00 / month** flat for 2 vCPU / 4GB RAM / 40GB NVMe | Direct host filesystem storage with Docker Compose volumes | Managed via Caddy / Nginx reverse proxy | **HIGHEST CONTROL**. Exact parity with local Docker Compose; requires managing OS security updates. |

---

## 7. Phased Implementation Roadmap (Phases L1 through L8)

- **Phase L1: Blockers & Model Upgrades**
  - Upgrade default models to `gemini-embedding-2` and `gemini-3.5-flash-lite`.
  - Implement dynamic provider probe endpoint (`GET /api/v1/system/probe`) with 60s cache and exact error diagnostics.
  - Fix false "Degraded" status in `DashboardPage.jsx` and wire to `/api/v1/health`.
  - Correct all "O(1) deletions" claims across docs and UI.
  - Commit root `LICENSE` file (MIT).
  - Clean up inaccurate claims ("Authenticated Canvas", "remove hallucination risk", "DOCX", "PyMuPDF splitter").
- **Phase L2: Spec Gaps & Research Workspace Depth**
  - Implement Collection Rename modal and document moving controls.
  - Add "Export Answer / Session as Markdown with Citations" to Research Desk.
  - Add "Inspect this answer" direct button linking to Inspector run ID.
  - Add "Copy Run ID" and "Export Trace JSON" in Retrieval Inspector.
  - Add platform-aware keyboard shortcut indicators (`⌘K` vs `Ctrl+K`).
- **Phase L3: Public Proof & Regenerated Screenshots**
  - Script Playwright to capture real live screenshots from populated workspace.
  - Deploy regenerated images to `frontend/public/screenshots/` and update Landing Page.
  - Add primary "Try Sample Research" CTA on Landing Page.
  - Remove raw developer telemetry from Landing hero and main Dashboard view.
- **Phase L4: Product Polish, Error States & Mobile**
  - Implement adaptive placeholder questions based on user's ingested documents.
  - Implement designed error states (API key missing, rate limit hit, backend offline).
  - Display sample document licensing and attribution cards.
  - Verify mobile bottom sheets and responsiveness across 390px viewports.
- **Phase L5: Quality & Automated Testing Battery**
  - Re-run full Pytest suite (48+ tests) and Vitest suite (19+ tests).
  - Execute end-to-end Playwright user journeys.
  - Run originality and real-data audit scripts.
- **Phase L6: Comprehensive Security Audit**
  - Verify `pip-audit`, `npm audit`, `detect-secrets scan`.
  - Validate CORS, CSRF double-submit, and rate limiter enforcement.
  - Add `SECURITY.md` and `/.well-known/security.txt`.
- **Phase L7: Repository Polish (GitHub)**
  - Add repository description, topics, social preview image, and `CHANGELOG.md`.
  - Validate clean clone execution from README.
- **Phase L8: Go-Live & Final Submission Package**
  - Update root `README.md` and documentation whitepapers.
  - Deliver updated demonstration script and one-page technical summary.

---

## 8. Explicit Deviation Confirmation Requests

Before proceeding to Phase L1, please confirm your approval for:
1. **Model Upgrades:** Transitioning default embedding model to `gemini-embedding-2` (768 MRL dimensions) and generation model to `gemini-3.5-flash-lite`, using official active Google AI Studio endpoints.
2. **Database Production Policy:** Maintaining SQLite 3 WAL for local zero-dependency development and single-container VPS, with PostgreSQL 16 Alpine orchestrated for Docker Compose and managed cloud environments.
3. **Algorithmic Claim Calibration:** Correcting "O(1) vector deletion" to "ID-mapped in-place vector deletion without index rebuilding".

---

**Awaiting your approval to begin Phase L1 implementation.**

