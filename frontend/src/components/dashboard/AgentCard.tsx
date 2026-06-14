import { Bot, Briefcase, PenTool, Mail, Users } from 'lucide-react';
import type { Agent } from '../../types';
import AgentStatusBadge from '../agents/AgentStatusBadge';
import { timeAgo } from '../../lib/utils';

const typeConfig: Record<string, { icon: typeof Bot; badgeBg: string; badgeText: string }> = {
  sales: { icon: Briefcase, badgeBg: 'rgba(59,130,246,.1)', badgeText: '#2563eb' },
  marketing: { icon: PenTool, badgeBg: 'rgba(73,2,162,.1)', badgeText: '#4902A2' },
  support: { icon: Mail, badgeBg: 'rgba(22,163,74,.1)', badgeText: '#16a34a' },
  custom: { icon: Users, badgeBg: 'rgba(234,88,12,.1)', badgeText: '#ea580c' },
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
    <div
      style={{
        background: 'var(--gc-card)',
        border: '1px solid var(--gc-border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform .2s ease, box-shadow .2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ padding: 20 }}>
        {/* Top row: badge + status */}
        <div className="flex items-center justify-between mb-3">
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.8px',
            background: config.badgeBg,
            color: config.badgeText,
            padding: '4px 10px',
            borderRadius: 6,
          }}>
            {agent.type}
          </span>
          <AgentStatusBadge status={agent.status} />
        </div>

        {/* Agent name + icon */}
        <div className="flex items-center gap-3 mb-3">
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'var(--gc-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon style={{ width: 20, height: 20, color: 'var(--gc-primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)' }}>{agent.name}</h3>
            {agent.description && (
              <p style={{ fontSize: 12, color: 'var(--gc-muted)', marginTop: 2 }} className="line-clamp-1">
                {agent.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4" style={{
          background: 'var(--gc-soft)',
          borderRadius: 10,
          padding: '10px 12px',
        }}>
          <div className="text-center">
            <p style={{ fontSize: 10, color: 'var(--gc-muted)', marginBottom: 2 }}>Last Run</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
              {agent.last_execution_at ? timeAgo(agent.last_execution_at) : 'Never'}
            </p>
          </div>
          <div className="text-center">
            <p style={{ fontSize: 10, color: 'var(--gc-muted)', marginBottom: 2 }}>Success</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
              {agent.success_rate != null ? `${Math.round(agent.success_rate)}%` : '--'}
            </p>
          </div>
          <div className="text-center">
            <p style={{ fontSize: 10, color: 'var(--gc-muted)', marginBottom: 2 }}>Runs</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
              {agent.total_executions ?? 0}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(agent); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 11,
              border: '1px solid var(--gc-border)',
              background: 'var(--gc-surface)',
              color: 'var(--gc-text2)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gc-soft)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gc-surface)')}
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(agent); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 11,
              border: 'none',
              background: 'var(--gc-primary)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#5a16b8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#4902A2')}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
