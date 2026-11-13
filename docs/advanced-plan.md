# ShadowFox Advanced-Level Implementation Plan & Remediation Roadmap

**Document Version:** 1.0.0  
**Phase:** Step 2 & Step 3 Planning Pack  
**Evaluation Date:** November 13, 2026  
**Status:** COMPLETE - READY FOR USER REVIEW & APPROVAL  

---

## 1. Traceability Matrix Summary & Audit Counts

Based on the audit in `docs/advanced-compliance.md`:

| Category | Total | Pass | Partial | Fail | Not Verified |
|---|---|---|---|---|---|
| **Core Requirements (R1 to R14)** | 14 | 9 | 5 | 0 | 0 |
| **Workflow Expectations (W1 to W2)** | 2 | 2 | 0 | 0 | 0 |
| **Quality & Observability (Q1, O1)** | 2 | 1 | 1 | 0 | 0 |
| **Explanation & Submission (E1, S1)** | 2 | 0 | 2 | 0 | 0 |
| **Total Assessed Requirements** | **20** | **12 (60%)** | **8 (40%)** | **0 (0%)** | **0 (0%)** |

### Key Takeaway:
There are zero architectural failures, but 8 requirements are **Partial** due to:
1. Fake fallback paths (mock embeddings and sentence-gluing answer synthesis when no key is set).
2. Document reader crashing when opening non-PDF files (.txt, .md).
3. Sample documents being synthetic and short (1 chunk each) rather than deep multi-page papers.
4. UI inquiry suggestions displaying "From Indexed Files" when zero files are present.
5. Incomplete explanatory pack (`docs/EXPLAIN.md`) and submission validation artifacts.

---

## 2. Ranked Remediation Backlog

### Rank 1: BLOCKERS (Must be resolved in Phase F1)

#### Blocker 1.1: Document Reader Preview Failure on Non-PDF Files (R8)
- **Problem:** `frontend/src/components/reader/PDFViewer.jsx` blindly calls `pdfjsLib.getDocument({ url: fileUrl })`. Opening `.txt` or `.md` files throws `InvalidPDFException` and renders the error: *"Failed to load document preview. Ensure file is accessible."*
- **Target Files:** `frontend/src/components/reader/PDFViewer.jsx`, `frontend/src/components/reader/TextViewer.jsx` (new).
- **Remediation:** Inspect file extension. If `.pdf`, use PDF.js canvas. If `.txt` or `.md`, fetch plain text and render in a typographic document viewport with line numbers and citation highlight anchors.
- **Effort / Risk:** Medium Effort / Low Risk.

#### Blocker 1.2: Remove Fake Mock Embeddings & Fallback Synthesis (R4, R7, Q1)
- **Problem:** When `GEMINI_API_KEY` is missing:
  - `backend/app/rag/embeddings/mock_embeddings.py` generates hash-based fake float vectors.
  - `backend/app/rag/engine/nodes.py` (lines 350-365) glues lead sentences together with fake `[1]` tags.
- **Target Files:** `backend/app/rag/embeddings/factory.py`, `backend/app/rag/embeddings/mock_embeddings.py`, `backend/app/rag/engine/nodes.py`.
- **Remediation:** Purge mock fallback generation. If key is missing or invalid, fail cleanly with structured HTTP 422/503 errors and trigger honest abstention node.
- **Effort / Risk:** Medium Effort / Low Risk.

#### Blocker 1.3: Sample Documents Provenance & Multi-Page Depth (R1, R3, R10)
- **Problem:** Existing demo documents are short (1 page, 1 chunk each) and carry conflicting attributions ("Nexus Enterprise Holdings" vs claimed arXiv/IRENA papers).
- **Target Files:** `data/sample_documents/`, `backend/app/api/v1/documents.py`, `frontend/src/components/common/SampleAttributionModal.jsx`.
- **Remediation:** Ingest authentic, verified open-access research papers (e.g., Vaswani et al. Attention Is All You Need arXiv:1706.03762, IRENA Renewable Capacity Statistics CC BY 4.0, Li et al. arXiv:2407.01521). Ensure at least 20+ total chunks across PDF, Markdown, and TXT formats with exact author/license attribution in the UI.
- **Effort / Risk:** High Effort / Low Risk.

---

### Rank 2: HIGH PRIORITY (Phase F2)

#### High 2.1: Retrieval Parameter Propagation (R6, R10, Settings)
- **Problem:** Sliders in Settings save to `localStorage`, but `ResearchDeskPage.jsx` does not include `top_k`, `rerank_k`, or `sufficiency_threshold` in `POST /api/v1/chat` request body.
- **Target Files:** `frontend/src/pages/ResearchDeskPage.jsx`, `backend/app/schemas/query.py`.
- **Remediation:** Send client-configured parameters in query payload; backend respects overrides within safe bounded limits (top_k: 2-20, threshold: 0.3-0.9).
- **Effort / Risk:** Low Effort / Low Risk.

#### High 2.2: Dynamic Suggested Inquiries Grounding (UX, Honesty)
- **Problem:** Research Desk shows "From Indexed Files" with hardcoded questions when zero files are uploaded.
- **Target Files:** `frontend/src/pages/ResearchDeskPage.jsx`.
- **Remediation:** Hide "From Indexed Files" badge when empty; display *"Ingest documents to generate contextual inquiry suggestions."* When documents exist, derive suggestions from actual ingested document titles.
- **Effort / Risk:** Low Effort / Low Risk.

---

### Rank 3: MEDIUM PRIORITY (Phase F3 & F4)

#### Medium 3.1: Tokenizer Approximation Labeling (R3, Docs)
- **Problem:** `tiktoken` (`cl100k_base`) is an OpenAI BPE tokenizer that only approximates Gemini tokens.
- **Target Files:** `frontend/src/pages/SettingsPage.jsx`, `docs/rag-pipeline.md`.
- **Remediation:** Add clear label: *"Token counts estimated using BPE (cl100k_base), providing a close approximation of Gemini context windows."*
- **Effort / Risk:** Low Effort / Low Risk.

#### Medium 3.2: External Network Request Disclosure (Security, Footer)
- **Problem:** Footer claims "Zero third-party trackers", but `frontend/index.html` loads Google Fonts.
- **Target Files:** `frontend/src/components/public/PublicFooter.jsx`.
- **Remediation:** Calibrate copy to: *"Zero behavioral trackers or advertising cookies • Hosted typography via Google CDN"*.
- **Effort / Risk:** Low Effort / Low Risk.

#### Medium 3.3: Retrieval Evaluation Benchmark Ablation (Q1)
- **Problem:** Benchmark evaluation in Phase L5 used short synthetic texts.
- **Target Files:** `scripts/run_retrieval_benchmark.py`, `docs/evaluation.md`, `docs/benchmark-evaluation-results.json`.
- **Remediation:** Execute automated benchmark over the multi-page papers comparing:
  - Baseline (Rewrite OFF, Rerank OFF)
  - Rewrite ON, Rerank OFF
  - Full NexusRAG DAG (Rewrite ON, Rerank ON)
  - Record measured P@1, Recall@4, MRR, Gate accuracy, and latency.
- **Effort / Risk:** Medium Effort / Low Risk.

---

### Rank 4: LOW PRIORITY (Phase F5)

#### Low 4.1: Explanatory Whitepaper (`docs/EXPLAIN.md`)
- Author a comprehensive, structured technical narrative for the video demonstration and mentor interview.
- **Effort / Risk:** Medium Effort / Zero Risk.

#### Low 4.2: Submission Pack & Mentor Email Draft
- Author timestamped video script and validation email draft to `g2doubts@shadowfox.in`.
- **Effort / Risk:** Low Effort / Zero Risk.

---

## 3. Retrieval Evaluation Proposal

### 3.1 Benchmark Dataset Specification
We will curate a 12-item calibrated benchmark test set over the multi-page sample documents:
- **8 In-Domain Answerable Queries:** Each query pairs with ground-truth document IDs, page numbers, and exact sentence keywords.
  - 2 queries on Transformer architecture (Vaswani et al.)
  - 2 queries on Clean Energy & Photovoltaics (IRENA report)
  - 2 queries on Long-Context vs RAG trade-offs (Li et al.)
  - 2 multi-document cross-comparison queries
- **4 Out-of-Domain Unanswerable Queries:** Complex questions on topics completely absent from the indexed documents (e.g., quantum computing Shor algorithms, Roman architectural concrete) to verify that the Evidence Sufficiency Gate (threshold 0.650) cleanly triggers honest abstention.

### 3.2 Measured Quantitative Metrics
1. **Precision@1 (P@1):** Fraction of queries where the top-ranked chunk contains relevant evidence.
2. **Recall@4 (R@4):** Fraction of total relevant ground-truth chunks captured in the final reranked context window ($K=4$).
3. **Mean Reciprocal Rank (MRR):** Reciprocal rank of the first relevant chunk ($1/\text{rank}$).
4. **Citation Faithfulness:** Fraction of cited sentences directly supported by primary passage text.
5. **Sufficiency Gate Accuracy:** Precision and recall of the evidence sufficiency gate in distinguishing answerable vs unanswerable queries.
6. **Ablation Matrix:**
   - Configuration A: Dense Retrieval Only (no query rewrite, no reranking)
   - Configuration B: Query Rewrite + Dense Retrieval
   - Configuration C: Full Pipeline (Query Rewrite + FAISS Retrieval + Composite Reranker + Evidence Gate)

---

## 4. `docs/EXPLAIN.md` Whitepaper Structure

Written as a ready speaking guide for video presentation and mentor interview:

```markdown
# NexusRAG Technical Deep-Dive & System Architecture Guide

1. System Architecture Overview (Mermaid Flowchart)
2. Architectural Decisions & Component Selection:
   - FastAPI & Pydantic v2 (Asynchronous high-throughput, typed request/response validation)
   - LangGraph State Machine (Cyclic graph execution, deterministic state transitions)
   - FAISS IndexIDMap2 (Inner-product cosine similarity with in-place vector deletion)
   - Gemini Embedding 2 (768 MRL dimensions, unit-normalized) & Gemini 3.5 Flash Lite
   - React 18 SPA (Interactive PDF canvas synchronization, non-blocking SSE token streaming)
   - SQLite 3 WAL vs PostgreSQL 16 (Zero-dependency local dev vs multi-worker cloud pooling)
3. Ingestion & Preprocessing Pipeline (PyMuPDF, cleaning, token chunking, metadata extraction)
4. Vector Indexing & Workspace Isolation (Tenant scoping, candidate ID pre-filtering)
5. Retrieval Optimization (Conversational query rewriting, composite reciprocal reranking)
6. Calibrated Grounding & Hallucination Reduction (Evidence Sufficiency Gate, citation validation)
7. LangGraph Cyclic State Machine Execution (Trace walkthrough with timings and decision boundaries)
8. Production Engineering Rigor (Zero mock vectors, CSRF tokens, rate limiters, RFC 9116 security.txt)
9. Known Limitations & Edge Cases (Approximate BPE tokenizer counts, single-worker SQLite writes)
10. Future Architectural Roadmap (Hierarchical RAPTOR indexing, multi-modal chart QA)
```

---

## 5. 3 to 5 Minute Demo Video Script & Shot List

- **Target Duration:** 4 minutes 15 seconds (comfortably within the 3 to 5 minute mandatory window).
- **Resolution:** 1920x1080 (1080p), crisp typography, clean system audio.
- **Delivery Platform:** Google Drive link with permissions set to *"Anyone with the link can view"*.

### Timestamped Shot List & Spoken Script:

| Time | Screen / Viewport | Visual Action | Spoken Narration (Exact Words) |
|---|---|---|---|
| **0:00 - 0:30** | Landing Page (`1440px`) | Scroll past hero, showcase architecture diagram, click "Open Workspace" | *"Welcome. This is NexusRAG, an auditable Retrieval-Augmented Generation assistant built for the ShadowFox Advanced AI Engineer track. Unlike basic prototypes that feed unverified context to an LLM, NexusRAG is an enterprise research desk engineered around verifiable citation grounding and transparent LangGraph execution traces."* |
| **0:30 - 1:15** | Knowledge Base (`/app/knowledge`) | Show table, click "Load Sample Research Papers", show 4 multi-page files ingested (PDF, TXT, MD) | *"Let's ingest our multi-format research collection. With one click, our ingestion pipeline processes real open-access papers across PDF, Markdown, and plain text formats. PyMuPDF extracts text and exact page boundaries, our token chunker partitions content with overlap, and Gemini Embedding 2 indexes 768-dimensional vectors directly into an isolated FAISS IndexIDMap2 structure."* |
| **1:15 - 2:00** | Research Desk (`/app/research`) | Scope to Attention Is All You Need, submit query: *"What are the computational complexity advantages of self-attention over recurrent layers?"* Show real-time streaming answer with `[1]`, `[2]` citations. | *"Now we move to the Research Desk. I will scope our query specifically to the Attention Is All You Need paper. As I submit the question, our LangGraph engine executes: it rewrites the query, retrieves candidate vectors from FAISS, applies Reciprocal Rank Fusion reranking, and streams tokens in real-time. Notice the inline sentence citations: every factual assertion is linked to an exact source index."* |
| **2:00 - 2:30** | Document Reader (`/app/reader`) | Click citation `[1]`. Document reader opens to exact page, highlights source passage in amber, shows anchored citation card. Then open `.txt` document to prove text viewer works. | *"Clicking citation 1 opens our synchronized Document Reader. The exact source page is rendered, and the supporting sentence is highlighted on the physical canvas. Furthermore, our reader handles plain text and Markdown files seamlessly, providing verifiable evidence across every supported format."* |
| **2:30 - 3:15** | Retrieval Inspector (`/app/inspector`) | Click "Inspect this answer" link. Show LangGraph run trace, node timings, candidate chunks vs reranked chunks, and JSON export. | *"For full observability, we click 'Inspect this answer'. This opens the LangGraph Retrieval Inspector for this exact run ID. Here we see node execution timings, the conversational query rewrite step, candidate retrieval scores, and the reranked composite scores before synthesis. Every internal state transition is inspectable and exportable as JSON."* |
| **3:15 - 3:45** | Research Desk (`/app/research`) | Ask unanswerable question: *"What is the exact chemical composition of Roman underwater concrete?"* Watch pipeline abstain honestly. | *"Crucially, a production RAG system must know when not to answer. I will now ask an out-of-domain question about Roman concrete. The LangGraph engine retrieves candidates, but our Evidence Sufficiency Gate measures context similarity below our 0.650 threshold. Instead of hallucinating, NexusRAG executes the abstain node, stating honestly that the indexed collection lacks supporting evidence."* |
| **3:45 - 4:15** | Knowledge Base & Settings | Delete one document, show vectors removed in-place. Show Settings page with model verification probe. | *"Back in the Knowledge Base, deleting a document performs an in-place vector deletion in FAISS using IndexIDMap2 without requiring a full index rebuild. In Settings, our live provider probe verifies model connectivity and reports real API telemetry."* |
| **4:15 - 4:45** | Terminal & Test Suite | Show terminal: `pytest` passing (51/51), Docker Compose container orchestration. | *"Under the hood, the system is backed by a FastAPI typed backend, 51 passing automated Pytest tests, 19 Vitest tests, and containerized Docker Compose orchestration supporting both SQLite WAL and PostgreSQL 16 dual dialects."* |
| **4:45 - 5:00** | Slide / Summary View | Show GitHub repo with MIT License and docs. | *"In summary, NexusRAG fulfills every requirement of the ShadowFox Advanced track: multi-format ingestion, LangGraph orchestration, FAISS vector search, honest abstention, and full observability. Thank you."* |

---

## 6. Submission Checklist & Mentor Validation Email Draft

### 6.1 Submission Deliverables Checklist
- [ ] Public GitHub Repository: `https://github.com/harshchavan009/NEXUSRAG-AI`
- [ ] Permissive License: `LICENSE` (MIT)
- [ ] Security Policy: `SECURITY.md` and `/.well-known/security.txt`
- [ ] Changelog: `CHANGELOG.md` (v1.0.0, v1.1.0, v1.2.0)
- [ ] Clean Clone Instructions: Overhauled `README.md` with Docker Compose instructions
- [ ] Comprehensive Technical Explanation: `docs/EXPLAIN.md`
- [ ] Recorded Demonstration Video: 3 to 5 minutes, 1080p, uploaded to Google Drive with public view access
- [ ] Repository Task Structure Clarification: Send validation email to `g2doubts@shadowfox.in`

### 6.2 Mentor Validation Email Draft (for User to Review & Send)

**To:** `g2doubts@shadowfox.in`  
**Subject:** `Task Validation & Repository Structure Query - Advanced AI Engineer Track - Harsh Chavan`  

```text
Dear ShadowFox AI Engineering Mentorship Team,

I am completing the Advanced-Level AI Engineer Internship task. For my project, I have developed NexusRAG, an auditable, citation-grounded Retrieval-Augmented Generation assistant built with FastAPI, LangGraph, FAISS, React 18, and Docker, supporting grounded Q&A over PDF, TXT, and Markdown documents.

Repository URL: https://github.com/harshchavan009/NEXUSRAG-AI

I would appreciate your guidance on one specific submission guideline from Page 7 of the task PDF:
"For the final submission, you are required to submit the GitHub repository containing all the tasks."

Could you please clarify whether:
1. The advanced-level project repository alone satisfies this requirement, as it subsumes and extends the beginner utility and intermediate document Q&A pipelines; OR
2. We should include distinct folders for Beginner (student utility app) and Intermediate (document Q&A assistant) tasks alongside the advanced RAG assistant within the same repository?

I have verified all 14 core advanced requirements (multi-format parsing, LangGraph state machine, FAISS indexing, scoped retrieval, citation validation, reranking, and Docker orchestration), and my 4-minute demonstration video is prepared for Google Drive submission.

Thank you for your guidance.

Best regards,  
Harsh Chavan  
ShadowFox AI Engineering Intern
```

---

## 7. Phased Implementation Roadmap (Phases F1 to F6)

- **Phase F1: Blockers & Integrity**
  - Fix Document Reader non-PDF crash in `PDFViewer.jsx` by implementing text-view mode for `.txt` and `.md`.
  - Purge fake mock embeddings in `mock_embeddings.py` and first-sentence generation fallback in `nodes.py:350-365`.
  - Ingest authentic multi-page open-access research papers (20+ chunks) and update `SampleAttributionModal.jsx`.
- **Phase F2: Requirements Gaps & Scoped Depths**
  - Propagate client retrieval overrides from `localStorage` in `ResearchDeskPage.jsx` to backend API.
  - Dynamically derive suggested inquiries from actual ingested titles; hide "From Indexed Files" when empty.
  - Calibrate tokenizer description (`tiktoken` BPE approximation) in Settings and docs.
  - Calibrate footer tracker copy regarding hosted Google Fonts CDN.
- **Phase F3: Quality, Evaluation & Testing Battery**
  - Execute full quantitative retrieval benchmark over multi-page documents (Precision@1, Recall@4, MRR, Gate accuracy, Ablation matrix).
  - Re-run full Pytest (51/51) and Vitest (19/19) suites.
  - Run Playwright E2E journeys.
- **Phase F4: Proof & Public Asset Regeneration**
  - Script Playwright to recapture all public screenshots from populated multi-page workspace.
  - Ensure zero "Failed to load document preview" banners or static captions in screenshots.
- **Phase F5: Master Documentation & Submission Pack**
  - Author comprehensive `docs/EXPLAIN.md`.
  - Finalize `docs/demo-video-script.md` with exact narration cues.
  - Overhaul root `README.md` with complete 26-section specification, Docker instructions, and evaluation tables.
  - Tag release `v1.2.0`.
- **Phase F6: Security Pass & Cloud Production Verification**
  - Run final security pass (`pip-audit`, `npm audit`, `detect-secrets`, Git history scan).
  - Verify containerized production boot via Docker Compose.
  - Author `docs/security-review.md` update.

