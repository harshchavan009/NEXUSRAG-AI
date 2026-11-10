# NexusRAG: Page Layouts & Low-Fidelity Wireframes

> **Document:** `docs/wireframes-and-layouts.md`  
> **Phase:** Phase 1 Deliverable  
> **Target Pages:** 7 Core Application Pages  
> **States Covered:** Populated, Empty, Loading, and Error states for every screen

---

## Page 1: Editorial Landing Page (`/`)

### Layout Architecture
- **Header:** Brand mark (geometric document frame with citation bracket) + wordmark "NexusRAG", navigation links (`Capabilities`, `Workflow`, `Documentation`), theme toggle, and primary CTA button (`Open Workspace`).
- **Hero:** Left-aligned or centered editorial block:
  - Headline: "Ask your documents. See the passage that answers."
  - Subhead: "A production-grade retrieval workspace that parses PDF, TXT, and Markdown documents, verifies evidence through LangGraph workflows, and pins citations to the exact source page."
  - Actions: `[Open Workspace]` (Solid Accent), `[Explore Features]` (Hairline Border).
- **Product Proof:** Framed real application screenshot captured via Playwright script from the live running app, showing the 3-panel research desk with highlighted passage and citation drawer.
- **Workflow Section:** Real LangGraph execution DAG diagram showing the 9 nodes (`validate_input` -> `rewrite_query` -> `retrieve` -> `rerank` -> `check_evidence` -> `generate` -> `validate_citations` -> `validate_groundedness` -> `finalise`).
- **Supported Formats & Capabilities:** PDF, TXT, Markdown. Transparent disclosure of limitations (e.g. Scanned PDFs without embedded text layer require OCR).
- **Security & Data Handling:** Calibrated explanation: visitor cookies expire after 7 days; text excerpts are sent to configured LLM API; zero false certifications claimed.
- **Pre-Footer CTA & Footer:** Links to Privacy Policy, Terms of Service, API Docs, and GitHub repository.

### State Variations
- **Populated State:** Displays dynamic stats from `GET /api/v1/system/status` (supported models, active engine version, vector store status).
- **Loading State:** Minimalist hairline skeleton pulses for dynamic status indicators while initial config loads.
- **Empty State:** N/A (Marketing and product explanation canvas).
- **Error State:** If backend status endpoint fails, a discrete inline alert notes: "Backend status temporarily unreachable. Workspace features may run in offline demo mode."

---

## Page 2: Dashboard (Ask-First Home, Ref 4 Logic) (`/dashboard`)

### Layout Architecture
- **Top Greeting & Header:** "Welcome to NexusRAG" with breadcrumbs and workspace context.
- **Ask-First Composer (Hero Element):**
  - Expansive question input area (`textarea` auto-resizing).
  - Bottom controls inside the composer frame:
    - Scope Selector (`All Collections`, `Specific Collection`, `Selected Documents`).
    - Model / Detail level tag (e.g., `Standard Synthesis`, `Comprehensive Report`).
    - Submit Action Button (`[Ask NexusRAG]` with enter shortcut hint `↵`).
- **Quick Action Bar:** Single clear upload action tile (`[+ Ingest Documents]`).
- **Real Metrics Strip:** 3 live-computed metric cards:
  - `Indexed Documents` (count from DB)
  - `Active Collections` (count from DB)
  - `Indexed Vectors` (total chunks in FAISS)
- **Recent Documents Table:**
  - Columns: `Name & Format`, `Collection`, `Pages`, `Indexed Chunks`, `Summary` (backend-generated one-sentence abstract), `Added`, `Actions`.
- **Recent Research Sessions Rail:** Last 3 active research threads with timestamp and query preview.

### State Variations
- **Populated State:** Full table of documents with real summaries, live vector counts, active recent sessions.
- **Loading State:** Skeletons in table rows and metric cards while `TanStack Query` fetches `/api/v1/workspaces` and `/api/v1/documents`.
- **Empty State (First Run / New Visitor):**
  - Ask box is disabled with placeholder: "Upload your first document below to start asking questions."
  - Metrics show `0 Documents`, `0 Collections`, `0 Chunks`.
  - Recent table replaced with an Onboarding Card: "No documents in your library yet. Drag and drop a PDF, TXT, or Markdown file to begin."
  - Primary button: `[Ingest First Document]`.
- **Error State:**
  - Table shows retry banner: "Unable to load document library. [Retry Connection]".

---

## Page 3: Knowledge Bases & Ingestion Desk (Ref 1 & 2 Logic) (`/documents`)

### Layout Architecture
- **Left Column (Collections Tree, Ref 2):**
  - Root: "All Documents" (total count badge).
  - Nested collections: e.g. "Legal Contracts", "Technical Specs", "Research Papers" with `+ New Collection` button, rename, and delete actions.
- **Center / Main (Document Table, Ref 1):**
  - Toolbar: Search input (`Find in library...`), View switcher (`List` / `Grid`), Collection filter dropdown, Status filter dropdown.
  - Bulk actions bar (appears when rows are checked): `[Reindex Selected]`, `[Delete Selected]`.
  - Table: Multi-select checkbox, File Type Icon, Document Name, Status Dot + Text (`Indexed`, `Processing`, `Failed`), Pages, File Size, Chunks, Date Added, Row Actions (Delete, Reindex).
- **Right Column (Upload Tray Desk, Ref 1):**
  - Drag-and-drop dropzone with dashed border and browse button.
  - Active upload queue list: each file displays filename, byte progress bar (`1.4 MB / 4.2 MB`), current stage pill (`Extracting pages...`, `Generating embeddings...`), and an `[X]` Cancel button.

### State Variations
- **Populated State:** Table filled with rows, real statuses, upload tray shows completed or active jobs.
- **Loading State:** Table rows render 5 skeleton placeholders; collection tree shows loading pulse.
- **Empty State:** Dropzone is enlarged to center canvas: "Your library is empty. Drop PDF, Markdown, or text files here."
- **Error State:**
  - If a file upload fails validation (e.g. password protected or scanned PDF without text), the tray card turns red: "Scanned document; OCR unavailable. Please upload a PDF with embedded text layer. [Dismiss]".

---

## Page 4: Research Workspace Desk (Ref 3 Logic) (`/research`)

### Layout Architecture (3-Panel Desk)
- **Left Panel (Scope & Threads, 260px):**
  - Search Scope selector: hierarchical checkbox tree of collections and individual documents.
  - Scope Summary: "3 of 12 documents selected (42 pages, 158 chunks)".
  - Past Research Sessions list with `+ New Session` action.
- **Center Canvas (Conversation & Evidence Synthesis, Flex-1):**
  - Session Header: Active scope indicator, `[Clear Conversation]`, `[Export Thread]`.
  - Suggested Questions Bar: 3 suggested questions generated from the selected document context.
  - Conversation Stream:
    - User message bubble (subtle neutral card).
    - Assistant response: Typeset in high-legibility serif with markdown headers, bullet points, and inline citation chips `[1]`, `[2]`.
    - Message Action Bar: `[Copy Markdown]`, `[Regenerate]`, `[View Trace in Inspector]`.
  - Composer: Multi-line input with send button, stop streaming button during generation, and shortcut hints.
- **Right Panel (Source Evidence Desk, Ref 3 Logic, 340px):**
  - Three Tabs: **Passages** | **Citation** | **Document**
  - **Passages Tab:** Vertical stack of cards for each retrieved chunk supporting the answer. Each card shows:
    - Rank / Similarity Score badge (e.g. `Rank 1 • Inner Product 0.84`)
    - Source document title & page number (e.g. `financial_report.pdf • Page 14`)
    - Exact chunk excerpt text with keyword highlights
    - Action: `[Open in Reader →]`
  - **Citation Tab:** Formatted academic / legal citation string ready for copy.
  - **Document Tab:** File size, total chunks, ingestion date, collection association.
  - *Behavior:* Panel stays collapsed until an answer contains retrieved evidence. On mobile (390px), switches to an accessible bottom sheet.

### State Variations
- **Populated State:** Active dialogue with streamed answer, inline citation chips, and populated source tabs.
- **Loading / Streaming State:** Streaming response with animated token output; stage indicator above composer shows LangGraph progress: `Retrieving candidates...` -> `Reranking...` -> `Validating citations...`.
- **Empty State:** Clean conversational canvas with document scope selector and prompt: "Select documents on the left and ask a question to begin research."
- **Abstention State (Insufficient Evidence):** When questions fall outside the uploaded documents, the assistant displays a calibrated refusal: "I could not find sufficient information in the selected documents to answer this question. (Evidence sufficiency score 0.28 below threshold 0.65)."
- **Error State:** Banner above composer: "Failed to connect to AI provider. Please verify API configuration in Settings. [Retry]".

---

## Page 5: Document Reader & Highlighting View (`/reader/:documentId`)

### Layout Architecture
- **Top Chrome:**
  - Back to workspace link (`← Back to Library`).
  - Multi-document tab bar (Ref 2): switch between currently open documents.
  - Viewer controls: `< Page 4 of 24 >`, Zoom controls (`-`, `+`, `Fit Width`), In-Document Search bar (`Find in text...`), and Extracted Text toggle.
- **Main Reading Canvas:**
  - High-fidelity PDF rendering via `PDF.js` / canvas text layer.
  - Markdown/TXT rendering in clean, readable serif typography.
  - **Cited Passage Highlighting:** When navigated from an answer citation `[1]`, the reader auto-scrolls to the exact target page and highlights the bounding box / text span with a warm ochre tint.
- **Right Evidence Sidebar:**
  - Displays the active citation excerpt that brought the user here.
  - Document metadata: SHA-256 hash, token count, chunk breakdown.

### State Variations
- **Populated State:** PDF rendered with text-layer selection and active yellow/ochre highlight on cited span.
- **Loading State:** Centered progress spinner with page-count loader.
- **Error State:** "Failed to render document preview. [Download Raw File] or view extracted text mode."

---

## Page 6: Retrieval Inspector (`/inspector/:runId`)

### Layout Architecture (Trace UI Logic - LangSmith / Phoenix Style)
- **Header:** Run ID (`run_...`), Execution Timestamp, Total Latency (`1,240 ms`), Final Status (`Completed • 4 Citations Validated`).
- **Stage Execution Timeline (DAG Nodes):**
  - Visual horizontal or vertical sequence with real measured millisecond durations:
    `validate_input (12ms)` → `rewrite_query (180ms)` → `retrieve (45ms)` → `rerank (210ms)` → `check_evidence (85ms)` → `generate (640ms)` → `validate_citations (34ms)` → `validate_groundedness (34ms)`.
- **Node Drilldown Panels:**
  1. **Query Transformation:**
     - Original User Query
     - Rewritten Search Query (with note if skipped for standalone queries)
  2. **Candidate Retrieval & Reranking:**
     - Table of retrieved chunks: Original Rank, Chunk ID, Document Name, Page, Initial Vector Score (Inner Product), Reranked Score, Selection Status (`Included in Context` vs. `Pruned`).
  3. **Evidence Sufficiency:**
     - Sufficiency metric, threshold applied, decision (`Proceed to Generation` vs. `Abstain`).
  4. **Citation Validation Matrix:**
     - Extracted citation tokens, verification status against retrieved chunk IDs (`Validated`, `Stripped`).
  5. **Groundedness Verdict:**
     - Model-based judge score and hallucination risk classification.

### State Variations
- **Populated State:** Complete trace details fetched from PostgreSQL `workflow_runs` table.
- **Loading State:** Skeleton trace timeline while run data is loaded.
- **Error State:** "Trace ID not found or expired under retention policy."

---

## Page 7: Settings & Data Governance (`/settings`)

### Layout Architecture
- **Tab Navigation:** `Provider & Models` | `RAG Parameters` | `Appearance` | `Data & Privacy` | `System Health`
- **Tab 1: Provider & Models:**
  - AI Provider status (Google Gemini API / OpenAI API).
  - API Key status: "Configured via environment variable (`GEMINI_API_KEY`)" (never displays secret keys).
  - Model selection dropdowns (Embedding model, Generation model).
- **Tab 2: RAG Parameters:**
  - Chunk Size (tokens, default 700, range 200-1500).
  - Chunk Overlap (tokens, default 100, range 0-300).
  - Top-K Retrieval limit (default 8).
  - Final Context Limit (default 4).
  - Reranker toggle and threshold.
- **Tab 3: Appearance:**
  - Theme mode: Light (Default) / Dark / System.
- **Tab 4: Data & Privacy:**
  - Retention notice: "Your session and uploaded files are automatically purged after 7 days of inactivity."
  - `[Export All Data (ZIP)]`: Exports JSON manifest of documents, chunks, sessions, and raw files.
  - `[Delete All Data]`: Destructive modal with double-confirmation that purges all database records, FAISS vector indexes, uploaded files, and clears the session cookie.
- **Tab 5: System Health & Diagnostics:**
  - PostgreSQL connection status.
  - FAISS index health and vector count.
  - Storage disk usage (MB used).

### State Variations
- **Populated State:** Displays live runtime configuration and parameters from `GET /api/v1/system/status`.
- **Loading State:** Form controls show loading skeletons while reading runtime status.
- **Error State:** Connection alert if runtime configuration cannot be queried.
