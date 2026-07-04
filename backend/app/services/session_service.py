"""
Nexora AI — Session Service.

Lifecycle management for conversation sessions.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.storage.models import Session

logger = logging.getLogger(__name__)


class SessionService:
    """Manages session lifecycle (create, get, list, delete, update).

    Attributes:
        db: The async database session for the current request.
    """

    def __init__(self, db: AsyncSession) -> None:
        """Initialise with a database session.

        Args:
            db: An active SQLAlchemy AsyncSession.
        """
        self.db = db

    async def create_session(self) -> Session:
        """Create a new conversation session.

        Returns:
            The newly created ``Session`` ORM instance with a UUID id.
        """
        session = Session()
        self.db.add(session)
        await self.db.flush()
        logger.info("Created session id=%s", session.id)
        return session

    async def get_session(self, session_id: str) -> Session | None:
        """Retrieve a session by ID.

        Args:
            session_id: The UUID string of the session.

        Returns:
            The ``Session`` instance or ``None`` if not found.
        """
        stmt = select(Session).where(Session.id == session_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_sessions(self) -> list[Session]:
        """List all sessions ordered by most recently updated.

        Returns:
            A list of ``Session`` instances.
        """
        stmt = select(Session).order_by(Session.updated_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def delete_session(self, session_id: str) -> bool:
        """Delete a session and all related data (cascade).

        Args:
            session_id: The UUID string of the session to delete.

        Returns:
            ``True`` if the session was found and deleted, ``False`` otherwise.
        """
        session = await self.get_session(session_id)
        if session is None:
            return False

        await self.db.delete(session)
        await self.db.flush()
        logger.info("Deleted session id=%s", session_id)
        return True

    async def update_session_timestamp(self, session_id: str) -> Session | None:
        """Touch the session's ``updated_at`` timestamp.

        Args:
            session_id: The UUID string of the session to update.

        Returns:
            The updated ``Session`` or ``None`` if not found.
        """
        session = await self.get_session(session_id)
        if session is None:
            return None

        session.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return session
