from app.db.base import Base
from app.db.session import engine

# Import models so they are registered with SQLAlchemy metadata.
from app.models.customer import Customer  # noqa: F401
from app.models.conversation import Conversation  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.role import Role  # noqa: F401
from app.models.user import User  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
