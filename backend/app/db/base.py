# Import all the models, so that Base has them before being
# used by Alembic
from app.core.database import Base  # noqa
from app.models import *  # noqa
