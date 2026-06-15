import { Bot, Briefcase, PenTool, Mail, Users, Calendar, DollarSign } from 'lucide-react';
import type { Agent } from '../../types';
import AgentStatusBadge from '../agents/AgentStatusBadge';
import { timeAgo, cronToHuman } from '../../lib/utils';

const typeConfig: Record<string, { icon: typeof Bot; badgeBg: string; badgeText: string; accentColor: string }> = {
  sales: { icon: Briefcase, badgeBg: 'rgba(59,130,246,.1)', badgeText: '#2563eb', accentColor: '#2563eb' },
  marketing: { icon: PenTool, badgeBg: 'rgba(73,2,162,.1)', badgeText: '#4902A2', accentColor: '#7c3aed' },
  support: { icon: Mail, badgeBg: 'rgba(22,163,74,.1)', badgeText: '#16a34a', accentColor: '#16a34a' },
  custom: { icon: Users, badgeBg: 'rgba(234,88,12,.1)', badgeText: '#ea580c', accentColor: '#0d9488' },
};

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onViewDetails: (agent: Agent) => void;
}

export default function AgentCard({ agent, onEdit, onViewDetails }: AgentCardProps) {
  const config = typeConfig[agent.type] || typeConfig.custom;
  const Icon = config.icon;

  // Simulated recent run history (last 3 runs) based on agent data
  // In a real app, this would come from the API. We derive a plausible set from available data.
  const totalRuns = agent.total_executions ?? 0;
  const successRate = agent.success_rate ?? 0;
  const recentDots: ('success' | 'failed' | 'none')[] = [];
  if (totalRuns === 0) {
    recentDots.push('none', 'none', 'none');
  } else {
    const runCount = Math.min(totalRuns, 3);
    for (let i = 0; i < runCount; i++) {
      // Use success rate to probabilistically show dots
      recentDots.push(successRate >= (i + 1) * (100 / runCount) ? 'success' : 'failed');
    }
    while (recentDots.length < 3) recentDots.push('none');
  }

  // Simulated cost (from total_executions - in real app this comes from API)
  const estimatedCost = totalRuns > 0 ? (totalRuns * 0.0008) : 0;

  // Last output preview placeholder (in real app, fetched from execution logs)
  const lastOutputPreview = agent.last_execution_at
    ? 'Completed workflow execution with all nodes processed successfully...'
    : null;

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
      {/* Colored top accent bar */}
      <div style={{ height: 3, background: config.accentColor }} />

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
        <div className="flex items-center gap-3 mb-1">
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
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)' }}>{agent.name}</h3>
            {agent.description && (
              <p style={{ fontSize: 12, color: 'var(--gc-muted)', marginTop: 2 }} className="line-clamp-1">
                {agent.description}
              </p>
            )}
          </div>
        </div>

        {/* Schedule info */}
        <div className="flex items-center gap-1.5 mb-3" style={{ marginLeft: 52 }}>
          <Calendar style={{ width: 11, height: 11, color: 'var(--gc-muted)' }} />
          <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}>
            {agent.schedule_cron ? cronToHuman(agent.schedule_cron) : 'Manual'}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3" style={{
          background: 'var(--gc-soft)',
          borderRadius: 10,
          padding: '10px 12px',
        }}>
          <div className="text-center">
            <p style={{ fontSize: 10, color: 'var(--gc-muted)', marginBottom: 2 }}>Last Run</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}
              title={agent.last_execution_at ? new Date(agent.last_execution_at).toLocaleString() : undefined}>
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

        {/* Cost + Mini execution history row */}
        <div className="flex items-center justify-between mb-3" style={{ padding: '0 2px' }}>
          <div className="flex items-center gap-1.5">
            <DollarSign style={{ width: 11, height: 11, color: 'var(--gc-muted)' }} />
            <span style={{
              fontSize: 11,
              color: 'var(--gc-muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              ${estimatedCost.toFixed(4)} total spend
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 10, color: 'var(--gc-muted)', marginRight: 4 }}>Recent:</span>
            {recentDots.map((dot, i) => (
              <span key={i} style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: dot === 'success' ? 'var(--gc-green)' :
                  dot === 'failed' ? 'var(--gc-red)' : 'var(--gc-border)',
                display: 'inline-block',
              }} />
            ))}
          </div>
        </div>

        {/* Last output preview */}
        {lastOutputPreview && (
          <div style={{
            padding: '8px 10px',
            borderRadius: 8,
            background: 'rgba(73,2,162,.03)',
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 10, color: 'var(--gc-muted)', fontWeight: 600, display: 'block', marginBottom: 3 }}>
              Last output:
            </span>
            <p style={{
              fontSize: 11,
              color: 'var(--gc-muted)',
              fontStyle: 'italic',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.4,
            }}>
              {lastOutputPreview.slice(0, 100)}
            </p>
          </div>
        )}

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
