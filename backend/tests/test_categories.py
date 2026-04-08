def test_create_category(client):
    resp = client.post("/api/categories", json={"name": "Transport"})
    assert resp.status_code == 201
    assert resp.get_json()["name"] == "Transport"


def test_list_categories(client):
    client.post("/api/categories", json={"name": "A"})
    client.post("/api/categories", json={"name": "B"})
    resp = client.get("/api/categories")
    assert resp.status_code == 200
    assert len(resp.get_json()) == 2


def test_duplicate_category_rejected(client):
    client.post("/api/categories", json={"name": "Food"})
    resp = client.post("/api/categories", json={"name": "Food"})
    assert resp.status_code == 409


def test_delete_category(client):
    resp = client.post("/api/categories", json={"name": "Temp"})
    cat_id = resp.get_json()["id"]
    resp = client.delete(f"/api/categories/{cat_id}")
    assert resp.status_code == 204


def test_delete_nonexistent_category(client):
    resp = client.delete("/api/categories/999")
    assert resp.status_code == 404


def test_category_name_blank_rejected(client):
    resp = client.post("/api/categories", json={"name": ""})
    assert resp.status_code == 400
