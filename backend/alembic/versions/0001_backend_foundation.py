"""backend foundation

Revision ID: 0001_backend_foundation
Revises:
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_backend_foundation"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(20) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT roles_name_check CHECK (name IN ('user', 'admin'))
    )
    """)
    op.execute("INSERT INTO roles (id, name) VALUES (1, 'user'), (2, 'admin') ON CONFLICT (id) DO NOTHING")
    op.execute("SELECT setval(pg_get_serial_sequence('roles', 'id'), GREATEST((SELECT MAX(id) FROM roles), 1))")
    op.execute("""
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role_id INTEGER NOT NULL REFERENCES roles(id) ON UPDATE CASCADE,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """)
    op.create_index("ix_users_email", "users", ["email"], unique=False, if_not_exists=True)
    op.create_table(
        "auth_refresh_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("jti", sa.String(length=64), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        if_not_exists=True,
    )
    op.create_index("ix_auth_refresh_tokens_user_id", "auth_refresh_tokens", ["user_id"], if_not_exists=True)
    op.create_index("ix_auth_refresh_tokens_jti", "auth_refresh_tokens", ["jti"], unique=True, if_not_exists=True)
    op.create_table(
        "auth_token_blacklist",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("jti", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        if_not_exists=True,
    )
    op.create_index("ix_auth_token_blacklist_jti", "auth_token_blacklist", ["jti"], unique=True, if_not_exists=True)


def downgrade() -> None:
    op.drop_index("ix_auth_token_blacklist_jti", table_name="auth_token_blacklist", if_exists=True)
    op.drop_table("auth_token_blacklist", if_exists=True)
    op.drop_index("ix_auth_refresh_tokens_jti", table_name="auth_refresh_tokens", if_exists=True)
    op.drop_index("ix_auth_refresh_tokens_user_id", table_name="auth_refresh_tokens", if_exists=True)
    op.drop_table("auth_refresh_tokens", if_exists=True)
