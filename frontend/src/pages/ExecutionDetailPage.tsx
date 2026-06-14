import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, User, CalendarClock, Loader2 } from 'lucide-react';
import { useExecution, useExecutionLogs } from '../hooks/useExecutions';
import ExecutionTimeline from '../components/executions/ExecutionTimeline';
import { cn, formatDate, formatDuration, formatCost } from '../lib/utils';

const statusBadge: Record<string, { bg: string; text: string; label: string; pulse?: boolean }> = {
  success: { bg: 'bg-green-100', text: 'text-green-700', label: 'Success' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
  running: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Running', pulse: true },
  pending: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Pending', pulse: true },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Cancelled' },
};

const triggeredByLabels: Record<string, string> = {
  manual: 'Manual',
  schedule: 'Schedule',
  webhook: 'Webhook',
};

export default function ExecutionDetailPage() {
  const { executionId } = useParams<{ executionId: string }>();
  const navigate = useNavigate();

  const { data: execution, isLoading: loadingExec } = useExecution(executionId!, {
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'running' || status === 'pending' ? 3000 : false;
    },
  });

  const { data: logs, isLoading: loadingLogs } = useExecutionLogs(executionId!, {
    refetchInterval: (query) => {
      // Poll logs when execution is still active
      return execution?.status === 'running' || execution?.status === 'pending' ? 3000 : false;
    },
  });

  if (loadingExec) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-32" />
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="h-4 bg-slate-200 rounded w-16 mb-2" />
                <div className="h-6 bg-slate-200 rounded w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Execution not found</h2>
          <p className="text-sm text-slate-500 mb-4">This execution may have been deleted.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const badge = statusBadge[execution.status] || statusBadge.pending;
  const truncatedId = execution.id.slice(0, 8);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate(`/agents/${execution.agent_id}`)}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agent
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Execution <span className="text-slate-400 font-mono">#{truncatedId}</span>
        </h1>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            badge.bg,
            badge.text,
            badge.pulse && 'animate-pulse',
          )}
        >
          {(execution.status === 'running' || execution.status === 'pending') && (
            <Loader2 className="w-3 h-3 animate-spin" />
          )}
          {badge.label}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <div className={cn('w-2 h-2 rounded-full', execution.status === 'success' ? 'bg-green-500' : execution.status === 'failed' ? 'bg-red-500' : 'bg-blue-500')} />
            Status
          </div>
          <p className="text-sm font-semibold text-slate-900 capitalize">{execution.status}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Clock className="w-3 h-3" />
            Duration
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {execution.duration_ms != null ? formatDuration(execution.duration_ms) : '--'}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <DollarSign className="w-3 h-3" />
            Total Cost
          </div>
          <p className="text-sm font-semibold text-slate-900">{formatCost(execution.total_cost)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <User className="w-3 h-3" />
            Triggered By
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {triggeredByLabels[execution.triggered_by] || execution.triggered_by}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <CalendarClock className="w-3 h-3" />
            Started At
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {execution.started_at ? formatDate(execution.started_at) : '--'}
          </p>
        </div>
      </div>

      {/* Error message */}
      {execution.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-red-700 mb-1">Execution Error</p>
          <p className="text-sm text-red-600 font-mono whitespace-pre-wrap">{execution.error_message}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Node Execution Timeline</h3>
        {loadingLogs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <ExecutionTimeline logs={logs || []} />
        )}
      </div>
    </div>
  );
}
