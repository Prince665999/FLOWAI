from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.db.postgres import postgres_engine
from app.db.sqlite import sqlite_engine

engine = postgres_engine if settings.ENVIRONMENT != "development" else sqlite_engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
