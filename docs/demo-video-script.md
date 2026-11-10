# NexusRAG: 3-to-5 Minute Demonstration Video Script

**Internship:** ShadowFox AI Engineer Track (Advanced Level)  
**Project:** NexusRAG — Reference-Driven, Production-Grade RAG Assistant  
**Target Duration:** 4 minutes 15 seconds (255 seconds)  

---

## Slide & Screen Progression Overview

| Timestamp | Screen / View | Topic | Key Narrative Points |
|---|---|---|---|
| **0:00 - 0:35** | Slide 1 & Landing Page | Introduction & Product Philosophy | What NexusRAG is; reference-driven UI; zero static data rule; calibrated claims. |
| **0:35 - 1:15** | Dashboard & Knowledge Bases | Ingestion, Chunking & FAISS | Live ingestion tray; PyMuPDF character offsets; token chunker; FAISS IndexIDMap2. |
| **1:15 - 2:30** | Research Desk | 9-Node LangGraph & Streaming | Live SSE query; prompt delimitation; bracketed citations `[1]`; evidence sufficiency gate. |
| **2:30 - 3:20** | Retrieval Inspector | Observability & Anti-Hallucination | Execution timeline waterfall; candidate scoring; sufficiency vs. groundedness gates; abstention. |
| **3:20 - 4:00** | Settings & Benchmark Evaluation | Verification, Security & Metrics | 100% P@1 and Recall@4; 0 vulnerabilities (`pip-audit`, `npm audit`); 256-bit tenant isolation. |
| **4:00 - 4:15** | Architecture Slide | Conclusion & Submission | FastAPI + React 18 + LangGraph + FAISS + Docker; ready for enterprise deployment. |

---

## Detailed Spoken Script

### 1. Introduction & Philosophy (0:00 - 0:35)
> *"Hello! I am Harsh Chavan, and today I am presenting **NexusRAG**, an advanced, reference-driven Retrieval-Augmented Generation workspace built for the ShadowFox Advanced-Level AI Engineer internship track.*
>
> *Most prototype RAG applications suffer from three critical flaws: they hallucinate claims when context is missing, they drift across multi-turn queries, and they present mock, unverified metrics in the UI. NexusRAG was engineered to eliminate these flaws through a defense-in-depth architecture: a 9-node LangGraph execution state machine, an atomic FAISS IndexIDMap2 vector store, and a strict Zero Static Data governance rule where every number, status, and score is computed live from the backend."*

### 2. Multi-Format Ingestion & FAISS Vector Indexing (0:35 - 1:15)
> *"Let's look at the document ingestion pipeline. On the Knowledge Bases screen, users can organize documents into collections and upload multi-page PDFs, Markdown, and text files.*
>
> *Our backend uses PyMuPDF to extract text while tracking exact physical character offsets and page numbers. Documents are chunked into 400-token blocks with 50-token overlap, preserving sentence and page boundaries. Each chunk is embedded and mapped to a 64-bit integer ID inside FAISS using `IndexIDMap2` wrapping `IndexFlatIP` with unit-normalized vectors.*
>
> *This design enables $O(1)$ individual vector deletions without having to re-index the entire dataset when a document is updated or removed."*

### 3. Agentic Retrieval & Grounded Synthesis (1:15 - 2:30)
> *"Now let's switch to the Research Desk. When a user asks a question, NexusRAG does not simply pass text to an LLM. It routes the request through a 9-node LangGraph state machine.*
>
> *First, it validates the query and prunes any unauthorized tenant scopes. Second, it rewrites the query into a self-contained search string. Third, it retrieves candidates from FAISS and applies relevance reranking.*
>
> *At Node 5, NexusRAG checks **Evidence Sufficiency**. If the composite similarity score falls below 0.650, the system cleanly abstains rather than hallucinating an answer.*
>
> *If sufficient, Node 7 synthesizes a grounded answer inside strictly delimited XML context blocks, emitting real-time Server-Sent Events for instant token delivery. Server-side regex validation checks every citation against real passage IDs, stripping any hallucinated reference before delivery."*

### 4. Retrieval Inspector & Observability (2:30 - 3:20)
> *"Observability is built directly into NexusRAG through our LangSmith and Phoenix-inspired Retrieval Inspector. For every executed query, we persist a complete `WorkflowRun` trace.*
>
> *Here in the Inspector, you can see the raw user query alongside the rewritten query, the list of candidate chunks with raw similarity scores, the reranked candidate pool, the exact evidence sufficiency score, and the groundedness verification score.*
>
> *Below, a millisecond-precision execution waterfall timeline shows the exact duration of each graph node, giving engineers full transparency into pipeline latency."*

### 5. Verification, Security & Quantitative Benchmarks (3:20 - 4:15)
> *"Finally, let's review our verification and security benchmarks. We evaluated NexusRAG across a calibrated benchmark dataset of in-domain factual queries and out-of-domain adversarial queries.*
>
> *The retrieval engine achieved **100% Precision@1**, **100% Recall@4**, a **Mean Reciprocal Rank of 1.000**, and **100% Gate Calibration Accuracy** with zero hallucinations.*
>
> *In our security audit, both `pip-audit` on the Python backend and `npm audit` on the React frontend reported **zero vulnerabilities**, and `detect-secrets` proved zero committed credentials across Git history. All color tokens achieve WCAG 2.1 AA compliance with a minimum 5.14:1 contrast ratio.*
>
> *NexusRAG is fully containerized with multi-stage Docker builds, non-root security execution, and persistent volume support. Thank you for your time, and I look forward to your evaluation!"*

