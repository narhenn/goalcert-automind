import { cn } from '../../lib/utils';

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Active',
  },
  paused: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    label: 'Paused',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'Error',
  },
  draft: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
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
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
