import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import all models to populate Base.metadata
from app.db.base import Base
import app.db.init_db  # noqa: F401
from app.models.user import User


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    user = User(
        id=1,
        email="testuser@flowai.test",
        full_name="Test User",
        hashed_password="hashed_pw_here",
        role_name="admin",
        is_active=True,
    )
    session.add(user)
    session.commit()

    yield session
    session.close()
