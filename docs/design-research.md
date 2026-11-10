# NexusRAG: Design Research & Pattern Synthesis

> **Document:** `docs/design-research.md`  
> **Phase:** Phase 1 Deliverable (Design Research & Synthesis)  
> **Target Product:** NexusRAG (Production-Grade Agentic RAG Workspace)  
> **Status:** Completed for Review

---

## 1. Study of Reference Screenshots (`docs/references/`)

### Ref 1: Documents Table with Upload Tray (`ref-1-documents-table.png`)
- **Direct Observations:**
  - **Layout Structure:** Calm split layout. Dark slate icon rail on the left (neutral, dark gray/slate background with muted white icons), crisp light central workspace, and a right-anchored upload drawer/tray.
  - **Table Architecture:** High-density document list displaying filename with filetype badge (PDF, PNG, SVG), size in KB, sharing metadata ("3 Members"), file type category, timestamp ("3/5/22 8:00AM"), and an inline row hover action (trash icon for deletion).
  - **Search & Filters:** Top bar with a "Find Documents" search input, view switcher (Grid vs. List), and secondary dropdown filters ("All Documents", "Documents Type").
  - **Upload Tray:** Right-hand drag-and-drop zone ("Drag And Drop Your Files Here" with dashed bounding box and "Upload file" CTA) positioned above an active per-file upload queue.
  - **Progress Visuals:** Each queued file card displays file icon, filename, horizontal progress bar, and an explicit `(X)` cancel/remove icon.
- **Patterns to Adopt:**
  - Table-first library with row-level hover actions (Delete, Reindex).
  - Integrated right-side upload tray with real per-file byte progress and explicit cancel capabilities.
  - Clean view mode toggle (Grid vs. List) and structured filter bars.
  - Muted, low-cognitive-load navigation icon rail.
- **Patterns to Reject (Do Not Adopt):**
  - Pill-shaped search inputs and rounded pill buttons.
  - "Shared / Members" multi-tenant collaboration columns (NexusRAG is personal isolated workspaces).
  - Decorative user avatars and warm brown accent bubbles.
  - Generic file types (e.g. 3D vector files, generic PNGs) that are irrelevant to text-based RAG.

---

### Ref 2: Research Reader with Tabs and Assistant (`ref-2-research-reader.png`)
- **Direct Observations:**
  - **Layout Structure:** Multi-pane workspace: Left hierarchical tree nav, center PDF reader view, secondary drafting document view, and far-right Assistant side-rail.
  - **Collection Tree:** Left panel organizes files into "Recent", "Favorites", and nested "Projects" (e.g., `Dissertation > Literature > research-methods.pdf`), with a pinned `+ New Project` button at the bottom.
  - **Multi-Document Tabs:** Header bar hosts persistent document tabs (`research-methods.pdf`, `systematic-review.pdf`, etc.) allowing fast switching between active reference files.
  - **In-Reader Highlighting:** Central PDF viewer displays an academic paper with exact highlighted text passages in a warm yellow tint ("In recent years, there has been growing interest in mixed-methods approaches...").
  - **Viewer Controls:** Bottom floating toolbar providing zoom percentage (`100%`), page counter (`1/24`), previous/next navigation buttons, and action buttons (search, bookmark, export).
  - **Assistant Panel:** Right column provides quick action pills ("Paraphrase selection", "Format citation", "Summarize PDF", "Research guidance") and a conversational query box ("Ask a question...").
- **Patterns to Adopt:**
  - Hierarchical Collections tree navigation for knowledge base scoping.
  - Multi-document tab bar for seamless switching between ingested research papers.
  - Exact passage highlight overlay pinned directly to document coordinates.
  - Reader toolbar with zoom levels and exact page navigation.
  - Right-anchored assistant panel maintaining conversational context beside the active reader.
- **Patterns to Reject (Do Not Adopt):**
  - Rich-text drafting editor (NexusRAG is a research and retrieval system, not a collaborative word processor).
  - Subjective writing actions like "Paraphrase" or "Format citation style".
  - Color-dot palette picker toolbar.

---

### Ref 3: PDF Annotator with Citation Panel (`ref-3-pdf-annotator.png`)
- **Direct Observations:**
  - **Layout Structure:** Dedicated reading canvas with top navigation chrome and a structured right-hand metadata and citation inspection drawer.
  - **Header Controls:** Application mark ("Logically File Annotator"), page counter (`< 4 of 20 >`), zoom controls (`Automatic`), in-document search field (`Search file content...`), and document download/notification icons.
  - **Grounding Visuals:** Multiple highlighted text spans across the PDF canvas in differentiated categorical colors (yellow, green, purple, blue).
  - **Contextual Annotation Popover:** Hover/click popover pinned to a highlighted passage displaying the AI summary, author attribution (`Rains et al., 2016, p. 1`), and structured "Key Points".
  - **Right Inspector Panel:** Structured tab navigation with **Info**, **Citation**, and **Notes**. Displays chronologically sorted excerpt cards, page references, comment threads, and a bottom "Ask AI" query composer.
- **Patterns to Adopt:**
  - Three-tab source evidence panel (**Passages**, **Citation**, **Document**).
  - Inline citation markers in answers that cross-link directly to highlighted passages on specific PDF pages.
  - In-document keyword search across the extracted text layer.
  - Structured excerpt cards showing exact snippet text, document title, and page index.
- **Patterns to Reject (Do Not Adopt):**
  - Freeform manual pen/drawing tools and multi-color highlighters.
  - Collaborative commenting/notes feature set (out of scope for verified RAG).

---

### Ref 4: Ask-First Home with a Table (`ref-4-ask-first-home.png`)
- **Direct Observations:**
  - **Layout Structure:** Clean search-first dashboard with a left navigational rail and expansive central content area.
  - **Editorial Hero & Ask Box:** Greeting headline ("Welcome, What will you discover today?"), followed by a large prominent input field ("Ask a general knowledge question...").
  - **Composer Scope Selectors:** Within the bottom border of the ask composer: model selector dropdown (`Gemini 2.5 Flash`), length limiter (`250 words`), knowledge scope dropdown (`General Knowledge`), and submit action button.
  - **Quick Action Tiles:** 4 horizontal action cards below the ask composer: `Upload`, `Import`, `Create`, `Learn`.
  - **Document Summary Table:** Below quick actions, a comprehensive table with "View settings", "Sort", "Filter", and "+ Add or create". Columns: `Title` (with document type icons), `Authors`, `Added`, `Viewed`, `File type`, and crucially a **Summary** column showing generated one-sentence abstracts.
  - **Left Rail Components:** Navigation items (Home, Search, Chats, Folders), "What's new" notification card, and plan usage meters ("AI words/day 0/1000", "Imports/day 1/5").
- **Patterns to Adopt:**
  - **Ask-First Dashboard:** Prominent query box immediately accessible upon workspace entry.
  - **Scope Selectors inside the Composer:** Direct control over query target (collection scope, document subset).
  - **Summary Column in Library Table:** Displaying authentic, backend-generated, persisted summaries for indexed documents.
  - Clean table sort and filter mechanisms.
- **Patterns to Reject (Do Not Adopt):**
  - Commercial plan usage meters, upsell banners, and "Upgrade / Get unlimited" buttons.
  - "What's new" product marketing cards and synthetic activity metrics.
  - Four generic action tiles (replaced by a single, functional "Upload Document" flow).

---

### Ref 5: Marketing Landing Page (`ref-5-landing-slite.png`)
- **Direct Observations:**
  - **Layout Structure:** Elegant, warm, editorial landing page (Slite). Off-white/cream canvas background (`#FAF7F2`), centered high-contrast typography, minimal header navigation, and a large framed application screenshot below.
  - **Hero Architecture:** Short announcement pill at top ("NEW Your knowledge base + enterprise search..."), bold confident headline ("Where knowledge goes to die thrives"), concise descriptive subhead ("Skip the software learning curve..."), and two balanced CTAs: secondary outline ("Start for free") and primary solid ("Book a demo").
  - **Product Proof:** Framed product application screenshot positioned directly below the fold, showing the real application interface (knowledge management sidebar, document canvas) as undeniable evidence of product capability.
- **Patterns to Adopt:**
  - Warm neutral canvas establishing a calm, intellectual, editorial tone.
  - Confident, concrete, short headline focusing on what the system does.
  - Dual CTA pairing (Primary "Open Workspace" / Secondary "Explore Features").
  - Large framed real product screenshot captured via script from the live running app as empirical proof.
- **Patterns to Reject (Do Not Adopt):**
  - Strikethrough/handwritten script headline gimmick ("goes to die thrives").
  - Overlaid floating customer testimonial cards and fake quote bubbles.
  - Fully rounded pill buttons and pill announcement chips.

---

## 2. Study of Live Reference Products

| Product | Area Studied | Key Observations & Usable Patterns | Rejected Patterns |
|---|---|---|---|
| **NotebookLM** (Google) | Source rail & citation grounding | Pinned left source rail showing uploaded documents with checkboxes; answers feature hyper-clean bracketed citation chips (`[1]`, `[2]`) that immediately slide out the exact extracted chunk in an evidence drawer. | Opaque audio overview generation; lack of retrieval score transparency. |
| **Perplexity** | Answer layout & source cards | Horizontal source excerpt cards at top of response with domain favicon, title, and snippet. Inline citation numbers match source cards. Clean typography. | Consumer web search bias; dense advertising and sponsored source links. |
| **Linear** | Density, shortcuts & restraint | Strict keyboard shortcut navigation (`Cmd+K`, `G then D`), ultra-crisp hairline borders (`1px`), small corner radii (4-6px), monospace identifiers only for UUIDs and hashes. Zero fluff. | Project management specific workflows; dark-mode default bias. |
| **Notion** | Database table views | Compact row density, inline property editing, clean status tags (dot + label), column reordering, and immediate empty-state messaging. | Block editor complexity; sluggish drag-and-drop hierarchy. |
| **Readwise Reader** | Reading view & typography | Highest legibility editorial typography: optical sizing on serif body text, high contrast without harsh pure black, left-aligned reading column locked to 68ch measure. | Complex highlight categorization rules. |
| **Glean / Dropbox Dash** | Search-first enterprise home | Universal search bar with immediate scope filter chips (`All`, `PDFs`, `Specific Collections`), instant search results with highlighted matching keywords. | Enterprise LDAP/SAML overhead; noisy cross-app integrations. |
| **LangSmith / Phoenix** | Trace & retrieval inspector | Step-by-step DAG execution timeline: input query -> rewritten query -> raw retrieval candidates (with cosine distance) -> reranked order -> evidence sufficiency gate -> generation token stream. Millisecond duration tags. | Raw developer JSON dumps without user-friendly visual hierarchy. |

---

## 3. The 12 Synthesized Design Patterns for NexusRAG

1. **Ask-First Entry Point (from Ref 4 & Glean):** The main dashboard opens with an expansive inquiry composer, enabling immediate questioning without forcing manual document browsing first.
2. **Context-Aware Scope Chips (from Ref 4 & NotebookLM):** Query scoping controls (All Documents, Specific Collection, Selected Files) are housed directly inside the question composer.
3. **Table-First Knowledge Base with Stored Summaries (from Ref 1, Ref 4, Notion):** Document library prioritizes a dense, sortable data table displaying real metadata, page counts, chunk metrics, and a genuine backend-generated document summary.
4. **Right-Anchored Upload Tray with Real Byte Progress (from Ref 1):** Uploads do not occur in an opaque modal. They expand an upload desk showing real byte transfer, validation stages, and cancel buttons.
5. **Hierarchical Collections Tree (from Ref 2):** Nested folder/collection tree on the left sidebar for organizing documents across domains and research topics.
6. **Multi-Document Tabbed Reader (from Ref 2):** Document viewer supports multi-document tabs, allowing users to jump between reference PDFs while preserving viewer state.
7. **Three-Tab Source Evidence Desk (from Ref 3):** Right drawer organizes retrieved evidence into **Passages** (raw chunks with similarity scores), **Citation** (academic attribution), and **Document** (file metadata).
8. **Interactive Citation Linking & In-Reader Highlighting (from Ref 2 & Ref 3):** Clicking an inline citation chip `[1]` in the answer scrolls the PDF viewer to the exact page and highlights the corresponding sentence/chunk.
9. **Visual Separation of Generated Text vs. Evidence (from Ref 2 & NotebookLM):** Synthesized LLM answers render in an editorial reading serif; retrieved evidence chunks appear in quoted neutral paper containers.
10. **Trace Timeline Retrieval Inspector (from LangSmith & Phoenix):** A dedicated inspection view exposes the LangGraph DAG run: original query, rewritten query, initial vector candidates, reranked results, evidence sufficiency verdict, and token latency.
11. **Keyboard-First Command Palette (from Linear):** Global `Cmd+K` / `Ctrl+K` command menu providing rapid search, navigation, theme switching, and document upload triggers.
12. **Empirical Editorial Landing Frame (from Ref 5):** Public landing page pairs a concise, honest value proposition with a full-size, unmocked Playwright screenshot of the running workspace.

