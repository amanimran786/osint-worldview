"""Add geospatial and AI fields to signals

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-01
"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("signals", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("signals", sa.Column("longitude", sa.Float(), nullable=True))
    op.add_column("signals", sa.Column("location_name", sa.String(255), nullable=True))
    op.add_column("signals", sa.Column("country_code", sa.String(10), nullable=True))
    op.add_column("signals", sa.Column("ai_summary", sa.Text(), nullable=True))

    # Index for geo queries
    op.create_index("ix_signals_country_code", "signals", ["country_code"])
    op.create_index("ix_signals_has_geo", "signals", ["latitude", "longitude"])


def downgrade() -> None:
    op.drop_index("ix_signals_has_geo", table_name="signals")
    op.drop_index("ix_signals_country_code", table_name="signals")
    op.drop_column("signals", "ai_summary")
    op.drop_column("signals", "country_code")
    op.drop_column("signals", "location_name")
    op.drop_column("signals", "longitude")
    op.drop_column("signals", "latitude")
