# NEXUSRAG ROUND 4: CRASH, REGRESSION, AND REQUIREMENTS PROOF PROMPT

> How to use: open the NexusRAG repository in Claude Code. Paste this file (or save it as `ROUND4_BRIEF.md`) and say: "Read ROUND4_BRIEF.md, CLAUDE.md, ADVANCED_BRIEF.md, and the ShadowFox PDF in docs/assignment/ fully, then begin Step 1 only."
> This brief adds to `ADVANCED_BRIEF.md` (the full Advanced Level traceability matrix R1 to R14, W1, W2, Q1, O1, E1, S1). Do not skip that matrix. This round fixes a new crash, closes items that were reported but are still unfixed, and requires real proof with a live provider key.

---

# 0. SITUATION

The latest screenshots show progress: the "Local Offline Mode" wording is gone and Settings now says "API Key Not Configured", the dashboard shows an `export GEMINI_API_KEY="..."` instruction instead of asking for a key in the browser, the hero has two clear actions, and Settings has editable Top-K, rerank, evidence, and groundedness controls.

They also show a **new blocker** and several **unfixed items**. With no provider key configured and no documents loaded, I cannot confirm any Advanced Level requirement from screenshots. The requirements are **not yet proven**.

You act as a QA Lead, Senior Frontend Engineer, AI/RAG Engineer, and Technical Writer.

### Rules
1. **Evidence or it does not count.** Pass, Partial, Fail, or Not verified, with a file path, test name, command output, or screenshot. Never claim something works unless you ran it.
2. **Run with a real provider key** (I will set `GEMINI_API_KEY` in my local `.env`; never ask me to paste it into chat). Verify every model ID on the provider's official pages the day you test.
3. **Plan first.** Deliver Steps 1 and 2, then **wait for my approval**. Stop after each phase with a report.
4. Use current official documentation, Playwright MCP or Claude in Chrome, and a docs MCP. Tell me what is missing. Update `CLAUDE.md` at each phase end.

---

# 1. NEW BLOCKER: RENDER CRASH

A full-page "Workspace Initialization Notice" appeared with the raw message **`Can't find variable: selectedDocs`** and a button "Reset Session & Reload". It appeared after visiting the Knowledge Bases page, and the Research Desk screen (the main product screen) is missing from this set, so it probably crashed.

Do all of the following:
1. **Reproduce it** in a clean browser profile and in a profile with existing saved state. Find which route and component reference `selectedDocs` without defining it. Fix the root cause and add a regression test.
2. **Why was this not caught?** A `ReferenceError` in production usually means no type check or lint runs. A Vite build does not type-check by default. Add `tsc --noEmit` (or `tsc -b`) and ESLint with `no-undef` to the build script and CI so an undefined variable fails the build.
3. **Saved-state safety.** The message says "while restoring the workspace session". Check persisted client state (for example Zustand persist or localStorage). Add a **schema version and a migration**, validate stored state before use, and discard only a corrupted UI-state key, never the user's documents.
4. **Error boundary UX.** Never show raw JavaScript errors to users. Show a plain message, a "Try again" action that re-renders without clearing data, and a separate, clearly labelled "Reset local view" that clears only client UI state. **"Reset Session" must never delete or orphan documents or the visitor identity without a confirmation that says exactly what will be lost.** Log the error with a request or session ID for me (without document content).
5. **Smoke test every route.** Add a Playwright test that opens every route (public and app) in a fresh profile and in a profile with seeded saved state, and **fails on any console error, unhandled rejection, or failed network request.** Run it in CI.

---

# 2. ITEMS REPORTED EARLIER THAT ARE STILL UNFIXED (CONFIRM AND FIX)

1. **Sample document description is still wrong.** Knowledge Bases still says "Loads 4 verified open-access research papers (Transformers, Clean Energy, RAG vs Long-Context, and Climate Modeling)" and links to "verified paper licences & attribution". The dashboard tile says "Ingest 4 real papers", while the onboarding checklist now says "load 4 benchmark documents". The same feature has three different descriptions. The earlier screenshot showed files named `ai_system_architecture_white...`, `clean_energy_report_2024.txt`, `corporate_governance_repor...`, `distributed_systems_consensus_br...`, a fictional "Nexus Enterprise Holdings", about 5 pages and 5 chunks in total, and a line attributing one document to the U.S. National Renewable Energy Laboratory.
   - Find where every sample file came from. If written for the demo, say so plainly everywhere ("demo documents written for NexusRAG"), and remove any attribution to a real organisation or report that did not produce it. Never present invented figures as sourced facts.
   - If any sample is a real openly licensed work, show title, authors, source URL, licence, and attribution, verified from the official source.
   - Use **one** description string from one constants file across landing, dashboard, checklist, library, and docs.
   - Make samples long enough (several pages each, many chunks) to genuinely demonstrate chunking, scoped retrieval, reranking, and multi-document questions, with at least one PDF, one Markdown, and one TXT file. The evaluation needs them.
2. **Fake browser frame on the landing preview.** The hero image sits in a frame labelled `nexusrag.app/dashboard`. That domain is not yours (confirm), and a fake address bar is decorative chrome. Remove the fake URL and window chrome. Use a plain captioned screenshot.
3. **The hero screenshot is old.** It still shows the previous data (4 documents, 5 chunks, "Ingest 4 real papers") and does not match the current UI or the corrected sample set. After fixes, **recapture all public screenshots by script** from the running app with real provider calls, notifications off, and a real cited answer, an opened citation, and a real trace.
4. **Overclaims in the hero:** "verified evidence checks" and "complete retrieval transparency". Use calibrated, plain language ("checks that each citation points to a passage that was retrieved", "see which passages were retrieved and how they were ranked"). Keep the headline concrete, and run the originality search on it.
5. **Still static or decorative:** the "Workspace Active" status label (show health only when degraded, with a reason), the four identical KPI cards, uppercase monospace labels ("FIRST-RUN ONBOARDING CHECKLIST"), the jargon subtitle in Settings ("tenant data privacy", "database dialect"), and "v1.0.0" next to the Settings title.
6. **Cache and stale state:** after upload, delete, reindex, and settings changes, every list and count refreshes without a manual reload. Private API responses are `no-store`. Static assets use hashed filenames.

---

# 3. STEP 1: PROVE THE REQUIREMENTS WITH A REAL KEY (WRITE `docs/round4-proof.md`)

1. Check the provider's live deprecation and models pages, and confirm the configured generation and embedding IDs.
2. With a valid key, execute the Advanced Level matrix from `ADVANCED_BRIEF.md` for real. Record command output and screenshots for each of: three-format upload and a multi-file batch; corrupted, empty, scanned, duplicate, and spoofed files; extraction and chunk metadata; real embeddings and index persistence across restart; ID-mapped delete and reindex without duplicates; scoped retrieval with different scopes giving different results; a follow-up question showing a rewrite and a clear question showing a skip; reranking before and after; an answerable and an unanswerable question (abstention); a forced bad citation being stripped; streaming with cancel; typed validation errors on malformed requests; Docker `compose up` from a clean clone; the LangGraph graph diagram and traces of at least two paths.
3. **Without a key:** show that the app displays a clear configuration error and produces **no** embeddings, answers, or citations. Search the code for any hash-based, random, or placeholder embedding path, and any canned-answer path. Report the result.
4. Produce the Advanced Level matrix with a status and evidence for every row, and list every failure and gap.

# 4. STEP 2: PLAN (WRITE `docs/round4-plan.md`, THEN WAIT FOR APPROVAL)

Rank every finding Blocker, High, Medium, or Low, with fix, files, effort, and risk. A Blocker is any crash, any failed R item, any fabricated path, any false claim. Include the retrieval evaluation plan (reproducible dataset, Precision@K, Recall@K, MRR, citation correctness, grounded answer correctness, abstention accuracy, configuration comparisons, **only measured numbers**), the `docs/EXPLAIN.md` outline, the timed 3 to 5 minute video script, and the submission checklist. **Stop and wait for approval.**

---

# 5. PHASES (STOP AFTER EACH WITH A REPORT)

**G1: Crash and stability.** Section 1 in full, plus the route smoke test in CI.
**G2: Honesty and proof.** Section 2 items 1 to 5, corrected samples, recaptured screenshots, calibrated copy.
**G3: Requirements gaps.** Close every failed or partial matrix row.
**G4: Tests and evaluation.** Backend and frontend tests, Playwright end-to-end flows, accessibility audit, the real evaluation with measured numbers, cache checks.
**G5: Documentation and submission pack.** README, `docs/architecture.md`, `docs/rag-pipeline.md`, `docs/api-reference.md`, `docs/evaluation.md`, `docs/EXPLAIN.md`, `LICENSE`, `SECURITY.md`, `CHANGELOG.md`, release tag, CI workflow, demo video script, submission checklist, and a short validation email draft to the mentor address in the PDF (`g2doubts@shadowfox.in`) for me to review and send myself.
**G6: Security pass, then go live.** Full security pass with evidence (keys hidden, env validated, access control, sanitised input, XSS protection for Markdown answers and excerpts, rate limits, CORS, security headers, secure cookies and CSRF, debug off, dependency audit, exposed files check, secured database, Git history scan for secrets, upload abuse and prompt-injection tests). Then deploy with a custom domain, favicon, no builder badge, Privacy and Terms pages, persistent volumes proven by redeploy, backups, monitoring, and a phone smoke test. Write `docs/security-review.md`.

### End-of-phase report (mandatory)
What changed, files changed, commands and tests run with real output, matrix rows that changed status, screenshots (1440, 820, 390), what was not verified and why, remaining work, decisions needed from me.

---

# 6. HARD CONSTRAINTS AND ACCEPTANCE TESTS

**Constraints:** no mock AI, fake embeddings, fake citations, invented scores, or hardcoded answers. Zero Static Data in the user-facing UI. Calibrated, verifiable claims. No pill shapes, gradients, emoji icons, em dashes, decorative monospace labels, scroll or cursor effects, or fake window chrome. Every control works. Original words.

**Acceptance tests (all must pass before you say "done"):**
1. **No-crash test:** every route loads without console errors in a fresh profile, a profile with old saved state, and a profile with seeded documents. CI fails on any console error.
2. **Build-safety test:** an undefined variable fails the build locally and in CI (demonstrate by introducing one temporarily).
3. **Recovery test:** a corrupted saved-state value recovers without deleting documents or the visitor identity. "Reset local view" never touches documents.
4. **Provenance test:** all sample documents are described truthfully, with one description everywhere, and real attributions only where real.
5. **Screenshot test:** every public screenshot was captured by script from the current app with real provider calls, and shows no fake URL or window chrome.
6. **No-fake test:** without a key, the app shows a clear error and produces nothing fabricated. With a key, every number comes from real calls.
7. **PDF test:** every Advanced Level row (R1 to R14, W1, W2, Q1) is Pass with evidence, or an approved documented limitation.
8. **Evaluation test:** `docs/evaluation.md` contains only measured numbers, with the dataset and commands to reproduce them.
9. **Explanation and submission test:** `docs/EXPLAIN.md` lets me explain each PDF "you will be expected to explain" item without notes, the video script fits 3 to 5 minutes, the repository structure question is resolved with my mentor, and the validation email draft is ready for me to send.
10. **Human checks (never marked done on my behalf):** I verify five citations by hand against my own PDFs, try to break it with bad files and an injection sentence, record the video myself, and submit through the official form.

