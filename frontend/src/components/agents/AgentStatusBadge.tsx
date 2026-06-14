import { cn } from '../../lib/utils';

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  active: {
    bg: 'rgba(22,163,74,.12)',
    color: '#16a34a',
    label: 'Active',
  },
  paused: {
    bg: 'rgba(234,88,12,.12)',
    color: '#ea580c',
    label: 'Paused',
  },
  error: {
    bg: 'rgba(225,29,72,.12)',
    color: '#e11d48',
    label: 'Error',
  },
  draft: {
    bg: 'rgba(73,2,162,.1)',
    color: '#4902A2',
    label: 'Draft',
  },
};

interface AgentStatusBadgeProps {
  status: string;
  className?: string;
}

export default function AgentStatusBadge({ status, className }: AgentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={cn(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '.8px',
        background: config.bg,
        color: config.color,
      }}
    >
      <span
        className={status === 'active' ? 'pulse-dot' : ''}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: config.color,
          display: 'inline-block',
        }}
      />
      {config.label}
    </span>
  );
}
