"""Phase 2 — Customer identity & access separation tests."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from fastapi.testclient import TestClient

from app.db.base import Base
import app.db.init_db  # noqa: F401
from app.db.session import get_db
from app.main import app
from app.models.customer import Customer
from app.models.user import User

client = TestClient(app)


def _make_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return engine, Session()


def _register_customer(db, email="cust@example.com", password="password123", full_name="Jane Buyer"):
    return client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "account_type": "customer",
        },
    )


def test_customer_registration_creates_linked_profile():
    engine, db = _make_db()
    app.dependency_overrides[get_db] = lambda: db
    try:
        r = _register_customer(db)
        assert r.status_code == 201, r.text
        tokens = r.json()
        assert tokens["access_token"] and tokens["refresh_token"]

        user = db.query(User).filter(User.email == "cust@example.com").first()
        assert user is not None
        assert user.account_type == "customer"
        assert user.role_name == "customer"  # never manager/admin

        linked = db.query(Customer).filter(Customer.user_id == user.id).first()
        assert linked is not None
        assert linked.email == "cust@example.com"
    finally:
        app.dependency_overrides.clear()
        db.close()
        engine.dispose()


def test_customer_cannot_self_select_privileged_role():
    engine, db = _make_db()
    app.dependency_overrides[get_db] = lambda: db
    try:
        # account_type is constrained to customer/staff only and no role_name is
        # accepted by the schema (extra fields are dropped by Pydantic). Even if
        # a caller passes role_name=admin, the service never reads it and always
        # derives the role from account_type.
        r = client.post(
            "/api/v1/auth/register",
            json={
                "email": "sneaky@example.com",
                "password": "password123",
                "full_name": "Sneaky",
                "account_type": "customer",
                "role_name": "admin",
            },
        )
        assert r.status_code == 201, r.text

        user = db.query(User).filter(User.email == "sneaky@example.com").first()
        assert user is not None
        # The caller's attempted admin role must never be applied.
        assert user.role_name == "customer"
        assert user.account_type == "customer"

        me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {r.json()['access_token']}"})
        assert me.json()["role_name"] == "customer"
    finally:
        app.dependency_overrides.clear()
        db.close()
        engine.dispose()


def test_customer_access_isolation():
    engine, db = _make_db()
    app.dependency_overrides[get_db] = lambda: db
    try:
        reg = _register_customer(db)
        headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

        # Customer must NOT see the staff CRM directory.
        r = client.get("/api/v1/customers", headers=headers)
        assert r.status_code == 403

        # Customer profile ownership: returns their own linked profile.
        r = client.get("/api/v1/customer/profile", headers=headers)
        assert r.status_code == 200
        assert r.json()["email"] == "cust@example.com"
    finally:
        app.dependency_overrides.clear()
        db.close()
        engine.dispose()
def test_customer_addresses_are_ownership_scoped():
    engine, db = _make_db()
    app.dependency_overrides[get_db] = lambda: db
    try:
        reg = _register_customer(db)
        headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

        create = client.post(
            "/api/v1/customer/addresses",
            headers=headers,
            json={
                "full_name": "Jane Buyer",
                "line1": "1 Market St",
                "city": "Springfield",
                "country": "US",
                "is_default": True,
            },
        )
        assert create.status_code == 201, create.text
        addr_id = create.json()["id"]

        listed = client.get("/api/v1/customer/addresses", headers=headers)
        assert listed.status_code == 200
        assert any(a["id"] == addr_id for a in listed.json())

        got = client.get(f"/api/v1/customer/addresses/{addr_id}", headers=headers)
        assert got.status_code == 200
        assert got.json()["city"] == "Springfield"
    finally:
        app.dependency_overrides.clear()
        db.close()
        engine.dispose()


def test_refresh_token_rotation_and_logout_revocation():
    engine, db = _make_db()
    app.dependency_overrides[get_db] = lambda: db
    try:
        reg = _register_customer(db)
        refresh = reg.json()["refresh_token"]
        access = reg.json()["access_token"]

        # Refresh rotates the token pair.
        refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
        assert refreshed.status_code == 200, refreshed.text
        new_access = refreshed.json()["access_token"]
        new_refresh = refreshed.json()["refresh_token"]
        assert new_refresh != refresh

        # The old refresh token is now revoked.
        reuse = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
        assert reuse.status_code == 401

        # Logout revokes the current (rotated) refresh token.
        headers = {"Authorization": f"Bearer {new_access}"}
        logout = client.post("/api/v1/auth/logout", headers=headers, json={"refresh_token": new_refresh})
        assert logout.status_code == 204

        after = client.post("/api/v1/auth/refresh", json={"refresh_token": new_refresh})
        assert after.status_code == 401

        # Original access token still works for /me (it expires on its own).
        me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access}"})
        assert me.status_code == 200
    finally:
        app.dependency_overrides.clear()
        db.close()
        engine.dispose()