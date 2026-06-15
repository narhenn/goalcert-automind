import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PenTool, Pause, Play, Trash2, Clock, CheckCircle, Zap, Rocket, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAgent, useDeleteAgent } from '../hooks/useAgents';
import { useExecutions, useTriggerExecution } from '../hooks/useExecutions';
import AgentStatusBadge from '../components/agents/AgentStatusBadge';
import LiveExecutionPanel from '../components/executions/LiveExecutionPanel';
import { cn, formatDate, formatDuration, formatCost, timeAgo } from '../lib/utils';
import apiClient from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const execStatusConfig: Record<string, { bg: string; color: string; label: string; pulse?: boolean }> = {
  success: { bg: 'rgba(22,163,74,.12)', color: '#16a34a', label: 'Success' },
  failed: { bg: 'rgba(225,29,72,.12)', color: '#e11d48', label: 'Failed' },
  running: { bg: 'rgba(73,2,162,.1)', color: '#4902A2', label: 'Running', pulse: true },
  pending: { bg: 'rgba(131,123,151,.1)', color: '#837b97', label: 'Pending' },
  cancelled: { bg: 'rgba(131,123,151,.1)', color: '#837b97', label: 'Cancelled' },
};

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: agent, isLoading } = useAgent(id!);
  const deleteAgent = useDeleteAgent();
  const [polling, setPolling] = useState(false);
  const { data: executions, isLoading: loadingExecutions } = useExecutions(id!, polling);
  const triggerExecution = useTriggerExecution(id!);
  const [toggling, setToggling] = useState(false);
  const [runAlert, setRunAlert] = useState(false);
  const [expandedExecId, setExpandedExecId] = useState<string | null>(null);

  // Auto-poll when there are pending/running executions
  const hasActiveExec = (executions || []).some((e) => e.status === 'pending' || e.status === 'running');
  if (hasActiveExec && !polling) setPolling(true);
  if (!hasActiveExec && polling) setPolling(false);

  const handleDelete = async () => {
    if (!agent || !confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) return;
    try {
      await deleteAgent.mutateAsync(agent.id);
      navigate('/');
    } catch {
      // error handled by mutation
    }
  };

  const handleTogglePause = async () => {
    if (!agent) return;
    setToggling(true);
    try {
      const action = agent.status === 'active' ? 'pause' : 'resume';
      await apiClient.post(`/agents/${agent.id}/${action}`);
      queryClient.invalidateQueries({ queryKey: ['agents', agent.id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    } catch {
      // silent fail
    } finally {
      setToggling(false);
    }
  };

  const handleRunNow = async () => {
    try {
      await triggerExecution.mutateAsync();
      setPolling(true);
      setRunAlert(true);
      setTimeout(() => setRunAlert(false), 3000);
    } catch {
      // mutation error
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 rounded w-32" style={{ background: 'var(--gc-border)' }} />
        <div className="h-8 rounded w-64" style={{ background: 'var(--gc-border)' }} />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div className="h-4 rounded w-20 mb-2" style={{ background: 'var(--gc-border)' }} />
              <div className="h-8 rounded w-16" style={{ background: 'var(--gc-border)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 48, textAlign: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 6 }}>Agent not found</h2>
        <p style={{ fontSize: 13, color: 'var(--gc-muted)', marginBottom: 18 }}>This agent may have been deleted.</p>
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

  const recentExecutions = (executions || []).slice(0, 10);
  const hasRunningExec = recentExecutions.some((e) => e.status === 'running');

  return (
    <div>
      {/* Run started alert */}
      {runAlert && (
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 100,
          background: 'var(--gc-green)',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: 12,
          boxShadow: 'var(--shadow-lg)',
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <CheckCircle style={{ width: 16, height: 16 }} />
          Execution started!
        </div>
      )}

      {/* Back link */}
      <button
        onClick={() => navigate('/')}
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
        Back to Dashboard
      </button>

      {/* Purple gradient banner */}
      <div style={{
        background: 'var(--gc-grad)',
        borderRadius: 'var(--radius)',
        padding: '28px 32px',
        marginBottom: 22,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', background: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,.06) 0%, transparent 70%)' }} />
        <div className="flex items-center gap-3 mb-2" style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>{agent.name}</h1>
          <AgentStatusBadge status={agent.status} />
          {hasRunningExec && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: '#ffffff',
              background: 'rgba(255,255,255,.2)',
              padding: '3px 10px',
              borderRadius: 20,
            }} className="animate-pulse">
              <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
              Running
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', position: 'relative' }}>
          {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent
          {agent.description && ` - ${agent.description}`}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4" style={{ position: 'relative' }}>
          <button
            onClick={handleRunNow}
            disabled={triggerExecution.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ffffff',
              color: 'var(--gc-primary)',
              padding: '8px 16px',
              borderRadius: 11,
              fontSize: 12.5,
              fontWeight: 600,
              border: 'none',
              cursor: triggerExecution.isPending ? 'not-allowed' : 'pointer',
              opacity: triggerExecution.isPending ? 0.7 : 1,
            }}
          >
            {triggerExecution.isPending ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Rocket style={{ width: 14, height: 14 }} />}
            Run Now
          </button>
          <button
            onClick={() => navigate(`/agents/${agent.id}/builder`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,.18)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: 11,
              fontSize: 12.5,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,.3)',
              cursor: 'pointer',
            }}
          >
            <PenTool style={{ width: 14, height: 14 }} />
            Edit Workflow
          </button>
          <button
            onClick={handleTogglePause}
            disabled={toggling || agent.status === 'draft' || agent.status === 'error'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,.18)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: 11,
              fontSize: 12.5,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,.3)',
              cursor: (toggling || agent.status === 'draft' || agent.status === 'error') ? 'not-allowed' : 'pointer',
              opacity: (toggling || agent.status === 'draft' || agent.status === 'error') ? 0.5 : 1,
            }}
          >
            {agent.status === 'active' ? <><Pause style={{ width: 14, height: 14 }} />Pause</> : <><Play style={{ width: 14, height: 14 }} />Resume</>}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteAgent.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(225,29,72,.2)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: 11,
              fontSize: 12.5,
              fontWeight: 600,
              border: '1px solid rgba(225,29,72,.3)',
              cursor: deleteAgent.isPending ? 'not-allowed' : 'pointer',
              opacity: deleteAgent.isPending ? 0.5 : 1,
            }}
          >
            <Trash2 style={{ width: 14, height: 14 }} />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} />
            <span style={{ fontSize: 13, color: 'var(--gc-muted)' }}>Success Rate</span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
            {agent.success_rate != null ? `${Math.round(agent.success_rate)}%` : '--'}
          </p>
        </div>
        <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} />
            <span style={{ fontSize: 13, color: 'var(--gc-muted)' }}>Total Executions</span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
            {agent.total_executions ?? 0}
          </p>
        </div>
        <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} />
            <span style={{ fontSize: 13, color: 'var(--gc-muted)' }}>Last Run</span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
            {agent.last_execution_at ? timeAgo(agent.last_execution_at) : 'Never'}
          </p>
        </div>
      </div>

      {/* Latest Execution Panel - shows inline when there's an active/recent execution */}
      {recentExecutions.length > 0 && (
        <LiveExecutionPanel
          executionId={recentExecutions[0].id}
        />
      )}

      {/* Agent Info */}
      <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 22 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 14 }}>Agent Details</h3>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3" style={{ fontSize: 13 }}>
          <div>
            <dt style={{ color: 'var(--gc-muted)' }}>Created</dt>
            <dd style={{ color: 'var(--gc-text)', fontWeight: 500 }}>{formatDate(agent.created_at)}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--gc-muted)' }}>Last Updated</dt>
            <dd style={{ color: 'var(--gc-text)', fontWeight: 500 }}>{formatDate(agent.updated_at)}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--gc-muted)' }}>Schedule</dt>
            <dd style={{ color: 'var(--gc-text)', fontWeight: 500 }}>{agent.schedule_cron || 'Manual trigger only'}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--gc-muted)' }}>Timezone</dt>
            <dd style={{ color: 'var(--gc-text)', fontWeight: 500 }}>{agent.schedule_timezone}</dd>
          </div>
        </dl>
      </div>

      {/* Execution History */}
      <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 22 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 16 }}>Execution History</h3>
        {loadingExecutions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 style={{ width: 20, height: 20, color: 'var(--gc-muted)' }} className="animate-spin" />
          </div>
        ) : recentExecutions.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ fontSize: 13, color: 'var(--gc-muted)' }}>
              No executions yet. Click &apos;Run Now&apos; to test your workflow.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gc-border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--gc-muted)', width: 28 }}></th>
                  <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--gc-muted)' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--gc-muted)' }}>Triggered By</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--gc-muted)' }}>Started</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--gc-muted)' }}>Duration</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--gc-muted)' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {recentExecutions.map((exec) => {
                  const cfg = execStatusConfig[exec.status] || execStatusConfig.pending;
                  const isExpanded = expandedExecId === exec.id;
                  return (
                    <tr key={exec.id} style={{ borderBottom: '1px solid var(--gc-soft)' }}>
                      <td colSpan={6} style={{ padding: 0 }}>
                        {/* Clickable row */}
                        <div
                          onClick={() => setExpandedExecId(isExpanded ? null : exec.id)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '28px 1fr 1fr 1fr 1fr 1fr',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '12px 0',
                            transition: 'background .1s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(73,2,162,.02)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isExpanded
                              ? <ChevronDown style={{ width: 14, height: 14, color: 'var(--gc-muted)' }} />
                              : <ChevronRight style={{ width: 14, height: 14, color: 'var(--gc-muted)' }} />
                            }
                          </div>
                          <div>
                            <span
                              className={cn(cfg.pulse && 'animate-pulse')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 9px',
                                borderRadius: 6,
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '.5px',
                                background: cfg.bg,
                                color: cfg.color,
                              }}
                            >
                              {exec.status === 'running' && <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" />}
                              {cfg.label}
                            </span>
                          </div>
                          <div style={{ color: 'var(--gc-text2)', textTransform: 'capitalize' }}>{exec.triggered_by}</div>
                          <div style={{ color: 'var(--gc-text2)' }}>
                            {exec.started_at ? timeAgo(exec.started_at) : '--'}
                          </div>
                          <div style={{ color: 'var(--gc-text2)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                            {exec.duration_ms != null ? formatDuration(exec.duration_ms) : '--'}
                          </div>
                          <div style={{ color: 'var(--gc-text2)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, textAlign: 'right' }}>
                            {formatCost(exec.total_cost)}
                          </div>
                        </div>
                        {/* Expanded inline panel */}
                        {isExpanded && (
                          <div style={{ padding: '0 8px 16px 28px' }}>
                            <LiveExecutionPanel
                              executionId={exec.id}
                              onClose={() => setExpandedExecId(null)}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
