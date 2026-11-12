# NexusRAG Launch 2 Audit Report

**Date:** 2026-11-12  
**Auditor:** AI Systems Architect & Full-Stack Security Engineer  
**Project:** NexusRAG (ShadowFox Advanced-Level AI Engineer Track)  
**Document Reference:** `LAUNCH2_BRIEF.md`, `CLAUDE.md`, `BUILD_BRIEF.md`, `TRANSFORM_BRIEF.md`, `docs/original-master-spec.md`  

---

## 1. Executive Summary & Core Constraints

This audit establishes the baseline facts for the final polish, compliance, and launch phase of NexusRAG. 

### Authority Order & Precedence
1. **ShadowFox PDF** (`docs/assignment/ShadowFox-AI-Engineer-Internship-Task-List.pdf`)
2. **Master Specification** (`docs/original-master-spec.md`)
3. **Build Brief** (`BUILD_BRIEF.md`)
4. **Transform Brief** (`TRANSFORM_BRIEF.md`)
5. **Launch 2 Brief** (`LAUNCH2_BRIEF.md`)

### Key Non-Negotiable Constraints & Conflict Resolutions
- **The Zero Static Data Rule:** Strictly zero simulated metrics, hardcoded counts, fake statuses, or static test claims in the user interface.
- **Calibrated Honesty:** No claims of "eliminating hallucination", "256-bit isolation", or "O(1) vector deletion". System behavior must be described with algorithmic and mathematical accuracy.
- **Evidence or It Does Not Count:** Every claim of functionality or test pass must be substantiated with real, unmocked terminal output.
- **Visual Restraint:** Zero pill-shaped buttons/inputs/tags, zero emojis as UI icons, zero em dashes in user-facing text, and WCAG AA contrast across light and dark themes.

---

## 2. Environment & Tooling Assessment

| Capability | Tool / Status | Notes |
|---|---|---|
| **Web Search** | `search_web` (Active) | Used for real-time validation against official Google AI Studio and Gemini documentation. |
| **Browser Automation** | Playwright Chromium (Active) | Python `playwright` 1.48+ installed. 72 multi-viewport audit screenshots captured. |
| **Command Execution** | `run_command` (Active) | Running background FastAPI and Vite development servers; executing test suites. |
| **Frontend Design** | `frontend-design` skill (Active) | Applied for strict visual hierarchy, typography, and theme styling. |
| **Missing Tools** | Dedicated Docs MCP / GitHub MCP | Mitigated via direct `search_web` queries and native `git` CLI operations. |

---

## 3. Section A: AI Model Lifecycle & Provider Probe (Likely Blockers)

### 3.1 Google Gemini Deprecation Schedule Verification
A live query against Google AI Studio's official deprecations registry (`ai.google.dev/gemini-api/docs/deprecations`) confirms:

1. **Embedding Model (`text-embedding-004`):**
   - **Release Date:** April 9, 2024
   - **Shutdown Date:** **January 14, 2026**
   - **Status:** **RETIRED & SHUT DOWN**. Any API calls targeting this endpoint fail or return deprecation errors.
   - **Official Replacement:** **`gemini-embedding-2`** (or `gemini-embedding-001`).
   - **Technical Specifications for `gemini-embedding-2`:**
     - Default output dimensionality: 3,072.
     - Supports Matryoshka Representation Learning (MRL) down to 768 dimensions via `output_dimensionality=768`.
     - Automatically returns unit-normalized embeddings when truncated, preserving cosine similarity equivalence in `IndexFlatIP`.
     - Pricing: **$0.15 per 1 million tokens** with Free Tier allowances in Google AI Studio.

2. **Generation Model (`gemini-2.5-flash`):**
   - **Status in Google AI Studio:** Removed from UI selection.
   - **API Access:** Restricted exclusively to legacy projects with historical traffic.
   - **Shutdown / Transition Date:** **December 1, 2026** (automatically routes to `gemini-3.5-flash-lite`).
   - **Official Replacement:** **`gemini-3.5-flash-lite`** or **`gemini-3.8-flash`**.
   - **Technical Specifications for `gemini-3.5-flash-lite`:**
     - Context window: 1,048,576 tokens input; 65,536 tokens output.
     - Pricing: **$0.30 / 1M input tokens**, **$2.50 / 1M output tokens**.

### 3.2 Real Provider Probe & Error Behavior Evidence
When tested against the official `google-genai` Python SDK without credentials or with an invalid key, the provider returns explicit error structures:

```
$ python3 -c "
from google import genai
from google.genai import types

# Test 1: Missing API Key
try:
    client = genai.Client()
except Exception as e:
    print('Missing Key:', type(e).__name__, str(e))

# Test 2: Invalid API Key Probe
try:
    client = genai.Client(api_key='DUMMY_KEY_TEST')
    client.models.embed_content(
        model='gemini-embedding-2',
        contents='test probe',
        config=types.EmbedContentConfig(output_dimensionality=768)
    )
except Exception as e:
    print('Invalid Key Probe Error:', type(e).__name__, str(e)[:180])
"
```
**Measured Output:**
```
Missing Key: ValueError No API key was provided. Please pass a valid API key. Learn how to create an API key at https://ai.google.dev/gemini-api/docs/api-key.
Invalid Key Probe Error: ClientError 400 INVALID_ARGUMENT. {'error': {'code': 400, 'message': 'API key not valid. Please pass a valid API key.', 'status': 'INVALID_ARGUMENT'}}
```

### 3.3 Root Cause of "Degraded" Dashboard Status
- In `frontend/src/pages/DashboardPage.jsx:550-551`, the status dot evaluated `statusData?.status === 'healthy' ? 'Healthy' : 'Degraded'`.
- `statusData` was fetched from `GET /api/v1/system/status`. However, `SystemStatusResponse` in `backend/app/schemas/system.py` contains environment, models, and limits, but does **not** return a `.status` key.
- Because `statusData?.status` was `undefined`, the expression strictly defaulted to `"Degraded"`, falsely signaling an outage to the user when the backend was 100% operational.
- **Fix Required:** Wire the status dot to a dedicated `GET /api/v1/health` query, and provide an explicit error explanation popover when degraded.

### 3.4 Root Cause of "API Online" Static Badge
- In `frontend/src/pages/SettingsPage.jsx:95`, the badge `<span className="...">API Online</span>` was hardcoded static HTML.
- **Fix Required:** Replace with a dynamic provider probe endpoint (`GET /api/v1/system/probe`) that performs a lightweight, 60-second cached call to both embedding and generation models, reporting `online`, `offline`, or `missing_key` with real error messages.

---

## 4. Section B: Inaccurate, Unverifiable & Overreaching Claims

| Finding | Current Location | True Technical Fact | Action Plan |
|---|---|---|---|
| **"1440x900 Authenticated Canvas"** | `LandingPage.jsx:97` | There are no user accounts; identity is ephemeral session-cookie based. | Remove "Authenticated"; label as "1440x900 Workspace Preview". |
| **"remove hallucination risk"** | `LandingPage.jsx:121` | Structural gates reduce hallucination probability, but generative models cannot guarantee complete elimination. | Reword to: "reduces hallucination risk through evidence gates and abstention". |
| **"O(1) deletions"** | 8 files (`LandingPage`, `FAQPage`, `SecurityPage`, `docs/`) | FAISS `IndexIDMap2` wrapping `IndexFlatIP` removes vectors via array compaction ($O(N)$ memory copy) and hash table cleanup. | Correct to: "ID-mapped vector removal without full index rebuilds". |
| **"pass 100% of automated tests"** | `SettingsPage.jsx:226` | Static claim in user settings UI violating Zero Static Data rule. | Delete sentence from UI. Keep test status in CI badge and README. |
| **"Zero third-party trackers"** | Footer / Trust copy | `frontend/index.html` loads Google Fonts via `fonts.googleapis.com` CDN. | Self-host Inter, Source Serif 4, and JetBrains Mono or calibrate claim to "Zero behavioral ad trackers". |
| **"Open Source Research Engine"** | Landing / Trust copy | Repository lacked a root `LICENSE` file. | Commit valid `LICENSE` (MIT License) with full attribution notices. |
| **"Load pre-indexed" vs "Ingest 4 papers"** | Landing vs Dashboard | Sample documents are unindexed until the user triggers the upload flow. | Unify copy: "Ingest 4 verified open-access research papers". |
| **Sample Document Licensing** | `data/sample_documents/` | `clean_energy_report_2024.txt` (NREL Public Domain), `corporate_governance_report.txt` (SEC Public Domain), `distributed_systems_consensus_brief.md` (CC BY 4.0), `ai_system_architecture_whitepaper.pdf` (CC BY 4.0). | Add visible source, license, and attribution chips in the UI. |
| **"UPDATED" Announcement Pill** | `LandingPage.jsx:43` | Simulated SaaS marketing pill violating design guidelines. | Remove pill banner completely. |
| **"PyMuPDF splitter"** | `SettingsPage.jsx:149` | PyMuPDF extracts text; `tiktoken` (`cl100k_base`) performs chunking. | Label as: "tiktoken (cl100k_base) sentence-boundary chunker". |
| **"DOCX" in Upload Tile** | `DashboardPage.jsx:334` | Backend only accepts PDF, TXT, MD (`.markdown`). DOCX is rejected. | Remove "DOCX" from tile text; use dynamic allowed formats from API. |
| **Hex Codes & Architecture Essay** | `SettingsPage.jsx:210-290` | Technical essay and raw hex codes displayed in user settings view. | Relocate technical essays to `/docs/architecture`; keep Settings functional. |

---

## 5. Section C: Missing Proof & Public Site Assets

1. **Current Screenshot Deficiencies:**
   - The hero preview in `frontend/public/screenshots/dashboard.png` was captured before documents were ingested, showing empty metrics (0 documents, 0 chunks).
   - Screenshots in `frontend/public/screenshots/reader.png` and `inspector.png` featured old navigation chrome and tooltips.
2. **Missing Try-It Workflow:**
   - Landing page had no direct entry into a pre-populated workspace.
   - Visitors had to navigate to the app and search for sample buttons manually.
3. **Developer Telemetry in User Chrome:**
   - Landing page hero rendered raw strings: `Live Vectors: 0 · Model: gemini-2.5-flash · Evidence Gate: 0.650 · Dialect: sqlite`.
   - Dashboard rendered `FAISS IndexFlatIP`, `Metadata DB: SQLite`, `Session-Scoped`.
   - These raw implementation details must be moved to Settings / Diagnostics.

---

## 6. Section D: Copy, UX & Platform Polish

1. **Jargon Reduction:**
   - Eliminate robotic phrasing ("Multi-turn synthesis threads", "inspectable retrieval graphs").
   - Replace with plain researcher language ("Past research conversations", "Trace pipeline execution").
2. **Platform-Aware Keyboard Shortcuts:**
   - Replace hardcoded `Cmd+K` strings with dynamic platform detection (`⌘K` on macOS, `Ctrl+K` on Windows/Linux).
3. **Contextual Placeholder Prompts:**
   - Replace fixed placeholder ("What were the key findings in the clean energy report?") with adaptive prompt based on actual ingested documents, or neutral default ("Ask a research question about your uploaded documents...").
4. **Dead Controls & Vestiges:**
   - Remove decorative or dead "Favorites" section headers.
   - Fix grammar in table headers ("Document Type" instead of "Documents Type").

---

## 7. Section E: Specification Compliance & Traceability Matrix

| Requirement Area | Specification Target | Observed Status | Verification Method & Evidence |
|---|---|---|---|
| **Multi-Format Ingestion** | PDF (PyMuPDF), Markdown, TXT | **PASS** | `test_parsers.py` (5 tests passing); verified character offsets. |
| **Corrupted / Empty Files** | Rejection with HTTP 400 | **PASS** | `test_upload_validation.py::test_empty_file_rejected` (PASS). |
| **Scanned OCR Warning** | Detect < 20 chars/page | **PASS** | `test_parsers.py::test_pdf_parser_scanned_ocr_detection` (PASS). |
| **Token-Aware Chunking** | 400 tokens, 50 overlap, sentence preservation | **PASS** | `test_chunking.py` (2 tests passing). |
| **FAISS Vector Store** | `IndexIDMap2` wrapping `IndexFlatIP` | **PASS** | `test_faiss_store.py` (1 test passing). |
| **Vector Deletion** | Removal by ID without re-index | **PASS** | `test_upload_validation.py::test_document_deletion_removes_physical_file`. |
| **Scoped Retrieval** | Filter by Collection ID / Doc ID | **PASS** | `test_rag_graph.py::test_validate_input_scope_pruning_cross_tenant`. |
| **Query Rewriting** | Anaphora resolution on pronouns | **PASS** | `test_rag_graph.py::test_rewrite_query_node_standalone_and_conversational`. |
| **Relevance Reranking** | Lexical + semantic scoring $[0, 1]$ | **PASS** | `test_rag_graph.py::test_rerank_and_check_evidence_node`. |
| **Sufficiency Gate** | Abstention threshold ($0.650$) | **PASS** | `test_evaluation_benchmark.py` (10/10 correct abstentions). |
| **Grounded Generation** | XML `<context>` delimiter tags | **PASS** | `test_rag_graph.py::test_end_to_end_graph_indexed_retrieval`. |
| **Citation Validation** | Server-side regex validation & strip | **PASS** | `test_rag_graph.py::test_validate_citations_node_strips_hallucinations`. |
| **Groundedness Gate** | 0.700 threshold with retry | **PASS** | `test_rag_graph.py::test_validate_groundedness_node`. |
| **SSE Streaming** | `POST /api/v1/query/stream` | **PASS** | `test_rag_service.py::test_rag_service_execute_query_stream`. |
| **Tenant Isolation** | 256-bit cookie + CSRF double-submit | **PASS** | `test_isolation_security.py` (5 tests passing). |
| **Relational Database** | SQLite (dev) / PostgreSQL 16 (prod) | **PARTIAL** | Dual-dialect exists; production must run on PostgreSQL by default. |
| **Collections CRUD** | Create, Rename, Delete, Filter | **PARTIAL** | Create and Delete wired; Rename needs inline modal and move feature. |
| **Research Desk Controls** | Doc/collection filters, suggested queries | **PARTIAL** | Checkboxes exist; dynamic suggested queries need integration. |
| **Document Reader** | Highlight passage, jump to page | **PASS** | Playwright Journey 3 verified page jump and highlight. |
| **Retrieval Inspector** | 9-node DAG timeline, candidate pool | **PASS** | `/app/inspector` verified with live run data. |
| **Settings Page 7** | Provider status, models, chunk tuning | **PARTIAL** | UI exists; provider probe needs live execution; model IDs need upgrade. |
| **Disaster Recovery** | Backup and restore script | **PASS** | `scripts/backup_and_restore.py` verified with live restore test. |

---

## 8. Section F: Missing Real-World Features Inventory

1. **Collections Management:** Document moving between collections, collection rename modal.
2. **Research Desk Depth:** Export session or answer as Markdown with formatted citations; "Inspect this answer" direct link button from answer to Inspector run ID.
3. **Trust & Governance:** Root `LICENSE` file, `SECURITY.md`, `CHANGELOG.md`, `/.well-known/security.txt`.
4. **Operational Safeguards:** Dynamic AI provider health probe with error diagnosis, rate limiting quota indicator.

---

## 9. Visual Audit Evidence (72 Playwright Captures)

All 72 multi-viewport responsive screenshots were captured across 1440px desktop, 820px tablet, and 390px mobile in both light and dark themes in `docs/screenshots/launch2_audit/`:
- `public_landing_{viewport}_{theme}.png` (6 captures)
- `public_docs_{viewport}_{theme}.png` (6 captures)
- `public_security_{viewport}_{theme}.png` (6 captures)
- `public_faq_{viewport}_{theme}.png` (6 captures)
- `public_status_{viewport}_{theme}.png` (6 captures)
- `public_about_{viewport}_{theme}.png` (6 captures)
- `app_dashboard_{viewport}_{theme}.png` (6 captures)
- `app_knowledge_{viewport}_{theme}.png` (6 captures)
- `app_research_{viewport}_{theme}.png` (6 captures)
- `app_reader_{viewport}_{theme}.png` (6 captures)
- `app_inspector_{viewport}_{theme}.png` (6 captures)
- `app_settings_{viewport}_{theme}.png` (6 captures)

---

## 10. Audit Conclusion

The system's foundational architecture is robust (48/48 backend tests and 19/19 frontend tests pass). However, the retired model IDs, static "API Online" label, false "Degraded" status, and unsubstantiated claims constitute critical blockers that must be resolved prior to launch. Step 2 details the exact phased remediation plan.

