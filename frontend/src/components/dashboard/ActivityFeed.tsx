import { CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { timeAgo, formatDuration, formatCost } from '../../lib/utils';

interface ActivityEvent {
  execution_id: string;
  agent_id: string;
  agent_name: string;
  agent_type: string;
  status: string;
  triggered_by: string;
  created_at: string;
  duration_ms?: number | null;
  total_cost?: number | null;
}

interface ActivityFeedProps {
  activities: ActivityEvent[] | undefined;
  isLoading: boolean;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success':
      return <CheckCircle style={{ width: 16, height: 16, color: 'var(--gc-green)' }} />;
    case 'failed':
    case 'error':
      return <AlertCircle style={{ width: 16, height: 16, color: 'var(--gc-red)' }} />;
    case 'running':
      return <Loader2 style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} className="animate-spin" />;
    default:
      return <Clock style={{ width: 16, height: 16, color: 'var(--gc-muted)' }} />;
  }
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 22 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 16 }}>Recent Executions</h3>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 rounded-full" style={{ background: 'var(--gc-border)' }} />
              <div className="flex-1 space-y-1">
                <div className="h-3 rounded w-3/4" style={{ background: 'var(--gc-border)' }} />
                <div className="h-2 rounded w-1/3" style={{ background: 'var(--gc-border)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = (activities || []).slice(0, 10);

  return (
    <div style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 22 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 16 }}>Recent Executions</h3>

      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--gc-muted)', textAlign: 'center', padding: '24px 0' }}>No recent activity</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.execution_id} className="flex items-start gap-3" style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: 'var(--gc-soft)',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--gc-surface)',
                border: '1px solid var(--gc-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}>
                {getStatusIcon(item.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, color: 'var(--gc-text)' }}>
                  <span style={{ fontWeight: 600 }}>{item.agent_name}</span>
                  {' '}
                  {item.status === 'success' ? 'completed successfully' :
                   item.status === 'failed' ? 'failed' :
                   item.status === 'running' ? 'is running' :
                   `triggered (${item.triggered_by})`}
                </p>
                <div className="flex items-center gap-3" style={{ marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}
                    title={new Date(item.created_at).toLocaleString()}>
                    {timeAgo(item.created_at)}
                  </span>
                  {item.duration_ms != null && item.duration_ms > 0 && (
                    <>
                      <span style={{ fontSize: 9, color: 'var(--gc-border)' }}>|</span>
                      <span style={{ fontSize: 11, color: 'var(--gc-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatDuration(item.duration_ms)}
                      </span>
                    </>
                  )}
                  {item.total_cost != null && item.total_cost > 0 && (
                    <>
                      <span style={{ fontSize: 9, color: 'var(--gc-border)' }}>|</span>
                      <span style={{ fontSize: 11, color: 'var(--gc-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatCost(item.total_cost)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {/* Status indicator */}
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.5px',
                color: item.status === 'success' ? 'var(--gc-green)' :
                  item.status === 'failed' ? 'var(--gc-red)' :
                  item.status === 'running' ? 'var(--gc-primary)' : 'var(--gc-muted)',
              }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
