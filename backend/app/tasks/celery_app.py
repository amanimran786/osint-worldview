from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery = Celery(
    "osint_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    # Auto-discover tasks in app.tasks package
    imports=["app.tasks.ingest"],
)

# Beat schedule — poll RSS feeds every 15 minutes
celery.conf.beat_schedule = {
    "poll-rss-feeds": {
        "task": "app.tasks.ingest.poll_all_sources",
        "schedule": crontab(minute="*/15"),
    },
    "cleanup-old-signals": {
        "task": "app.tasks.ingest.cleanup_old_signals",
        "schedule": crontab(hour="3", minute="0"),  # daily at 03:00 UTC
    },
}
