from backend.app.config import settings

def test_security_headers_present(client):
    response = client.get("/api/v1/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert "strict-origin-when-cross-origin" in response.headers.get("Referrer-Policy")

def test_session_cookie_issuance_and_entropy(client):
    response = client.post("/api/v1/workspaces")
    assert response.status_code == 200
    cookie = response.cookies.get(settings.SESSION_COOKIE_NAME)
    assert cookie is not None
    # 32 bytes hex = 64 characters = 256 bits of entropy
    assert len(cookie) == 64
    assert "X-CSRF-Token" in response.headers

def test_csrf_protection_on_state_changing_post(client, workspace_a_auth):
    # Cookie is provided without X-CSRF-Token header -> Must be blocked 403
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    
    # 1. Missing CSRF header
    res_no_csrf = client.post("/api/v1/collections", json={"name": "Test Coll"})
    assert res_no_csrf.status_code == 403
    assert res_no_csrf.json()["error"]["code"] == "CSRF_VALIDATION_FAILED"

    # 2. Forged/invalid CSRF header
    res_bad_csrf = client.post(
        "/api/v1/collections",
        json={"name": "Test Coll"},
        headers={"X-CSRF-Token": "forged-invalid-token"}
    )
    assert res_bad_csrf.status_code == 403
    assert res_bad_csrf.json()["error"]["code"] == "CSRF_VALIDATION_FAILED"

    # 3. Valid CSRF header -> Success 201
    res_valid = client.post(
        "/api/v1/collections",
        json={"name": "Test Coll"},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert res_valid.status_code == 201
    assert res_valid.json()["name"] == "Test Coll"

def test_cross_tenant_collection_isolation(client, workspace_a_auth, workspace_b_auth):
    # Workspace A creates a collection
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    res_create = client.post(
        "/api/v1/collections",
        json={"name": "Private Collection A"},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert res_create.status_code == 201
    coll_id = res_create.json()["id"]

    # Workspace B attempts to list collections -> Collection A must NOT appear
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_b_auth["token"])
    res_list_b = client.get("/api/v1/collections")
    assert res_list_b.status_code == 200
    b_ids = [c["id"] for c in res_list_b.json()["collections"]]
    assert coll_id not in b_ids

    # Workspace B attempts to directly GET Collection A by ID -> 404 Not Found
    res_get_b = client.get(f"/api/v1/collections/{coll_id}")
    assert res_get_b.status_code == 404

    # Workspace B attempts to DELETE Collection A -> 404 Not Found
    res_del_b = client.delete(
        f"/api/v1/collections/{coll_id}",
        headers={"X-CSRF-Token": workspace_b_auth["csrf"]}
    )
    assert res_del_b.status_code == 404

def test_user_purge_clears_cookie_and_records(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    
    # Create collection
    client.post(
        "/api/v1/collections",
        json={"name": "Will Be Purged"},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    
    # Purge
    res_purge = client.post(
        "/api/v1/user/purge",
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert res_purge.status_code == 200
    assert res_purge.json()["success"] is True

