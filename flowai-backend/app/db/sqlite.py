from sqlalchemy import create_engine

from app.config import settings

sqlite_engine = create_engine(
    settings.SQLITE_DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
)
