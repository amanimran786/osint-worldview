from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve .env relative to this file's location (backend/.env)
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    app_name: str = "OSINT Worldview"
    api_prefix: str = "/api"
    env: str = "dev"
    database_url: str = "postgresql+psycopg2://osint:osint@localhost:5432/osint"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 480
    data_retention_days: int = 30
    cors_origins: str = "http://localhost:3000,http://localhost:5174"

    # PostgreSQL connection pool tuning
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_timeout: int = 30
    db_pool_recycle: int = 1800

    model_config = {"env_file": str(_ENV_FILE), "env_file_encoding": "utf-8"}


settings = Settings()
