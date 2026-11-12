def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "NexusRAG"
    assert "health" in data

def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert "FAISS" in data["vector_store"]
    assert "timestamp" in data

def test_system_status_endpoint(client):
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "NexusRAG"
    assert data["vector_store"] == "FAISS"
    assert data["embedding_model"] == "gemini-embedding-2"
    assert data["generation_model"] == "gemini-3.5-flash-lite"
    assert data["limits"]["max_file_size_bytes"] == 25 * 1024 * 1024
    assert ".pdf" in data["limits"]["allowed_extensions"]
    assert ".md" in data["limits"]["allowed_extensions"]
    assert data["rag_defaults"]["chunk_size"] == 700
    assert data["retention_days"] == 7

def test_system_probe_endpoint(client):
    response = client.get("/api/v1/system/probe")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["online", "missing_key", "error"]
    assert data["embedding_model"] == "gemini-embedding-2"
    assert data["generation_model"] == "gemini-3.5-flash-lite"
    assert "tested_at" in data

def test_security_txt_endpoint(client):
    response = client.get("/.well-known/security.txt")
    assert response.status_code == 200
    assert "mailto:security@nexusrag.internal" in response.text
    assert "Preferred-Languages:" in response.text



