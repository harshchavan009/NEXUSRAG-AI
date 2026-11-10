# NEXUSRAG BUILD PROMPT (CLAUDE EDITION): REFERENCE-DRIVEN, PRODUCTION-GRADE RAG WORKSPACE

> How to use: open the project folder in Claude Code (inside `Advanced-Level/Production-RAG-Assistant` if you use the consolidated ShadowFox repo), then save these files first:
> 1. `docs/assignment/` : the official ShadowFox task PDF.
> 2. `docs/original-master-spec.md` : your original NexusRAG master instruction (the long ChatGPT-style spec).
> 3. `docs/references/` : the five reference screenshots, named `ref-1-documents-table.png`, `ref-2-research-reader.png`, `ref-3-pdf-annotator.png`, `ref-4-ask-first-home.png`, `ref-5-landing-slite.png`.
> Then paste this file (or save it as `BUILD_BRIEF.md`) and say: "Read BUILD_BRIEF.md and the three documents above fully, then begin Phase 1 only."

---

# 0. WHAT THIS BRIEF IS

You are building **NexusRAG**, an advanced, production-style Retrieval-Augmented Generation workspace for the Advanced-Level AI Engineer internship at ShadowFox. You act as a Principal AI Engineer, RAG Architect, LangGraph specialist, Senior Full-Stack Engineer, Principal Product Designer, Security Engineer, and Release Engineer.

This brief **wraps and upgrades** the original master spec. It does not replace it.

### Authority order (when documents disagree, higher wins, and you must tell me about the conflict)
1. The official ShadowFox PDF in `docs/assignment/`.
2. `docs/original-master-spec.md` (all its requirements A to Q, pages, API list, database design, tests, Docker, documentation, and acceptance checklist remain in force).
3. This brief (design direction, engineering upgrades, security, go-live, and process rules).

### Working rules
1. **Plan first.** Do Phase 1 only, then stop and wait for my approval. Stop after every phase with a report.
2. **Evidence or it does not count.** Never say something works, passes, or is deployed unless you ran it and saw the result. Quote real command output. Mark anything unverified as "Not verified".
3. **No fake anything:** no mock AI, fake embeddings, fake citations, invented scores, simulated progress, hardcoded answers, or placeholder buttons.
4. **Use current documentation.** Before using LangGraph, FAISS, the AI provider SDK, FastAPI, SQLAlchemy, Vite, Tailwind, shadcn/ui, TanStack Query, or a PDF viewer, look up current official docs (docs MCP such as Context7, or official sites). Confirm current model IDs and API methods from the provider's official pages at implementation time.
5. **Use your tools** (tell me what is missing and how to install it): the `frontend-design` skill (read it before UI work), Playwright MCP or Claude in Chrome (real browser checks, screenshots, responsive tests), a docs MCP, GitHub MCP or git, subagents (parallel design research, backend tests, security review, accessibility audit).
6. **Persist context.** Create `CLAUDE.md` with product summary, design tokens, forbidden-patterns list, structure, run and test commands, and phase status. Update it at every phase end.
7. Never print or commit secrets. If I must supply a key, tell me to put it in `.env`. Do not touch the Beginner or Intermediate projects.

---

# 1. DESIGN REFERENCES (STUDY BEFORE DESIGNING)

I supplied five reference screenshots. Open each in `docs/references/`, and write observations in your own words in `docs/design-research.md`. Items 1 to 4 look like app or concept screens, item 5 is a marketing page. I have not confirmed which are shipped products versus design concepts, so do not assume. Adopt the **layout logic and interaction patterns**, and build an original identity. Do not copy logos, names, copy, illustrations, or exact visuals.

| Ref | What it shows | Adopt | Do not adopt |
|---|---|---|---|
| **1. Documents table with upload tray** | Dark slate icon rail, light content area, search with grid/list toggle, filter dropdowns, document table (name with type badge, size, type, date, row delete on hover), right-side drag-and-drop zone with a per-file progress list and cancel buttons | Table-first library, row hover actions, view toggle, **upload tray with per-file progress and cancel** (real byte progress), calm icon rail | Pill-shaped search and buttons, "Shared / Members" columns, brown accent bubble, decorative avatar |
| **2. Research reader with tabs and assistant** | Left tree (Recent, Favorites, Projects with nested folders), multi-tab PDF reader with yellow highlight, zoom and page controls (100%, 1/24), right Assistant panel with quick actions and a question box | **Collections as a tree**, multi-document tabs, highlighted cited passage in the PDF, page and zoom controls, assistant panel on the right | The rich-text drafting editor, "Paraphrase" and "Format citation" actions (out of scope), colour-dot toolbar |
| **3. PDF annotator with citation panel** | Top toolbar (page 4 of 20, zoom, search file content), coloured highlights on the page, right panel with **Info / Citation / Notes** tabs, AI summaries with inline page citations, source excerpt cards | **Source panel tabs: Info, Citation, Passage**, inline citations with page numbers, in-document search, highlight-to-source linking | Notes and comment features (out of scope unless time allows), multi-colour annotation tools |
| **4. Ask-first home with a table** | "Welcome, what will you discover today?" heading, large ask box with scope and length selectors, four quick-action tiles (Upload, Import, Create, Learn), sortable and filterable table with Title, Added, Viewed, File type, Summary columns, left nav with Search, Chats, Folders | **Ask-first Home**, scope selector inside the composer, table with a real **Summary** column (generated from the document, stored, labelled), sort and filter | Plan usage meters, "Upgrade" and "Get unlimited" buttons, "What's new" cards, fake usage numbers, tile grid of generic actions |
| **5. Marketing landing page** | Warm cream background, large confident headline, short subhead, two buttons (outline and filled), large framed product screenshot below | **Warm paper background, confident short headline, one product frame as proof, minimal nav** | Announcement pill, overlaid testimonial cards and fake quotes, handwritten script headline gimmick (do not copy its wording or effect), pill buttons |

### Additional live products to open and study with the browser tool
NotebookLM (public pages and help docs), Perplexity (answer and citation layout), Linear (density, command palette, shortcuts, restraint), Notion (database table views), Readwise Reader (reading view), Glean and Dropbox Dash (search-first home), and **trace and observability UIs such as LangSmith, Langfuse, or Arize Phoenix (public pages and docs) for the Retrieval Inspector**. If a product needs a login, study only its public pages and docs and say so. Do not invent observations.

Write a synthesis: 10 to 12 patterns you will adopt, source, target screen, and why it serves RAG work. **Wait for my approval of the design brief before writing UI code.**

---

# 2. ORIGINAL VISUAL IDENTITY

NexusRAG must look clearly different from my other project (DocuMind AI uses warm paper with forest green). Propose **two palette and typography options** with rationale, recommend one, and wait for approval.

Direction (overrides the original spec where they differ):
- **Light theme by default**, with a properly designed dark theme (its own tokens, not an inversion), light, dark, and system options.
- Warm neutral surfaces, deep ink text, a restrained, distinctive accent used sparingly for citation markers, focus, selection, and primary actions. **Do not use indigo, violet, or purple as the accent.** No gradients, no glow, no glassmorphism.
- Small, consistent corner radius. **No pill-shaped buttons, search fields, or badges.** Status is a dot plus text.
- A reading serif for answers and document text, a clean sans for the interface, monospace only for code and identifiers (never decorative uppercase labels).
- Lucide icons only. No emoji. Original mark and wordmark as SVG, plus a favicon set and Open Graph image generated from the real product.
- Voice: plain, specific, verb-first. No buzzwords, no vague hero text, no em dashes anywhere. Example of the register: "Ask your documents. See the passage that answers." (write 3 headline options, recommend one, do not copy any reference headline.)
- Motion: short and consistent (about 120 to 200 ms), purposeful only: streaming text, citation hover preview, evidence panel slide, one-time highlight on arrival, real progress, real workflow stage changes in the inspector. At most one signature motion tied to function (for example a thin connector from a clicked citation to the passage). No scroll-triggered reveals, parallax, floating shapes, or cursor effects. Respect `prefers-reduced-motion`.
- Accessibility: WCAG AA in both themes, full keyboard use, visible focus, correct landmarks and names, platform-aware shortcut hints (Cmd on Mac, Ctrl elsewhere).

---

# 3. THE ZERO STATIC DATA RULE

No hardcoded numbers, names, documents, answers, scores, statuses, versions, model names, page counts, retention periods, or limits anywhere in the user-facing UI. Everything comes from the backend, PostgreSQL, `GET /api/v1/system/status` (or a config endpoint), or the user's actions. Dashboard metrics, processing activity, health, and document facts (page count, size, chunk count) are computed live. Static strings are labels, instructions, and legal text only. No fake metrics, testimonials, customer logos, pricing, counters, or usage meters.

The landing page product preview must be **a real screenshot captured by script (Playwright) from the running app** using a clearly labelled demo document that was genuinely ingested, or a live try-it interaction. It must never be a hand-built mockup with invented content. Demo documents must be **public domain or openly licensed** (for example Project Gutenberg texts, government reports, CC0 or CC BY material) with source, licence, and attribution shown in the UI. **Never claim "fair use" or "public domain" unless verified from the official source.**

---

# 4. PAGES (ORIGINAL SPEC PAGES 1 TO 7, WITH REFERENCE-DRIVEN LAYOUTS)

Keep every feature listed in the original spec. Layouts below add the reference patterns.

1. **Landing.** Left-aligned or centered editorial hero (concrete headline, one plain sentence, two actions: Open Workspace and Explore Features), one large framed real product screenshot (Ref 5 logic), capabilities, the real LangGraph workflow shown as a diagram, supported formats (PDF, TXT, Markdown), honest "what it can and cannot do" (for example scanned PDFs are not supported without OCR), privacy and handling (including that text is sent to the configured AI provider), footer with Privacy Policy, Terms, Documentation, and a real contact. No testimonials or logos. Optional live try-it box that really uploads and asks.
2. **Dashboard (ask-first home, Ref 4 logic).** Ask box with scope selector, quick Upload action, real metrics (documents, collections, indexed chunks), recent documents table with a stored Summary column, recent research sessions, processing activity, system health shown only when degraded or in a status panel. Empty workspace becomes real onboarding, not zeros and skeletons.
3. **Knowledge bases (Ref 1 and 2 logic).** Collections as a left tree with create, rename, delete. Document table (name with type icon, status dot and text, pages, size, chunks, added), sortable, filterable, searchable, multi-select with bulk reindex and delete. Upload tray with real per-file byte progress, real pipeline stages (uploaded, validating, extracting, chunking, embedding, indexing, indexed, failed), real failure reasons, retry, cancel.
4. **Research workspace (three panels).** Left: knowledge base, collection and document scope with checkboxes, recent sessions. Center: conversation, suggested questions generated from the selected documents (a real call, cached, labelled as suggestions), streaming Markdown answers, follow-ups, copy, regenerate, stop. Right: sources with tabs **Passages / Citation / Document** (Ref 3 logic), filename, page, excerpt, relevance shown as a rank or labelled score, never as a confidence percentage, and an Open Source action. Generated text and retrieved evidence must be visually distinct. Evidence panel stays closed until there is evidence. Mobile uses bottom sheets.
5. **Document reader (Ref 2 and 3 logic).** Multi-document tabs, PDF viewer with page navigation, zoom, in-document search, extracted-text view, metadata, and the **cited passage highlighted** (text-layer matching where feasible, otherwise page-level navigation with the excerpt pinned). Markdown and TXT get a readable reading view.
6. **Retrieval inspector (trace-UI logic).** For each run: original and rewritten question (with whether rewriting was skipped and why), scope, initial candidates with scores, reranked order, final context, evidence sufficiency result, citation validation result, groundedness result, a stage timeline with real durations, retries and errors. All from the persisted WorkflowRun. Label every score with what it actually is.
7. **Settings.** Provider configuration status (never show keys), models from the backend, chunk size, overlap, top-K, reranking options within allowed bounds, theme, data and privacy (export, delete all, retention message), storage and system health, application information. Technical detail lives here or on a separate Technical page, not in the main navigation.

Plus: branded 404 and error pages, a Documentation area (user guide first, technical docs second), a command palette (Cmd or Ctrl K) with only real actions, and consistent names across the UI and docs from one constants file.

---

# 5. ENGINEERING UPGRADES AND DECISIONS TO MAKE (DOCUMENT EACH IN `docs/architecture.md`)

- **FAISS design.** Use cosine similarity via normalised vectors with an inner-product index. Wrap in an ID map so vector IDs map to chunk IDs and **removal on document delete works** (a plain flat index cannot delete without an ID map). Decide per-collection versus per-workspace indexes and explain how isolation is enforced. Persist atomically (write to a temp file, then rename), keep the vector-ID to chunk mapping in PostgreSQL, and define a recovery routine that detects and repairs drift between PostgreSQL and FAISS after a crash. FAISS is not safe for concurrent writers: use a single writer (one worker or an explicit lock) and document it. Reindexing must remove old vectors before adding new ones, and a test must prove no duplicates.
- **Embeddings.** Provider abstraction with a configurable model. Store model name and dimension with each index, and refuse to query on mismatch. Batch, retry with backoff, handle rate limits and partial failures, never fake a vector.
- **Chunking.** Token-aware (document the tokenizer), configurable size and overlap (starting defaults 700 and 100, top-K 8, final context 4 to 5), page boundaries preserved, start and end page recorded, character offsets stored for highlighting. Independently testable.
- **Reranking.** Choose and justify one real method: a cross-encoder (heavier Docker image and CPU latency) or a documented LLM-based relevance ranking with structured output. Make it configurable and measure the effect in the evaluation. Do not present similarity scores as factual confidence.
- **LangGraph.** Typed state (Pydantic or TypedDict), meaningful nodes (validate input, rewrite query, retrieve, rerank, check evidence, abstain, generate, validate citations, validate groundedness, finalise), conditional edges, a **bounded** retrieval retry and a single bounded correction attempt (no infinite loops), and persisted traces. Skip rewriting for clear standalone questions. Explain in the docs why a graph is used instead of a plain function chain.
- **Streaming.** Server-Sent Events from `POST /api/v1/query/stream`. Because the browser `EventSource` cannot POST, read the stream with `fetch` and a stream reader. Send stage events, token events, and a final event that carries validated citations and the run ID. Handle disconnects and cancellation.
- **Evidence and groundedness checks.** Combine thresholds, sufficiency checks, and a model-based judge. State clearly in the UI and docs that these reduce hallucination but do not prove correctness.
- **Validation.** Pydantic request and response models, structured error envelope with stable codes, pagination, correct status codes, OpenAPI docs. API routes exactly as in the original spec under `/api/v1`.
- **Parsing.** PyMuPDF for PDFs, plain processing for TXT and Markdown, encoding detection, text normalisation, empty-page handling, password-protected and corrupted PDF handling, and a clear "scanned document, OCR unavailable" error. No OCR claim unless implemented.
- **Database.** PostgreSQL with migrations (Alembic), entities as in the original spec plus an owner or workspace key on every table.
- **Provider abstraction.** One interface each for embeddings, generation, rewriting, groundedness, and reranking. Model IDs and keys only in environment configuration. A missing key produces a clear configuration error, never a silent fallback.
- **Docker.** Multi-stage builds, non-root user, health checks, persistent volumes (PostgreSQL, uploads, FAISS indexes and mappings), a documented Compose command, and a no-Docker development setup. Prove that documents and indexes survive a restart.
- **Evaluation.** A reproducible dataset of real sample documents with questions and expected supporting passages. Compute Precision@K, Recall@K, MRR, citation correctness, and grounded answer correctness. Compare configurations (with and without rewriting, with and without reranking, chunk sizes). **Never invent a number.** Unmeasured metrics are stated as unmeasured.

---

# 6. IDENTITY, ISOLATION, AND SECURITY

The original spec allows a single-user workspace for the first version. Because I want to share the live site with real users, implement real isolation now:

- **Visitor or user identity:** issued by the server, generated with a cryptographically secure random source (at least 128 bits), stored in an **httpOnly, Secure, SameSite cookie**, with CSRF protection on state-changing requests. **Never show tokens or internal IDs in the UI.** Offer optional sign-in (email link or OAuth) as an upgrade path, and explain honestly what happens if a visitor loses their cookie.
- Every document, chunk, vector, collection, session, message, run, and file lookup is scoped to the owner **at the data layer**. Tests must attempt cross-owner access and prove it fails, including through FAISS scopes and the inspector.
- Retention job with a tested schedule. Delete-all removes files, database rows, vectors, and traces, and expires the cookie. Export returns only the caller's data.
- Cost and abuse protection: per-owner and per-IP rate limits, daily upload and query quotas, file size and page caps, concurrency limits, bot protection on public endpoints (for example Cloudflare Turnstile), a global budget guard for provider calls, and clear user-facing messages. All values from configuration.
- **Full security pass (report evidence for each):** API keys hidden, environment variables validated at startup, admin and maintenance routes protected, access control, sanitised inputs, XSS protection (especially Markdown answers and excerpts), rate limiting, secured endpoints, CORS limited to exact origins, security headers (CSP, HSTS in production, X-Content-Type-Options, frame protections, referrer and permissions policies), debug and verbose errors off, dependencies updated with audit results (`pip-audit`, `npm audit`), unused code removed, exposed files check (`.env`, `.git`, storage, source maps), database secured with parameterised queries, passwords hashed if accounts exist, **full Git history scanned for leaked secrets** (gitleaks or similar), upload abuse tests, prompt-injection tests. Write `docs/security-review.md`. Do not claim enterprise-grade security or certifications.
- Treat uploaded documents as untrusted data. Delimit context clearly in prompts, validate citations server-side, and never let document text change system rules.
- Calibrated claims only: no "guaranteed", no "deterministic" for model output, no "zero hallucination", no medical or clinical positioning. State plainly that answers can be wrong and must be checked against the cited source.

---

# 7. PHASES (STOP AFTER EACH, WITH A REPORT)

**Phase 1: Analysis, design research, and plan (no application code).** Read the PDF, extract every requirement into a traceability matrix, inspect the repo, check tools, write `docs/design-research.md` from the references and live products, propose two identity options, design tokens, page layouts (low-fidelity wireframes with empty, loading, populated, and error states), architecture, RAG architecture, LangGraph graph, database schema, API contract, folder structure, risks, test and evaluation strategy, and go-live plan. **Stop for approval.**
**Phase 2: Backend foundation.** FastAPI, config, PostgreSQL models and migrations, schemas, health, logging, error envelope, identity and isolation, upload and storage.
**Phase 3: Ingestion.** Parsers, preprocessing, chunking, embeddings, FAISS with persistence and recovery, document status stages, delete and reindex. Tests for each.
**Phase 4: Advanced RAG engine.** LangGraph workflow, rewriting, scoped retrieval, reranking, evidence check, grounded generation, citation and groundedness validation, SSE streaming, persisted traces. Real end-to-end questions.
**Phase 5: Frontend.** Design system, landing, dashboard, knowledge bases with upload tray, research workspace, document reader, retrieval inspector, settings, docs, legal pages, command palette. All wired to real endpoints.
**Phase 6: Integration and evaluation.** Verify every hop from upload to final answer, deletion, reindex, restart persistence, and run the evaluation with real numbers.
**Phase 7: Testing and security.** Backend tests, frontend tests, Playwright end-to-end flows, accessibility audit, cross-browser run, mobile run, security pass, dependency audit, secret scan.
**Phase 8: Documentation.** README (all 26 sections from the spec), `docs/architecture.md`, `docs/rag-pipeline.md`, `docs/api-reference.md`, `docs/evaluation.md`, Mermaid diagrams, genuine screenshots, final requirement-to-implementation mapping, and a 3 to 5 minute demo outline.
**Phase 9: Go live.** Deploy, custom domain with HTTPS, favicon set, **any "Made with AI" or builder badge removed**, Privacy Policy and Terms and Conditions live and linked in the footer and upload flow, production environment variables, persistent volumes verified by redeploying, backups, monitoring, error tracking, CI, rollback rehearsed, live smoke test from a phone, README screenshots regenerated from the live site.

### End-of-phase report (mandatory)
What changed, files changed, commands and tests run with real output, screenshots at 1440, 820, and 390 (light and dark), what was not verified and why, remaining work, decisions needed from me.

---

# 8. GO-LIVE NOTES (PHASE 9)

This stack needs a host that runs containers and offers persistent disks, because of PostgreSQL and FAISS files. Compare current options (for example Render, Railway, Fly.io, or a small VPS with Docker Compose) with limits and prices verified from official pages, not memory, and ask me to choose. Serve the frontend and API from the same site (a reverse proxy or sibling subdomains) so the secure cookie works without weakening it, and set CORS to exact production origins. Prove persistence: upload on the live site, redeploy, confirm documents, vectors, and sessions survive. For anything requiring my accounts, domain purchase, or payment, stop and give me exact numbered steps. Never ask me to paste secrets into chat.

I also need drafts for me to review (not final legal advice): Privacy Policy, Terms, a cost-safety checklist for the AI provider key (separate production key, restrictions, quota alerts or spending cap, rotation steps), and the internship submission pack (demo video script and shot list, one-page technical summary, architecture diagram, links).

---

# 9. ACCEPTANCE TESTS (ALL MUST PASS BEFORE YOU SAY "DONE")

1. Every requirement in the ShadowFox PDF and original spec has a traceability row with status and evidence, and no unexplained Partial or Fail rows.
2. **Swap test:** hide the logo on every screenshot. No screen resembles a generic AI template or any of the references.
3. **Real-data test:** grep the built frontend for hardcoded numbers, filenames, model names, statuses, and scores. Only labels and legal text remain. Report the output.
4. A real question across multiple documents returns a streamed, cited answer. Each citation maps to a real retrieved chunk and opens the exact page with the passage highlighted.
5. The inspector shows genuine rewritten query, candidates with scores, reranked order, evidence and groundedness results, stage timings, and retries from a persisted run.
6. An unrelated question produces a designed abstention. A forced bad citation is stripped or flagged. A prompt-injection sentence inside a document does not change behaviour.
7. Delete removes the file, database rows, and FAISS vectors (verified). Reindex leaves no duplicate vectors (verified).
8. Cross-owner access fails everywhere (tested). No credential or internal identifier appears in the UI.
9. Docker Compose starts everything. Documents, database, and indexes survive a restart.
10. Backend tests, frontend tests, Playwright end-to-end tests, accessibility audit, and security checks all run with real output reported. The evaluation report contains only measured numbers.
11. The live site has a custom domain, HTTPS, favicon, no builder badge, Privacy and Terms, monitoring, and backups, and a stranger can use it end to end on a phone without instructions.
12. Things I check myself, never to be marked done on my behalf: upload my own real PDFs and verify five citations by hand against the originals, try to break it with bad files and an injection sentence, use the live site on my phone, have three people try it unaided, and read the legal pages in full.

---

# FINAL COMMAND

Begin with **Phase 1 only**.

1. Read this brief, `docs/assignment/`, `docs/original-master-spec.md`, and open every image in `docs/references/`. Summarise the constraints you consider most important and any conflicts or ambiguities between the documents.
2. Inspect the repository and list the available tools (browser MCP or Chrome extension, docs MCP, GitHub MCP, `frontend-design` skill) and anything missing.
3. Study the references and live products and write `docs/design-research.md`. Produce the Phase 1 deliverables A to L from the original spec plus the identity options and wireframes above.
4. **Stop and wait for my approval.**
