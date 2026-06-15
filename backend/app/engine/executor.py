"""Main workflow executor - the brain of the system.

Runs inside a Celery worker (via asyncio.run) and manages its own DB sessions.
"""

import logging
import time
import uuid
from collections import deque
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select

from app.core.database import async_session
from app.engine.graph import get_next_nodes, parse_workflow
from app.engine.nodes.ai_action import AIActionNodeExecutor
from app.engine.nodes.decision import DecisionNodeExecutor
from app.engine.nodes.escalation import EscalationNodeExecutor
from app.engine.nodes.integration import IntegrationNodeExecutor
from app.engine.nodes.trigger import TriggerNodeExecutor
from app.engine.nodes.web_search import WebSearchNodeExecutor
from app.models.execution import Execution, ExecutionNodeLog

logger = logging.getLogger(__name__)


class WorkflowExecutor:
    def __init__(
        self,
        execution_id: str,
        workflow_definition: dict,
        variables: dict | None = None,
    ):
        self.execution_id = execution_id
        self.definition = workflow_definition
        self.variables: dict = variables or {}
        self.total_cost: float = 0.0
        self.node_executors = {
            "trigger": TriggerNodeExecutor(),
            "ai_action": AIActionNodeExecutor(),
            "integration": IntegrationNodeExecutor(),
            "decision": DecisionNodeExecutor(),
            "escalation": EscalationNodeExecutor(),
            "web_search": WebSearchNodeExecutor(),
        }

    async def execute(self) -> dict:
        """Execute the full workflow, updating the DB as we go."""
        exec_start = time.monotonic()
        started_at = datetime.now(timezone.utc)

        # Mark execution as running
        async with async_session() as session:
            execution = await self._get_execution(session)
            execution.status = "running"
            execution.started_at = started_at
            await session.commit()

        nodes, edges = parse_workflow(self.definition)
        if not nodes:
            await self._finish_execution("success", exec_start, started_at)
            return self.variables

        node_map = {n["id"]: n for n in nodes}

        # Find start node: first node with no incoming edges, preferring trigger type
        incoming = {e["target"] for e in edges}
        root_candidates = [n for n in nodes if n["id"] not in incoming]
        if not root_candidates:
            root_candidates = nodes[:1]

        # Prefer trigger node if present
        start_nodes = [n for n in root_candidates if n.get("type") == "trigger"]
        if not start_nodes:
            start_nodes = root_candidates[:1]

        # BFS traversal following edges, respecting decision branches
        queue: deque[str] = deque(n["id"] for n in start_nodes)
        visited: set[str] = set()
        error_occurred = False
        error_message = ""

        while queue and not error_occurred:
            node_id = queue.popleft()
            if node_id in visited:
                continue
            visited.add(node_id)

            node = node_map.get(node_id)
            if node is None:
                logger.warning("Node %s not found in workflow definition", node_id)
                continue

            node_type = node.get("type", "unknown")
            node_data = node.get("data", {})
            node_label = node_data.get("label", node.get("label", ""))
            node_config = node_data.get("config", node_data)

            # Execute the node
            result, node_error = await self._execute_node(
                node_id=node_id,
                node_type=node_type,
                node_label=node_label,
                config=node_config,
            )

            if node_error:
                error_occurred = True
                error_message = node_error
                break

            # Determine next nodes
            branch = None
            if node_type == "decision" and result:
                branch = result.get("branch")

            next_ids = get_next_nodes(node_id, edges, branch=branch)
            for nid in next_ids:
                if nid not in visited:
                    queue.append(nid)

        final_status = "failed" if error_occurred else "success"
        await self._finish_execution(
            status=final_status,
            exec_start=exec_start,
            started_at=started_at,
            error_message=error_message if error_occurred else None,
        )
        return self.variables

    async def _execute_node(
        self,
        node_id: str,
        node_type: str,
        node_label: str,
        config: dict,
    ) -> tuple[dict | None, str | None]:
        """Execute a single node. Returns (result, error_message)."""
        executor = self.node_executors.get(node_type)
        if executor is None:
            logger.warning("No executor for node type %s, skipping", node_type)
            await self._log_node(
                node_id=node_id,
                node_type=node_type,
                node_label=node_label,
                status="skipped",
                input_data=config,
                output_data={"skipped": True, "reason": f"Unknown node type: {node_type}"},
            )
            return None, None

        node_start = time.monotonic()
        node_started_at = datetime.now(timezone.utc)

        # Create node log (status=running)
        log_id = await self._create_node_log(
            node_id=node_id,
            node_type=node_type,
            node_label=node_label,
            started_at=node_started_at,
            input_data=config,
        )

        try:
            result = await executor.execute(
                config=config,
                variables=self.variables,
                triggered_by=self.variables.get("triggered_by", "manual"),
            )
        except Exception as exc:
            logger.exception("Node %s (%s) failed", node_id, node_type)
            duration_ms = int((time.monotonic() - node_start) * 1000)
            await self._update_node_log(
                log_id=log_id,
                status="failed",
                ended_at=datetime.now(timezone.utc),
                duration_ms=duration_ms,
                output_data={"error": str(exc)},
                error_message=str(exc),
            )
            return None, f"Node {node_label or node_id} ({node_type}) failed: {exc}"

        duration_ms = int((time.monotonic() - node_start) * 1000)

        # Extract and merge output variables
        llm_usage = None
        output_data = result
        node_error = result.get("error") if isinstance(result, dict) else None

        if node_type in ("ai_action", "web_search"):
            output_vars = result.get("output_variables", {})
            llm_usage = result.get("llm_usage")
            if llm_usage:
                self.total_cost += llm_usage.get("cost", 0.0)
            # Merge output into workflow variables
            if isinstance(output_vars, dict):
                self.variables.update(output_vars)
            else:
                self.variables["output"] = output_vars
        elif node_type == "decision":
            self.variables["branch"] = result.get("branch")
            self.variables["condition_result"] = result.get("condition_result")
        else:
            # trigger, integration, escalation: merge all result keys
            if isinstance(result, dict):
                self.variables.update(result)

        status = "failed" if node_error else "success"
        await self._update_node_log(
            log_id=log_id,
            status=status,
            ended_at=datetime.now(timezone.utc),
            duration_ms=duration_ms,
            output_data=output_data,
            llm_usage=llm_usage,
            error_message=node_error,
        )

        if node_error:
            return result, f"Node {node_label or node_id} ({node_type}) error: {node_error}"
        return result, None

    # -- DB helpers (each opens its own session) --

    async def _get_execution(self, session) -> Execution:
        result = await session.execute(
            select(Execution).where(Execution.id == self.execution_id)
        )
        execution = result.scalar_one()
        return execution

    async def _create_node_log(
        self,
        node_id: str,
        node_type: str,
        node_label: str,
        started_at: datetime,
        input_data: dict,
    ) -> uuid.UUID:
        log_id = uuid.uuid4()
        async with async_session() as session:
            node_log = ExecutionNodeLog(
                id=log_id,
                execution_id=uuid.UUID(self.execution_id),
                node_id=node_id,
                node_type=node_type,
                node_label=node_label,
                status="running",
                started_at=started_at,
                input_data=input_data,
                output_data={},
            )
            session.add(node_log)
            await session.commit()
        return log_id

    async def _update_node_log(
        self,
        log_id: uuid.UUID,
        status: str,
        ended_at: datetime,
        duration_ms: int,
        output_data: dict,
        error_message: str | None = None,
        llm_usage: dict | None = None,
    ) -> None:
        async with async_session() as session:
            result = await session.execute(
                select(ExecutionNodeLog).where(ExecutionNodeLog.id == log_id)
            )
            node_log = result.scalar_one()
            node_log.status = status
            node_log.ended_at = ended_at
            node_log.duration_ms = duration_ms
            node_log.output_data = output_data
            node_log.error_message = error_message
            node_log.llm_usage = llm_usage
            await session.commit()

    async def _log_node(
        self,
        node_id: str,
        node_type: str,
        node_label: str,
        status: str,
        input_data: dict,
        output_data: dict,
    ) -> None:
        async with async_session() as session:
            node_log = ExecutionNodeLog(
                id=uuid.uuid4(),
                execution_id=uuid.UUID(self.execution_id),
                node_id=node_id,
                node_type=node_type,
                node_label=node_label,
                status=status,
                started_at=datetime.now(timezone.utc),
                ended_at=datetime.now(timezone.utc),
                duration_ms=0,
                input_data=input_data,
                output_data=output_data,
            )
            session.add(node_log)
            await session.commit()

    async def _finish_execution(
        self,
        status: str,
        exec_start: float,
        started_at: datetime,
        error_message: str | None = None,
    ) -> None:
        ended_at = datetime.now(timezone.utc)
        duration_ms = int((time.monotonic() - exec_start) * 1000)

        async with async_session() as session:
            result = await session.execute(
                select(Execution).where(Execution.id == self.execution_id)
            )
            execution = result.scalar_one()
            execution.status = status
            execution.started_at = started_at
            execution.ended_at = ended_at
            execution.duration_ms = duration_ms
            execution.total_cost = Decimal(str(round(self.total_cost, 6)))
            execution.error_message = error_message
            execution.variables = self.variables

            # Update agent.last_execution_at
            from app.models.agent import Agent

            agent_result = await session.execute(
                select(Agent).where(Agent.id == execution.agent_id)
            )
            agent = agent_result.scalar_one_or_none()
            if agent:
                agent.last_execution_at = ended_at

            await session.commit()
