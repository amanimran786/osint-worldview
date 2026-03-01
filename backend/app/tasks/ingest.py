"""Ingest tasks: fetch RSS feeds, score signals, store in DB."""
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Set

import feedparser

from app.tasks.celery_app import celery
from app.db.session import SessionLocal
from app.models.entities import Source, Signal, Rule, Detection
from app.services.scoring import apply_rules, canonical_key

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------ helpers
def _parse_rss(url: str) -> List[Dict[str, Any]]:
    """Fetch and parse an RSS feed, returning a list of entry dicts."""
    feed = feedparser.parse(url)
    entries = []
    for entry in feed.entries:
        published = None
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            try:
                published = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            except Exception:
                pass

        entries.append({
            "title": entry.get("title", "")[:500],
            "url": entry.get("link", ""),
            "snippet": (entry.get("summary") or "")[:2000],
            "published_at": published,
        })
    return entries


def _ingest_entries(
    entries: List[Dict[str, Any]],
    source_name: str,
    rules: List[Rule],
    db,
) -> int:
    """Score and insert entries, returning count of new signals.

    Uses batch dedup-key lookup and bulk_save_objects for efficiency.
    """
    if not entries:
        return 0

    # Batch dedup check: gather all candidate keys upfront
    candidate_keys: List[str] = []
    entry_key_map: List[tuple] = []  # (entry, dedup_key)
    for entry in entries:
        if not entry["url"]:
            continue
        dedup = canonical_key(entry["url"], entry["title"])
        candidate_keys.append(dedup)
        entry_key_map.append((entry, dedup))

    if not candidate_keys:
        return 0

    # Single query to find all existing dedup keys
    existing_keys: Set[str] = set()
    # Query in chunks of 500 to avoid SQL param limits
    for i in range(0, len(candidate_keys), 500):
        chunk = candidate_keys[i : i + 500]
        rows = db.query(Signal.dedupe_key).filter(Signal.dedupe_key.in_(chunk)).all()
        existing_keys.update(row[0] for row in rows)

    new_signals: List[Signal] = []
    for entry, dedup in entry_key_map:
        if dedup in existing_keys:
            continue

        sig = Signal(
            title=entry["title"],
            url=entry["url"],
            snippet=entry["snippet"],
            source=source_name,
            published_at=entry["published_at"],
            dedupe_key=dedup,
        )

        result = apply_rules(sig, rules)
        sig.severity = result.score
        db.add(sig)
        db.flush()  # get sig.id

        # Create Detection rows for each triggered rule
        for rule_id in result.triggered_rules:
            det = Detection(
                signal_id=sig.id,
                rule_id=rule_id,
                score=result.score,
                explanation="; ".join(result.explanations),
            )
            db.add(det)

        new_signals.append(sig)
        # Prevent the existing_keys set from allowing duplicate inserts within same batch
        existing_keys.add(dedup)

    return len(new_signals)


# ------------------------------------------------------------------ tasks
@celery.task(name="app.tasks.ingest.poll_all_sources", bind=True, max_retries=2)
def poll_all_sources(self):
    """Iterate over all enabled sources and ingest their feeds."""
    db = SessionLocal()
    try:
        sources = db.query(Source).filter(Source.enabled.is_(True)).all()
        rules = db.query(Rule).filter(Rule.enabled.is_(True)).all()
        total = 0

        for src in sources:
            try:
                if src.type == "rss":
                    entries = _parse_rss(src.url)
                else:
                    logger.info("Skipping non-RSS source %s (type=%s)", src.name, src.type)
                    continue

                count = _ingest_entries(entries, src.name, rules, db)
                db.commit()
                total += count
                logger.info("Source '%s': ingested %d new signals", src.name, count)

            except Exception as exc:
                db.rollback()
                logger.error("Error ingesting source '%s': %s", src.name, exc)

        logger.info("Poll complete — %d new signals total", total)
        return {"new_signals": total}

    except Exception as exc:
        db.rollback()
        logger.error("poll_all_sources failed: %s", exc)
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()


@celery.task(name="app.tasks.ingest.poll_single_source")
def poll_single_source(source_id: int):
    """Ingest a single source by ID (for on-demand triggers)."""
    db = SessionLocal()
    try:
        src = db.query(Source).get(source_id)
        if not src or not src.enabled:
            return {"error": "Source not found or disabled"}

        rules = db.query(Rule).filter(Rule.enabled.is_(True)).all()

        if src.type == "rss":
            entries = _parse_rss(src.url)
        else:
            return {"error": f"Unsupported source type: {src.type}"}

        count = _ingest_entries(entries, src.name, rules, db)
        db.commit()
        logger.info("Single poll '%s': ingested %d new signals", src.name, count)
        return {"source": src.name, "new_signals": count}

    except Exception as exc:
        db.rollback()
        logger.error("poll_single_source(%d) failed: %s", source_id, exc)
        raise
    finally:
        db.close()


@celery.task(name="app.tasks.ingest.cleanup_old_signals")
def cleanup_old_signals():
    """Delete signals older than DATA_RETENTION_DAYS that are still status=New."""
    from app.core.config import settings

    db = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(days=settings.data_retention_days)
        deleted = (
            db.query(Signal)
            .filter(Signal.status == "New", Signal.created_at < cutoff)
            .delete(synchronize_session=False)
        )
        db.commit()
        logger.info("Cleanup: deleted %d old signals", deleted)
        return {"deleted": deleted}
    except Exception as exc:
        db.rollback()
        logger.error("cleanup_old_signals failed: %s", exc)
        raise
    finally:
        db.close()
