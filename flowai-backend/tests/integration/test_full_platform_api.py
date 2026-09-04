from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.models.user import User

from app.db.session import get_db

client = TestClient(app)

def test_full_system_endpoints(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    try:
        # 1. Health & Observability
        health_resp = client.get("/api/v1/health")
        assert health_resp.status_code == 200
        assert health_resp.json()["status"] == "healthy"

        deep_health_resp = client.get("/api/v1/system/health/deep")
        assert deep_health_resp.status_code == 200
        assert "services" in deep_health_resp.json()

        # 2. Authentication
        user = db_session.query(User).first()
        if not user:
            user = User(email="test@flowai.com", full_name="Test Operator", role_name="admin", hashed_password="pw")
            db_session.add(user)
            db_session.commit()
            db_session.refresh(user)

        token = create_access_token(str(user.id))
        headers = {"Authorization": f"Bearer {token}"}

        me_resp = client.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == user.email

        # 3. CRM Customers
        cust_resp = client.get("/api/v1/customers", headers=headers)
        assert cust_resp.status_code == 200

        create_cust_resp = client.post(
            "/api/v1/customers",
            json={"name": "Acme Global", "email": "contact@acme.com", "company": "Acme Corp"},
            headers=headers,
        )
        assert create_cust_resp.status_code in [200, 201]

        # 4. Workflows & Execution
        wf_list_resp = client.get("/api/v1/workflows", headers=headers)
        assert wf_list_resp.status_code == 200

        create_wf_resp = client.post(
            "/api/v1/workflows",
            json={
                "name": "Integration Test Workflow",
                "description": "Validates full execution",
                "definition": {
                    "nodes": [
                        {"id": "n_trig", "type": "trigger", "label": "Start", "config": {}},
                        {"id": "n_ai", "type": "ai", "label": "Process", "config": {"prompt": "Analyze input"}},
                    ],
                    "edges": [{"source": "n_trig", "target": "n_ai"}],
                },
                "status": "published",
            },
            headers=headers,
        )
        assert create_wf_resp.status_code in [200, 201]
        wf_id = create_wf_resp.json()["id"]

        run_wf_resp = client.post(
            f"/api/v1/workflows/{wf_id}/runs",
            json={"input_data": {"test_key": "val"}},
            headers=headers,
        )
        assert run_wf_resp.status_code in [200, 201]

        # 5. Approvals
        appr_resp = client.get("/api/v1/approvals", headers=headers)
        assert appr_resp.status_code == 200

        pending_appr_resp = client.get("/api/v1/approvals/pending", headers=headers)
        assert pending_appr_resp.status_code == 200

        # 6. Schedules
        sched_resp = client.get("/api/v1/schedules", headers=headers)
        assert sched_resp.status_code == 200

        create_sched_resp = client.post(
            "/api/v1/schedules",
            json={
                "workflow_id": wf_id,
                "cron_expression": "0 9 * * 1-5",
                "timezone": "UTC",
                "is_active": True,
            },
            headers=headers,
        )
        assert create_sched_resp.status_code in [200, 201]
        sched_id = create_sched_resp.json()["id"]

        client.delete(f"/api/v1/schedules/{sched_id}", headers=headers)

        # 7. Analytics & Costs
        overview_resp = client.get("/api/v1/analytics/overview", headers=headers)
        assert overview_resp.status_code == 200
        assert "workflows_executed" in overview_resp.json()

        costs_resp = client.get("/api/v1/analytics/costs", headers=headers)
        assert costs_resp.status_code == 200

        # 8. Notifications
        notif_resp = client.get("/api/v1/notifications", headers=headers)
        assert notif_resp.status_code == 200

        read_all_resp = client.post("/api/v1/notifications/read-all", headers=headers)
        assert read_all_resp.status_code == 200

        # 9. Agents & Tools
        tools_resp = client.get("/api/v1/agents/tools", headers=headers)
        assert tools_resp.status_code == 200

        agent_run_resp = client.post(
            "/api/v1/agents/runs",
            json={"objective": "Test multi-agent supervisor dispatch"},
            headers=headers,
        )
        assert agent_run_resp.status_code in [200, 201]

        # 10. Documents
        docs_resp = client.get("/api/v1/documents", headers=headers)
        assert docs_resp.status_code == 200

        # 11. Conversations
        conv_resp = client.get("/api/v1/conversations", headers=headers)
        assert conv_resp.status_code == 200
    finally:
        app.dependency_overrides.clear()
