import io
from backend.app.config import settings

def test_collections_crud_and_duplicate(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    
    # 1. Create collection
    create_res = client.post(
        "/api/v1/collections",
        json={"name": "Engineering", "description": "Technical specifications"},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert create_res.status_code == 201
    coll_id = create_res.json()["id"]

    # 2. Duplicate name rejection
    dup_res = client.post(
        "/api/v1/collections",
        json={"name": "Engineering"},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert dup_res.status_code == 409
    assert dup_res.json()["error"]["code"] == "CONFLICT_DUPLICATE"

    # 3. Get collection by ID
    get_res = client.get(f"/api/v1/collections/{coll_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Engineering"

    # 4. Update collection
    update_res = client.put(
        f"/api/v1/collections/{coll_id}",
        json={"name": "Core Engineering", "description": "Updated description"},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Core Engineering"

    # 5. Delete collection
    del_res = client.delete(
        f"/api/v1/collections/{coll_id}",
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 6. Verify 404 after deletion
    assert client.get(f"/api/v1/collections/{coll_id}").status_code == 404

def test_document_listing_filtering_and_export(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])

    # Create collection
    coll_res = client.post(
        "/api/v1/collections",
        json={"name": "Research Papers"},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    coll_id = coll_res.json()["id"]

    # Upload document attached to collection
    doc_res = client.post(
        "/api/v1/documents/upload",
        data={"collection_id": coll_id},
        files={"files": ("paper.pdf", io.BytesIO(b"%PDF-1.4\nAcademic paper content\n%%EOF"), "application/pdf")},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert doc_res.status_code == 201
    doc_id = doc_res.json()["uploaded"][0]["document_id"]

    # 1. Filter by collection_id
    list_res = client.get(f"/api/v1/documents?collection_id={coll_id}")
    assert list_res.status_code == 200
    assert len(list_res.json()["documents"]) == 1
    assert list_res.json()["documents"][0]["id"] == doc_id
    assert list_res.json()["documents"][0]["collection_name"] == "Research Papers"

    # 2. Filter by search query
    search_res = client.get("/api/v1/documents?search=paper")
    assert search_res.status_code == 200
    assert len(search_res.json()["documents"]) == 1

    search_miss = client.get("/api/v1/documents?search=nonexistent")
    assert search_miss.status_code == 200
    assert len(search_miss.json()["documents"]) == 0

    # 3. Test reindex endpoint
    reindex_res = client.post(
        f"/api/v1/documents/{doc_id}/reindex",
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert reindex_res.status_code == 200
    assert reindex_res.json()["success"] is True

    # 4. Test export endpoint
    export_res = client.post(
        "/api/v1/user/export",
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert export_res.status_code == 200
    export_data = export_res.json()
    assert "workspace_id" in export_data
    assert len(export_data["collections"]) == 1
    assert len(export_data["documents"]) == 1
    assert export_data["documents"][0]["filename"] == "paper.pdf"

    # 5. Test workspace current
    current_res = client.get("/api/v1/workspaces/current")
    assert current_res.status_code == 200
    assert current_res.json()["stats"]["document_count"] == 1
    assert current_res.json()["stats"]["collection_count"] == 1

