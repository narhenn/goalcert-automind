import json
import logging
from typing import Any

import anthropic

from app.core.config import settings
from app.engine.nodes.base import BaseNodeExecutor
from app.engine.variables import interpolate

logger = logging.getLogger(__name__)

# Cost per million tokens  (input, output)
_COST_TABLE: dict[str, tuple[float, float]] = {
    "claude-sonnet-4-20250514": (3.0, 15.0),
    "claude-haiku-4-5-20251001": (0.80, 4.0),
}
_DEFAULT_COST = (3.0, 15.0)

_MOCK_API_KEYS = {"", "sk-ant-your-key-here"}


class AIActionNodeExecutor(BaseNodeExecutor):
    async def execute(self, config: dict, variables: dict, **kwargs) -> dict:
        prompt_template = config.get("prompt", "")
        prompt = interpolate(prompt_template, variables)
        model = config.get("model", "claude-sonnet-4-20250514")
        max_tokens = config.get("max_tokens", 1024)
        temperature = config.get("temperature", 0.7)
        system_prompt = config.get("system_prompt")
        output_variable = config.get("output_variable")

        if system_prompt:
            system_prompt = interpolate(system_prompt, variables)

        # Mock mode when no real API key is configured
        if settings.ANTHROPIC_API_KEY in _MOCK_API_KEYS:
            return self._mock_response(prompt, model, output_variable)

        try:
            return await self._call_api(
                prompt=prompt,
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system_prompt=system_prompt,
                output_variable=output_variable,
            )
        except anthropic.APIError as exc:
            logger.exception("Anthropic API error")
            return self._error_response(str(exc), model)
        except Exception as exc:
            logger.exception("Unexpected error during AI action")
            return self._error_response(str(exc), model)

    async def _call_api(
        self,
        *,
        prompt: str,
        model: str,
        max_tokens: int,
        temperature: float,
        system_prompt: str | None,
        output_variable: str | None,
    ) -> dict:
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        kwargs: dict[str, Any] = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            kwargs["system"] = system_prompt

        response = await client.messages.create(**kwargs)

        response_text = ""
        for block in response.content:
            if block.type == "text":
                response_text += block.text

        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        cost = self._calculate_cost(model, input_tokens, output_tokens)

        # Try to parse response as JSON
        output_vars = self._parse_output(response_text)

        if output_variable:
            output_vars = {output_variable: output_vars}

        return {
            "output_variables": output_vars,
            "llm_usage": {
                "model": model,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost": cost,
            },
        }

    @staticmethod
    def _parse_output(text: str) -> dict | str:
        """Try to parse the response as JSON, fall back to plain text."""
        stripped = text.strip()
        # Handle ```json ... ``` fenced blocks
        if stripped.startswith("```"):
            lines = stripped.split("\n")
            # Drop first and last lines (fences)
            inner = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
            try:
                return json.loads(inner)
            except (json.JSONDecodeError, ValueError):
                pass

        try:
            parsed = json.loads(stripped)
            if isinstance(parsed, dict):
                return parsed
            return {"output": parsed}
        except (json.JSONDecodeError, ValueError):
            return {"output": text}

    @staticmethod
    def _calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
        input_rate, output_rate = _COST_TABLE.get(model, _DEFAULT_COST)
        return round(
            (input_tokens * input_rate / 1_000_000)
            + (output_tokens * output_rate / 1_000_000),
            6,
        )

    @staticmethod
    def _mock_response(prompt: str, model: str, output_variable: str | None) -> dict:
        mock_output: dict = {
            "output": f"[MOCK] AI response for prompt: {prompt[:100]}...",
            "mock": True,
        }
        if output_variable:
            mock_output = {output_variable: mock_output}

        return {
            "output_variables": mock_output,
            "llm_usage": {
                "model": model,
                "input_tokens": 0,
                "output_tokens": 0,
                "cost": 0.0,
            },
        }

    @staticmethod
    def _error_response(error_msg: str, model: str) -> dict:
        return {
            "output_variables": {"error": error_msg},
            "llm_usage": {
                "model": model,
                "input_tokens": 0,
                "output_tokens": 0,
                "cost": 0.0,
            },
            "error": error_msg,
        }
