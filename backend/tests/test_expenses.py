import json


def _expense_payload(category_id, **overrides):
    base = {
        "description": "Lunch",
        "amount": 12.50,
        "date": "2026-04-01",
        "category_id": category_id,
    }
    base.update(overrides)
    return base


def test_create_expense(client, seed_category):
    payload = _expense_payload(seed_category["id"])
    resp = client.post("/api/expenses", json=payload)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["description"] == "Lunch"
    assert data["amount"] == 12.50


def test_create_expense_invalid_category(client):
    payload = _expense_payload(category_id=999)
    resp = client.post("/api/expenses", json=payload)
    assert resp.status_code == 400


def test_create_expense_negative_amount(client, seed_category):
    payload = _expense_payload(seed_category["id"], amount=-5)
    resp = client.post("/api/expenses", json=payload)
    assert resp.status_code == 400


def test_create_expense_zero_amount(client, seed_category):
    payload = _expense_payload(seed_category["id"], amount=0)
    resp = client.post("/api/expenses", json=payload)
    assert resp.status_code == 400


def test_list_expenses_paginated(client, seed_category):
    for i in range(3):
        client.post(
            "/api/expenses",
            json=_expense_payload(seed_category["id"], description=f"Item {i}"),
        )
    resp = client.get("/api/expenses?per_page=2")
    data = resp.get_json()
    assert data["total"] == 3
    assert len(data["items"]) == 2
    assert data["pages"] == 2


def test_filter_by_date_range(client, seed_category):
    cid = seed_category["id"]
    client.post("/api/expenses", json=_expense_payload(cid, date="2026-01-01"))
    client.post("/api/expenses", json=_expense_payload(cid, date="2026-06-15"))
    resp = client.get("/api/expenses?start_date=2026-06-01&end_date=2026-06-30")
    data = resp.get_json()
    assert data["total"] == 1


def test_update_expense(client, seed_category):
    cid = seed_category["id"]
    resp = client.post("/api/expenses", json=_expense_payload(cid))
    eid = resp.get_json()["id"]

    updated = _expense_payload(cid, description="Dinner", amount=25.00)
    resp = client.put(f"/api/expenses/{eid}", json=updated)
    assert resp.status_code == 200
    assert resp.get_json()["description"] == "Dinner"


def test_delete_expense(client, seed_category):
    resp = client.post(
        "/api/expenses", json=_expense_payload(seed_category["id"])
    )
    eid = resp.get_json()["id"]
    resp = client.delete(f"/api/expenses/{eid}")
    assert resp.status_code == 204


def test_expense_summary(client, seed_category):
    cid = seed_category["id"]
    client.post("/api/expenses", json=_expense_payload(cid, amount=10))
    client.post("/api/expenses", json=_expense_payload(cid, amount=20))
    resp = client.get("/api/expenses/summary")
    data = resp.get_json()
    assert data["grand_total"] == 30.0
    assert data["by_category"][0]["category"] == "Food"


def test_get_nonexistent_expense(client):
    resp = client.get("/api/expenses/999")
    assert resp.status_code == 404


def test_health_check(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"
