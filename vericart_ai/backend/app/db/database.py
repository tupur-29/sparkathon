

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# 1. Database Engine
# The engine is the primary interface for connecting to the database.
# It uses the DATABASE_URL from your configuration settings.
engine = create_engine(
    settings.DATABASE_URL
    # For production PostgreSQL, you don't need connect_args.
    # If you switch to SQLite for local testing, add: connect_args={"check_same_thread": False}
)

# 2. SessionLocal
# This is a factory for creating new database sessions. Each request in FastAPI
# will get its own session from this factory to ensure isolation.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Declarative Base
# This is a base class that all your ORM models in models.py will inherit from.
# It allows SQLAlchemy to map your Python classes to database tables.
Base = declarative_base()

# 4. get_db Dependency
# This is a FastAPI dependency that creates a new database session for each request,
# yields it to the route, and ensures it's closed afterward, even if an error occurs.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()