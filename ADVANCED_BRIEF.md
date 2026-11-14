# ADVANCED_BRIEF.md: ShadowFox Advanced-Level AI Engineer Track Brief

The official ShadowFox PDF is the primary source of requirements. Anything in my earlier long spec that is stricter than the PDF (React instead of Streamlit, PostgreSQL, a landing page, a design system) is my own choice. It must still be documented honestly, but it never outranks a PDF requirement.

NexusRAG now has: a public site separate from the app, a dashboard, an onboarding checklist, a knowledge base page, a research desk, a document reader, a retrieval inspector, and a Settings page with editable top-K, rerank, evidence, and groundedness controls. Several screenshots show real data (a run in the inspector with an original and a rewritten query), which is good progress.

Still wrong or unproven: a public screenshot shows the Document Reader failing to load a document, the sample documents' provenance is misdescribed, a "Local Offline Mode" exists whose behaviour is unknown, some UI is static while labelled as dynamic, and most requirements have not been proven by evidence.

You act as a QA Lead, AI/RAG Engineer, Staff Full-Stack Engineer, Security Engineer, and Technical Writer.

## Rules
- Evidence or it does not count. Every requirement gets Pass (verified by running it or reading the code, with the proof cited), Partial, Fail, or Not verified. Proof is a file path and lines, a test name, a command with real output, or a screenshot. Never write that something works unless you ran it.
- Run the real product with a valid provider key: upload PDF, Markdown, and TXT files, ask real questions, open citations, force failures, restart, delete, reindex, and test at 1440, 820, and 390 px.
- Plan first. Deliver Steps 1 and 2, then wait for my approval. Stop after each phase with a report.
- Use current official documentation and verify every model ID, limit, and price from the provider's official pages on the day you implement. Use the frontend-design skill, Playwright MCP or Claude in Chrome, and a docs MCP. Tell me what is missing.
- Never print or commit secrets. Anything needing my accounts or key: give exact numbered steps. Update CLAUDE.md at every phase end.

---

## 1. ADVANCED-LEVEL TRACEABILITY MATRIX REQUIREMENTS

### 1.1 The PDF's "typically include" list (R1 to R14)
- **R1: Multi-format document ingestion (PDF, TXT, Markdown):** Upload one of each plus a multi-file batch. Show corrupted, empty, scanned (no text), duplicate, and spoofed-extension files being handled with clear errors.
- **R2: Parsing and preprocessing:** Show extracted text, page boundaries, cleaning and normalisation, empty-page handling, and stored page and character offsets.
- **R3: Chunking strategy:** Show configurable size and overlap, the tokenizer used and why, chunk metadata, and tests. Use documents long enough to produce many chunks.
- **R4: Embedding generation:** A real embedding call for documents and queries with a current, supported model. Consistent model and dimension. Index refuses a mismatched model.
- **R5: Vector indexing and search:** FAISS index creation, search, persistence, reload after restart, ID mapping, delete, and reindex without duplicates (prove each).
- **R6: Document-scoped retrieval:** Ask the same question with different scopes and show different results. Prove nothing leaks across scopes or visitors.
- **R7: Grounded answer generation:** Controlled prompt, evidence only, insufficient-evidence abstention. Show an answerable and an unanswerable question.
- **R8: Context display or citation support:** Citations map to real retrieved chunks, open the exact page or offset in the reader, and bad citations are stripped (force one).
- **R9: Query rewriting or refinement where useful:** Follow-up question rewritten using conversation history. Clear questions skipped with a recorded reason.
- **R10: Reranking or retrieval improvement:** A real reranking step (method documented), visible before and after ordering, and a measured effect in the evaluation.
- **R11: Validation using typed schemas:** Pydantic models for requests, responses, file metadata, and workflow state, with structured error responses (show a rejected malformed request).
- **R12: Streaming or responsive answer delivery:** Streamed tokens through the API and UI, stage events, interruption and cancel handling, final citations in the last event.
- **R13: Clean API or app structure:** Versioned routes, OpenAPI docs, separation of ingestion, retrieval, and generation modules, no giant files.
- **R14: Containerized setup for reproducibility:** docker compose up from a clean clone works, health checks pass, data survives restart, .env.example documents variables.

### 1.2 The PDF's workflow and quality expectations
- **W1: Agentic or multi-step workflow:** LangGraph with meaningful nodes (validate, rewrite, retrieve, rerank, evidence check, abstain, generate, validate citations, validate groundedness, finalise), conditional routing, and bounded retries. Show a graph diagram generated from the real graph and a real trace of at least two different paths (answer, abstain).
- **W2: Production-style thinking:** clear architecture, modular components, reliable input handling, well-structured request and response models, separation of ingestion, retrieval, and generation responsibilities.
- **Q1: AI quality through retrieval orchestration, prompt control, context filtering, validation checks:** show each mechanism and measure its effect.
- **O1: Observability (optional in the PDF, a differentiator here):** retrieved chunk display, confidence-style indicators (labelled for what they are), structured responses, and the retrieval inspector.
- **E1: Explain it:** the architecture, why each component was used, how retrieval quality was handled, how hallucinations were reduced, and how the project goes beyond a demo. Create `docs/EXPLAIN.md`.
- **S1: Submission:** GitHub repository, plus a mandatory 3 to 5 minute self-recorded video shared by Google Drive link in the submission form.

### 1.3 Candidate innovations (Record as deviations, never as PDF failures)
- React and TypeScript / JSX front end instead of Streamlit.
- SQLite 3 WAL by default + PostgreSQL 16 Alpine container.
- Decoupled public marketing site at `/` from app shell at `/app/*`.
- Custom Warm Sand & Deep Slate design system.

