"""Add Phase 2 customer identity, address book, and persisted refresh tokens.

Revision ID: 0002_customer_identity
Revises: 0001_commerce
"""
from alembic import op
import sqlalchemy as sa


revision = "0002_customer_identity"
down_revision = "0001_commerce"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ---- users -------------------------------------------------------------
    op.add_column(
        "users",
        sa.Column("account_type", sa.String(20), nullable=False, server_default="staff"),
    )
    op.create_index("ix_users_account_type", "users", ["account_type"])
    op.add_column("users", sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True))

    # ---- customers (link account to CRM profile) ---------------------------
    op.add_column("customers", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_customers_user_id_users",
        "customers",
        "users",
        ["user_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_customers_user_id", "customers", ["user_id"])

    # ---- addresses ----------------------------------------------------------
    op.create_table(
        "addresses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("label", sa.String(60)),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50)),
        sa.Column("line1", sa.String(200), nullable=False),
        sa.Column("line2", sa.String(200)),
        sa.Column("city", sa.String(120), nullable=False),
        sa.Column("state", sa.String(120)),
        sa.Column("postal_code", sa.String(40)),
        sa.Column("country", sa.String(2), nullable=False, server_default="US"),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_addresses_user_id", "addresses", ["user_id"])

    # ---- tokens (persisted, revocable refresh tokens) ----------------------
    op.create_table(
        "tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("jti", sa.String(255), nullable=False),
        sa.Column("token_type", sa.String(20), nullable=False, server_default="refresh"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("revoked_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("jti"),
    )
    op.create_index("ix_tokens_user_id", "tokens", ["user_id"])
    op.create_index("ix_tokens_jti", "tokens", ["jti"])


def downgrade() -> None:
    op.drop_index("ix_tokens_jti", table_name="tokens")
    op.drop_index("ix_tokens_user_id", table_name="tokens")
    op.drop_table("tokens")

    op.drop_index("ix_addresses_user_id", table_name="addresses")
    op.drop_table("addresses")

    op.drop_index("ix_customers_user_id", table_name="customers")
    op.drop_constraint("fk_customers_user_id_users", "customers", type_="foreignkey")
    op.drop_column("customers", "user_id")

    op.drop_column("users", "email_verified_at")
    op.drop_index("ix_users_account_type", table_name="users")
    op.drop_column("users", "account_type")