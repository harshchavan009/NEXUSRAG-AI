# NexusRAG API Reference (OpenAPI v1)

**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Authentication:** HttpOnly session cookie (`nexus_session`) with Double-Submit `X-CSRF-Token`  
**Content-Type:** `application/json` (or `multipart/form-data` for file uploads, `text/event-stream` for SSE)  

---

## 1. System & Health Endpoints

### `GET /api/v1/health`
Health check endpoint reporting backend operational status.
- **Request:** None
- **Response `200 OK`:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-10T18:00:00Z",
    "environment": "development"
  }
  ```

### `GET /api/v1/health/system`
Live telemetry and storage metrics backing the Zero Static Data verification display.
- **Request:** None
- **Response `200 OK`:**
  ```json
  {
    "app_name": "NexusRAG",
    "version": "1.0.0",
    "environment": "development",
    "database_type": "sqlite",
    "faiss_vectors": 18,
    "indexed_chunks": 18,
    "status": "healthy"
  }
  ```

---

## 2. Workspace & Tenant Identity

### `POST /api/v1/workspaces`
Provisions or retrieves an isolated visitor workspace. Issues a 256-bit cryptographically secure session cookie and `X-CSRF-Token` header.
- **Request:** Empty body
- **Response Headers:**
  - `Set-Cookie: nexus_session=<64-char-hex>; HttpOnly; SameSite=Lax; Path=/`
  - `X-CSRF-Token: <64-char-hex>`
- **Response `200 OK`:**
  ```json
  {
    "id": "ws_0193021f...",
    "session_token": "<64-char-hex>",
    "created_at": "2026-11-10T17:00:00Z",
    "stats": {
      "documents": 3,
      "collections": 1,
      "chunks": 18,
      "sessions": 2
    }
  }
  ```

### `GET /api/v1/workspaces/current`
Returns metadata and live entity statistics for the calling tenant.
- **Response `200 OK`:** `WorkspaceResponse` object matching above.

---

## 3. Collections Management

### `GET /api/v1/collections`
Lists all collections belonging to the authenticated workspace.
- **Response `200 OK`:**
  ```json
  {
    "collections": [
      {
        "id": "col_123...",
        "name": "Clean Energy & Climate",
        "description": "2024 Renewable energy transition reports",
        "document_count": 2,
        "created_at": "2026-11-10T17:15:00Z"
      }
    ]
  }
  ```

### `POST /api/v1/collections`
Creates a new document collection.
- **Headers:** `X-CSRF-Token: <token>`
- **Request Body:**
  ```json
  {
    "name": "Distributed Systems",
    "description": "Consensus, replication, and Raft protocols"
  }
  ```
- **Response `201 Created`:** Created collection object.

### `GET /api/v1/collections/{id}`
Retrieves a single collection by ID. Returns 404 if not found or owned by another tenant.

### `PUT /api/v1/collections/{id}`
Updates a collection's name and description.
- **Headers:** `X-CSRF-Token: <token>`

### `DELETE /api/v1/collections/{id}`
Deletes a collection. Documents assigned to this collection remain in the workspace with `collection_id = null`.
- **Headers:** `X-CSRF-Token: <token>`

---

## 4. Document Management & Ingestion

### `POST /api/v1/documents/upload`
Uploads one or more documents (PDF, TXT, MD) and initiates asynchronous parsing, chunking, embedding, and FAISS indexing.
- **Headers:** `X-CSRF-Token: <token>`
- **Form Data:**
  - `files`: File byte stream(s)
  - `collection_id`: Optional target collection ID
- **Response `201 Created`:**
  ```json
  {
    "uploaded": [
      {
        "document_id": "doc_019...",
        "filename": "clean_energy_report_2024.txt",
        "file_size_bytes": 4200,
        "status": "uploaded",
        "message": "File uploaded and scheduled for background indexing."
      }
    ],
    "failed": []
  }
  ```

### `GET /api/v1/documents`
Lists documents for the calling workspace with optional collection filtering.
- **Query Parameters:** `collection_id` (optional), `status` (optional)
- **Response `200 OK`:**
  ```json
  {
    "documents": [
      {
        "id": "doc_019...",
        "filename": "clean_energy_report_2024.txt",
        "original_filename": "clean_energy_report_2024.txt",
        "file_type": "txt",
        "file_size_bytes": 4200,
        "page_count": 2,
        "chunk_count": 6,
        "summary": "Global energy transition analysis covering solar and wind growth.",
        "status": "indexed",
        "created_at": "2026-11-10T17:10:00Z"
      }
    ],
    "total": 1
  }
  ```

### `GET /api/v1/documents/{id}`
Retrieves full details of a document, including processing status stages.

### `DELETE /api/v1/documents/{id}`
Cascades deletion of document: removes file from disk, deletes chunk records from database, and removes vectors from FAISS index via ID-mapped removal with `IndexIDMap2`.
- **Headers:** `X-CSRF-Token: <token>`

### `POST /api/v1/documents/{id}/reindex`
Triggers re-parsing and re-indexing of an existing document without duplicating vectors.
- **Headers:** `X-CSRF-Token: <token>`

---

## 5. RAG Retrieval & Research Chat

### `POST /api/v1/query`
Executes synchronous RAG query through the 9-node LangGraph state machine.
- **Headers:** `X-CSRF-Token: <token>`
- **Request Body:**
  ```json
  {
    "query": "What percentage of new generation capacity was solar and wind in 2024?",
    "session_id": "sess_019...",
    "scope": {
      "collection_ids": [],
      "document_ids": []
    },
    "top_k": 4
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "answer": "According to the Clean Energy Report 2024, solar and wind power accounted for 85% of all new generation capacity additions [1].",
    "session_id": "sess_019...",
    "workflow_run_id": "run_938a...",
    "citations": [
      {
        "index": 1,
        "chunk_id": 14,
        "document_id": "doc_019...",
        "filename": "clean_energy_report_2024.txt",
        "page_number": 1,
        "excerpt": "Solar and wind accounted for 85% of new generation capacity in 2024.",
        "relevance_score": 0.942
      }
    ],
    "is_abstention": false,
    "sufficiency_score": 0.885,
    "groundedness_score": 0.950,
    "timings_ms": {
      "validate_input": 0.12,
      "rewrite_query": 0.15,
      "retrieve": 1.10,
      "rerank": 1.85,
      "check_evidence": 0.05,
      "generate": 382.40,
      "validate_citations": 0.20,
      "validate_groundedness": 0.40
    }
  }
  ```

### `POST /api/v1/query/stream`
Asynchronous SSE streaming endpoint. Delivers real-time execution node stage updates, token deltas, and final citation payload.
- **Headers:** `X-CSRF-Token: <token>`
- **Response Format:** `text/event-stream`
  ```
  event: stage
  data: {"stage": "rewriting", "message": "Analyzing query and context..."}

  event: stage
  data: {"stage": "retrieving", "message": "Searching FAISS index across 18 vectors..."}

  event: token
  data: {"delta": "According "}

  event: token
  data: {"delta": "to the report [1]..."}

  event: final
  data: {"answer": "...", "citations": [...], "workflow_run_id": "run_..."}
  ```

---

## 6. Research Sessions & Chat Threads

### `GET /api/v1/chat/sessions`
Lists recent research chat sessions for the active workspace.

### `POST /api/v1/chat/sessions`
Creates a new research session thread.
- **Headers:** `X-CSRF-Token: <token>`
- **Request Body:** `{"title": "Clean Energy Deep Dive"}`

### `GET /api/v1/chat/sessions/{id}`
Returns details of a session and its associated collection/document scopes.

### `GET /api/v1/chat/sessions/{id}/messages`
Retrieves chronological message history with embedded citation records.

### `DELETE /api/v1/chat/sessions/{id}`
Deletes a session thread and its associated message records.
- **Headers:** `X-CSRF-Token: <token>`

---

## 7. Retrieval Inspector & Observability

### `GET /api/v1/inspector/runs`
Lists recent workflow run traces for the caller's workspace.

### `GET /api/v1/inspector/{run_id}`
Retrieves complete execution telemetry for a specific query run:
- Rewritten query vs. raw user query
- Full candidate retrieval list with similarity scores
- Reranked candidates and relevance rationales
- Sufficiency score ($0.650$ threshold) and groundedness score ($0.700$ threshold)
- Millisecond-precision execution waterfall timeline

---

## 8. User Data Portability & Purge

### `POST /api/v1/user/export`
Exports all caller documents, collections, messages, and traces as a structured JSON archive.
- **Headers:** `X-CSRF-Token: <token>`

### `POST /api/v1/user/purge`
Completely and permanently purges all documents, physical upload files on disk, chunks, FAISS vectors, sessions, and traces belonging to the caller's workspace, and expires the session cookie.
- **Headers:** `X-CSRF-Token: <token>`
- **Response `200 OK`:** `{"success": true, "message": "Workspace data purged successfully."}`

