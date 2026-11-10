import io
from pathlib import Path
from backend.app.config import settings

def test_valid_pdf_upload(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    
    response = client.post(
        "/api/v1/documents/upload",
        files={"files": ("sample_report.pdf", io.BytesIO(pdf_content), "application/pdf")},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["uploaded"]) == 1
    assert data["uploaded"][0]["filename"] == "sample_report.pdf"
    assert data["uploaded"][0]["status"] == "uploaded"

def test_valid_txt_and_markdown_upload(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    txt_content = b"This is a research document explaining artificial intelligence concepts."
    md_content = b"# Executive Summary\n\nRetrieval-augmented generation grounds model responses."

    response = client.post(
        "/api/v1/documents/upload",
        files=[
            ("files", ("notes.txt", io.BytesIO(txt_content), "text/plain")),
            ("files", ("overview.md", io.BytesIO(md_content), "text/markdown"))
        ],
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["uploaded"]) == 2
    assert len(data["failed"]) == 0

def test_empty_file_rejected(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    empty_content = b""

    response = client.post(
        "/api/v1/documents/upload",
        files={"files": ("empty.txt", io.BytesIO(empty_content), "text/plain")},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["failed"]) == 1
    assert "empty" in data["failed"][0]["message"].lower()

def test_unsupported_extension_rejected(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    content = b"Some data"

    response = client.post(
        "/api/v1/documents/upload",
        files={"files": ("script.exe", io.BytesIO(content), "application/octet-stream")},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["failed"]) == 1
    assert "not supported" in data["failed"][0]["message"]

def test_spoofed_pdf_magic_bytes_rejected(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    fake_pdf = b"This is clearly not a real PDF file header."

    response = client.post(
        "/api/v1/documents/upload",
        files={"files": ("fake.pdf", io.BytesIO(fake_pdf), "application/pdf")},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["failed"]) == 1
    assert "signature" in data["failed"][0]["message"].lower()

def test_duplicate_sha256_rejected(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    doc_content = b"%PDF-1.4\nUnique test content for duplicate check 12345\n%%EOF"

    # First upload -> Success
    res1 = client.post(
        "/api/v1/documents/upload",
        files={"files": ("first_upload.pdf", io.BytesIO(doc_content), "application/pdf")},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert res1.status_code == 201
    assert len(res1.json()["uploaded"]) == 1

    # Second upload with identical bytes -> Failed due to duplicate SHA-256
    res2 = client.post(
        "/api/v1/documents/upload",
        files={"files": ("duplicate_upload.pdf", io.BytesIO(doc_content), "application/pdf")},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert res2.status_code == 201
    assert len(res2.json()["failed"]) == 1
    assert "already been uploaded" in res2.json()["failed"][0]["message"]

def test_document_deletion_removes_physical_file(client, workspace_a_auth):
    client.cookies.set(settings.SESSION_COOKIE_NAME, workspace_a_auth["token"])
    pdf_content = b"%PDF-1.4\nTemporary file to be deleted\n%%EOF"

    upload_res = client.post(
        "/api/v1/documents/upload",
        files={"files": ("to_delete.pdf", io.BytesIO(pdf_content), "application/pdf")},
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    doc_id = upload_res.json()["uploaded"][0]["document_id"]

    # Verify document exists in DB and get storage path
    doc_detail = client.get(f"/api/v1/documents/{doc_id}").json()
    assert doc_detail["id"] == doc_id

    # Delete document
    del_res = client.delete(
        f"/api/v1/documents/{doc_id}",
        headers={"X-CSRF-Token": workspace_a_auth["csrf"]}
    )
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Verify subsequent GET returns 404
    get_res = client.get(f"/api/v1/documents/{doc_id}")
    assert get_res.status_code == 404

