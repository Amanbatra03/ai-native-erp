import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for initial development if Postgres isn't ready, 
# but plan for Postgres. For now, let's assume a local sqlite for quick start
# or look for a DATABASE_URL in .env
_db_url = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
# Supabase / Heroku give "postgres://" but SQLAlchemy requires "postgresql://"
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)
SQLALCHEMY_DATABASE_URL = _db_url

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
