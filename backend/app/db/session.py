from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

connect_args: dict = {}
pool_kwargs: dict = {
    "pool_pre_ping": True,
}

if settings.database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL connection pool tuning
    pool_kwargs.update(
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout,
        pool_recycle=settings.db_pool_recycle,
    )

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    **pool_kwargs,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
