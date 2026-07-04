"""
Nexora AI — Session API Endpoints.

CRUD operations for conversational sessions.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_session_service
from app.services.session_service import SessionService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Sessions"])


@router.post(
    "/session",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new chat session",
)
async def post_session(
    session_service: SessionService = Depends(get_session_service),
) -> dict[str, Any]:
    """Create a new conversational session and generate a UUID.

    Args:
        session_service: Session service dependency.

    Returns:
        JSON response with the new session_id and metadata.
    """
    try:
        session = await session_service.create_session()
        return {
            "id": session.id,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
            "metadata": session.metadata_,
        }
    except Exception as exc:
        logger.exception("Error creating session")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {exc}",
        )


@router.get(
    "/sessions",
    summary="List all chat sessions",
)
async def get_sessions(
    session_service: SessionService = Depends(get_session_service),
) -> list[dict[str, Any]]:
    """List all sessions in chronological order of last update.

    Args:
        session_service: Session service dependency.

    Returns:
        A list of sessions.
    """
    try:
        sessions = await session_service.list_sessions()
        return [
            {
                "id": s.id,
                "created_at": s.created_at.isoformat(),
                "updated_at": s.updated_at.isoformat(),
                "metadata": s.metadata_,
            }
            for s in sessions
        ]
    except Exception as exc:
        logger.exception("Error listing sessions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list sessions: {exc}",
        )


@router.get(
    "/session/{session_id}",
    summary="Get details of a single session",
)
async def get_session(
    session_id: str,
    session_service: SessionService = Depends(get_session_service),
) -> dict[str, Any]:
    """Retrieve details for a single session.

    Args:
        session_id: Session UUID.
        session_service: Session service dependency.

    Returns:
        Session details.
    """
    try:
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session with ID {session_id} not found",
            )
        return {
            "id": session.id,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
            "metadata": session.metadata_,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error fetching session details")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch session: {exc}",
        )


@router.delete(
    "/session/{session_id}",
    summary="Delete a session and all its database cascades",
)
async def delete_session(
    session_id: str,
    session_service: SessionService = Depends(get_session_service),
) -> Response:
    """Delete a session, including messages, dynamic UIs, events, and memory.

    Cascades are handled automatically by database foreign keys.

    Args:
        session_id: Session UUID to delete.
        session_service: Session service dependency.
    """
    try:
        deleted = await session_service.delete_session(session_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {session_id} not found",
            )
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error deleting session")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete session: {exc}",
        )
