"""
Nexora AI — UI Response Validator.

Validates the raw structured output from OpenAI against the Nexora UI
schema, ensuring component types are supported, chart configurations are
valid, and the recursive component tree is well-formed.
"""

from __future__ import annotations

import logging
from typing import Any, get_args

from app.schemas.ui_schema import (
    AgentResponse,
    ChartType,
    ComponentType,
    UIComponent,
)

logger = logging.getLogger(__name__)

# Pre-compute the set of allowed component types from the Literal union
SUPPORTED_COMPONENTS: set[str] = set(get_args(ComponentType))
SUPPORTED_CHART_TYPES: set[str] = set(get_args(ChartType))


class UIValidator:
    """Validates AI-generated responses and UI component trees.

    All validation methods are stateless and can be used as class methods,
    but the class provides a convenient namespace and is instantiated by
    the orchestrator for consistency.
    """

    def validate_response(self, raw_data: dict[str, Any]) -> AgentResponse:
        """Parse and validate a raw dictionary into an AgentResponse.

        Args:
            raw_data: Dictionary (typically from JSON) representing an
                      agent response.

        Returns:
            A fully-validated AgentResponse instance.

        Raises:
            ValueError: If the data fails Pydantic validation or contains
                        invalid UI components.
        """
        try:
            agent_response = AgentResponse.model_validate(raw_data)
        except Exception as exc:
            logger.error("AgentResponse validation failed: %s", exc)
            raise ValueError(f"Invalid agent response structure: {exc}") from exc

        # Deep-validate the UI component tree if present
        if agent_response.ui is not None:
            errors = self.validate_component(agent_response.ui)
            if errors:
                error_summary = "; ".join(errors)
                logger.warning("UI component validation warnings: %s", error_summary)
                raise ValueError(f"UI component validation failed: {error_summary}")

        return agent_response

    def validate_component(self, component: UIComponent) -> list[str]:
        """Recursively validate a UIComponent and its children.

        Checks:
          • component type is in the supported set
          • chart components have valid chart config
          • all children are themselves valid

        Args:
            component: The UIComponent node to validate.

        Returns:
            A list of human-readable error strings (empty if valid).
        """
        errors: list[str] = []

        # 1. Check component type
        if component.component not in SUPPORTED_COMPONENTS:
            errors.append(
                f"Component '{component.id}' has unsupported type "
                f"'{component.component}'. Supported types: "
                f"{sorted(SUPPORTED_COMPONENTS)}"
            )

        # 2. Chart-specific validation
        if component.component == "chart" and component.props:
            errors.extend(self.validate_chart_config(component.props, component.id))

        # 3. Progress-specific validation
        if component.component == "progress" and component.props:
            errors.extend(self.validate_progress_props(component.props, component.id))

        # 4. Recursively validate children
        if component.children:
            for child in component.children:
                errors.extend(self.validate_component(child))

        return errors

    def validate_progress_props(
        self,
        props: dict[str, Any],
        component_id: str = "unknown",
    ) -> list[str]:
        """Validate progress-specific props."""
        errors: list[str] = []

        value = props.get("value")
        if value is None:
            errors.append(
                f"Progress component '{component_id}' is missing required prop 'value'."
            )
        elif not isinstance(value, (int, float, str)):
            errors.append(
                f"Progress component '{component_id}' prop 'value' must be a number or numeric string, got {type(value).__name__}."
            )
        else:
            try:
                numeric_value = float(str(value).strip().replace('%', ''))
            except ValueError:
                errors.append(
                    f"Progress component '{component_id}' prop 'value' must be numeric, got '{value}'."
                )
            else:
                if not (0 <= numeric_value <= 100):
                    errors.append(
                        f"Progress component '{component_id}' prop 'value' must be between 0 and 100. Got {numeric_value}."
                    )

        return errors

    def validate_chart_config(
        self,
        props: dict[str, Any],
        component_id: str = "unknown",
    ) -> list[str]:
        """Validate chart-specific properties.

        Checks:
          • ``chart_type`` key exists and its value is a supported ChartType
          • ``data`` key exists and is a non-empty list

        Args:
            props: The ``props`` dictionary of a chart UIComponent.
            component_id: Identifier of the component (for error messages).

        Returns:
            A list of human-readable error strings (empty if valid).
        """
        errors: list[str] = []

        # chart_type is required
        chart_type = props.get("chart_type")
        if chart_type is None:
            errors.append(
                f"Chart component '{component_id}' is missing required "
                f"prop 'chart_type'."
            )
        elif chart_type not in SUPPORTED_CHART_TYPES:
            errors.append(
                f"Chart component '{component_id}' has unsupported "
                f"chart_type '{chart_type}'. Supported: "
                f"{sorted(SUPPORTED_CHART_TYPES)}"
            )

        # data is required
        data = props.get("data")
        if data is None:
            errors.append(
                f"Chart component '{component_id}' is missing required "
                f"prop 'data'."
            )
        elif not isinstance(data, list):
            errors.append(
                f"Chart component '{component_id}' prop 'data' must be a "
                f"list, got {type(data).__name__}."
            )
        elif len(data) == 0:
            errors.append(
                f"Chart component '{component_id}' prop 'data' must not "
                f"be empty."
            )

        return errors
