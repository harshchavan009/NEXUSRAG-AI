# NEXUSRAG ROUND 4: COMPREHENSIVE IMPLEMENTATION PLAN
**Document Version:** 1.0.0  
**Timestamp:** 2026-11-14T19:46:00+05:30  
**Evaluation Standard:** ShadowFox AI Engineer Internship Task List (Advanced Level)  
**Governance Document:** ROUND4_BRIEF.md & ADVANCED_BRIEF.md  

---

## 1. Prioritized Findings Matrix

All findings from the Round 4 audit have been categorized by severity, actionable fix, affected files, estimated effort, and regression risk:

| ID | Severity | Finding | Root Cause | Proposed Fix | Target Files | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **B1** | **Blocker** | Render Crash `ReferenceError: Can't find variable: selectedDocs` on `/app/research` | Identifier `selectedDocs` used in `ResearchDeskPage.jsx` lines 79 and 751 while state variable is declared as `selectedDocIds` (line 56). | Update lines 79 and 751 to use `selectedDocIds` (or derive `selectedDocs = documents.filter(...)`). Add regression test. | `frontend/src/pages/ResearchDeskPage.jsx`, `frontend/src/tests/navigation_and_pages.test.jsx` | 30 min | Low |
| **B2** | **Blocker** | Build pipeline does not catch undefined variables | `vite build` transpiles without AST scope symbol validation. No ESLint `no-undef` or TypeScript typecheck in build script. | Configure ESLint with `no-undef` and React plugin; update `frontend/package.json` build script to run linting before Vite build (`eslint src && vite build`). | `frontend/package.json`, `frontend/.eslintrc.json` or `eslint.config.js`, `.github/workflows/ci.yml` | 1 hour | Medium |
| **B3** | **Blocker** | Destructive Error Boundary UX | `frontend/src/main.jsx` renders raw `error.message` in `<pre>` block and offers only `localStorage.clear()` which blindly purges client state. | Redesign Error Boundary: plain user-friendly notice, "Try again" action (re-renders without clearing data), and a separate "Reset local view" (clears only UI state key with confirmation). Log error with session ID. | `frontend/src/main.jsx`, `frontend/src/components/common/ErrorBoundary.jsx` | 45 min | Low |
| **H1** | **High** | Mismatched sample document descriptions across 4 views | Three conflicting hardcoded strings describe sample papers (`KnowledgeBasesPage.jsx`, `DashboardPage.jsx`, `SampleAttributionModal.jsx`). | Unify all sample document descriptions into `frontend/src/constants/sampleDocuments.js` stating "demo documents written for NexusRAG under CC BY 4.0". | `frontend/src/constants/sampleDocuments.js`, `frontend/src/pages/KnowledgeBasesPage.jsx`, `frontend/src/pages/DashboardPage.jsx`, `frontend/src/components/common/SampleAttributionModal.jsx` | 45 min | Low |
| **H2** | **High** | Fake browser frame and fake domain on Landing Page | `frontend/src/pages/LandingPage.jsx:74` displays `nexusrag.app/dashboard` and decorative macOS window dots. | Remove fake address bar, window chrome dots, and unowned domain. Replace with a clean captioned product screenshot. | `frontend/src/pages/LandingPage.jsx` | 30 min | Low |
| **H3** | **High** | Outdated public hero screenshots | Screenshots in `frontend/public/screenshots/` (Nov 12) show old 5-chunk count instead of current 26 chunks. | Scripted recapture of all public screenshots from running app with real provider data, notifications dismissed, and real citations. | `scripts/capture_launch2_public_proof.py`, `frontend/public/screenshots/*` | 1 hour | Low |
| **H4** | **High** | Missing route smoke test in CI | No automated test opening every route in clean and seeded profiles to detect console errors or unhandled rejections. | Add Playwright route smoke test (`tests/test_route_smoke.py` or Playwright spec) that visits every route, listens to `console.error` and `pageerror`, and asserts zero errors. | `tests/test_route_smoke.py`, `.github/workflows/ci.yml` | 1 hour | Low |
| **M1** | **Medium** | Overclaims in Landing Page hero copy | Line 42 contains `"verified evidence checks, and complete retrieval transparency"`. | Calibrate copy to plain, concrete language: `"checks that each citation points to a passage that was retrieved, and lets you inspect which passages were retrieved and how they were ranked"`. | `frontend/src/pages/LandingPage.jsx` | 20 min | Low |
| **M2** | **Medium** | Decorative & static elements in UI | Static `"Workspace Active"` badge, monospace uppercase checklist header, `"v1.0.0"` badge and jargon subtitle in Settings. | Show system health status only when degraded (with reason); remove uppercase monospace styling from checklist; calibrate Settings subtitle. | `frontend/src/components/layout/TopBar.jsx`, `frontend/src/pages/DashboardPage.jsx`, `frontend/src/pages/SettingsPage.jsx` | 30 min | Low |
| **M3** | **Medium** | Saved-state schema safety | `localStorage` state has no schema versioning or migration strategy; corrupted keys could crash components. | Implement schema versioning wrapper for persisted client state (`localStorageService.js`) that validates structure and drops only corrupted keys. | `frontend/src/utils/storage.js` | 45 min | Low |
| **L1** | **Low** | Missing `Cache-Control: no-store` on private API responses | API responses do not explicitly instruct client caches to avoid storing tenant-isolated data. | Add `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` to all `/api/*` responses in `SecurityHeadersMiddleware`. | `backend/app/main.py` | 15 min | Low |

---

## 2. Phase-by-Phase Execution Plan

### Phase G1: Crash and Stability (Blockers B1, B2, B3, H4)
- **Objective:** Eliminate the render crash, enforce build-time symbol validation, deploy a safe Error Boundary, and establish an automated route smoke test.
- **Tasks:**
  1. Fix `selectedDocs` reference in `ResearchDeskPage.jsx` (lines 79 and 751).
  2. Install ESLint with `@eslint/js`, `eslint-plugin-react`, and configure `no-undef: "error"`.
  3. Update `frontend/package.json` build command to `eslint src && vite build`. Demonstrate build failure when an undefined variable is introduced.
  4. Overhaul `ErrorBoundary` in `main.jsx`:
     - Display plain, calibrated message without raw stack traces.
     - Provide "Try again" (clears boundary error state, triggers re-render).
     - Provide separate "Reset local view" (clears only client UI view state, leaves documents intact).
     - Log client error with anonymous session ID.
  5. Add Playwright route smoke test visiting `/`, `/docs`, `/security`, `/faq`, `/about`, `/privacy`, `/terms`, `/status`, `/app/dashboard`, `/app/library`, `/app/research`, `/app/reader`, `/app/inspector`, `/app/settings`. Fail on any console error or unhandled rejection.
- **Deliverables:** Updated components, passing smoke tests, clean build output.

### Phase G2: Honesty and Proof (Findings H1, H2, H3, M1, M2)
- **Objective:** Eliminate misleading marketing chrome, unify sample document descriptions, calibrate copy, and recapture all screenshots.
- **Tasks:**
  1. Author `frontend/src/constants/sampleDocuments.js` containing single source of truth for benchmark documents:
     - Document 1: 10-page Architecture Whitepaper (PDF, 10 chunks).
     - Document 2: 26-section Clean Energy Assessment (TXT, 6 chunks).
     - Document 3: 27-section Corporate Governance Charter (TXT, 5 chunks).
     - Document 4: 22-section Distributed Consensus Specification (MD, 5 chunks).
     - Attribution note: "Demo documents written for NexusRAG under CC BY 4.0".
  2. Update `KnowledgeBasesPage.jsx`, `DashboardPage.jsx`, and `SampleAttributionModal.jsx` to consume `sampleDocuments.js`.
  3. Overhaul Landing Page hero preview:
     - Purge fake browser chrome, three macOS window dots, and `nexusrag.app/dashboard` fake address bar.
     - Replace with clean bordered screenshot container with plain descriptive caption.
  4. Calibrate hero copy: replace overclaims with verified descriptions.
  5. Remove decorative static elements:
     - Replace static "Workspace Active" badge with dynamic health pill (visible only when degraded).
     - Change monospace uppercase checklist header to standard interface sans sentence case.
     - Clean up Settings subtitle and remove decorative "v1.0.0" badge.
  6. Script automated recapture of all public screenshots in `frontend/public/screenshots/` using the live app.
- **Deliverables:** Verified copy, unified constants, clean hero container, recaptured screenshots.

### Phase G3: Requirements Gaps & Live Key Verification (Matrix R1-R14, W1-W2, Q1, O1)
- **Objective:** Execute live-provider verification with user-configured `GEMINI_API_KEY` across all 20 requirements.
- **Tasks:**
  1. Verify live provider health via `GET /api/v1/system/probe` (status: `ok`, latency recorded).
  2. Execute live ingestion of 4-document multi-format batch (26 chunks total).
  3. Execute multi-file batch upload edge cases:
     - 0-byte file rejection (400 Bad Request).
     - Corrupted/unsupported extension rejection (400 Bad Request).
     - Duplicate SHA-256 upload rejection (409 Conflict).
     - Scanned PDF rejection (400 Bad Request with OCR guidance).
  4. Execute scoped retrieval comparison:
     - Question A scoped to PDF only vs scoped to TXT only; prove different retrieved passages.
  5. Execute conversational query rewriting:
     - Turn 1: "What is Raft leader election?"
     - Turn 2: "What is its timeout interval?" (Prove rewrite to "What is Raft leader election timeout interval?").
     - Clear Question: "What is the LCOE of photovoltaic generation?" (Prove rewrite skipped).
  6. Execute hybrid reranking before/after comparison and record delta.
  7. Execute answerable question vs unanswerable out-of-domain question (abstention).
  8. Execute forced invalid citation stripping.
  9. Execute SSE streaming with client cancellation via `AbortController`.
  10. Verify Docker Compose reproducibility (`docker compose up` from clean clone).
- **Deliverables:** Updated `docs/advanced-audit-evidence.json` and `docs/advanced-audit-evidence.md`.

### Phase G4: Tests and Real Evaluation
- **Objective:** Run exhaustive automated test suite and produce retrieval evaluation benchmark with measured numbers only.
- **Tasks:**
  1. Run full backend pytest suite (target: 52+ tests, 0 failures).
  2. Run full frontend vitest suite (target: 20+ tests, 0 failures).
  3. Run Playwright route smoke test across 3 viewports: Desktop (1440px), Tablet (820px), Mobile (390px).
  4. Run automated retrieval benchmark script (`scripts/run_retrieval_benchmark.py`):
     - Compute Precision@1, Precision@4, Recall@4, MRR, Citation Correctness, Groundedness Score, Abstention Accuracy across 10 benchmark queries.
     - Execute 4-way ablation study:
       1. Baseline Dense FAISS
       2. With Conversational Query Rewriting
       3. With Hybrid Cross-Encoder Reranking
       4. Full LangGraph Pipeline (Rewrite + Retrieve + Rerank + Evidence Gate + Groundedness Check)
     - Record measured latency percentiles (p50, p90, p99).
  5. Save measured results to `docs/benchmark-evaluation-results.json` and update `docs/evaluation.md`.
- **Deliverables:** All tests passing, reproducible benchmark metrics.

### Phase G5: Documentation and Submission Pack
- **Objective:** Finalize all documentation, speaking guide, demo video script, and mentor inquiry.
- **Tasks:**
  1. Update `docs/EXPLAIN.md` to cover all PDF "you will be expected to explain" points:
     - System architecture & component justifications (FastAPI, React, LangGraph, FAISS).
     - Multi-stage retrieval quality funnel.
     - Hallucination mitigation strategy (XML isolation, citation validation, groundedness judge).
     - Failure modes & recovery mechanisms.
  2. Finalize `docs/demo-video-script.md`:
     - 4:15 timestamped demonstration script across 7 scenes.
  3. Finalize `docs/mentor-validation-inquiry.md`:
     - Professional validation email draft addressed to `g2doubts@shadowfox.in`.
  4. Update root `README.md` and `CHANGELOG.md` with verified test counts and release notes.
- **Deliverables:** Master documentation suite, submission checklist, video script.

### Phase G6: Security Pass & Go-Live
- **Objective:** Complete end-to-end security audit and tag production release.
- **Tasks:**
  1. Python security audit: `pip-audit -r backend/requirements.txt` (0 CVEs).
  2. Frontend security audit: `npm --prefix frontend audit` (0 CVEs).
  3. Secrets scan: `detect-secrets scan` (0 exposed secrets).
  4. Git commit history audit for credentials or leaked keys.
  5. Security headers audit: CSP, X-Content-Type-Options, X-Frame-Options, `Cache-Control: no-store` on private endpoints.
  6. Tag release `v1.3.0` on `main`.
- **Deliverables:** `docs/security-review.md`, git tag `v1.3.0`.

---

## 3. Retrieval Evaluation Plan

### 3.1 Benchmark Dataset
- **Corpus:** 4 authentic benchmark documents written for NexusRAG under CC BY 4.0:
  - `ai_system_architecture_whitepaper.pdf` (10 chunks)
  - `clean_energy_report_2024.txt` (6 chunks)
  - `corporate_governance_report.txt` (5 chunks)
  - `distributed_systems_consensus_brief.md` (5 chunks)
  - **Total Workspace Corpus:** 26 indexed chunks.
- **Query Set:** 10 curated evaluation queries:
  - 6 domain-specific fact retrieval queries with ground-truth chunk IDs.
  - 2 multi-turn conversational follow-up queries requiring anaphora resolution.
  - 2 out-of-domain unanswerable queries (e.g. quantum entanglement, warp drives) testing abstention.

### 3.2 Quantitative Metrics Computed
- **Precision@1:** Fraction of queries where the top retrieved chunk is relevant.
- **Precision@4:** Fraction of the top 4 retrieved chunks that are relevant.
- **Recall@4:** Fraction of all relevant ground-truth chunks retrieved in top 4.
- **Mean Reciprocal Rank (MRR):** Average of reciprocal rank of the first relevant chunk.
- **Citation Correctness:** Percentage of citations in generated answers that map to valid retrieved chunks.
- **Grounded Answer Correctness:** Evaluator verification that answer claims are supported by cited passages.
- **Abstention Accuracy:** True-negative rate on unanswerable queries.
- **Latency Percentiles:** p50, p90, p99 measured in milliseconds.

### 3.3 4-Way Ablation Matrix
| Configuration | Precision@1 | Recall@4 | MRR | Evidence Gate Accuracy | p50 Latency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A: Baseline FAISS (No rewrite, No rerank)** | *Measured* | *Measured* | *Measured* | *Measured* | *Measured* |
| **B: Rewriter Only + FAISS** | *Measured* | *Measured* | *Measured* | *Measured* | *Measured* |
| **C: FAISS + Hybrid Reranker** | *Measured* | *Measured* | *Measured* | *Measured* | *Measured* |
| **D: Full Pipeline (Rewriter + FAISS + Reranker + Evidence Gate)** | *Measured* | *Measured* | *Measured* | *Measured* | *Measured* |

*Zero-Mock Guarantee: All values in the final report will be directly computed by running `scripts/run_retrieval_benchmark.py` against the running instance.*

---

## 4. `docs/EXPLAIN.md` Outline (Interview Defense Guide)

1. **System Architecture Overview:**
   - Architectural justification: Why FastAPI over Flask/Django, why React SPA over Streamlit, why LangGraph over basic sequential chains, why FAISS `IndexIDMap2` over naive arrays.
2. **Multi-Stage Retrieval Quality Funnel:**
   - Query rewrite -> FAISS dense cosine retrieval -> BM25 lexical hybrid reranking -> Evidence sufficiency gating.
3. **Hallucination Mitigation Architecture:**
   - Strict XML context boundary isolation (`<context>` tags).
   - Server-side citation parsing and stripping of unretrieved passage indices.
   - Groundedness evaluation judge with bounded retry loop (max 1 retry).
4. **Production Engineering & Reliability:**
   - SQLite WAL default for zero-config portability + PostgreSQL 16 container for production scale.
   - HttpOnly secure cookies + double-submit CSRF tokens.
   - Atomic vector index persistence (`.tmp` write + POSIX rename).
   - Startup index drift recovery reconciling database chunks with FAISS vector IDs.
5. **Interview-Ready Speaking Script:**
   - Structured answers to the common interview questions:
     - "Why didn't you just use an off-the-shelf framework like LlamaIndex or simple LangChain?"
     - "How do you guarantee that citations aren't made up by the LLM?"
     - "How does the system handle vector deletion when documents are removed?"

---

## 5. Demonstration Video Script Outline (3 to 5 Minutes)

- **Total Duration:** 4 minutes 15 seconds (255 seconds).
- **Format:** High-definition screen recording with voiceover commentary.
- **Scene Breakdown:**
  - **Scene 1 (0:00 - 0:35): Problem & Architecture Overview.** Show Landing Page and architecture diagram; explain the need for auditable, reference-grounded RAG.
  - **Scene 2 (0:35 - 1:15): Multi-Format Ingestion & Dynamic Dashboard.** Show 1-click sample loading and custom file upload across PDF, TXT, MD; demonstrate 26 chunks indexed into FAISS.
  - **Scene 3 (1:15 - 2:05): Research Inquiry & Conversational Rewriting.** Ask "What is Raft leader election?", then follow up with "What is its timeout interval?"; highlight live query rewrite in action.
  - **Scene 4 (2:05 - 2:45): Citation Grounding & Document Reader.** Click inline citation `[1]`; watch Document Reader open exact PDF page and text offset with anchored quote popover.
  - **Scene 5 (2:45 - 3:25): Retrieval Inspector & Execution Telemetry.** Inspect the full 9-node LangGraph trace, per-node millisecond timings, and candidate vs reranked chunk scores.
  - **Scene 6 (3:25 - 3:55): Out-of-Domain Abstention & Live Settings.** Ask an unanswerable science-fiction question; show clean abstention without hallucination; adjust Top-K and Evidence Gate sliders in Settings.
  - **Scene 7 (3:55 - 4:15): Engineering Rigor & Production Proof.** Show Docker Compose setup, 72+ passing automated tests, 0 security vulnerabilities, and GitHub repository.

---

## 6. Submission Checklist & Mentor Communication

### 6.1 Mentor Inquiry (`g2doubts@shadowfox.in`)
- Clarification on Option A (submitting the full enterprise-grade NexusRAG repository containing all beginner, intermediate, and advanced capabilities) vs Option B (splitting into subfolders).
- Draft email included in `docs/mentor-validation-inquiry.md` ready for candidate review and transmission.

### 6.2 Pre-Submission Verification Checklist
- [ ] Render crash `selectedDocs` eliminated with regression test.
- [ ] ESLint `no-undef` wired into build pipeline; build fails if undefined variable exists.
- [ ] Error boundary provides safe "Try again" and non-destructive "Reset local view".
- [ ] All sample document descriptions unified under CC BY 4.0 in `sampleDocuments.js`.
- [ ] Landing page fake browser frame and unowned domain removed.
- [ ] All public screenshots recaptured by script from running application.
- [ ] All 20 Advanced Level matrix rows marked Pass with concrete evidence.
- [ ] Zero static data, zero fake mock embeddings, zero hallucinated citations.
- [ ] 100% passing test battery (pytest + vitest + Playwright route smoke test).
- [ ] 0 CVEs in pip-audit and npm audit; 0 secrets in detect-secrets.
- [ ] Timed 3 to 5 minute demonstration video recorded and uploaded to Google Drive.
- [ ] Official submission form completed with GitHub repo and Google Drive video link.

---

## 7. STOP & AWAIT APPROVAL
In strict compliance with Rule 3 ("Plan first. Deliver Steps 1 and 2, then wait for my approval. Stop after each phase with a report"):
- Steps 1 and 2 are complete.
- `docs/round4-proof.md` and `docs/round4-plan.md` are persisted.
- **Awaiting user approval before proceeding to Phase G1 (Crash and Stability).**

