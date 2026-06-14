import asyncio
import logging

from celery import shared_task

from app.engine.executor import WorkflowExecutor

logger = logging.getLogger(__name__)


@shared_task(name="execute_workflow")
def execute_workflow_task(execution_id: str, workflow_definition: dict) -> dict:
    """Celery task to execute a workflow.

    Celery tasks are synchronous, so we use asyncio.run() to drive the async
    executor.
    """
    try:
        result = asyncio.run(_execute(execution_id, workflow_definition))
        return {"status": "completed", "execution_id": execution_id}
    except Exception as exc:
        logger.exception("Workflow execution failed for %s", execution_id)
        # Try to mark execution as failed in the DB
        try:
            asyncio.run(_mark_failed(execution_id, str(exc)))
        except Exception:
            logger.exception("Could not mark execution %s as failed", execution_id)
        return {"status": "failed", "execution_id": execution_id, "error": str(exc)}


async def _execute(execution_id: str, workflow_definition: dict) -> dict:
    executor = WorkflowExecutor(execution_id, workflow_definition)
    return await executor.execute()


async def _mark_failed(execution_id: str, error_message: str) -> None:
    from datetime import datetime, timezone
    from sqlalchemy import select
    from app.core.database import async_session
    from app.models.execution import Execution

    async with async_session() as session:
        result = await session.execute(
            select(Execution).where(Execution.id == execution_id)
        )
        execution = result.scalar_one_or_none()
        if execution and execution.status != "failed":
            execution.status = "failed"
            execution.error_message = error_message
            execution.ended_at = datetime.now(timezone.utc)
            await session.commit()
