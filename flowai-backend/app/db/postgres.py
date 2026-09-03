from sqlalchemy import create_engine

from app.config import settings

postgres_engine = create_engine(
    settings.postgres_database_url,
    pool_pre_ping=True,
)
