# NexusRAG Privacy Policy (Draft for User Review)

**Effective Date:** November 10, 2026  
**Status:** Review Draft (Not formal legal advice)  
**Product:** NexusRAG Document Intelligence Assistant  

---

## 1. Introduction & Core Privacy Principles

NexusRAG is built with a privacy-by-design architecture. We believe document research tools should be transparent about where data travels, how it is indexed, and how it is permanently removed.

NexusRAG adheres to three core commitments:
1. **Zero Tracking:** We do not use third-party analytics trackers, advertising beacons, or behavioural tracking cookies.
2. **Strict Tenant Isolation:** Every document, chunk, vector index, and message thread is isolated by a 256-bit cryptographically secure session token. Other users cannot discover, search, or view your data.
3. **Complete Data Sovereignty:** You may export your entire workspace as structured JSON or execute a permanent, immediate purge of all files, database rows, and vectors at any time.

---

## 2. Information We Process

### 2.1 Workspace Identity
When you open NexusRAG, the server provisions a random 256-bit entropy session token stored in an `httpOnly`, `SameSite=Lax` cookie (`nexus_session`). We do not collect your real name, personal email, or phone number unless you choose an optional authenticated sign-in method in future releases.

### 2.2 Uploaded Documents
When you upload PDF, Markdown, or plain text files:
- Files are stored in an isolated physical folder tied to your workspace (`storage/uploads/{workspace_id}/`).
- Documents are parsed locally on the server using PyMuPDF to extract text, page numbers, and character offsets.
- Extracted text is segmented into token-bounded chunks and stored in our relational database and FAISS vector index.

### 2.3 Query Context & Prompts
When you submit a research question:
- The system searches only vectors belonging to your workspace.
- The top-matching passage excerpts (up to 4 chunks) are formatted into delimited XML blocks (`<context>...</context>`).
- These excerpts are sent to the configured AI provider (Google Gemini API) strictly to generate the grounded answer and verify citations.

---

## 3. Third-Party AI Provider Disclosures

NexusRAG integrates with external LLM APIs (specifically Google Gemini API or OpenAI API depending on environment configuration).
- **Processing Scope:** The provider receives your rewritten query and the small subset of relevant passage excerpts retrieved by FAISS. It does not receive your entire document archive.
- **Model Training Policy:** Under standard commercial API terms (such as Google Cloud Vertex AI and Gemini Developer API terms of service for paid/direct API accounts), customer data submitted via the API is not used to train or fine-tune foundation models.
- **Ephemeral Ingestion:** Providers process the request in memory and return the generated completion stream.

---

## 4. Data Retention & Deletion

- **Voluntary Deletion:** Deleting an individual document immediately deletes the raw file from disk, deletes chunk records from the relational database, and removes the vectors from FAISS using ID-mapped deletion (`IndexIDMap2`).
- **Complete Workspace Purge:** Clicking "Purge All Workspace Data" in Settings sends a confirmed `POST /api/v1/user/purge` request that:
  1. Deletes all uploaded files from physical storage.
  2. Drops all database rows for documents, collections, messages, and traces.
  3. Clears all vector embeddings from FAISS.
  4. Expires and invalidates the session cookie.
- **Automated Retention:** Unused visitor workspaces inactive for more than 7 consecutive days are scheduled for automated cleanup.

---

## 5. Security Safeguards

- Session cookies are protected with `httpOnly` and `SameSite` flags to eliminate XSS-based theft.
- State-changing requests require a companion HMAC-SHA256 CSRF double-submit token (`X-CSRF-Token`).
- Content Security Policy (CSP), frame denial (`X-Frame-Options: DENY`), and strict MIME-sniffing protections are enforced on all HTTP responses.
- Filename sanitization prevents directory traversal attacks.

---

## 6. Contact & Data Requests

For inquiries or questions regarding workspace data processing:  
**Contact:** Harsh Chavan - [harshchavan1030@gmail.com](mailto:harshchavan1030@gmail.com)  
**ShadowFox AI Engineer Internship Submission:** [https://github.com/harshchavan009/NEXUSRAG-AI.git](https://github.com/harshchavan009/NEXUSRAG-AI.git)

