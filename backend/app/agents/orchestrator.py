"""
Nexora AI — Agent Orchestrator.

Acts as the brain of the platform. Orchestrates loading session state,
invoking the OpenAI service with structured schemas, validating outputs,
saving state to database, and returning the structured UI back to the client.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from app.agents.memory import MemoryManager
from app.prompts.system_prompt import build_system_prompt
from app.schemas.ui_schema import (
    AgentResponse,
    AgentState,
    ChatResponse,
    EventResponse,
    UIComponent,
)
from app.services.openai_service import OpenAIService
from app.services.session_service import SessionService
from app.services.storage_service import StorageService
from app.validators.ui_validator import UIValidator

logger = logging.getLogger(__name__)


class Orchestrator:
    """The central coordinator of the dynamic UI agent loop.

    Coordinates storage operations, message packaging, structured LLM
    requests, schema validation, and memory persistence.
    """

    def __init__(
        self,
        openai_service: OpenAIService,
        storage_service: StorageService,
        session_service: SessionService,
        memory_manager: MemoryManager,
    ) -> None:
        """Initialise the orchestrator with its dependencies.

        Args:
            openai_service: Client wrapper for LLM requests.
            storage_service: Database CRUD operations.
            session_service: Session lifecycle manager.
            memory_manager: Context and memory helper.
        """
        self.openai_service = openai_service
        self.storage_service = storage_service
        self.session_service = session_service
        self.memory_manager = memory_manager
        self.validator = UIValidator()

    async def handle_chat(
        self, session_id: str | None, message: str
    ) -> ChatResponse:
        """Processes a new natural-language chat turn.

        Args:
            session_id: The UUID of the session, or None to create one.
            message: User prompt string.

        Returns:
            A ChatResponse containing the agent message, state, and UI schema.
        """
        # 1. Create session if not exists
        if not session_id:
            session = await self.session_service.create_session()
            session_id = session.id
        else:
            session = await self.session_service.get_session(session_id)
            if not session:
                session = await self.session_service.create_session()
                session_id = session.id

        # Update session activity timestamp
        await self.session_service.update_session_timestamp(session_id)

        # 2. Persist user message
        user_message_orm = await self.storage_service.save_message(
            session_id=session_id, role="user", content=message
        )

        # 3. Load session state and memory
        context = await self.memory_manager.load_context(
            session_id, self.storage_service
        )
        history = context["messages"]
        current_memory = context["memory"]

        # 4. Construct prompt and message list
        system_prompt = build_system_prompt(
            memory=current_memory,
            current_state=current_memory.get("_workflow_state", "collecting_information"),
        )
        api_messages = self.memory_manager.build_messages(
            history=history[:-1],  # Exclude the user message we just saved (handled below)
            current_memory=current_memory,
            user_message=message,
        )

        # 5. Call OpenAI Structured Outputs API
        try:
            agent_response: AgentResponse = await self.openai_service.generate_response(
                messages=api_messages, system_prompt=system_prompt
            )
        except Exception as e:
            logger.error("OpenAI service error in orchestrator: %s", e)
            # Create a fallback response
            agent_response = AgentResponse(
                response=f"I encountered a temporary issue connecting to the AI brain: {str(e)}",
                state="failed",
                ui=None,
                actions=[],
                memory={},
            )

        # 6. Validate generated UI (if present)
        if agent_response.ui:
            validation_errors = self.validator.validate_component(agent_response.ui)
            if validation_errors:
                logger.warning(
                    "Generated UI validation failed: %s. Falling back to text response.",
                    validation_errors,
                )
                # Keep text response but strip invalid UI
                agent_response.ui = None

        # 7. Persist AI responses & updates
        # Save assistant text message
        assistant_message_orm = await self.storage_service.save_message(
            session_id=session_id, role="assistant", content=agent_response.response
        )

        # Save UI if generated
        ui_schema_dict = (
            agent_response.ui.model_dump() if agent_response.ui else None
        )
        await self.storage_service.save_generated_ui(
            session_id=session_id,
            ui_schema=ui_schema_dict,
            message_id=assistant_message_orm.id,
        )

        # Save memory updates
        memory_updates = dict(agent_response.memory)
        memory_updates["_workflow_state"] = agent_response.state
        await self.storage_service.update_memory(session_id, memory_updates)

        # Re-fetch combined memory
        full_memory = await self.storage_service.get_memory(session_id)

        # 8. Return response
        return ChatResponse(
            session_id=session_id,
            response=agent_response.response,
            state=agent_response.state,
            ui=ui_schema_dict,
            actions=[action.model_dump() for action in agent_response.actions],
            memory=full_memory,
        )

    async def handle_event(
        self, session_id: str, event_type: str, payload: dict[str, Any]
    ) -> EventResponse:
        """Processes a dynamic UI event (like form submission).

        Formats the event as an implicit user turn, passes it through the
        AI planning cycle, and yields the subsequent UI.

        Args:
            session_id: Target session.
            event_type: Event classification label (e.g. form_submit).
            payload: Dynamic form data or button payload.

        Returns:
            An EventResponse with the next action / UI from the agent.
        """
        # Ensure session exists
        session = await self.session_service.get_session(session_id)
        if not session:
            raise ValueError(f"Session not found: {session_id}")

        await self.session_service.update_session_timestamp(session_id)

        # Save submitted event details in events database table
        await self.storage_service.save_event(
            session_id=session_id, event_type=event_type, payload=payload
        )

        # Translate event to a natural language instruction for the LLM
        # This allows the AI agent to reason about the event as if it was user text
        if event_type == "form_submit":
            payload_str = json.dumps(payload, indent=2)
            implicit_message = (
                f"[SYSTEM EVENT: User submitted form with data]\n{payload_str}"
            )
        elif event_type == "button_click":
            payload_str = json.dumps(payload, indent=2)
            implicit_message = (
                f"[SYSTEM EVENT: User clicked action button]\nPayload: {payload_str}"
            )
        else:
            implicit_message = (
                f"[SYSTEM EVENT: {event_type}]\nPayload: {json.dumps(payload)}"
            )

        # Delegate execution directly to handle_chat but using the implicit system event message
        chat_response = await self.handle_chat(
            session_id=session_id, message=implicit_message
        )

        return EventResponse(
            session_id=chat_response.session_id,
            response=chat_response.response,
            state=chat_response.state,
            ui=chat_response.ui,
            actions=chat_response.actions,
            memory=chat_response.memory,
        )
