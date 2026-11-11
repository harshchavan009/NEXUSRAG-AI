# NexusRAG Transformation - Phase T2 Report: Architectural Separation & Real Dashboard
**Date:** November 11, 2026  
**Phase Status:** Completed & Fully Verified  
**Commit:** Pending  

---

## 1. What Changed

In accordance with [`TRANSFORM_BRIEF.md`](file:///Users/harsh/Desktop/RAG%20Assistant/TRANSFORM_BRIEF.md) and [`docs/transform-plan.md`](file:///Users/harsh/Desktop/RAG%20Assistant/docs/transform-plan.md), Phase T2 executed the structural and visual separation between the public website and the authenticated application workspace, eliminated persistent developer chrome, fixed navigation collisions, and delivered the true executive dashboard.

### 1. Architectural Separation: Public Site (`/`) vs App Shell (`/app/*`)
- **Decoupled Layouts in `frontend/src/App.jsx`:**
  - Route `/` now exclusively renders the standalone Public Website (`LandingPage.jsx`) with its own marketing navigation header, hero, features grid, and footer. Zero app rail, zero app top bar, and zero status bar are rendered on the public website.
  - Route `/app/*` (`/app/dashboard`, `/app/knowledge`, `/app/research`, `/app/reader`, `/app/inspector`, `/app/settings`) mounts the Authenticated Application Shell with the navigation rail and workspace top bar.
  - Synchronized routing with browser history using native `pushState` and `popstate` event listeners.

### 2. Elimination of Developer Status Bar from Persistent Chrome
- Completely removed `StatusBar.jsx` (`sqlite, 0 vectors, 0 chunks indexed, v1.0.0`) from the persistent application shell layout.
- Per acceptance criteria, system health telemetry is only surfaced as a badge in `TopBar.jsx` when degraded (`status !== 'healthy'`), while detailed diagnostics and live index metrics reside in the Settings page and Retrieval Inspector.

### 3. Expandable Rail Navigation (`RailNav.jsx`) & Accessible Labels
- Converted `RailNav` into an expandable 200px / 64px navigation rail.
- Users can toggle between compact icon-only mode (64px) and expanded mode with explicit, readable text labels (200px).
- State is persisted in `localStorage` (`nexusrag_rail_expanded`).
- **Resolved Double-Tooltip Bug:** Removed duplicate browser `title` attributes that previously collided with the custom CSS tooltip span. All nav buttons maintain accessible `aria-label` tags.
- Added explicit "Public Site" / `Overview` navigation button and integrated theme toggle in the rail footer.

### 4. Delivered the True Dashboard (`DashboardPage.jsx`)
- **Removed Duplicate Inner Sidebar:** Eliminated the redundant `aside className="w-56..."` sub-navigation that previously duplicated chats and folders. The dashboard now utilizes the full workspace canvas cleanly.
- **Live 4-Card Aggregate Metrics Grid (Zero Static Data Rule):**
  1. **Total Documents:** Live count (`documents.length`), indexed count, and total pages analyzed across the workspace.
  2. **Knowledge Collections:** Active collections count (`collections.length`) with domain namespace indication.
  3. **Vector Chunks:** Total vectors in FAISS index (`statusData.faiss_vectors ?? total_chunks`).
  4. **Active Sessions:** Live multi-turn synthesis threads count (`sessions.length`).
- **Ask-First Composer:**
  - Full-width query textarea pre-configured with model selector (`Gemini 2.5 Flash`, `Gemini 2.0 Flash`), response length selector (`250 words`, `Brief Summary`, `Comprehensive`), and collection scope selector.
  - Direct submit action packages scope and transfers query seamlessly into the 3-Panel Research Desk.
- **4 Operational Quick Action Cards:**
  1. *Add Sample Docs:* Triggers one-click ingestion of 4 real research whitepapers.
  2. *Upload Files:* Opens verified upload modal for PDFs, Markdown, TXT.
  3. *New Thread:* Creates a new research session and opens the Research Desk.
  4. *DAG Inspector:* Navigates directly to the LangGraph 9-Node retrieval execution trace.
- **Split View Layout:**
  - **Left (2/3 width on lg):** Ingested Documents Table with real-time text filter, A-Z/Z-A sort toggle, generated summary column toggle, reader launch action, and delete action.
  - **Right (1/3 width on lg):** Recent Research Sessions feed (with quick session creation) and Live Engine & Pipeline Status card.

### 5. Dead Control Cleanup in Knowledge Bases & Ingestion
- **`KnowledgeBasesPage.jsx`:**
  - Removed dead notification bell icon and `R` avatar.
  - Renamed dead `Shared` column to `Collection` and populated with dynamic collection name.
  - Replaced hardcoded `Today` strings with formatted dynamic `doc.created_at`.
- **`UploadTray.jsx`:**
  - Fixed multipart form field name from `'file'` to `'files'`, aligning with FastAPI backend `List[UploadFile] = File(...)`.
  - Replaced hardcoded "25MB" with dynamic limit fetched from `/api/v1/system/status`.

---

## 2. Files Changed

| File | Change Summary |
|---|---|
| [`CLAUDE.md`](file:///Users/harsh/Desktop/RAG%20Assistant/CLAUDE.md) | Recorded Phase T2 completion and updated component status. |
| [`frontend/index.html`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/index.html) | Replaced reused headline and em dashes with original calibrated tagline. |
| [`frontend/package.json`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/package.json) | Added `react-router-dom` dependency. |
| [`frontend/src/App.jsx`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/App.jsx) | Decoupled public site layout (`/`) from app shell (`/app/*`), removed persistent status bar, added history sync. |
| [`frontend/src/components/layout/RailNav.jsx`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/components/layout/RailNav.jsx) | Added 200px/64px expandable width toggle, clean text labels, fixed double-tooltip bug, added overview link. |
| [`frontend/src/components/layout/TopBar.jsx`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/components/layout/TopBar.jsx) | Cleaned workspace status badge, removed internal developer tags. |
| [`frontend/src/components/upload/UploadTray.jsx`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/components/upload/UploadTray.jsx) | Fixed form field to `files`, dynamic file size limit from system status API. |
| [`frontend/src/pages/DashboardPage.jsx`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/pages/DashboardPage.jsx) | Overhauled into True Dashboard: 4-card live metrics grid, ask-first composer, 4 quick actions, split documents & sessions layout. |
| [`frontend/src/pages/KnowledgeBasesPage.jsx`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/pages/KnowledgeBasesPage.jsx) | Removed notification bell and avatar; replaced `Shared` column with dynamic `Collection` column; live dates. |
| [`frontend/src/test/navigation_and_pages.test.jsx`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/test/navigation_and_pages.test.jsx) | Added tests for standalone public landing page, 4 dashboard metric cards, quick action tiles, and app navigation. |
| [`scripts/capture_phase_t2_screenshots.py`](file:///Users/harsh/Desktop/RAG%20Assistant/scripts/capture_phase_t2_screenshots.py) | Created Playwright automation script to capture 18 multi-viewport screenshots across light and dark modes. |

---

## 3. Evidence & Verification

### A. Frontend Test Suite (`vitest`)
```
> nexusragg-frontend@1.0.0 test
> vitest run --run

 RUN  v4.1.12 /Users/harsh/Desktop/RAG Assistant/frontend

 ✓ src/test/components.test.jsx (12 tests) 88ms
 ✓ src/test/navigation_and_pages.test.jsx (5 tests) 251ms

 Test Files  2 passed (2)
      Tests  17 passed (17)
   Duration  865ms
```

### B. Production Frontend Build (`vite build`)
```
> nexusragg-frontend@1.0.0 build
> vite build

vite v6.4.6 building for production...
✓ 1633 modules transformed.
dist/index.html                              1.84 kB │ gzip:   0.96 kB
dist/assets/pdf.worker.min-yatZIOMy.mjs  1,375.84 kB
dist/assets/index-BsD-YrmN.css              27.48 kB │ gzip:   6.15 kB
dist/assets/icons-CKK11egH.js               19.81 kB │ gzip:   4.02 kB
dist/assets/index-D_Rt30N2.js              118.05 kB │ gzip:  25.81 kB
dist/assets/vendor-DCbBefT_.js             184.55 kB │ gzip:  58.03 kB
dist/assets/pdfjs-DQl15R3w.js              364.06 kB │ gzip: 107.37 kB
✓ built in 1.42s
```

### C. Backend Test Suite (`pytest`)
```
pytest
============================== 48 passed in 0.83s ==============================
```

### D. Multi-Viewport & Multi-Theme Screenshots (18 Files Captured)
Captured in [`docs/screenshots/phase_t2/`](file:///Users/harsh/Desktop/RAG%20Assistant/docs/screenshots/phase_t2/):
- **1440px Desktop:**
  - `public_landing_1440_light.png` / `public_landing_1440_dark.png` (Standalone public layout)
  - `app_dashboard_1440_light.png` / `app_dashboard_1440_dark.png` (4-card metric grid + Ask-first composer + Ingested docs + Sessions)
  - `app_knowledge_1440_light.png` / `app_knowledge_1440_dark.png` (Cleaned table + Dynamic collection)
- **820px Tablet:**
  - `public_landing_820_light.png` / `public_landing_820_dark.png`
  - `app_dashboard_820_light.png` / `app_dashboard_820_dark.png`
  - `app_knowledge_820_light.png` / `app_knowledge_820_dark.png`
- **390px Mobile:**
  - `public_landing_390_light.png` / `public_landing_390_dark.png`
  - `app_dashboard_390_light.png` / `app_dashboard_390_dark.png`
  - `app_knowledge_390_light.png` / `app_knowledge_390_dark.png`

---

## 4. Acceptance Criteria Checklist (Phase T2)

- [x] **Criterion 1 (Layout Decoupling):** Public site at `/` has its own layout with zero app rail, zero app top bar, and zero developer status bar.
- [x] **Criterion 2 (Status Bar Removal):** Developer status bar (`StatusBar.jsx`) completely removed from persistent application chrome.
- [x] **Criterion 3 (Expandable Rail):** 200px expanded / 64px compact rail with readable text labels, persistent toggle, zero double-tooltip bugs.
- [x] **Criterion 4 (True Dashboard):** 4-card live metrics grid (Total Documents, Collections, Vector Chunks, Active Sessions), ask-first composer, 4 quick actions, split recent documents and sessions view.
- [x] **Criterion 5 (Dead Controls):** Removed notification bell, user avatar, dead `Shared` column, and fixed upload multipart field name.
- [x] **Criterion 6 (Full Verification):** 48/48 backend tests passing, 17/17 vitest tests passing, 18 screenshots captured across 3 viewports and 2 themes.

---

## 5. Next Steps

Phase T2 is fully realized and verified. Ready to proceed to **Phase T3: Pipeline Verification & Settings Realignment** (PostgreSQL verification/deviation justification, complete Page 7 settings panel, and citation grounding verification).
