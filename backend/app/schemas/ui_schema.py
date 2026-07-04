"""
Nexora AI — Pydantic v2 UI Schema Definitions.

Defines the complete type-safe schema system used for:
  • Structured output from OpenAI (AgentResponse)
  • API request / response contracts (ChatRequest, ChatResponse, etc.)
  • Recursive UI component tree description (UIComponent)

Uses Literal unions instead of Python Enums so the models are directly
compatible with OpenAI Structured Outputs (``text_format``).
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Literal type aliases — compatible with OpenAI Structured Outputs
# ---------------------------------------------------------------------------

ComponentType = Literal[
    "container",
    "form",
    "card",
    "button",
    "text",
    "markdown",
    "input",
    "textarea",
    "number_input",
    "email_input",
    "password_input",
    "dropdown",
    "checkbox",
    "radio",
    "date_picker",
    "time_picker",
    "table",
    "chart",
    "upload",
    "image",
    "tabs",
    "modal",
    "divider",
    "badge",
    "list",
    "progress",
    "accordion",
]

ChartType = Literal[
    "bar",
    "line",
    "pie",
    "scatter",
    "area",
    "radar",
    "heatmap",
]

AgentState = Literal[
    "collecting_information",
    "waiting_for_user",
    "processing",
    "completed",
    "failed",
    "cancelled",
]

ActionType = Literal[
    "submit",
    "navigate",
    "cancel",
    "custom",
]


# ---------------------------------------------------------------------------
# Validation rule for individual UI components
# ---------------------------------------------------------------------------


class ValidationRule(BaseModel):
    """Optional validation constraints for a UI input component.

    Attributes:
        min_length: Minimum character count for text inputs.
        max_length: Maximum character count for text inputs.
        min_val: Minimum numeric value for number inputs.
        max_val: Maximum numeric value for number inputs.
        pattern: Regex pattern the value must satisfy.
        custom_message: Human-readable error message on validation failure.
    """

    min_length: int | None = None
    max_length: int | None = None
    min_val: float | None = None
    max_val: float | None = None
    pattern: str | None = None
    custom_message: str | None = None


# ---------------------------------------------------------------------------
# Recursive UI component tree
# ---------------------------------------------------------------------------


class UIComponent(BaseModel):
    """A single node in a recursive UI component tree.

    The frontend renderer walks this tree and maps each ``component``
    value to a concrete React / Vue / Svelte component.

    Attributes:
        id: Unique identifier for the component instance.
        component: One of the 28 supported component types.
        props: Arbitrary key-value properties forwarded to the renderer.
        children: Optional nested child components (recursive).
        validation: Optional validation constraints for input components.
    """

    id: str = Field(..., description="Unique component identifier")
    component: ComponentType = Field(..., description="Component type from the supported set")
    props: dict[str, Any] | None = Field(default=None, description="Component-specific properties")
    children: list[UIComponent] | None = Field(
        default=None,
        description="Nested child components",
    )
    validation: ValidationRule | None = Field(
        default=None,
        description="Validation rules for input components",
    )

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# UI action descriptors
# ---------------------------------------------------------------------------


class UIAction(BaseModel):
    """Describes an actionable button / link the user can trigger.

    Attributes:
        id: Unique identifier for the action.
        label: Display text for the action control.
        action_type: Semantic action category.
        payload: Optional data attached to the action when triggered.
    """

    id: str = Field(..., description="Unique action identifier")
    label: str = Field(..., description="Display label for the action")
    action_type: ActionType = Field(..., description="Action category")
    payload: dict[str, Any] | None = Field(
        default=None,
        description="Optional payload attached to the action",
    )


# ---------------------------------------------------------------------------
# Master agent response — this is what OpenAI returns via structured output
# ---------------------------------------------------------------------------


class AgentResponse(BaseModel):
    """Master response schema returned by the AI agent.

    This model is passed as ``text_format`` to the OpenAI Responses API
    so the LLM is constrained to produce valid JSON matching this shape.

    Attributes:
        response: Natural-language text response to the user.
        state: Current agent workflow state.
        ui: Optional UI component tree for the frontend to render.
        actions: List of actions the user can take.
        memory: Key-value pairs to persist in session memory.
    """

    response: str = Field(..., description="Natural language response text")
    state: AgentState = Field(..., description="Current agent state")
    ui: UIComponent | None = Field(
        default=None,
        description="UI component tree for frontend rendering",
    )
    actions: list[UIAction] = Field(
        default_factory=list,
        description="Available user actions",
    )
    memory: dict[str, Any] = Field(
        default_factory=dict,
        description="Key-value memory updates to persist",
    )


# ---------------------------------------------------------------------------
# API request / response models
# ---------------------------------------------------------------------------


class ChatRequest(BaseModel):
    """Incoming chat message from the client.

    Attributes:
        session_id: Optional existing session ID; omit to create a new session.
        message: The user's text message.
    """

    session_id: str | None = Field(
        default=None,
        description="Existing session ID, or null to start a new session",
    )
    message: str = Field(..., min_length=1, description="User message text")


class ChatResponse(BaseModel):
    """Response payload returned to the client after a chat turn.

    Attributes:
        session_id: The session ID (may be newly created).
        response: Agent's natural-language reply.
        state: Agent workflow state after this turn.
        ui: Serialised UI component tree (dict), or None.
        actions: List of available actions.
        memory: Current session memory snapshot.
    """

    session_id: str
    response: str
    state: str
    ui: dict[str, Any] | None = None
    actions: list[dict[str, Any]] = Field(default_factory=list)
    memory: dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)


class EventRequest(BaseModel):
    """Incoming user event (form submission, button click, etc.).

    Attributes:
        session_id: Session the event belongs to.
        event_type: Freeform event type label.
        payload: Arbitrary event data.
    """

    session_id: str = Field(..., description="Session ID")
    event_type: str = Field(..., description="Event type label")
    payload: dict[str, Any] = Field(default_factory=dict, description="Event payload data")


class EventResponse(BaseModel):
    """Response payload returned to the client after processing an event.

    Mirrors ChatResponse for a consistent client-side contract.
    """

    session_id: str
    response: str
    state: str
    ui: dict[str, Any] | None = None
    actions: list[dict[str, Any]] = Field(default_factory=list)
    memory: dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)
