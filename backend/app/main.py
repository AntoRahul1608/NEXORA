"""
Nexora AI — Application Entry Point.

Initialises the FastAPI server, registers routers, adds middleware, handles
global exception mappings, and manages lifespan database initialisation.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.storage.database import init_db
from app.api import chat, event, session

# Configure logging
settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for the FastAPI application.

    Pre-starts database tables and sets up filesystem resources.
    """
    logger.info("Initializing database and uploads directory...")
    # Initialize SQLite database tables
    await init_db()

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info("Lifespan setup completed successfully.")
    yield
    logger.info("Lifespan shutdown completed.")


def create_app() -> FastAPI:
    """FastAPI application factory.

    Configures routes, middleware, static files, and exception handling.

    Returns:
        A fully configured FastAPI instance.
    """
    app = FastAPI(
        title="Nexora AI",
        description=(
            "Stateful AI Agent Platform with Dynamic UI Generation. "
            "Built for HackIndia 2026."
        ),
        version="1.0.0",
        lifespan=lifespan,
    )

    # Enable CORS for frontend Vite development server
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Serve uploads static directory (for image / file retrieval)
    # Checks if directory exists on startup (managed by lifespan as well)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount(
        "/uploads",
        StaticFiles(directory=settings.UPLOAD_DIR),
        name="uploads",
    )

    # Register API routes with '/api' prefix
    app.include_router(chat.router, prefix="/api")
    app.include_router(event.router, prefix="/api")
    app.include_router(session.router, prefix="/api")

    # Global Exception Handlers
    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
        logger.warning("ValueError intercepted: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandles exception intercepted")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred. Please try again later."},
        )

    # Simple Health Check endpoint
    @app.get("/health", tags=["System"])
    async def health_check() -> dict[str, str]:
        """Verify the service status."""
        return {"status": "healthy", "service": "Nexora AI Backend"}

    return app


app = create_app()
