"""
Nexora AI — Storage Service.

CRUD operations for all six generic database tables.  Injected into
the Orchestrator to persist conversation history, generated UIs,
events, and session memory.
"""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.storage.models import (
    Artifact,
    GeneratedUI,
    Memory,
    Message,
    SubmittedEvent,
)

logger = logging.getLogger(__name__)


class StorageService:
    """Provides async CRUD operations for all generic Nexora tables.

    Each method receives the data to persist and the underlying
    ``AsyncSession`` handles transaction management.

    Attributes:
        db: The async database session for the current request.
    """

    def __init__(self, db: AsyncSession) -> None:
        """Initialise with a database session.

        Args:
            db: An active SQLAlchemy AsyncSession.
        """
        self.db = db

    # ------------------------------------------------------------------
    # Messages
    # ------------------------------------------------------------------

    async def save_message(
        self, session_id: str, role: str, content: str
    ) -> Message:
        """Persist a new message in the conversation history.

        Args:
            session_id: The session this message belongs to.
            role: Message author role (``user``, ``assistant``, ``system``).
            content: Full text content.

        Returns:
            The newly created ``Message`` ORM instance.
        """
        message = Message(session_id=session_id, role=role, content=content)
        self.db.add(message)
        await self.db.flush()
        logger.debug("Saved message id=%s role=%s session=%s", message.id, role, session_id)
        return message

    async def get_messages(
        self, session_id: str, limit: int = 50
    ) -> list[Message]:
        """Retrieve recent messages for a session, ordered chronologically.

        Args:
            session_id: Target session.
            limit: Maximum number of messages to return.

        Returns:
            A list of ``Message`` instances.
        """
        stmt = (
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.timestamp.asc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    # ------------------------------------------------------------------
    # Generated UI
    # ------------------------------------------------------------------

    async def save_generated_ui(
        self,
        session_id: str,
        ui_schema: dict[str, Any] | None,
        message_id: int | None = None,
    ) -> GeneratedUI:
        """Persist a generated UI schema.

        Args:
            session_id: The session this UI belongs to.
            ui_schema: The JSON-serializable UI component tree.
            message_id: Optional FK linking to the triggering message.

        Returns:
            The newly created ``GeneratedUI`` instance.
        """
        generated_ui = GeneratedUI(
            session_id=session_id,
            ui_schema=ui_schema,
            message_id=message_id,
        )
        self.db.add(generated_ui)
        await self.db.flush()
        logger.debug("Saved generated UI id=%s session=%s", generated_ui.id, session_id)
        return generated_ui

    # ------------------------------------------------------------------
    # Submitted Events
    # ------------------------------------------------------------------

    async def save_event(
        self,
        session_id: str,
        event_type: str,
        payload: dict[str, Any],
    ) -> SubmittedEvent:
        """Persist a user-submitted event.

        Args:
            session_id: The session the event belongs to.
            event_type: Freeform event type label.
            payload: Event data.

        Returns:
            The newly created ``SubmittedEvent`` instance.
        """
        event = SubmittedEvent(
            session_id=session_id,
            event_type=event_type,
            payload=payload,
        )
        self.db.add(event)
        await self.db.flush()
        logger.debug("Saved event id=%s type=%s session=%s", event.id, event_type, session_id)
        return event

    # ------------------------------------------------------------------
    # Memory
    # ------------------------------------------------------------------

    async def get_memory(self, session_id: str) -> dict[str, Any]:
        """Load all memory key-value pairs for a session.

        Args:
            session_id: Target session.

        Returns:
            A dict of ``{key: value}`` memory entries.
        """
        stmt = select(Memory).where(Memory.session_id == session_id)
        result = await self.db.execute(stmt)
        memories = result.scalars().all()
        return {m.key: m.value for m in memories}

    async def update_memory(
        self, session_id: str, memory_updates: dict[str, Any]
    ) -> None:
        """Upsert memory key-value pairs for a session.

        Existing keys are updated; new keys are inserted.

        Args:
            session_id: Target session.
            memory_updates: Dict of keys and values to persist.
        """
        for key, value in memory_updates.items():
            stmt = select(Memory).where(
                Memory.session_id == session_id,
                Memory.key == key,
            )
            result = await self.db.execute(stmt)
            existing = result.scalar_one_or_none()

            if existing:
                existing.value = value
            else:
                self.db.add(Memory(session_id=session_id, key=key, value=value))

        await self.db.flush()
        logger.debug(
            "Updated %d memory keys for session=%s", len(memory_updates), session_id
        )

    # ------------------------------------------------------------------
    # Artifacts
    # ------------------------------------------------------------------

    async def save_artifact(
        self,
        session_id: str,
        artifact_type: str,
        data: dict[str, Any],
    ) -> Artifact:
        """Persist a structured artifact.

        Args:
            session_id: The session the artifact belongs to.
            artifact_type: Freeform type label.
            data: JSON-serializable artifact content.

        Returns:
            The newly created ``Artifact`` instance.
        """
        artifact = Artifact(
            session_id=session_id,
            artifact_type=artifact_type,
            data=data,
        )
        self.db.add(artifact)
        await self.db.flush()
        logger.debug("Saved artifact id=%s type=%s session=%s", artifact.id, artifact_type, session_id)
        return artifact
