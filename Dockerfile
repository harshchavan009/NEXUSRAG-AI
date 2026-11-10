# ==========================================
# Stage 1: Build Frontend Single Page App
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Python Backend
# ==========================================
FROM python:3.11-slim AS runner

# Install essential runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN groupadd -g 1000 nexus && \
    useradd -u 1000 -g nexus -s /bin/bash -m nexus

# Install Python requirements
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend application and alembic configurations
COPY backend /app/backend
COPY alembic.ini /app/
COPY data /app/data

# Copy compiled frontend static assets
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create storage volumes and set permissions
RUN mkdir -p /app/storage/uploads /app/storage/faiss && \
    chown -R nexus:nexus /app/storage

USER nexus

ENV ENVIRONMENT=production \
    PYTHONUNBUFFERED=1 \
    PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
