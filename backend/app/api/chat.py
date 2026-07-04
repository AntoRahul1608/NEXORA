"""
Nexora AI — Chat API Endpoints.

Handles user text conversation turns and history retrieval.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import Orchestrator
from app.api.dependencies import get_orchestrator, get_storage_service
from app.schemas.ui_schema import ChatRequest, ChatResponse
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit a new message to the AI agent",
)
async def post_chat(
    request: ChatRequest,
    orchestrator: Orchestrator = Depends(get_orchestrator),
) -> ChatResponse:
    """Submit a text message to the stateful AI agent.

    This initiates a reasoning loop, updates working memory, and
    dynamically constructs the interactive user interface (JSON).

    Args:
        request: The chat request object.
        orchestrator: Injected Orchestrator.

    Returns:
        ChatResponse including assistant response, state, UI layout, actions.
    """
    try:
        response = await orchestrator.handle_chat(
            session_id=request.session_id,
            message=request.message,
        )
        return response
    except Exception as exc:
        logger.exception("Error in post_chat API")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred in the agent loop: {exc}",
        )


@router.get(
    "/chat/{session_id}/history",
    response_model=list[dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Get conversation message history for a session",
)
async def get_history(
    session_id: str,
    storage: StorageService = Depends(get_storage_service),
) -> list[dict[str, Any]]:
    """Retrieve all messages exchanged in a session, in chronological order.

    Includes user input and assistant text replies.

    Args:
        session_id: Session ID UUID.
        storage: Storage service dependency.

    Returns:
        A list of messages.
    """
    try:
        messages_orm = await storage.get_messages(session_id)
        # We manually map the ORM models to dictionary responses for clean API output
        return [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
            }
            for msg in messages_orm
        ]
    except Exception as exc:
        logger.exception("Error in get_history API")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch conversation history: {exc}",
        )
