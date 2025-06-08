"""Initialize package and ensure database tables exist."""

from .db import Base, engine

# Import models so that SQLAlchemy registers them with Base.metadata
from .models.agent import Agent  # noqa: F401
from .models.sales_point import SalesPoint  # noqa: F401
from .models.poet import Poet  # noqa: F401
from .models.video_editor import VideoEditor 

# Create tables if they don't already exist
Base.metadata.create_all(bind=engine)