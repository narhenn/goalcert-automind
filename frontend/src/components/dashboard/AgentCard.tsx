import { Users, PenTool, Mail, Briefcase } from 'lucide-react';
import type { Agent } from '../../types';
import AgentStatusBadge from '../agents/AgentStatusBadge';
import { timeAgo } from '../../lib/utils';

const typeConfig: Record<string, { icon: typeof Users; gradient: string }> = {
  sales: { icon: Briefcase, gradient: 'from-blue-500 to-cyan-500' },
  marketing: { icon: PenTool, gradient: 'from-purple-500 to-pink-500' },
  support: { icon: Mail, gradient: 'from-green-500 to-emerald-500' },
  custom: { icon: Users, gradient: 'from-orange-500 to-amber-500' },
};

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onViewDetails: (agent: Agent) => void;
}

export default function AgentCard({ agent, onEdit, onViewDetails }: AgentCardProps) {
  const config = typeConfig[agent.type] || typeConfig.custom;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with icon */}
      <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{agent.name}</h3>
              <p className="text-xs text-slate-500 capitalize">{agent.type}</p>
            </div>
          </div>
          <AgentStatusBadge status={agent.status} />
        </div>

        {agent.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{agent.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div>
            <p className="text-xs text-slate-400">Last Run</p>
            <p className="text-xs font-medium text-slate-700">
              {agent.last_execution_at ? timeAgo(agent.last_execution_at) : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Success Rate</p>
            <p className="text-xs font-medium text-slate-700">
              {agent.success_rate != null ? `${Math.round(agent.success_rate)}%` : '--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Executions</p>
            <p className="text-xs font-medium text-slate-700">
              {agent.total_executions ?? 0}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(agent)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onViewDetails(agent)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
