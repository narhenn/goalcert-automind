import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, User, CalendarClock, Loader2 } from 'lucide-react';
import { useExecution, useExecutionLogs } from '../hooks/useExecutions';
import ExecutionTimeline from '../components/executions/ExecutionTimeline';
import { cn, formatDate, formatDuration, formatCost } from '../lib/utils';

const statusBadge: Record<string, { bg: string; color: string; label: string; pulse?: boolean }> = {
  success: { bg: 'rgba(22,163,74,.12)', color: '#16a34a', label: 'Success' },
  failed: { bg: 'rgba(225,29,72,.12)', color: '#e11d48', label: 'Failed' },
  running: { bg: 'rgba(73,2,162,.1)', color: '#4902A2', label: 'Running', pulse: true },
  pending: { bg: 'rgba(131,123,151,.1)', color: '#837b97', label: 'Pending', pulse: true },
  cancelled: { bg: 'rgba(131,123,151,.1)', color: '#837b97', label: 'Cancelled' },
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
    refetchInterval: () => {
      return execution?.status === 'running' || execution?.status === 'pending' ? 3000 : false;
    },
  });

  if (loadingExec) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 rounded w-32" style={{ background: 'var(--gc-border)' }} />
        <div className="h-8 rounded w-64" style={{ background: 'var(--gc-border)' }} />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 16 }}>
              <div className="h-4 rounded w-16 mb-2" style={{ background: 'var(--gc-border)' }} />
              <div className="h-6 rounded w-12" style={{ background: 'var(--gc-border)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 48, textAlign: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 6 }}>Execution not found</h2>
        <p style={{ fontSize: 13, color: 'var(--gc-muted)', marginBottom: 18 }}>This execution may have been deleted.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'var(--gc-primary)',
            color: '#ffffff',
            padding: '9px 18px',
            borderRadius: 11,
            fontSize: 12.5,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const badge = statusBadge[execution.status] || statusBadge.pending;
  const truncatedId = execution.id.slice(0, 8);

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => navigate(`/agents/${execution.agent_id}`)}
        className="flex items-center gap-1"
        style={{
          fontSize: 13,
          color: 'var(--gc-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 20,
          padding: 0,
        }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Back to Agent
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gc-text)' }}>
          Execution <span style={{ color: 'var(--gc-muted)', fontFamily: "'JetBrains Mono', monospace" }}>#{truncatedId}</span>
        </h1>
        <span
          className={cn(badge.pulse && 'animate-pulse')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 11px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.8px',
            background: badge.bg,
            color: badge.color,
          }}
        >
          {(execution.status === 'running' || execution.status === 'pending') && (
            <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" />
          )}
          {badge.label}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="pulse-dot" style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: execution.status === 'success' ? 'var(--gc-green)' : execution.status === 'failed' ? 'var(--gc-red)' : 'var(--gc-primary)',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}>Status</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gc-text)', textTransform: 'capitalize' }}>{execution.status}</p>
        </div>
        <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock style={{ width: 12, height: 12, color: 'var(--gc-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}>Duration</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
            {execution.duration_ms != null ? formatDuration(execution.duration_ms) : '--'}
          </p>
        </div>
        <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign style={{ width: 12, height: 12, color: 'var(--gc-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}>Total Cost</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
            {formatCost(execution.total_cost)}
          </p>
        </div>
        <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div className="flex items-center gap-1.5 mb-1">
            <User style={{ width: 12, height: 12, color: 'var(--gc-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}>Triggered By</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gc-text)' }}>
            {triggeredByLabels[execution.triggered_by] || execution.triggered_by}
          </p>
        </div>
        <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarClock style={{ width: 12, height: 12, color: 'var(--gc-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}>Started At</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gc-text)' }}>
            {execution.started_at ? formatDate(execution.started_at) : '--'}
          </p>
        </div>
      </div>

      {/* Error message */}
      {execution.error_message && (
        <div style={{
          background: 'rgba(225,29,72,.06)',
          border: '1px solid rgba(225,29,72,.15)',
          borderRadius: 'var(--radius)',
          padding: 18,
          marginBottom: 22,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gc-red)', marginBottom: 4 }}>Execution Error</p>
          <p style={{ fontSize: 12, color: '#b91c1c', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{execution.error_message}</p>
        </div>
      )}

      {/* Timeline */}
      <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 22 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 16 }}>Node Execution Timeline</h3>
        {loadingLogs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 style={{ width: 20, height: 20, color: 'var(--gc-muted)' }} className="animate-spin" />
          </div>
        ) : (
          <ExecutionTimeline logs={logs || []} />
        )}
      </div>
    </div>
  );
}
