"""
Nexora AI — API Dependencies.

Defines FastAPI dependencies for injecting services and the agent orchestrator.
"""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.memory import MemoryManager
from app.agents.orchestrator import Orchestrator
from app.storage.database import get_db
from app.services.openai_service import get_openai_service, OpenAIService
from app.services.session_service import SessionService
from app.services.storage_service import StorageService


def get_memory_manager() -> MemoryManager:
    """Dependency provider for MemoryManager singleton."""
    return MemoryManager()


def get_storage_service(db: AsyncSession = Depends(get_db)) -> StorageService:
    """Dependency provider for StorageService scoped to request."""
    return StorageService(db)


def get_session_service(db: AsyncSession = Depends(get_db)) -> SessionService:
    """Dependency provider for SessionService scoped to request."""
    return SessionService(db)


def get_orchestrator(
    openai_service: OpenAIService = Depends(get_openai_service),
    storage_service: StorageService = Depends(get_storage_service),
    session_service: SessionService = Depends(get_session_service),
    memory_manager: MemoryManager = Depends(get_memory_manager),
) -> Orchestrator:
    """FastAPI dependency injecting a fully initialized Orchestrator instance.

    Args:
        openai_service: OpenAIService instance.
        storage_service: StorageService instance.
        session_service: SessionService instance.
        memory_manager: MemoryManager instance.

    Returns:
        An active Orchestrator.
    """
    return Orchestrator(
        openai_service=openai_service,
        storage_service=storage_service,
        session_service=session_service,
        memory_manager=memory_manager,
    )
