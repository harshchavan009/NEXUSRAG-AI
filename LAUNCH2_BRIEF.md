# NEXUSRAG FINAL POLISH, COMPLIANCE, AND LAUNCH PROMPT

> How to use: open the NexusRAG repository in Claude Code, paste this file (or save it as `LAUNCH2_BRIEF.md` in the project root), then say: "Read LAUNCH2_BRIEF.md, CLAUDE.md, BUILD_BRIEF.md, TRANSFORM_BRIEF.md, docs/original-master-spec.md and docs/assignment/ fully, then begin Step 1 only."

---

# 0. SITUATION

NexusRAG improved a lot since the last round. Confirmed from the latest screenshots: the public site and the app now have separate layouts, the fake testimonial and the copied headline pill are gone, the app has a labelled sidebar and a real dashboard, the Feedback button, Terms and Privacy links in the upload area, a footer with legal and trust links, a Settings page with model, chunking, and threshold information, and a PostgreSQL migration path.

Still unproven: nearly every screenshot is an empty state, so the RAG pipeline, upload, citations, reader, and inspector have not been shown working. Several claims and labels are inaccurate or unverifiable, one likely **blocker** concerns the AI model IDs, and the public site still lacks real proof.

You act as a Staff Full-Stack Engineer, AI/RAG Engineer, QA Lead, Security Engineer, UX Writer, and Release Engineer.

### Rules
1. **Authority order:** ShadowFox PDF, then `docs/original-master-spec.md`, then `BUILD_BRIEF.md`, then `TRANSFORM_BRIEF.md`, then this brief. Say so when this brief changes something.
2. **Evidence or it does not count.** Never claim something works, passes, or is deployed unless you ran it and saw the result. Quote real output. Mark the rest "Not verified".
3. **Plan first.** Deliver Steps 1 and 2, then **wait for my approval**. Stop after each phase with a report.
4. **Run the real product:** start everything, upload real PDF, Markdown, and TXT files, ask real questions, open citations, force failures, restart, delete, reindex, and test at 1440, 820, and 390 px in light and dark.
5. Use current official documentation for every library, provider, and host. **Verify every model ID, limit, and price from the official page on the day you implement.** Use the `frontend-design` skill, Playwright MCP or Claude in Chrome, and a docs MCP. Tell me what is missing.
6. Never print or commit secrets. Anything needing my accounts, domain, or payment: give exact numbered steps.
7. Update `CLAUDE.md` at every phase end.

---

# 1. STEP 1: AUDIT (WRITE `docs/launch2-audit.md`)

Confirm, fix, and extend each item with evidence and screenshots.

## A. Likely blocker: AI model IDs and the "API Online" label
1. Settings shows the embedding model `text-embedding-004` and generation model `gemini-2.5-flash`. When I checked Google's published Gemini API deprecation schedule, it listed **`text-embedding-004` as shut down on January 14, 2026**, and **`gemini-2.5-flash` scheduled to shut down on October 16, 2026**. Replacement names differ between sources (for example `gemini-embedding-2`, `gemini-3.5-flash`), so **do not trust my notes. Read the live official deprecations page and models page yourself** and choose currently supported IDs.
2. Settings and the dashboard show "API Online" while those IDs appear to be retired. That label may be static. Replace it with a **real provider probe** (a small embedding call and a small generation call, cached for a short time) that reports real status, the exact error when it fails, and a clear setup message when the key is missing.
3. If you change the embedding model, handle everything that depends on it: dimension (choose and record it), normalisation (some embedding models do not return unit vectors, which breaks inner-product cosine search), task types for documents versus queries, stored model name and dimension in the index metadata, a refusal to query on mismatch, and a **reindex of all existing documents**. Update docs, Settings, and the evaluation. Keep model IDs only in environment configuration, and add a startup warning when a configured model appears on the provider's deprecation list.
4. The dashboard shows Pipeline Status "**Degraded**" with no explanation. Find out whether something is genuinely wrong. Then make every degraded state explain what is degraded, why, and what the user or operator should do.

## B. Inaccurate, unverifiable, or overreaching claims (fix or remove)
5. "1440x900 **Authenticated** Canvas" on the landing preview. There are no accounts. Remove.
6. "Engineered to **remove hallucination risk** through structural evidence checks." Checks reduce risk and do not remove it. Use calibrated wording.
7. "IndexIDMap2 for **O(1) deletions**." I believe removing vectors from a flat ID-mapped FAISS index is not constant time. Verify against the FAISS documentation and your own measurement, and state only what is true.
8. "Both backends ... **pass 100% of automated tests**" appears in Settings. A static claim in the UI. Delete it. Test status belongs in CI and the README.
9. "**Zero third-party trackers**" in the footer. Verify with a network capture that no third-party requests happen (fonts, CDNs, analytics). Self-host fonts or remove the claim.
10. "**Open Source Research Engine**" and "Released under permissive research license". There must be a real `LICENSE` file with a recognised licence (for example MIT or Apache-2.0), a public repository, and third-party notices. Otherwise remove the claims.
11. "Load our **pre-indexed** research sample reports" on the landing page versus "Ingest 4 real papers" on the dashboard. Pick the true description. Verify the **licence of every sample document** from its official source, show source, licence, and attribution in the UI, and never say "public domain" or "fair use" unless verified. Prefer documents with a clear open licence.
12. The banner "**UPDATED** Transparent Document Synthesis with LangGraph Traces" above the hero is a fake announcement pill. Remove it. Use real changelog entries or nothing.
13. Settings labels "**PyMuPDF splitter**" for chunking. PyMuPDF parses PDFs and does not split text. Label the real tokenizer and splitter.
14. The Dashboard "Upload Files" tile says "PDF, MD, TXT, **DOCX**" while the landing page and spec say PDF, Markdown, TXT. Either implement and test DOCX or remove the claim. Keep one source of truth for accepted formats, from configuration.
15. Hex colour codes and developer notes in user-facing Settings ("Warm sand canvas (#F7F6F2)", "SQLite & PostgreSQL Dual-Dialect Design" essay). Move technical architecture into a Technical docs page.

## C. Missing proof on the public site
16. The hero preview is a **tiny screenshot of the empty dashboard (all zeros)**, and the two feature screenshots are **empty Document Reader and Retrieval Inspector screens from the old shell** (visible tooltips, old status bar). They prove nothing and do not match the current UI. Regenerate **all** public screenshots by script (Playwright) from the current app with sample documents ingested, showing: a real cited answer, an opened citation highlighted on the exact page, a real inspector trace with timings, the library with processing stages, and a multi-document scope. Make them large and readable.
17. The hero has no way to try the product. Add a real try-it path (load samples, then ask), or a clear primary action that lands the visitor in a ready, guided workspace.
18. Developer telemetry in the hero ("Live Vectors: 0 · Model: gemini-2.5-flash · Evidence Gate: 0.650 · Dialect: sqlite") and in the dashboard ("FAISS IndexFlatIP", "Metadata DB: SQLite", "Session-Scoped"). Remove from public and normal views.

## D. Copy and polish
19. Jargon and repetition: "Verifiable Research Synthesis for Complex Documents", "groundedness validation", "inspectable retrieval graphs", "Domain-isolated namespaces", "Multi-turn synthesis threads", "Query your indexed collections" repeated in the title, the subtitle, and a "Live Workspace" tag. Rewrite in plain, specific language in NexusRAG's own voice, then run the **originality audit**: web-search each headline, subhead, CTA, and section title in quotation marks and rewrite anything found elsewhere.
20. Pill-shaped elements remain (the announcement pill, "Workspace Active" status, the search fields). No pill shapes. Replace the status badge with a dot and text shown only when relevant.
21. Four identical stat cards on the dashboard, and three identical limits cards on the landing page. Vary the layout.
22. Mac-only shortcut symbol (Cmd K). Make hints platform-aware.
23. Smaller items: "Documents Type" grammar, Title Case in "Drag And Drop Your Files Here", the example placeholder "What were the key findings in the clean energy report?" referring to a document that does not exist (generate examples from the user's actual documents or use a neutral prompt), the "Favorites" section with no feature behind it, the blank toolbar strip in the Document Reader, monospace used for ordinary labels ("0 files available", "0 indexed files").
24. Landing nav links to FAQ, System Status, About, Security and Privacy. Confirm each page exists with real content. Add Contact.

## E. Specification check (mark Pass, Partial, Fail, or Not verified, with evidence)
Build a traceability table from `docs/original-master-spec.md` and the ShadowFox PDF. From the screenshots I could only observe the following, and everything else must be verified by running it:
- **Observed present in the UI:** landing with formats, limits, retention, and footer links; dashboard with real-looking metrics, ask box, recent documents, recent sessions, quick actions; knowledge base table with upload area; research desk with three regions; document reader and inspector shells; Settings with provider, chunking, retrieval, thresholds, storage, theme.
- **Observed missing or unclear:** collection create, rename, delete controls; document selection and filters in the research desk; suggested example questions; processing activity feed on the dashboard; rerank and top-K controls that are actually editable within bounds (spec requires configurable settings); an "Explore Features" secondary CTA (spec wording, a documented alternative is fine).
- **Deviation to record:** SQLite by default with PostgreSQL in Docker Compose. Acceptable only if documented, tested on both, and **production runs on PostgreSQL** (or an explicit, approved single-instance justification).
- **Must be proven by real runs:** multi-format ingestion, corrupted and empty files, scanned PDF error, duplicate detection, chunk metadata, real embeddings, FAISS persistence and reload, ID mapping, deletion and reindex without duplicates, scoped retrieval, workspace isolation, query rewriting, reranking, evidence abstention, grounded generation, citation validation (force a bad citation), groundedness validation with one bounded correction, LangGraph conditional routing and bounded retries, SSE streaming and interruption, persisted traces, API validation and error envelopes, Docker Compose restart persistence, tests, evaluation numbers measured on a reproducible dataset, README and docs complete.

## F. Missing real-world pieces (add anything not already present)
- **Collections:** create, rename, delete, move documents, per-collection counts. Real processing activity feed. Upload tray with real progress, cancel, retry.
- **Research desk:** document and collection selection with checkboxes and filters, suggested questions generated from the selected documents (real call, cached, labelled), history, follow-ups, copy, regenerate, stop, **export an answer or session as Markdown with citations**, and an **"Inspect this answer"** link from each answer to its run in the inspector.
- **Inspector:** stage timeline with real durations, candidate and reranked lists with scores labelled for what they are, rewrite decision with reason, retries and errors, copy run ID, export trace JSON.
- **Reader:** multi-tab, search, thumbnails, highlight of the cited passage, citation-to-page jump, extracted-text view.
- **Trust:** `LICENSE`, `SECURITY.md`, `/.well-known/security.txt`, `CHANGELOG`, real Contact, real status page, Privacy Policy and Terms drafted from actual behaviour (marked as drafts for my review).
- **Product basics:** first-run onboarding checklist, usage and quota panel with real numbers, session-expiry and cookie-loss explanation, optional sign-in plan, designed missing-key, rate-limit, offline, and degraded states, keyboard shortcuts sheet, mobile layouts (bottom sheets for sources and inspector).
- **Ops:** rate limits and quotas per visitor and IP, bot protection on public endpoints, a global spending guard for provider calls, structured logs with request IDs, error tracking, uptime monitoring, health and readiness endpoints, backups with a tested restore, CI, rehearsed rollback.

---

# 2. STEP 2: PLAN (WRITE `docs/launch2-plan.md`, THEN WAIT FOR APPROVAL)

Rank every finding as Blocker, High, Medium, or Low. Propose the model and embedding choice with dimension, normalisation, and reindex steps, using only IDs you verified on the official pages. Propose the PostgreSQL production decision. Provide the copy deck (old and new strings, originality-checked), the screenshot capture plan, the hosting comparison (container host with persistent disks or a VPS with Docker Compose, with limits and prices verified from official pages), and effort and risk per item. Ask me to confirm deviations. **Stop and wait for approval.**

---

# 3. STEP 3: PHASES (STOP AFTER EACH WITH A REPORT)

**L1: Blockers.** Model IDs and provider probe, reindex, "Degraded" cause, remove false and unverifiable claims, licence and sample document verification, DOCX decision, security of identity and isolation.
**L2: Spec gaps.** Collections CRUD, document selection and filters, suggested questions, processing activity, editable bounded retrieval settings, any Partial or Fail row from the matrix.
**L3: Proof and public site.** Scripted screenshots from real data, try-it path, rewritten and originality-checked copy, FAQ, About, Contact, Security, Privacy, Terms, changelog, status page, SEO and icons, platform-aware shortcuts, remove telemetry from public views.
**L4: Product depth.** Export with citations, "Inspect this answer", inspector and reader upgrades, onboarding, usage panel, designed error states, mobile.
**L5: Quality.** Backend and frontend tests, Playwright end-to-end flows, accessibility audit, cross-browser, real retrieval evaluation with measured numbers only, originality and real-data audits.
**L6: Security pass (report evidence for each):** API keys hidden, env validated, admin and maintenance routes protected, access control, sanitised inputs, XSS protection (especially Markdown answers and excerpts), rate limiting, secured endpoints, CORS limited to exact origins, security headers (CSP, HSTS, X-Content-Type-Options, frame, referrer, permissions), secure cookie flags and CSRF, debug off, dependency updates with `pip-audit` and `npm audit`, unused code removed, exposed files check (`.env`, `.git`, storage, source maps), secured database, hashed passwords if accounts exist, **full Git history scan for leaked secrets**, upload abuse tests, prompt-injection tests. Write `docs/security-review.md`. No enterprise-grade or compliance claims.
**L7: Repository polish (GitHub).** See Section 4.
**L8: Go live.** Deploy, **custom domain with HTTPS**, **favicon and app icons**, **any "Made with AI" or builder badge removed**, Privacy and Terms linked in the footer and upload flow, production variables, PostgreSQL in production, persistent volumes proven by redeploying, backups, monitoring, error tracking, CI green, rollback rehearsed, live smoke test from a phone, README screenshots regenerated from the live site, submission pack (demo script, one-page technical summary), cost-safety checklist for the provider key (separate production key, restrictions, quota alerts or spending cap, rotation steps).

### End-of-phase report (mandatory)
What changed, files changed, commands and tests run with real output, screenshots (1440, 820, 390, light and dark), what was not verified and why, remaining work, decisions needed from me.

---

# 4. REPOSITORY POLISH (PHASE L7)

Make the GitHub repository look like a maintained, professional project. Do only what is true.
- **Repository metadata:** a one-sentence description in plain words, website URL once live, and 8 to 12 accurate topics (for example `rag`, `langgraph`, `faiss`, `fastapi`, `react`, `typescript`, `document-search`, `citations`). Social preview image generated from the real app.
- **README:** all sections required by the spec, a clear opening (what it does, who it is for, a real screenshot or short real demo capture), quick start with Docker Compose, environment variable table, architecture and LangGraph diagrams (Mermaid), tests and evaluation results **only if measured**, limitations, licence. No badges unless real (for example a CI status badge from your actual workflow).
- **Files:** `LICENSE`, `SECURITY.md`, `CHANGELOG.md`, `.env.example`, `.gitignore`, `CONTRIBUTING.md` (short, only if you will accept contributions), issue templates, and a `docs/` folder as specified.
- **Hygiene:** consistent commit messages going forward (do not rewrite published history unless needed to remove a leaked secret, and tell me first), no committed secrets, databases, uploads, vector indexes, or `node_modules`, a tagged release (for example `v1.0.0`) with notes written from the real changelog, and a working GitHub Actions workflow (backend tests, frontend lint and build, dependency audit, secret scan).
- Verify the repository installs and runs from a clean clone using only the README.

---

# 5. HARD CONSTRAINTS AND ACCEPTANCE TESTS

**Constraints:** Zero Static Data (no hardcoded numbers, names, documents, answers, scores, statuses, versions, model names, limits, retention periods, or test results in user-facing UI). No fake metrics, reviews, announcements, or counters. No pill shapes, gradients, glow, emoji icons, em dashes, decorative monospace labels, or scroll and cursor effects. Calibrated, verifiable claims only. Every control works. WCAG AA in both themes. Original product, original words.

**Acceptance tests (all must pass before you say "done"):**
1. **Model test:** every configured model ID is confirmed supported on the provider's current official pages. A real embedding call and a real generation call succeed. The "API" status comes from a real probe. A missing or invalid key shows a designed configuration error.
2. **Claims test:** every claim on public pages and in Settings is verified or removed. No "authenticated", "removes hallucination", "100% tests", unverified "zero trackers", unverified licence, or unverified complexity claim remains.
3. **Proof test:** every public screenshot was captured by script from the current app with real data and shows a real answer, citation, and trace.
4. **First-run test:** a new visitor loads sample documents, asks a question, opens a citation on the exact page highlighted, and views the run in the inspector without instructions.
5. **Spec test:** every row of the traceability matrix is Pass, or a documented and approved deviation, with evidence.
6. **Isolation and deletion test:** another visitor cannot read my data. Delete removes files, rows, FAISS vectors, and traces. Reindex leaves no duplicates (verified).
7. **Persistence test:** documents, database, and indexes survive a Docker Compose restart and a redeploy, with PostgreSQL in production.
8. **Originality and real-data test:** web search finds no copied headline or CTA. A grep of the built frontend finds no hardcoded numbers, filenames, model names, statuses, or scores outside labels and legal text.
9. **Repository test:** licence, security policy, changelog, tagged release, passing CI, and a clean-clone install from the README.
10. **Live test:** custom domain, HTTPS, favicon, no builder badge, Privacy and Terms, status page, monitoring, backups, and a stranger on a phone can use it end to end.
11. **Human checks (never marked done on my behalf):** I upload my own PDFs and verify five citations by hand, try to break it with bad files and an injection sentence, use the live site on my phone, have three people try it unaided, and read the legal pages in full.

---

# FINAL COMMAND

Begin with **Step 1 only**.

1. Read this brief and the documents named at the top. Summarise the constraints you consider most important and any conflicts.
2. Check available tools (browser MCP or Chrome extension, docs MCP, GitHub MCP, `frontend-design` skill) and list anything missing.
3. **First, check the provider's live deprecations page and run a real embedding and generation call.** Then run both servers and the tests, capture every route at 1440, 820, and 390 px in both themes, execute the real flows, and write `docs/launch2-audit.md` with evidence.
4. Continue to Step 2, then **stop and wait for my approval.**

I want a NexusRAG whose every claim is true, whose proof is real, whose models are current, whose repository looks maintained, and which strangers can use on a real domain.

