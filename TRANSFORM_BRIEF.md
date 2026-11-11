# NEXUSRAG REAL-WORLD TRANSFORMATION PROMPT

> How to use: open the NexusRAG repository in Claude Code, paste this file (or save it as `TRANSFORM_BRIEF.md` in the project root), then say: "Read TRANSFORM_BRIEF.md, CLAUDE.md, BUILD_BRIEF.md, docs/original-master-spec.md and docs/assignment/ fully, then begin Step 1 only."

---

# 0. SITUATION

NexusRAG runs on localhost with a terracotta accent, an icon rail, a landing page, an ask-first home, a knowledge base table, a research desk, a document reader, a retrieval inspector, and settings. Most screens I reviewed were empty states, so I could not judge the RAG pipeline itself.

It does **not yet feel like a real, working website**. The causes are structural, not cosmetic: the public site and the app are mixed together, the hero shows invented proof, some copy was lifted from the reference screenshots, several controls have no matching feature, developer telemetry is shown to end users, and a real product's surrounding pages and systems are missing.

You act as a Principal Product Designer, Staff Full-Stack Engineer, UX Writer, Security Engineer, and Release Engineer. Your job is to **audit, restructure, fix, and ship**.

### Rules
1. **Authority order:** ShadowFox PDF in `docs/assignment/`, then `docs/original-master-spec.md`, then `BUILD_BRIEF.md`, then this brief. Where this brief changes something, say so in your plan.
2. **Evidence or it does not count.** Never say something works, passes, or is deployed unless you ran it and saw the result. Quote real output. Mark the rest "Not verified".
3. **Plan first.** Deliver Steps 1 to 3, then **wait for my approval**. Stop after every phase with a report.
4. **Run the real product.** Start the backend and frontend, upload real files, ask real questions, open citations, force failures, restart, delete, and test at 1440, 820, and 390 px, light and dark.
5. Use current official documentation for every library and hosting platform, and verify model IDs, limits, and prices from official pages. Use the `frontend-design` skill, Playwright MCP or Claude in Chrome, and a docs MCP. Tell me what is missing.
6. Never print or commit secrets. Anything needing my accounts, domain, or payment: give exact numbered steps.
7. Update `CLAUDE.md` at every phase end.

---

# 1. STEP 1: AUDIT (WRITE `docs/transform-audit.md`)

Confirm, fix, and extend every item below with screenshots and evidence.

## A. Honesty and originality (blockers)
1. **Fabricated proof in the landing hero.** The "3-Panel Verifiable Research Workspace" preview shows invented content: `annual_financial_report.pdf`, "18 chunks indexed (768-dim)", "Passed 0.700", "Operating revenue rose to $120.4 million in Q3", a "Page 4, Ch 2" quote about operating profit, and "Citation Integrity: 100% verified". None of it comes from the real pipeline. It breaks the Zero Static Data rule, and "100% verified" is an unsupported claim.
2. **Fake testimonial.** A quote card reads like a customer review ("...SO simple and useful. It's been the best RAG experience we've had.") attributed to "Verified Researcher, ShadowFox AI Internship". Remove it. Never ship invented quotes. It is also almost word for word the testimonial overlay from one of my reference screenshots.
3. **Copy lifted from references.** The announcement pill ("NEW Your knowledge base + verifiable search, finally working together") mirrors the reference landing page's pill. The Home heading ("Welcome / What will you discover today?"), the selectors, the Upload / Import / Create / Learn tiles, the table columns, and "View settings / Sort / Filter / Add or create" mirror another reference. The underlined headline accent mimics a reference gesture. References are for patterns, not words. **Rewrite all of it originally** and run an **originality audit**: web-search each distinctive headline, subhead, CTA, and section title in quotation marks, and rewrite anything that appears on another site.
4. **Reused headline.** "Ask your documents. See the passage that answers." is also the headline of my other project (DocuMind AI). Give NexusRAG its own positioning and headline.
5. **Overclaims:** "Skip hallucinated answers", "deterministic Directed Acyclic Graph", "links deterministically", "256-bit isolation", "protected by a 256-bit cryptographically secure session cookie and double-submit CSRF headers" (only keep security statements that are true and verified in code, in plain words). Model output is not deterministic and no system skips hallucination. Use calibrated language.
6. **Internship references inside the product:** footer "ShadowFox AI Track Advanced Level". Keep that in the README, not in the product.

## B. Structure and information architecture
7. **The landing page renders inside the app shell.** The icon rail, the app top bar ("Overview", Quick search, "System Ready", "ws:visitor"), the bottom status bar, **and** a second landing navigation are all visible at once. The route labelled "Overview" is the marketing page. Separate them: a public site at `/` with its own layout (no rail, no status bar), and the app under `/app/*`.
8. **No real dashboard.** The original spec's dashboard (total documents, collections, indexed chunks, recent documents, recent sessions, processing activity, quick actions, health) does not exist as a page. The current Home is an ask box with an empty table.
9. **Icon-only rail with no labels.** Add visible labels or an expandable rail. Two overlapping tooltips appear on hover ("Knowledge Bases" shown twice, and one covers the "Chats" label). Use one accessible tooltip.
10. **Permanent developer status bar** ("sqlite, 0 vectors, 0 chunks indexed, 256-bit isolation, v1.0.0") and a top-bar tag "ws:visitor". Remove from the normal UI. Show health only when degraded, and put diagnostics on a separate System page.

## C. Specification gaps (verify each against the spec and mark Pass, Partial, Fail)
11. **Database:** Settings shows "SQLite 3". The spec requires **PostgreSQL** for application metadata, in Docker Compose. Either implement PostgreSQL with migrations, or record a justified deviation and get my approval. Do not leave it silent.
12. **Settings (spec Page 7)** must include AI provider configuration status, model configuration, chunk size and overlap, retrieval top-K, reranking configuration, theme preference, storage and system health, and application information. Only storage and purge are visible.
13. **Knowledge bases:** create, rename, delete collection, search, filter, select, reindex, delete, real processing progress, indexed, failed, and pending status. The screen shows a folder list, a table, and an upload box, and I could not confirm the rest.
14. **Research workspace:** knowledge base selector, collection selector, document selection, filters, recent sessions, suggested questions, streaming Markdown, follow-ups, conversation history, sources with page, excerpt, relevance, and an open-source action.
15. **Document reader:** PDF preview, page navigation, extracted text, in-document search, highlighted source passages, citation-to-page navigation, metadata.
16. **Retrieval inspector:** original and rewritten question, scope, initial chunks with scores, reranked order, final context, evidence result, groundedness result, stage timeline with durations, errors and retries, all from persisted runs.
17. **Pipeline:** verify the whole LangGraph flow, FAISS persistence and reload, ID mapping, deletion, reindex without duplicates, scoped retrieval, workspace isolation, citation validation, SSE streaming, and the tests, exactly as listed in the original spec's acceptance checklist.

## D. Dead, ambiguous, or out-of-scope controls
18. Home tiles **Import, Create, Learn**, the **notification bell**, the **"R" avatar** (there are no accounts), the **"Shared" column** (there is no sharing), **"Favorites"**, the Research Desk quick actions **"Format citation" and "Research guidance"**, the **four colour dots** under the conversation (a leftover from an annotation tool), "Summarize PDF" (keep only if it truly works and is scoped), the model and word-count selectors (keep only if wired to real behaviour). **Every control must work or be removed.**
19. **Stuck or wrong values:** Settings shows "Workspace session ID: Generating..." that never resolves and "Workspace ID: -". The research footer shows "100% • 1 of 1 files" while 0 files are indexed. Find and fix the root causes. Do not display internal IDs or tokens to users.
20. **The "Zero Static Data Compliance Verification" table** in Settings is a developer proof shown to end users. Move it into an automated test and the docs.
21. The hint "up to 25MB" and every limit must come from configuration (`/api/v1/system/status` or a config endpoint), not literals in components.

## E. Visual craft and tone
22. Uppercase monospace micro-labels are used as decoration everywhere ("STORAGE & HEALTH TELEMETRY", "RELATIONAL DATABASE", "KNOWLEDGE BASE", "CHATS", "FOLDERS"). Reserve monospace for code and identifiers.
23. Pill shapes remain: the announcement pill, search fields, and toggles. No pill-shaped controls. Fake window chrome with traffic-light dots must go.
24. Three identical feature cards with icons. Replace with varied editorial rows built around real screenshots.
25. Jargon-heavy copy ("sentence-level FAISS embeddings", "groundedness gate", "tenant isolation", "telemetry", "DAG", "chunk strip"). Rewrite for a non-technical reader. Technical detail belongs in a Technical page.
26. Empty everywhere: a new user lands on blank screens with no guidance, no sample content, and no sense of what the product does. Fix with onboarding (Section 3).

## F. Missing real-world pieces
Check which of the items in Section 2 exist, and list every missing one.

---

# 2. WHAT A REAL, LIVE PRODUCT NEEDS (ADD EVERYTHING THAT IS MISSING)

## 2.1 Public website (separate layout, under `/`)
- **Landing page:** concrete headline in NexusRAG's own voice, one plain sentence, two real actions, and **a real proof element**: a working try-it box or a **real screenshot captured by script from the running app** using an openly licensed demo document. No invented content.
- **How it works** (upload, index, ask, check the source) with real screenshots.
- **Features** as varied editorial rows, each with one real screenshot: scoped questions across documents, cited answers with page numbers, the document reader with highlighted passages, the retrieval inspector (this is NexusRAG's real differentiator, show a real trace).
- **Supported formats and limits** (PDF, TXT, Markdown, size and page limits from config, scanned PDFs not supported without OCR, said plainly).
- **Privacy and data handling:** what is stored, where, for how long, how to export and delete, and that text is sent to the configured AI provider.
- **Security page** (honest, only verified controls) with a real contact for reporting a vulnerability.
- **FAQ** from real questions (accuracy, privacy, limits, file types, cost).
- **Documentation / Help centre:** user guide first (getting started, uploading, scopes, asking, reading citations, the inspector, limits, troubleshooting with real error messages), technical docs second (architecture, RAG pipeline, API reference generated from OpenAPI).
- **About and Contact** (working form or address), **Changelog**, **Status page** (real health, shown from the live backend), **Privacy Policy**, **Terms and Conditions**, **Acceptable Use** note, **cookie notice only if non-essential cookies or analytics exist**, branded **404 and error pages**.
- **Footer** with real links: Docs, Privacy, Terms, Security, Status, Contact, GitHub (if the repo is public and intended).
- **SEO and sharing:** per-page titles and descriptions, Open Graph and Twitter images generated from the real product, `robots.txt`, `sitemap.xml`, canonical URLs, `manifest.webmanifest`, favicon set (SVG, PNG sizes, Apple touch, maskable).

## 2.2 Application (under `/app`)
- **Dedicated app shell:** labelled navigation, workspace switcher, breadcrumbs, command palette (Cmd or Ctrl K) with only real actions, platform-aware shortcut hints, a help menu (docs, shortcuts, feedback, contact).
- **First-run onboarding:** a clear three-step path (add documents, wait for indexing, ask a question) and a one-click **"Add sample documents"** action that ingests a small set of **openly licensed** demo documents through the real pipeline, clearly labelled as demo content with source, licence, and attribution. Never claim "fair use" or "public domain" unless verified from the official source.
- **Real dashboard:** documents, collections, indexed chunks, recent documents, recent sessions, processing activity, quick upload, quick ask, and system health when degraded. All numbers computed live.
- **Upload tray** with real per-file byte progress, real pipeline stages, cancel, retry, duplicate handling, and real failure reasons.
- **Notifications that are real** (ingestion finished, ingestion failed) or no bell at all.
- **Usage and limits panel** showing real quotas and what happens at the limit.
- **Feedback control** that stores or sends feedback for real.
- **Session and identity UX:** if visitors are anonymous, say so plainly, explain what happens if the cookie is lost, and offer optional sign-in (email link or OAuth) for continuity. Never show tokens or internal IDs.
- **Offline, backend-down, rate-limited, expired-session, and missing-API-key states** that are designed and honest.
- **Keyboard shortcuts sheet, mobile layouts** (bottom sheets for sources and inspector), full accessibility.

## 2.3 Trust and compliance
- Privacy Policy and Terms drafted from what the app actually does (mark as drafts for my review, and tell me to check whether Indian data protection rules apply). A visible note near answers: answers can be wrong, check the cited passage. Delete-all and export that really remove or return everything (files, rows, vectors, traces). A retention job with a tested schedule.

## 2.4 Operations
- Rate limits and quotas per visitor and per IP, bot protection on public endpoints (for example Cloudflare Turnstile), a global budget guard for provider calls, structured logs with request IDs, error tracking, uptime monitoring, health and readiness endpoints, backups with a tested restore, CI (backend tests, frontend lint and build, Playwright smoke, dependency audit, secret scan), a rehearsed rollback, production configuration with debug off.

---

# 3. STEP 2 AND 3: DESIGN AND PLAN (WRITE `docs/transform-plan.md`, THEN WAIT FOR APPROVAL)

1. **Research:** open real live products with the browser tool (public pages and docs only where login is needed) and write `docs/transform-research.md`. Study how real RAG and knowledge products present: marketing structure and proof (Linear, Stripe, Vercel, Resend), search-first home (Dropbox Dash, Glean), research workspace (NotebookLM, Perplexity), reading view (Readwise Reader), tables (Notion, Attio), command palette (Raycast), trace UIs (LangSmith, Langfuse, Arize Phoenix), docs (Stripe Docs, Mintlify). Record layout, type scale, copy tone with paraphrased examples, empty states, and motion timing. **Adopt patterns, never words.**
2. **Identity:** keep the terracotta direction if I approve it, but redesign the chrome. Propose the typography pairing, spacing and radius scales, and light and dark tokens. No gradients, no glow, no pill shapes, no emoji icons, no em dashes, no decorative monospace labels, no scroll or cursor effects. One purposeful signature motion at most (for example a thin line from a clicked citation to its passage). Respect reduced motion.
3. **Copy deck:** every string, old and new, plain and specific, originality-checked.
4. **Information architecture:** route map separating `/` (public) from `/app/*`, navigation labels, page list with empty, loading, populated, and error states, low-fidelity wireframes at desktop and mobile.
5. **Spec-gap decisions:** PostgreSQL versus a justified deviation, Settings content, anything marked Partial or Fail, with effort and risk.
6. **Deployment plan:** compare current hosting options for a stack with PostgreSQL, FAISS files, and uploads (a container host with persistent disks or a small VPS with Docker Compose), verifying limits and prices from official pages. Same-site frontend and API so the secure cookie works. Ask me to choose.
7. **Rank every defect:** Blocker, High, Medium, Low.

**Stop and wait for my approval.**

---

# 4. STEP 4: IMPLEMENTATION IN PHASES (STOP AFTER EACH WITH A REPORT)

**T1: Blockers.** Remove fabricated proof and the fake testimonial, rewrite copied and overclaiming copy, drop dead controls, fix stuck values, move internship references, fix identity and isolation, verify the PostgreSQL decision, hide internal IDs and tokens.
**T2: Structure.** Separate the public site from the app, build the app shell and real dashboard, remove the developer status bar, fix tooltips and labels.
**T3: Product completeness.** Settings per spec Page 7, knowledge base features, upload tray, onboarding and sample documents, research workspace, reader with highlighting, retrieval inspector, notifications, usage panel, feedback, designed error states.
**T4: Public site.** Landing with real screenshots (captured by a Playwright script so they can be regenerated), how it works, features, formats and limits, privacy, security, FAQ, docs and help centre, about, contact, changelog, status, legal pages, 404, footer, SEO and icons.
**T5: Quality.** Backend tests, frontend tests, Playwright end-to-end flows, accessibility audit, cross-browser, mobile, real retrieval evaluation with measured numbers only, and the originality and real-data audits (Section 5).
**T6: Security pass (report evidence for each).** API keys hidden, env validated, protected admin routes, access control, sanitised input, XSS protection (especially Markdown answers and excerpts), rate limiting, secured endpoints, CORS limited to exact origins, security headers (CSP, HSTS, X-Content-Type-Options, frame, referrer, permissions), secure cookie flags and CSRF, debug off, dependency updates with `pip-audit` and `npm audit`, unused code removed, exposed files check (`.env`, `.git`, storage, source maps), database secured, passwords hashed if accounts exist, **full Git history scan for leaked secrets**, upload abuse tests, prompt-injection tests. Write `docs/security-review.md`. No enterprise-grade or compliance claims.
**T7: Go live.** Deploy, **custom domain with HTTPS**, **favicon and app icons**, **any "Made with AI" or builder badge removed**, Privacy and Terms live and linked in the footer and upload flow, production variables, persistent volumes proven by redeploying, backups, monitoring, error tracking, CI green, rollback rehearsed, live smoke test from a phone, README screenshots regenerated from the live site.
**T8: Final verification and submission pack.** Re-run the whole audit, write the requirement-to-implementation mapping, README (all required sections), docs, a 3 to 5 minute demo script and shot list, a one-page technical summary, and a cost-safety checklist for the AI provider key (separate production key, restrictions, quota alerts or spending cap, rotation steps).

### End-of-phase report (mandatory)
What changed, files changed, commands and tests run with real output, screenshots (1440, 820, 390, light and dark), what was not verified and why, remaining work, decisions needed from me.

---

# 5. HARD CONSTRAINTS AND ACCEPTANCE TESTS

**Constraints:** Zero Static Data (no hardcoded numbers, names, documents, answers, scores, statuses, versions, model names, limits, or retention periods in user-facing UI). No fake metrics, reviews, testimonials, customer logos, pricing, or counters. Not generic or vibe-coded. Honest, calibrated claims. Every control works. WCAG AA in both themes. Original product, original words.

**Acceptance tests (all must pass before you say "done"):**
1. **Structure test:** the public site and the app have separate layouts. No app chrome on the landing page, no landing navigation inside the app.
2. **Real-proof test:** every number, filename, quote, and screenshot on public pages comes from the real running system. A grep of the built frontend finds no hardcoded numbers, filenames, model names, statuses, or scores outside labels and legal text. Report the output.
3. **Originality test:** every headline, subhead, CTA, and section title was web-searched in quotation marks, and none matches another site. The announcement pill, testimonial, and reference copy are gone.
4. **Dead-control test:** click every control. None is dead, ambiguous, or out of scope.
5. **Spec test:** PostgreSQL (or an approved deviation), Settings Page 7 content, dashboard, collections, reader, inspector, and the full LangGraph flow all verified with real runs. The original spec's acceptance checklist is mapped to evidence.
6. **First-run test:** a brand-new visitor can add sample documents with one click, ask a question, open a citation on the exact page, and view the run in the inspector, with no instructions.
7. **Honest-failure test:** unrelated question abstains in a designed state. Forced bad citation is stripped. Missing API key shows a clear configuration error. Backend down, rate limit, and expired session show designed states.
8. **Isolation and deletion test:** another visitor cannot read my data (tested). Delete-all removes files, rows, FAISS vectors, and traces (verified). Reindex leaves no duplicate vectors (verified). No token or internal ID appears in the UI.
9. **Persistence test:** Docker Compose starts everything, and documents, database, and indexes survive a restart and a redeploy.
10. **Live test:** custom domain, HTTPS, favicon, no builder badge, Privacy and Terms, status page, monitoring, backups, CI green, and a stranger on a phone can use it end to end.
11. **Tests and audits:** backend tests, frontend tests, Playwright end-to-end, accessibility audit, cross-browser run, security checks, and a retrieval evaluation containing only measured numbers, all run with real output.
12. **Human checks (never mark done on my behalf):** I upload my own PDFs and verify five citations by hand, try to break it with bad files and an injection sentence, use the live site on my phone, have three people try it unaided, and read the legal pages in full.

---

# FINAL COMMAND

Begin with **Step 1 only**.

1. Read this brief and the documents named at the top. Summarise the constraints you consider most important and any conflicts between documents.
2. Check available tools (browser MCP or Chrome extension, docs MCP, GitHub MCP, `frontend-design` skill) and list anything missing.
3. Run both servers and the test suite, capture every route at 1440, 820, and 390 px in both themes, execute the real flows, and write `docs/transform-audit.md` with evidence, including the originality audit.
4. Continue to Steps 2 and 3, then **stop and wait for my approval**.

I want a NexusRAG that a stranger would believe is a real, shipped product: separate public site and app, real proof, original words, every feature working, honest claims, and live on a real domain.
