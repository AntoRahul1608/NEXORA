"""
Nexora AI — Memory Manager.

Manages loading the conversation context, reconstructing message history,
merging working memory updates, and history truncation.
"""

from __future__ import annotations

import logging
from typing import Any

from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)


class MemoryManager:
    """Manages conversational and session memory for the AI Orchestrator."""

    async def load_context(
        self, session_id: str, storage: StorageService
    ) -> dict[str, Any]:
        """Loads both messages and working memory keys for a session.

        Args:
            session_id: Target session.
            storage: Storage service instance.

        Returns:
            A dict containing 'messages' list and 'memory' dict.
        """
        messages = await storage.get_messages(session_id)
        memory = await storage.get_memory(session_id)
        return {
            "messages": messages,
            "memory": memory,
        }

    def build_messages(
        self,
        history: list[Any],
        current_memory: dict[str, Any],
        user_message: str,
    ) -> list[dict[str, Any]]:
        """Constructs the prompt message list for the OpenAI Responses API.

        Combines history, memory context (implicit in prompt or explicit messages),
        and the final user message.

        Args:
            history: List of stored Message ORM instances.
            current_memory: Persisted session memory variables.
            user_message: The user's new message.

        Returns:
            A list of dictionary messages matching OpenAI format.
        """
        api_messages: list[dict[str, Any]] = []

        # Convert ORM history to API messages
        # We exclude system messages from history since system prompt is set separately
        for msg in history:
            if msg.role in ("user", "assistant"):
                api_messages.append({"role": msg.role, "content": msg.content})

        # Append new user message
        api_messages.append({"role": "user", "content": user_message})

        return self.truncate_history(api_messages)

    def merge_memory(
        self, existing: dict[str, Any], new_memory: dict[str, Any]
    ) -> dict[str, Any]:
        """Performs a deep/flat merge of new memory keys from the agent.

        Args:
            existing: Existing memory dictionary.
            new_memory: Memory updates from the agent response.

        Returns:
            A combined dictionary.
        """
        merged = dict(existing)
        for k, v in new_memory.items():
            if isinstance(v, dict) and isinstance(merged.get(k), dict):
                merged[k] = self.merge_memory(merged[k], v)
            else:
                merged[k] = v
        return merged

    def truncate_history(
        self, messages: list[dict[str, Any]], max_messages: int = 20
    ) -> list[dict[str, Any]]:
        """Ensures conversation history does not exceed the model context window.

        Args:
            messages: List of message dicts.
            max_messages: Maximum allowed messages in history.

        Returns:
            Truncated list of messages, always preserving roles.
        """
        if len(messages) <= max_messages:
            return messages

        # Preserve the very first user prompt if useful, or just take the last N
        # We take the last N, ensuring the first message in context is from 'user'
        truncated = messages[-max_messages:]
        if truncated[0]["role"] == "assistant":
            truncated = truncated[1:]

        logger.debug(
            "Truncated history from %d to %d messages", len(messages), len(truncated)
        )
        return truncated
