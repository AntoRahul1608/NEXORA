"""
Nexora AI — Async SQLAlchemy Database Setup.

Provides the async engine, session factory, declarative base, table
initialisation helper, and a FastAPI dependency that yields an
AsyncSession per request.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.LOG_LEVEL == "DEBUG",
    future=True,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Declarative base class for all SQLAlchemy ORM models."""

    pass


async def init_db() -> None:
    """Create all tables defined by models inheriting from Base.

    Should be called once during application startup (e.g. inside the
    FastAPI lifespan context manager).
    """
    async with engine.begin() as conn:
        from app.storage import models as _models  # noqa: F401 — side-effect import

        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides a scoped async database session.

    Yields:
        An AsyncSession that is automatically closed when the request ends.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
