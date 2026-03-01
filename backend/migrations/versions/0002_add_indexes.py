"""Add performance indexes to signals table

Revision ID: 0002_add_indexes
Revises: 0001
Create Date: 2026-03-01
"""
from alembic import op

# revision identifiers
revision = "0002_add_indexes"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_signals_status_severity", "signals", ["status", "severity"])
    op.create_index("ix_signals_source", "signals", ["source"])
    op.create_index("ix_signals_published_at", "signals", ["published_at"])
    op.create_index("ix_signals_created_at", "signals", ["created_at"])
    # Make dedupe_key unique (was just indexed before)
    op.drop_index("ix_signals_dedupe_key", table_name="signals")
    op.create_index("ix_signals_dedupe_key", "signals", ["dedupe_key"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_signals_created_at", table_name="signals")
    op.drop_index("ix_signals_published_at", table_name="signals")
    op.drop_index("ix_signals_source", table_name="signals")
    op.drop_index("ix_signals_status_severity", table_name="signals")
    op.drop_index("ix_signals_dedupe_key", table_name="signals")
    op.create_index("ix_signals_dedupe_key", "signals", ["dedupe_key"], unique=False)
