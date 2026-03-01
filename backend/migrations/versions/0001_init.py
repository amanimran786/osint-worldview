"""init tables

Revision ID: 0001
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("full_name", sa.String(255)),
        sa.Column("role", sa.String(50), server_default="Analyst"),
        sa.Column("hashed_password", sa.String(255)),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "sources",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("url", sa.Text, nullable=False),
        sa.Column("enabled", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "rules",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("severity", sa.Integer, server_default="10"),
        sa.Column("keywords", sa.Text, nullable=False),
        sa.Column("allowlist", sa.Text),
        sa.Column("denylist", sa.Text),
        sa.Column("enabled", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "cases",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("status", sa.String(50), server_default="New"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "signals",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("snippet", sa.Text),
        sa.Column("url", sa.Text, nullable=False),
        sa.Column("source", sa.String(100), nullable=False),
        sa.Column("published_at", sa.DateTime),
        sa.Column("fetched_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("severity", sa.Integer, server_default="0"),
        sa.Column("category", sa.String(100)),
        sa.Column("status", sa.String(50), server_default="New"),
        sa.Column("case_id", sa.Integer, sa.ForeignKey("cases.id")),
        sa.Column("dedupe_key", sa.String(255), index=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "detections",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("signal_id", sa.Integer, sa.ForeignKey("signals.id")),
        sa.Column("rule_id", sa.Integer, sa.ForeignKey("rules.id")),
        sa.Column("score", sa.Integer, server_default="0"),
        sa.Column("explanation", sa.Text),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "notes",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("signal_id", sa.Integer, sa.ForeignKey("signals.id")),
        sa.Column("case_id", sa.Integer, sa.ForeignKey("cases.id")),
        sa.Column("author_id", sa.Integer, sa.ForeignKey("users.id")),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "assignments",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("case_id", sa.Integer, sa.ForeignKey("cases.id")),
        sa.Column("assignee_id", sa.Integer, sa.ForeignKey("users.id")),
        sa.Column("status", sa.String(50), server_default="Active"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("actor_id", sa.Integer, sa.ForeignKey("users.id")),
        sa.Column("action", sa.String(255), nullable=False),
        sa.Column("target_type", sa.String(100), nullable=False),
        sa.Column("target_id", sa.Integer),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )


def downgrade():
    for t in ["audit_logs", "assignments", "notes", "detections", "signals", "cases", "rules", "sources", "users"]:
        op.drop_table(t)
