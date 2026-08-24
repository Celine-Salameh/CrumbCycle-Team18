"""add registration profile fields

Revision ID: 0002_registration_profile
Revises: 0001_backend_foundation
Create Date: 2026-08-24
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_registration_profile"
down_revision = "0001_backend_foundation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("role", sa.String(), nullable=True))
    op.add_column("users", sa.Column("organization", sa.String(), nullable=True))
    op.add_column("users", sa.Column("phone", sa.String(), nullable=True))
    op.add_column("users", sa.Column("country", sa.String(), nullable=True))
    op.add_column("users", sa.Column("workspaceName", sa.String(), nullable=True))
    op.add_column("users", sa.Column("termsAccepted", sa.Boolean(), nullable=True))
    op.execute("UPDATE users SET role = COALESCE(role, 'Team member')")
    op.execute("UPDATE users SET country = COALESCE(country, 'Unknown')")
    op.execute("UPDATE users SET \"workspaceName\" = COALESCE(\"workspaceName\", full_name || ' Workspace')")
    op.execute("UPDATE users SET \"termsAccepted\" = COALESCE(\"termsAccepted\", false)")
    op.alter_column("users", "role", nullable=False)
    op.alter_column("users", "country", nullable=False)
    op.alter_column("users", "workspaceName", nullable=False)
    op.alter_column("users", "termsAccepted", nullable=False)


def downgrade() -> None:
    op.drop_column("users", "termsAccepted")
    op.drop_column("users", "workspaceName")
    op.drop_column("users", "country")
    op.drop_column("users", "phone")
    op.drop_column("users", "organization")
    op.drop_column("users", "role")