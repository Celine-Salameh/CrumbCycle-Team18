"""add google signup fields

Revision ID: 0003_google_signup
Revises: 0002_registration_profile
Create Date: 2026-08-24
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_google_signup"
down_revision = "0002_registration_profile"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("googleId", sa.String(), nullable=True))
    op.add_column("users", sa.Column("profilePicture", sa.String(), nullable=True))
    op.create_unique_constraint("uq_users_googleId", "users", ["googleId"])


def downgrade() -> None:
    op.drop_constraint("uq_users_googleId", "users", type_="unique")
    op.drop_column("users", "profilePicture")
    op.drop_column("users", "googleId")