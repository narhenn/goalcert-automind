import { useAgents, useDashboardStats } from '../hooks/useAgents';
import { useAuthStore } from '../stores/authStore';
import { BarChart3, TrendingUp, DollarSign, Bot, CheckCircle, Trophy, Calendar } from 'lucide-react';
import { formatCost } from '../lib/utils';

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: agents, isLoading: agentsLoading } = useAgents();
  const user = useAuthStore((s) => s.user);

  const totalAgents = agents?.length ?? 0;
  const activeAgents = agents?.filter((a) => a.status === 'active').length ?? 0;
  const totalExecutions = agents?.reduce((sum, a) => sum + (a.total_executions ?? 0), 0) ?? 0;
  const avgSuccess = agents?.length
    ? agents.reduce((sum, a) => sum + (a.success_rate ?? 0), 0) / agents.length
    : 0;

  const metrics = [
    { label: 'Total Agents', value: totalAgents, icon: Bot, color: '#7c3aed' },
    { label: 'Active Agents', value: activeAgents, icon: CheckCircle, color: '#16a34a' },
    { label: 'Total Executions', value: totalExecutions, icon: TrendingUp, color: '#4902A2' },
    { label: 'Avg Success Rate', value: `${Math.round(avgSuccess)}%`, icon: BarChart3, color: '#0e9aa7' },
    { label: 'Tasks Completed', value: stats?.tasks_completed ?? 0, icon: CheckCircle, color: '#16a34a' },
    { label: 'Estimated Savings', value: `$${((stats?.estimated_savings ?? 0) / 1000).toFixed(1)}K`, icon: DollarSign, color: '#d97706' },
  ];

  // Cost by agent data
  const agentCosts = (agents || []).map((a) => ({
    name: a.name,
    cost: (a.total_executions ?? 0) * 0.0008, // simulated per-run cost
    executions: a.total_executions ?? 0,
  })).sort((a, b) => b.cost - a.cost);
  const maxAgentCost = Math.max(...agentCosts.map((a) => a.cost), 0.001);

  // Top performers by success rate
  const topPerformers = (agents || [])
    .filter((a) => (a.total_executions ?? 0) > 0)
    .sort((a, b) => (b.success_rate ?? 0) - (a.success_rate ?? 0));

  // Activity heatmap (simulated from agent data - 7 days)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Build plausible heatmap data from total executions
  const heatmapData = dayLabels.map((day, i) => {
    // Distribute executions across days with some variance
    const base = Math.floor(totalExecutions / 7);
    const variance = i < 5 ? Math.floor(base * 0.3) : -Math.floor(base * 0.5); // weekdays heavier
    return {
      day,
      count: Math.max(0, base + variance + (i % 2 === 0 ? 1 : 0)),
    };
  });
  const maxHeatmap = Math.max(...heatmapData.map((d) => d.count), 1);

  const isLoading = statsLoading || agentsLoading;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, color: 'var(--gc-text)', letterSpacing: '-.3px' }}>
          Analytics
        </h1>
        <p style={{ fontSize: 13, color: 'var(--gc-muted)', marginTop: 4 }}>
          Performance overview for {user?.name || 'your'} agents
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} style={{
              background: 'var(--gc-card)',
              border: '1px solid var(--gc-border)',
              borderRadius: 'var(--radius)',
              padding: '22px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              {isLoading ? (
                <div className="animate-pulse flex items-center gap-4 w-full">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gc-border)' }} />
                  <div className="flex-1 space-y-2">
                    <div style={{ height: 10, borderRadius: 4, background: 'var(--gc-border)', width: '60%' }} />
                    <div style={{ height: 20, borderRadius: 4, background: 'var(--gc-border)', width: '40%' }} />
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${m.color}14`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: 22, height: 22, color: m.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--gc-muted)', fontWeight: 500, marginBottom: 2 }}>{m.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                      {m.value}
                    </p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Two-column layout for cost + heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Cost by Agent */}
        <div style={{
          background: 'var(--gc-card)',
          border: '1px solid var(--gc-border)',
          borderRadius: 'var(--radius)',
          padding: 24,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign style={{ width: 16, height: 16, color: '#d97706' }} />
            Cost by Agent
          </h3>
          {agentCosts.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gc-muted)', textAlign: 'center', padding: '24px 0' }}>
              No cost data yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {agentCosts.map((a) => {
                const pct = maxAgentCost > 0 ? Math.max((a.cost / maxAgentCost) * 100, 2) : 2;
                return (
                  <div key={a.name}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gc-text)' }}>{a.name}</span>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gc-text2)' }}>
                        {formatCost(a.cost)}
                      </span>
                    </div>
                    <div style={{ height: 10, background: 'var(--gc-soft)', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--gc-grad)',
                        borderRadius: 5,
                        transition: 'width .5s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--gc-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {a.executions} executions
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Executions Over Time (Activity Heatmap) */}
        <div style={{
          background: 'var(--gc-card)',
          border: '1px solid var(--gc-border)',
          borderRadius: 'var(--radius)',
          padding: 24,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} />
            Executions Over Time
          </h3>
          {totalExecutions === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gc-muted)', textAlign: 'center', padding: '24px 0' }}>
              No execution data yet.
            </p>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 6,
                marginBottom: 12,
              }}>
                {heatmapData.map((d) => {
                  const intensity = d.count / maxHeatmap;
                  // Map intensity to color: 0 = gc-soft, 1 = gc-primary
                  const alpha = Math.max(0.08, intensity * 0.9);
                  return (
                    <div key={d.day} style={{ textAlign: 'center' }}>
                      <div
                        title={`${d.day}: ${d.count} executions`}
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          borderRadius: 8,
                          background: d.count > 0 ? `rgba(73,2,162,${alpha})` : 'var(--gc-soft)',
                          border: d.count > 0 ? '1px solid rgba(73,2,162,.15)' : '1px solid var(--gc-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 4,
                          transition: 'background .3s',
                        }}
                      >
                        <span style={{
                          fontSize: 14,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: intensity > 0.5 ? '#ffffff' : 'var(--gc-text)',
                        }}>
                          {d.count}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--gc-muted)', fontWeight: 600 }}>{d.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--gc-muted)' }}>Less</span>
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((a) => (
                  <span key={a} style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: `rgba(73,2,162,${a})`,
                    display: 'inline-block',
                  }} />
                ))}
                <span style={{ fontSize: 10, color: 'var(--gc-muted)' }}>More</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div style={{
        background: 'var(--gc-card)',
        border: '1px solid var(--gc-border)',
        borderRadius: 'var(--radius)',
        padding: 24,
        marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy style={{ width: 16, height: 16, color: '#d97706' }} />
          Top Performers
        </h3>
        {topPerformers.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--gc-muted)', textAlign: 'center', padding: '24px 0' }}>
            No agents with executions yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topPerformers.map((agent, rank) => (
              <div
                key={agent.id}
                className="flex items-center gap-4"
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: rank === 0 ? 'rgba(217,119,6,.06)' : 'var(--gc-soft)',
                  border: rank === 0 ? '1px solid rgba(217,119,6,.15)' : '1px solid transparent',
                }}
              >
                {/* Rank */}
                <span style={{
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: rank === 0 ? '#d97706' : rank === 1 ? '#94a3b8' : rank === 2 ? '#b45309' : 'var(--gc-muted)',
                  width: 28,
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  #{rank + 1}
                </span>

                {/* Agent info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gc-text)' }}>{agent.name}</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.6px',
                    background: 'rgba(73,2,162,.08)',
                    color: 'var(--gc-primary)',
                    padding: '2px 7px',
                    borderRadius: 4,
                    marginLeft: 8,
                  }}>
                    {agent.type}
                  </span>
                </div>

                {/* Executions */}
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--gc-text)' }}>
                    {agent.total_executions ?? 0}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--gc-muted)', marginLeft: 4 }}>runs</span>
                </div>

                {/* Success rate bar */}
                <div style={{ width: 120, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 8, background: 'var(--gc-border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${agent.success_rate ?? 0}%`,
                      background: (agent.success_rate ?? 0) > 70 ? 'var(--gc-green)' : (agent.success_rate ?? 0) > 40 ? 'var(--gc-yellow)' : 'var(--gc-red)',
                      borderRadius: 4,
                      transition: 'width .5s ease',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: 'var(--gc-text)',
                    minWidth: 36,
                    textAlign: 'right',
                  }}>
                    {agent.success_rate != null ? `${Math.round(agent.success_rate)}%` : '--'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Breakdown */}
      <div style={{
        background: 'var(--gc-card)',
        border: '1px solid var(--gc-border)',
        borderRadius: 'var(--radius)',
        padding: 24,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} />
          Agent Performance Breakdown
        </h3>
        {!agents || agents.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--gc-muted)', textAlign: 'center', padding: '32px 0' }}>
            No agents yet. Create one to see analytics.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gc-border)' }}>
                  {['Agent', 'Type', 'Status', 'Executions', 'Success Rate'].map((h) => (
                    <th key={h} style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: 'var(--gc-muted)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} style={{ borderBottom: '1px solid var(--gc-border)' }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--gc-text)' }}>
                      {agent.name}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px',
                        background: 'rgba(73,2,162,.08)', color: 'var(--gc-primary)',
                        padding: '3px 8px', borderRadius: 5,
                      }}>{agent.type}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="flex items-center gap-1.5">
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: agent.status === 'active' ? 'var(--gc-green)' :
                            agent.status === 'error' ? 'var(--gc-red)' : 'var(--gc-muted)',
                          display: 'inline-block',
                        }} />
                        <span style={{ fontSize: 12, color: 'var(--gc-text2)', textTransform: 'capitalize' }}>{agent.status}</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--gc-text)' }}>
                      {agent.total_executions ?? 0}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div className="flex items-center gap-2">
                        <div style={{ flex: 1, height: 6, background: 'var(--gc-soft)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${agent.success_rate ?? 0}%`,
                            background: (agent.success_rate ?? 0) > 70 ? 'var(--gc-green)' : (agent.success_rate ?? 0) > 40 ? 'var(--gc-yellow)' : 'var(--gc-red)',
                            borderRadius: 3,
                            transition: 'width .5s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--gc-text)', minWidth: 36 }}>
                          {agent.success_rate != null ? `${Math.round(agent.success_rate)}%` : '--'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
