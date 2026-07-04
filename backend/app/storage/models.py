"""
Nexora AI — Generic SQLAlchemy ORM Models.

Six domain-agnostic tables that power any AI-agent workflow without
hard-coding business-specific schemas (no flight_booking, email, etc.).
"""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.storage.database import Base


def _utcnow() -> datetime:
    """Return the current UTC timestamp (timezone-aware)."""
    return datetime.now(timezone.utc)


def _generate_uuid() -> str:
    """Return a new UUID4 as a string."""
    return str(uuid4())


class Session(Base):
    """Represents a conversational session between a user and the AI agent.

    Attributes:
        id: Unique session identifier (UUID string).
        created_at: When the session was initiated.
        updated_at: Last activity timestamp.
        metadata_: Arbitrary JSON metadata associated with the session.
    """

    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=_generate_uuid,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        onupdate=_utcnow,
        nullable=False,
    )
    metadata_: Mapped[dict | None] = mapped_column(
        "metadata",
        JSON,
        default=dict,
        nullable=True,
    )

    # Relationships
    messages: Mapped[list["Message"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    artifacts: Mapped[list["Artifact"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    generated_uis: Mapped[list["GeneratedUI"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    submitted_events: Mapped[list["SubmittedEvent"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    memories: Mapped[list["Memory"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Session id={self.id!r}>"


class Message(Base):
    """A single message exchanged within a session.

    Attributes:
        id: Auto-incrementing primary key.
        session_id: FK referencing the parent session.
        role: Message author role (``user``, ``assistant``, ``system``).
        content: Full text content of the message.
        timestamp: When the message was created.
    """

    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_session_id", "session_id"),
        Index("ix_messages_timestamp", "timestamp"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
    )

    session: Mapped["Session"] = relationship(back_populates="messages")

    def __repr__(self) -> str:
        return f"<Message id={self.id} role={self.role!r}>"


class Artifact(Base):
    """A structured artifact produced by the AI agent during a session.

    Attributes:
        id: Auto-incrementing primary key.
        session_id: FK referencing the parent session.
        artifact_type: Freeform type label (e.g. ``code``, ``summary``).
        data: Arbitrary JSON payload for the artifact content.
        created_at: When the artifact was generated.
    """

    __tablename__ = "artifacts"
    __table_args__ = (Index("ix_artifacts_session_id", "session_id"),)

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    artifact_type: Mapped[str] = mapped_column(String(50), nullable=False)
    data: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
    )

    session: Mapped["Session"] = relationship(back_populates="artifacts")

    def __repr__(self) -> str:
        return f"<Artifact id={self.id} type={self.artifact_type!r}>"


class GeneratedUI(Base):
    """Stores the UI schema generated by the AI agent for rendering.

    Attributes:
        id: Auto-incrementing primary key.
        session_id: FK referencing the parent session.
        message_id: Optional FK linking to the message that triggered this UI.
        ui_schema: JSON representation of the UI component tree.
        created_at: Generation timestamp.
    """

    __tablename__ = "generated_uis"
    __table_args__ = (Index("ix_generated_uis_session_id", "session_id"),)

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    message_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ui_schema: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
    )

    session: Mapped["Session"] = relationship(back_populates="generated_uis")

    def __repr__(self) -> str:
        return f"<GeneratedUI id={self.id}>"


class SubmittedEvent(Base):
    """Records user-submitted events (form submissions, button clicks, etc.).

    Attributes:
        id: Auto-incrementing primary key.
        session_id: FK referencing the parent session.
        event_type: Freeform event type label.
        payload: Arbitrary JSON event data.
        created_at: Event timestamp.
    """

    __tablename__ = "submitted_events"
    __table_args__ = (Index("ix_submitted_events_session_id", "session_id"),)

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
    )

    session: Mapped["Session"] = relationship(back_populates="submitted_events")

    def __repr__(self) -> str:
        return f"<SubmittedEvent id={self.id} type={self.event_type!r}>"


class Memory(Base):
    """Key-value memory store scoped to a session for agent state tracking.

    Attributes:
        id: Auto-incrementing primary key.
        session_id: FK referencing the parent session.
        key: Memory key identifier.
        value: Arbitrary JSON value.
        updated_at: Last time this memory entry was modified.
    """

    __tablename__ = "memories"
    __table_args__ = (
        Index("ix_memories_session_id", "session_id"),
        Index("ix_memories_key", "key"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    key: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        onupdate=_utcnow,
        nullable=False,
    )

    session: Mapped["Session"] = relationship(back_populates="memories")

    def __repr__(self) -> str:
        return f"<Memory id={self.id} key={self.key!r}>"
