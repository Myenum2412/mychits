import os
import socket
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger("uvicorn")

Base = declarative_base()


def is_postgres_available(host: str = "127.0.0.1", port: int = 5432) -> bool:
    """Quick non-blocking check if PostgreSQL server is listening."""
    try:
        with socket.create_connection((host, port), timeout=0.3):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False


def get_database_engine():
    """
    Connect to PostgreSQL if available.
    If PostgreSQL is unreachable, fallback to SQLite (chits.db) so user authentication
    and all database tables work seamlessly without crashing or hanging.
    """
    url = settings.DATABASE_URL

    if "postgres" in url.lower():
        # Parse host/port if standard
        host = "127.0.0.1"
        port = 5432
        if "@" in url:
            parts = url.split("@")[1].split("/")[0]
            if ":" in parts:
                host, port_str = parts.split(":")
                try:
                    port = int(port_str)
                except ValueError:
                    port = 5432
            else:
                host = parts

        if is_postgres_available(host, port):
            try:
                eng = create_engine(
                    url,
                    connect_args={"connect_timeout": 3},
                    pool_pre_ping=True,
                    echo=False,
                )
                with eng.connect():
                    logger.info("Connected to PostgreSQL database.")
                return eng
            except Exception as e:
                logger.warning(f"PostgreSQL connection error: {e}")

        # Fallback to local SQLite file
        sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chits.db"))
        sqlite_url = f"sqlite:///{sqlite_path}"
        logger.info(f"PostgreSQL is unavailable. Using local database at: {sqlite_url}")
        return create_engine(
            sqlite_url,
            connect_args={"check_same_thread": False},
            echo=False,
        )

    # Custom SQLite or other configured URL
    return create_engine(
        url,
        connect_args={"check_same_thread": False} if "sqlite" in url else {},
        pool_pre_ping=True,
        echo=False,
    )


engine = get_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
