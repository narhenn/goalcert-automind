import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bot } from 'lucide-react';
import { useAgents, useDashboardStats, useDashboardActivity } from '../hooks/useAgents';
import StatsCards from '../components/dashboard/StatsCards';
import AgentCard from '../components/dashboard/AgentCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import CreateAgentModal from '../components/agents/CreateAgentModal';
import type { Agent } from '../types';

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const { data: agents, isLoading: agentsLoading } = useAgents();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useDashboardActivity();

  const handleEdit = (agent: Agent) => {
    navigate(`/agents/${agent.id}/builder`);
  };

  const handleViewDetails = (agent: Agent) => {
    navigate(`/agents/${agent.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Agents</h1>
          <p className="text-sm text-slate-500 mt-1">
            {agents ? `${agents.length} agent${agents.length !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <StatsCards stats={stats} isLoading={statsLoading} />
      </div>

      {/* Agent Grid */}
      {agentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse">
              <div className="h-2 bg-slate-200 rounded mb-4" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                <div className="space-y-1">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                  <div className="h-3 bg-slate-200 rounded w-16" />
                </div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-full mb-4" />
              <div className="grid grid-cols-3 gap-3 mb-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-8 bg-slate-200 rounded" />
                ))}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-slate-200 rounded-lg" />
                <div className="flex-1 h-8 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={handleEdit}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No agents yet</h3>
          <p className="text-sm text-slate-500 mb-4">
            Create your first AI agent to start automating tasks.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      )}

      {/* Activity Feed */}
      <ActivityFeed activities={activities} isLoading={activitiesLoading} />

      {/* Create Modal */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
