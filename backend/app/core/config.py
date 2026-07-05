"""
Nexora AI — Application Configuration.

Loads settings from environment variables and .env file using pydantic-settings.
Uses @lru_cache to ensure a single Settings instance across the application.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings loaded from environment variables.

    Attributes:
        OPENAI_API_KEY: API key for authenticating with OpenAI.
        OPENAI_MODEL: The OpenAI model identifier to use for responses.
        DATABASE_URL: Async SQLAlchemy connection string for the database.
        CORS_ORIGINS: Comma-separated list of allowed CORS origins.
        LOG_LEVEL: Logging verbosity level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
        UPLOAD_DIR: Directory path for storing uploaded files.
    """

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_TIMEOUT: int = 60
    OPENAI_MAX_RETRIES: int = 3
    DATABASE_URL: str = "sqlite+aiosqlite:///./nexora.db"
    CORS_ORIGINS: str = "http://localhost:5173"
    LOG_LEVEL: str = "INFO"
    UPLOAD_DIR: str = "uploads"

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse the comma-separated CORS_ORIGINS into a list of strings."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton instance of the application settings.

    Uses functools.lru_cache so the .env file is only read once during the
    lifetime of the process.

    Returns:
        A fully-validated Settings instance.
    """
    return Settings()  # type: ignore[call-arg]
