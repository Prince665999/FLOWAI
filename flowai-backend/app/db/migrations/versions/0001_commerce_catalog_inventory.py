"""Add Phase 1 commerce catalog and inventory tables."""

from alembic import op
import sqlalchemy as sa


revision = "0001_commerce"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("product_categories", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(120), nullable=False), sa.Column("slug", sa.String(140), nullable=False), sa.Column("description", sa.Text()), sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.UniqueConstraint("name"), sa.UniqueConstraint("slug"))
    op.create_table("products", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("sku", sa.String(80), nullable=False), sa.Column("name", sa.String(255), nullable=False), sa.Column("slug", sa.String(280), nullable=False), sa.Column("description", sa.Text()), sa.Column("short_description", sa.String(500)), sa.Column("brand", sa.String(120)), sa.Column("category_id", sa.Integer(), sa.ForeignKey("product_categories.id")), sa.Column("price_amount", sa.Integer(), nullable=False), sa.Column("currency", sa.String(3), nullable=False, server_default="USD"), sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.false()), sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()), sa.Column("image_url", sa.String(1000)), sa.Column("specifications", sa.JSON(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.UniqueConstraint("sku"), sa.UniqueConstraint("slug"))
    op.create_table("inventory", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False), sa.Column("quantity_on_hand", sa.Integer(), nullable=False, server_default="0"), sa.Column("quantity_reserved", sa.Integer(), nullable=False, server_default="0"), sa.Column("reorder_level", sa.Integer(), nullable=False, server_default="0"), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.UniqueConstraint("product_id"))
    op.create_table("inventory_history", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False), sa.Column("quantity_delta", sa.Integer(), nullable=False), sa.Column("quantity_on_hand", sa.Integer(), nullable=False), sa.Column("quantity_reserved", sa.Integer(), nullable=False), sa.Column("reason", sa.Text(), nullable=False), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id")), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False))


def downgrade() -> None:
    op.drop_table("inventory_history")
    op.drop_table("inventory")
    op.drop_table("products")
    op.drop_table("product_categories")