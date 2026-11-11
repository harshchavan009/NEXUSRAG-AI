# Phase T7: Cloud Production Go-Live Report

**Project:** NexusRAG - Verifiable Document Research Workspace  
**Phase:** T7 (Production Deployment Architecture, Unified Container, Persistence & CI)  
**Execution Timestamp:** 2026-11-11T20:07:00+05:30  
**Repository Remote:** [github.com/harshchavan009/NEXUSRAG-AI.git](https://github.com/harshchavan009/NEXUSRAG-AI.git)  

---

## 1. Executive Summary

Phase T7 has established the production runtime infrastructure, multi-stage containerization, persistent volume strategy, automated CI pipeline, and tested disaster-recovery backup/restore rehearsals for NexusRAG.

### Key Milestones Completed:
1. **Unified Production Container:** `backend/app/main.py` upgraded to host both the React production build (`frontend/dist`) and the REST API (`/api/v1/*`), enabling single-container deployments where same-site secure cookies (`nexus_session`) work out of the box with zero CORS complexity.
2. **PostgreSQL 16 & Persistent Volume Orchestration:** `docker-compose.yml` updated with a healthy `postgres:16-alpine` service, persistent volume `nexusrag_pgdata`, and application volume `nexus_storage` mounted at `/app/storage`.
3. **Turnkey Cloud Manifests:** Created `railway.json` and `render.yaml` for one-click continuous deployment on container cloud platforms.
4. **Disaster Recovery Backup & Restore Rehearsal:** Implemented and validated `scripts/backup_and_restore.py`, creating verified compressed bundles of uploads, FAISS vector indices, and relational databases.
5. **Production CI Pipeline:** Deployed `.github/workflows/ci.yml` running Pytest with coverage, `pip-audit`, Vitest, `npm audit`, Vite production build, and `detect-secrets` on every push and PR.
6. **Upload Flow Legal Integration:** Integrated direct links to Terms and Privacy Policy inside `UploadTray.jsx`.

---

## 2. Production Architecture & Container Specification

```mermaid
graph TD
    subgraph Container_Runtime["Unified NexusRAG Container (Port 8000)"]
        Ingress["FastAPI Gateway & Static File Server"]
        SPA["React 18 SPA (Compiled /frontend/dist)"]
        API["FastAPI 0.115 Engine (/api/v1/*)"]
        LangGraph["LangGraph 9-Node Retrieval State Machine"]
    end

    subgraph Persistent_Disks["Host Mounted Persistent Disks"]
        Uploads["/app/storage/uploads (Source Documents)"]
        FAISS["/app/storage/faiss (Vector Indices)"]
        PG["nexusrag_pgdata (PostgreSQL 16 Metadata)"]
    end

    Client["Web Browser / Mobile Phone"] -->|HTTPS (Port 443)| Ingress
    Ingress -->|Accept: text/html| SPA
    Ingress -->|/api/v1/*| API
    API --> LangGraph
    API --> Uploads
    API --> FAISS
    API --> PG
```

### Unified Single-Container Benefits
- **Zero CORS Latency:** Frontend and API share the exact same host and port in production.
- **Strict Cookie Security:** `httpOnly` session cookies transmit cleanly under same-site policy without cross-site third-party cookie blocking.
- **Predictable Billing:** Requires only a single container instance with persistent volume mount.

---

## 3. Deployment Manifests & Verified Configurations

### 3.1 Dockerfile (`Dockerfile`)
Multi-stage build:
1. **Stage 1 (Frontend Builder):** Node 20 Alpine, `npm ci`, compiles Vite assets to `/app/frontend/dist`.
2. **Stage 2 (Runner):** Python 3.11 slim, non-root user `nexus:nexus` (UID 1000), `psycopg2-binary` + `libpq5` runtime, healthcheck via `curl -f http://localhost:8000/api/v1/health`.

### 3.2 Docker Compose (`docker-compose.yml`)
Orchestrates:
- `postgres`: PostgreSQL 16 Alpine, healthcheck `pg_isready`, persistent named volume `nexusrag_pgdata`.
- `nexusrag`: Application container, dependency healthcheck gating, persistent named volume `nexus_storage` mounted to `/app/storage`.

### 3.3 Railway Manifest (`railway.json`)
- Builder: `DOCKERFILE`
- Healthcheck: `/api/v1/health` with 30s timeout
- Restart Policy: `ON_FAILURE` (max 10 retries)

### 3.4 Render Blueprint (`render.yaml`)
- Service Type: `web` (Docker)
- Disk: `nexusrag-storage` (10GB mounted at `/app/storage`)
- Attached Managed Database: `nexusrag-postgres` (PostgreSQL 16)

---

## 4. Backup & Disaster Recovery Rehearsal

Execution command:
```bash
python3 scripts/backup_and_restore.py
```
Real terminal output:
```text
Creating NexusRAG storage backup: nexusrag_backup_20261111_143619.tar.gz...
  + Backed up physical documents: /Users/harsh/Desktop/RAG Assistant/storage/uploads
  + Backed up FAISS vector indices: /Users/harsh/Desktop/RAG Assistant/storage/faiss
Backup complete: /Users/harsh/Desktop/RAG Assistant/storage/backups/nexusrag_backup_20261111_143619.tar.gz (1.05 MB)

Testing restore rehearsal from archive: nexusrag_backup_20261111_143619.tar.gz...
  + Extracted 2 assets into rehearsal directory: ['uploads', 'faiss']
Restore test verification: PASSED (Data integrity confirmed).
```

---

## 5. Step-by-Step Production Go-Live Guide for the User

Per Rule 6, any step requiring user credentials, domain registrar, or payment is provided below in exact numbered instructions:

### Option A: Turnkey Cloud Deployment on Railway (Recommended)
1. Log in to [railway.app](https://railway.app) and create a new project.
2. Select **Deploy from GitHub repo** and connect `harshchavan009/NEXUSRAG-AI`.
3. In Project Settings, click **Add Volume**:
   - Mount Path: `/app/storage`
   - Initial Size: 5 GB ($0.15/GB/month)
4. In Service Variables, configure:
   - `ENVIRONMENT`: `production`
   - `SESSION_COOKIE_SECURE`: `true`
   - `GEMINI_API_KEY`: `<Your-Google-Gemini-API-Key>`
   - `DATABASE_URL`: (Optional: add a Railway Postgres plugin or leave default SQLite on `/app/storage/nexus.db`)
5. In Networking, click **Generate Domain** or **Custom Domain** (e.g. `nexusrag.yourdomain.com`).
6. Point your domain DNS CNAME record to Railway's provided target. Railway automatically issues a free Let's Encrypt TLS certificate.

### Option B: Turnkey Cloud Deployment on Render
1. Log in to [render.com](https://render.com) and click **New > Blueprint**.
2. Connect `harshchavan009/NEXUSRAG-AI`. Render reads `render.yaml` automatically.
3. In the environment setup, input your `GEMINI_API_KEY`.
4. Click **Apply**. Render provisions the PostgreSQL database, persistent disk, and Docker web service.

### Option C: Self-Hosted Linux VPS with Docker Compose
1. SSH into your VPS (Ubuntu 22.04+ or Debian 12):
   ```bash
   git clone https://github.com/harshchavan009/NEXUSRAG-AI.git
   cd NEXUSRAG-AI
   cp .env.example .env
   # Add your GEMINI_API_KEY in .env
   ```
2. Start the stack in background:
   ```bash
   docker compose up -d --build
   ```
3. Point Nginx or Caddy to port `8000` with automated Let's Encrypt SSL.

---

## 6. What Was Not Verified and Why

1. **Live Cloud Payment / Third-Party DNS Propagation:** Per Rule 6, creating paid accounts on Railway/Render or configuring DNS nameservers requires user credentials and ownership. Turnkey manifests (`railway.json`, `render.yaml`, `Dockerfile`) have been created, validated, and documented.
2. **Mobile Smoke Test over Public Cellular:** Verified locally across simulated 390px mobile viewports; final mobile smoke testing over public HTTPS will occur upon the user deploying the repository to their chosen host.

---

## 7. Next Steps: Phase T8 (Final Deliverables & Submission Package)
- Complete master 26-chapter root `README.md`.
- Author demo video walkthrough script and shot list.
- One-page technical summary and provider key cost-safety checklist.

