import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PenTool, Pause, Play, Trash2, Clock, CheckCircle, Zap, Rocket, Loader2, Eye } from 'lucide-react';
import { useAgent, useDeleteAgent } from '../hooks/useAgents';
import { useExecutions, useTriggerExecution } from '../hooks/useExecutions';
import AgentStatusBadge from '../components/agents/AgentStatusBadge';
import { cn, formatDate, formatDuration, formatCost, timeAgo } from '../lib/utils';
import apiClient from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const execStatusConfig: Record<string, { bg: string; text: string; label: string; pulse?: boolean }> = {
  success: { bg: 'bg-green-100', text: 'text-green-700', label: 'Success' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
  running: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Running', pulse: true },
  pending: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Pending' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Cancelled' },
};

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: agent, isLoading } = useAgent(id!);
  const deleteAgent = useDeleteAgent();
  const { data: executions, isLoading: loadingExecutions } = useExecutions(id!);
  const triggerExecution = useTriggerExecution(id!);
  const [toggling, setToggling] = useState(false);
  const [runAlert, setRunAlert] = useState(false);

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
      // silent fail, will be visible by status not changing
    } finally {
      setToggling(false);
    }
  };

  const handleRunNow = async () => {
    try {
      await triggerExecution.mutateAsync();
      setRunAlert(true);
      setTimeout(() => setRunAlert(false), 3000);
    } catch {
      // mutation error
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-32" />
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-5">
                <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
                <div className="h-8 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Agent not found</h2>
          <p className="text-sm text-slate-500 mb-4">This agent may have been deleted.</p>
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

  const recentExecutions = (executions || []).slice(0, 10);
  const hasRunningExec = recentExecutions.some((e) => e.status === 'running');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Run started alert */}
      {runAlert && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" />
          Execution started!
        </div>
      )}

      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{agent.name}</h1>
            <AgentStatusBadge status={agent.status} />
            {hasRunningExec && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Running
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 capitalize">{agent.type} Agent</p>
          {agent.description && (
            <p className="text-sm text-slate-600 mt-1">{agent.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleRunNow}
            disabled={triggerExecution.isPending}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {triggerExecution.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            Run Now
          </button>
          <button
            onClick={() => navigate(`/agents/${agent.id}/builder`)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <PenTool className="w-4 h-4" />
            Edit Workflow
          </button>
          <button
            onClick={handleTogglePause}
            disabled={toggling || agent.status === 'draft' || agent.status === 'error'}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {agent.status === 'active' ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteAgent.isPending}
            className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            Success Rate
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {agent.success_rate != null ? `${Math.round(agent.success_rate)}%` : '--'}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Zap className="w-4 h-4" />
            Total Executions
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {agent.total_executions ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Clock className="w-4 h-4" />
            Last Run
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {agent.last_execution_at ? timeAgo(agent.last_execution_at) : 'Never'}
          </p>
        </div>
      </div>

      {/* Agent Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Agent Details</h3>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Created</dt>
            <dd className="text-slate-900 font-medium">{formatDate(agent.created_at)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Last Updated</dt>
            <dd className="text-slate-900 font-medium">{formatDate(agent.updated_at)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Schedule</dt>
            <dd className="text-slate-900 font-medium">
              {agent.schedule_cron || 'Manual trigger only'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Timezone</dt>
            <dd className="text-slate-900 font-medium">{agent.schedule_timezone}</dd>
          </div>
        </dl>
      </div>

      {/* Execution History */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Execution History</h3>
        {loadingExecutions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : recentExecutions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">
              No executions yet. Click &apos;Run Now&apos; to test your workflow.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Triggered By</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Started</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Cost</th>
                  <th className="text-right py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExecutions.map((exec) => {
                  const cfg = execStatusConfig[exec.status] || execStatusConfig.pending;
                  return (
                    <tr key={exec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                          cfg.bg, cfg.text,
                          cfg.pulse && 'animate-pulse',
                        )}>
                          {exec.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 capitalize">{exec.triggered_by}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {exec.started_at ? timeAgo(exec.started_at) : '--'}
                      </td>
                      <td className="py-3 pr-4 text-slate-600 tabular-nums">
                        {exec.duration_ms != null ? formatDuration(exec.duration_ms) : '--'}
                      </td>
                      <td className="py-3 pr-4 text-slate-600 tabular-nums">
                        {formatCost(exec.total_cost)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/executions/${exec.id}`)}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
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
