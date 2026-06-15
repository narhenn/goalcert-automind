import { useAgents, useDashboardStats } from '../hooks/useAgents';
import { useAuthStore } from '../stores/authStore';
import { BarChart3, TrendingUp, DollarSign, Clock, Bot, CheckCircle, XCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: stats } = useDashboardStats();
  const { data: agents } = useAgents();
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
            </div>
          );
        })}
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
        )}
      </div>
    </div>
  );
}
