import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PenTool, Pause, Play, Trash2, Clock, CheckCircle, Zap } from 'lucide-react';
import { useAgent, useDeleteAgent } from '../hooks/useAgents';
import AgentStatusBadge from '../components/agents/AgentStatusBadge';
import { formatDate, timeAgo } from '../lib/utils';
import apiClient from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: agent, isLoading } = useAgent(id!);
  const deleteAgent = useDeleteAgent();
  const [toggling, setToggling] = useState(false);

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
      const newStatus = agent.status === 'active' ? 'paused' : 'active';
      await apiClient.patch(`/agents/${agent.id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['agents', agent.id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    } catch {
      // silent fail, will be visible by status not changing
    } finally {
      setToggling(false);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
          <p className="text-sm text-slate-500 capitalize">{agent.type} Agent</p>
          {agent.description && (
            <p className="text-sm text-slate-600 mt-1">{agent.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
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

      {/* Execution History Placeholder */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Execution History</h3>
        <div className="text-center py-8">
          <p className="text-sm text-slate-400">
            Execution history will appear here once the agent runs.
          </p>
        </div>
      </div>
    </div>
  );
}
