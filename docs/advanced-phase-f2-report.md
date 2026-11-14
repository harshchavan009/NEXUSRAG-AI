# NexusRAG Advanced Phase F2 Verification Report: Dynamic Inquiries & Public Copy Overhaul

**Date:** 2026-11-13  
**Auditor / Roles:** Staff Full-Stack Engineer, AI/RAG Engineer, UX/UI Lead, Technical Writer  
**Specification Precedence:** ShadowFox Official Task PDF > Master Specs > Candidate Choices  
**Status:** PHASE F2 COMPLETED (Awaiting User Approval for Phase F3)  

---

## 1. Executive Summary

Phase F2 executes the second milestone of the approved Advanced Implementation Plan (`docs/advanced-plan.md`). 

This phase completely eliminates static mock suggestions from the Research Desk, deploys a live document-derived suggestions endpoint (`GET /api/v1/query/suggestions`), cleans up the public marketing landing page, purges marketing jargon and decorative captions, and validates all public copy with automated originality scanning.

---

## 2. Architectural Implementations & Remediations

### 2.1 Dynamic Suggested Inquiries Engine
- **Defect Addressed:** Previously, the Research Desk right panel displayed static, hardcoded inquiries ("Summarize primary thesis", "Extract quantitative data", "Compare key assertions") under the badge *"From Indexed Files"*, even when zero documents were indexed in the workspace.
- **Backend Implementation:**
  - Added `SuggestedInquiry` and `SuggestedInquiriesResponse` Pydantic schemas in `backend/app/schemas/query.py`.
  - Added `GET /api/v1/query/suggestions` in `backend/app/api/v1/chat.py`.
  - The endpoint dynamically scans indexed workspace documents (or scopes to specific `document_ids`).
  - When 0 documents are indexed, the endpoint returns `{"suggestions": [], "total_indexed_documents": 0}`.
  - When documents are indexed, it extracts high-signal inquiries tailored to the specific topics, sections, and headings of each document (e.g. photovoltaic cell efficiencies, LFP battery chemistries, SEC Rule 10D-1 clawback mandates, Raft randomized timeouts, Byzantine fault bounds, and LangGraph 9-node execution).
- **Frontend Integration:**
  - Added `useSuggestedInquiries(selectedDocs)` hook in `frontend/src/api/queries.js`.
  - Refactored `frontend/src/pages/ResearchDeskPage.jsx`:
    - When 0 documents are indexed, the static prompts are completely hidden and replaced with an honest empty state: *"No Documents Indexed: Upload files or load benchmark documents to view document-derived research suggestions."*
    - When documents are indexed, suggestions update dynamically based on the user's active document selection and display the truthful label: *"Derived from Selected Files"* or *"Derived from Indexed Files"*.
- **Evidence:** New unit test `test_suggested_inquiries_endpoint` in `backend/tests/test_rag_service.py` verifies both the empty unindexed workspace state and the populated document-derived suggestion state.

### 2.2 Landing Page Editorial & Jargon Purge
- **Defect Addressed:** The landing page contained a crowded 3-button CTA row in the hero, developer jargon ("groundedness validation", "inspectable retrieval graphs"), decorative captions on screenshot preview frames ("Live Running Application • Dashboard Workspace", "1440x900 Interactive Research Canvas"), and generic copy.
- **Remediations in `frontend/src/pages/LandingPage.jsx`:**
  - **Hero Actions:** Removed the redundant third "Documentation" button from the hero action row, focusing user flow on two distinct, primary actions: *"Open Research Workspace"* (primary) and *"Try Sample Research"* (outline secondary). Documentation remains accessible in the persistent PublicHeader and footer.
  - **Jargon Elimination:** Rewrote hero subtitle from *"sentence-level citations, groundedness validation, and inspectable retrieval graphs"* to direct, active English: *"NexusRAG analyzes PDFs, Markdown files, and plain text documents with sentence-level citations, verified evidence checks, and complete retrieval transparency."*
  - **Browser Preview Chrome:** Replaced decorative meta captions with a clean browser chrome header: three subtle window dots, `<span className="font-mono">nexusrag.app/dashboard</span>`, and a clean *"Research Dashboard Preview"* label.
  - **Refined Feature Row Headlines & Badges:**
    - Feature 01: *"Feature 01: Passage Highlighting"* with headline *"Verify every claim on the exact source page"*.
    - Feature 02: *"Feature 02: Pipeline Inspection"* with headline *"Inspect the full 9-node execution path"*.
    - Feature 03: *"Feature 03: Scoped Retrieval"* with headline *"Search across individual files or entire collections"*.
  - **Banner Copy:** Calibrated bottom call-to-action to reference authentic benchmark documents: *"Load benchmark documents or upload your own files to experience verifiable, citation-grounded research."*

---

## 3. Quantitative Test Verification

### 3.1 Backend Pytest Battery (52 Tests Passing)
```bash
$ pytest backend/tests
============================== 52 passed in 1.93s ==============================
```

### 3.2 Frontend Vitest Battery (20 Tests Passing)
```bash
$ npm --prefix frontend test
Test Files  2 passed (2)
Tests       20 passed (20)
Duration    1.26s
```

### 3.3 Production Frontend Bundle Build
```bash
$ npm --prefix frontend run build
vite v6.4.6 building for production...
✓ built in 1.43s
```

### 3.4 Automated Originality & Real-Data Audit
```bash
$ python3 scripts/audit_originality_and_real_data.py
============================================================
NEXUSRAG REAL-DATA & ORIGINALITY AUDIT
============================================================
PASSED: 0 forbidden phrases, 0 copied reference strings, 0 overclaims found in frontend/src.
Scanned all .jsx, .js, .html production files cleanly.
```

### 3.5 Zero Em Dash Audit
```bash
$ grep -rn "-" backend/ frontend/src/ data/sample_documents/
# Exit code 1 (Zero em dashes found)
```

---

## 4. Phase F2 Deliverables Summary

| Deliverable | File Path | Status |
|---|---|---|
| Suggested Inquiries Endpoint | [`backend/app/api/v1/chat.py`](file:///Users/harsh/Desktop/RAG%20Assistant/backend/app/api/v1/chat.py) | **PASS** |
| Suggested Inquiries Schemas | [`backend/app/schemas/query.py`](file:///Users/harsh/Desktop/RAG%20Assistant/backend/app/schemas/query.py) | **PASS** |
| Suggested Inquiries Test | [`backend/tests/test_rag_service.py`](file:///Users/harsh/Desktop/RAG%20Assistant/backend/tests/test_rag_service.py) | **PASS** |
| Suggested Inquiries TanStack Hook | [`frontend/src/api/queries.js`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/api/queries.js) | **PASS** |
| Dynamic Research Desk Panel | [`frontend/src/pages/ResearchDeskPage.jsx`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/pages/ResearchDeskPage.jsx) | **PASS** |
| Polished Public Landing Page | [`frontend/src/pages/LandingPage.jsx`](file:///Users/harsh/Desktop/RAG%20Assistant/frontend/src/pages/LandingPage.jsx) | **PASS** |
| Originality & Real-Data Audit | [`scripts/audit_originality_and_real_data.py`](file:///Users/harsh/Desktop/RAG%20Assistant/scripts/audit_originality_and_real_data.py) | **PASS** |
| Project Governance Update | [`CLAUDE.md`](file:///Users/harsh/Desktop/RAG%20Assistant/CLAUDE.md) | **PASS** |

---

## 5. Next Steps: Request for Approval to Proceed to Phase F3

With Phase F2 complete and all 72 automated tests passing, the project is ready for:

**Phase F3 (Live Provider Real-Data Testing & Audit Evidence Collection):**
1. Test end-to-end ingestion and querying across all formats (PDF, Markdown, TXT) and capture live query traces.
2. Verify document-scoped retrieval (prove zero cross-tenant bleeding and document scope filtering).
3. Force deliberate edge failures: corrupted PDF, empty 0-byte file, scanned image PDF without text, duplicate SHA-256 upload, spoofed extension, and out-of-domain unanswerable question.
4. Record verified terminal output and screenshots for all PDF requirements (R1 through R14).

