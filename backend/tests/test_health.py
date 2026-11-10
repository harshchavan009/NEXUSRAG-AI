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
    assert data["embedding_model"] == "text-embedding-004"
    assert data["limits"]["max_file_size_bytes"] == 25 * 1024 * 1024
    assert ".pdf" in data["limits"]["allowed_extensions"]
    assert ".md" in data["limits"]["allowed_extensions"]
    assert data["rag_defaults"]["chunk_size"] == 700
    assert data["retention_days"] == 7
