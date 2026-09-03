from app.db.base import Base
from app.db.session import engine

# Import models so they are registered with SQLAlchemy metadata.
from app.models.customer import Customer  # noqa: F401
from app.models.conversation import Conversation  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.agent import Agent  # noqa: F401
from app.models.agent_run import AgentRun  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.job import Job  # noqa: F401
from app.models.role import Role  # noqa: F401
from app.models.tool import Tool  # noqa: F401
from app.models.tool_call import ToolCall  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.workflow import Workflow  # noqa: F401
from app.models.workflow_run import WorkflowRun  # noqa: F401
from app.models.workflow_step import WorkflowStep  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
