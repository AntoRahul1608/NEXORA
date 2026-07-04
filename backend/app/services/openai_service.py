"""
Nexora AI — OpenAI Service.

Wraps the AsyncOpenAI client and uses the Responses API with Structured
Outputs to guarantee the LLM returns valid JSON matching AgentResponse.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from openai import AsyncOpenAI

from app.core.config import get_settings
from app.schemas.ui_schema import AgentResponse

logger = logging.getLogger(__name__)
settings = get_settings()


class OpenAIService:
    """Service for generating structured AI responses via the OpenAI Responses API.

    Uses ``client.responses.parse()`` with ``text_format=AgentResponse``
    so the model output is constrained to the Pydantic schema and returned
    as a validated Python object.

    Attributes:
        client: The async OpenAI client instance.
        model: The model identifier to use for generation.
    """

    def __init__(self) -> None:
        """Initialise the OpenAI async client."""
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model: str = settings.OPENAI_MODEL

    async def generate_response(
        self,
        messages: list[dict[str, Any]],
        system_prompt: str,
        max_retries: int = 3,
    ) -> AgentResponse:
        """Generate a structured AI response with dynamic UI.

        Calls the OpenAI Responses API with Structured Outputs.  Retries
        on transient failures with exponential back-off.

        Args:
            messages: Conversation history as a list of ``{role, content}`` dicts.
            system_prompt: The system instructions for the agent.
            max_retries: Number of retry attempts on failure.

        Returns:
            A validated ``AgentResponse`` instance.

        Raises:
            ValueError: If the model refuses or all retries are exhausted.
        """
        if not self.client.api_key:
            raise ValueError(
                "OPENAI_API_KEY is not set. Please copy '.env.example' to '.env' "
                "in the backend directory and configure your key."
            )

        last_error: Exception | None = None

        for attempt in range(1, max_retries + 1):
            try:
                logger.info(
                    "OpenAI request attempt %d/%d  model=%s  messages=%d",
                    attempt,
                    max_retries,
                    self.model,
                    len(messages),
                )

                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        *messages
                    ],
                    response_format={"type": "json_object"},
                )

                content = response.choices[0].message.content
                if not content:
                    raise ValueError("The AI model returned an empty response.")

                parsed_response = AgentResponse.model_validate_json(content)

                logger.info("OpenAI response received — state=%s", parsed_response.state)
                return parsed_response

            except ValueError:
                raise  # Don't retry refusals
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "OpenAI request failed (attempt %d/%d): %s",
                    attempt,
                    max_retries,
                    str(exc),
                )
                if attempt < max_retries:
                    wait = 2 ** attempt
                    logger.info("Retrying in %ds …", wait)
                    await asyncio.sleep(wait)

        raise ValueError(
            f"Failed to get AI response after {max_retries} attempts: {last_error}"
        )


# ---------------------------------------------------------------------------
# Dependency injection helper
# ---------------------------------------------------------------------------

_openai_service: OpenAIService | None = None


def get_openai_service() -> OpenAIService:
    """Return a singleton ``OpenAIService`` instance.

    Returns:
        The shared OpenAIService.
    """
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service
