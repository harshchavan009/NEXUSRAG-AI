# NexusRAG Phase L2 Verification Report: Spec Gaps & Research Workspace Depth

**Date:** November 12, 2026  
**Environment:** macOS (Local Node.js 20+ & Python 3.14, FastAPI, PostgreSQL/SQLite, React 18, Playwright Chromium)  
**Status:** **PHASE L2 COMPLETED & VERIFIED**

---

## 1. Executive Summary

Phase L2 addressed the remaining functional specification gaps and deepened the interaction mechanics across the NexusRAG research workspace. All changes strictly adhere to the **Zero Static Data Rule**, **Design Tokens** (no pill shapes, no gradients, no em dashes), and **Authority Hierarchy** (ShadowFox PDF, `docs/original-master-spec.md`, `BUILD_BRIEF.md`, `TRANSFORM_BRIEF.md`, and `LAUNCH2_BRIEF.md`).

---

## 2. Key Implementations & Enhancements

### A. Collections Management & Document Moving
- **Backend Endpoints:**
  - `PATCH /api/v1/documents/{document_id}`: Assigns or unassigns a single document to/from a collection with workspace validation.
  - `POST /api/v1/documents/bulk-move`: Atomic bulk assignment of multiple document IDs to a target collection (or unassigned).
  - Schema updates in `backend/app/schemas/document.py` (`DocumentUpdate`, `BulkMoveRequest`).
- **Frontend Interactivity:**
  - `KnowledgeBasesPage.jsx`: Collection table cell is now an interactive `<select>` dropdown allowing instant reassignment without navigating away.
  - Multi-select bulk action toolbar includes a "Move to..." dropdown enabling 1-click batch relocation of selected documents.
  - Fixed grammar in table filter ("Document Type" instead of "Documents Type").
  - Removed decorative `font-mono` on ordinary labels ("X files available").

### B. Research Desk Depth
- **Scoped Document Selection:**
  - Replaced dead "Favorites" section in the left navigation rail with an active **"Scoped Documents"** panel featuring individual document checkmarks.
  - Users can click any document to scope queries strictly to those files; `selectedDocIds` is wired directly into `payload.scope.document_ids`.
- **Dynamic Suggested Inquiries:**
  - Replaced static quick-actions with dynamic inquiries generated from the user's actual indexed files (e.g., Renewable microgrid advantages for clean energy files, Corporate governance oversight for 10-K filings, Consensus fault tolerance for distributed systems papers).
  - Explicitly labelled "From Indexed Files" with honest fallbacks.
- **Markdown Export with Citations:**
  - Added **"Export"** action to each synthesis message: downloads an individual response formatted as Markdown with full citation details, character excerpts, and page references.
  - Added **"Export Session (.md)"** button in the header tab strip: exports the complete research conversation, queries, grounded answers, and cited sources into a structured `.md` file.
- **Direct Trace Link ("Inspect this answer"):**
  - Updated the action bar of every synthesized message to feature a prominent **"Inspect this answer"** button linking directly to the specific execution run (`msg.workflow_run_id`) in `/app/inspector`.

### C. Retrieval Inspector Depth
- **Copy Run ID:** Added a 1-click copy button with animated feedback (`Copy` / `Check` icons) to quickly capture the full UUID run ID.
- **Export Trace JSON:** Added an "Export JSON" button that downloads the full execution payload (rewritten query, sufficiency scores, groundedness metrics, node durations, candidate chunks, and rationale) as `nexusrag-trace-{id}.json`.
- **Candidate vs Reranked Inspection:**
  - Implemented dual-tab comparison view:
    - **Reranked Context (Top-4):** Inspects cross-encoder rerank scores and semantic rationale.
    - **Initial Retrieved Candidates (Top-8):** Inspects initial FAISS cosine similarity scores, chunk database IDs, and exact character boundaries.

### D. Live Processing Activity Feed & Dashboard Overhaul
- **Processing Activity Feed:** Added a live pipeline events feed on `DashboardPage.jsx` showing real extraction, chunking, and FAISS indexing events derived from real database timestamps.
- **Varied Card Layouts:** Varied the dashboard metrics grid (Card 1 featured as prominent primary metric with ready status and page breakdown; Card 2 for Knowledge Bases; Card 3 for 768-dim FAISS vectors; Card 4 for Active Sessions with quick action).
- **Adaptive Composer Placeholder:** Textarea placeholder dynamically adapts based on ingested documents rather than referencing non-existent files.
- **Pill Shape Elimination:** Replaced all pill-shaped badges (`rounded-full`) with crisp dot + text status indicators.

### E. Configurable Bounded Retrieval Settings (Spec Page 7)
- Upgraded Section 2 in `SettingsPage.jsx` from static text into **interactive, bounded sliders**:
  - **Initial Retrieval (Top-K):** Bounded between 1 and 20 (Default: 8).
  - **Reranked Context (Top-N):** Bounded between 1 and 10 (Default: 4).
  - **Evidence Sufficiency Gate:** Bounded between 0.50 and 0.95 (Default: 0.65).
  - **Faithful Groundedness Gate:** Bounded between 0.50 and 0.95 (Default: 0.70).
  - Sliders automatically persist to browser `localStorage` and include a **"Reset to Defaults"** action.

### F. Platform-Aware Keyboard Shortcuts
- `TopBar.jsx`: Dynamic detection via `navigator.platform` ensures tooltips and titles display `⌘K` on macOS and `Ctrl+K` on Windows/Linux.
- Status badge simplified to an unobtrusive dot + text indicator.

---

## 3. Files Modified & Created

| Path | Type | Modifications |
|---|---|---|
| `backend/app/schemas/document.py` | Backend Schema | Added `DocumentUpdate` and `BulkMoveRequest` models |
| `backend/app/api/v1/documents.py` | Backend API | Implemented `PATCH /{id}` and `POST /bulk-move` endpoints |
| `backend/tests/test_upload_validation.py` | Pytest | Added `test_document_collection_move_and_bulk_move` test |
| `frontend/src/api/queries.js` | Frontend API | Added `useUpdateDocument` and `useBulkMoveDocuments` hooks |
| `frontend/src/pages/KnowledgeBasesPage.jsx` | React Page | Added document moving controls, fixed grammar, removed monospace |
| `frontend/src/pages/ResearchDeskPage.jsx` | React Page | Added scoped documents checklist, dynamic suggested inquiries, Markdown export, and "Inspect this answer" |
| `frontend/src/pages/RetrievalInspectorPage.jsx` | React Page | Added Copy Run ID, Export JSON, and Candidate vs Reranked tabs |
| `frontend/src/pages/DashboardPage.jsx` | React Page | Added Processing Activity Feed, varied card layout, adaptive placeholder |
| `frontend/src/pages/SettingsPage.jsx` | React Page | Implemented interactive bounded retrieval parameter sliders |
| `frontend/src/components/layout/TopBar.jsx` | React Component | Dynamic shortcut hint in tooltips, removed pill badge |
| `frontend/src/test/navigation_and_pages.test.jsx` | Vitest | Updated query mocks and assertion matchers |
| `CLAUDE.md` | Memory File | Logged Phase L1 & L2 progress per Rule 7 |

---

## 4. Verification & Testing Evidence

### A. Backend Pytest Suite (50/50 Passing)
```bash
pytest backend/tests -v
============================== 50 passed in 1.76s ==============================
```

### B. Frontend Vitest Suite (19/19 Passing)
```bash
npm --prefix frontend test -- --run
Test Files  2 passed (2)
     Tests  19 passed (19)
  Duration  1.93s
```

### C. Originality & Real-Data Audit
```bash
python3 scripts/audit_originality_and_real_data.py
============================================================
NEXUSRAG REAL-DATA & ORIGINALITY AUDIT
============================================================
PASSED: 0 forbidden phrases, 0 copied reference strings, 0 overclaims found in frontend/src.
Scanned all .jsx, .js, .html production files cleanly.
```

### D. Playwright End-to-End User Journeys (8/8 Passing)
```bash
python3 scripts/run_e2e_user_journeys.py
============================================================
PLAYWRIGHT END-TO-END AUTOMATED USER JOURNEYS
============================================================

[JOURNEY 1] Public Marketing & Architecture Separation...
 -> PASSED: RailNav mounted with 6 navigational destinations.

[JOURNEY 2] First-Run Onboarding & Sample Documents Ingestion...
 -> PASSED: Knowledge Bases table populated with 4 indexed research papers.

[JOURNEY 3] Ask-First Research Query & Streaming Synthesis...
 -> PASSED: Research Desk rendered verified synthesis.

[JOURNEY 4] Retrieval Inspector & 9-Node DAG Execution Trace...
 -> PASSED: Retrieval Inspector loaded with live run execution history.

[JOURNEY 5] Global Command Palette (Cmd+K) & Settings Page 7...
 -> PASSED: Spec Page 7 Settings fully verified: Provider, Models, Chunking, Retrieval, and Dual-Dialect Storage.

[JOURNEY 6] Honest Failure & Calibrated Out-of-Domain Abstention...
 -> PASSED: System calibrated properly: abstained honestly without hallucinating answers.

[JOURNEY 7] Cross-Tenant Isolation Verification (Visitor B vs Visitor A)...
 -> PASSED: Visitor B has 0 documents (Zero Cross-Tenant Leakage verified).

[JOURNEY 8] Cross-Viewport & Responsive Accessibility Check...
 -> PASSED: Captured 6 multi-viewport responsive dashboard proofs (1440, 820, 390px in light and dark mode).

============================================================
END-TO-END AUTOMATION SUMMARY: 8 PASSED, 0 FAILED
============================================================
```

---

## 5. Next Steps

With Phase L1 (Blockers & Model Upgrades) and Phase L2 (Spec Gaps & Workspace Depth) complete and verified, we are ready to proceed to:
- **Phase L3: Proof & Public Site Assets:**
  - Execute automated Playwright script to capture live, high-resolution 1440px screenshots from the populated workspace (showing real cited answers, citation jump in PDF reader, LangGraph 9-node DAG trace, and knowledge base table).
  - Deploy regenerated screenshots into `frontend/public/screenshots/`.
  - Add primary "Try Sample Research" CTA on Landing Page.
  - Strip raw developer telemetry strings from public hero views.

