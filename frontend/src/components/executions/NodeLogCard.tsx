import { useState } from 'react';
import {
  Clock,
  Brain,
  Plug,
  GitBranch,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2,
  SkipForward,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ExecutionNodeLog } from '../../types';
import { formatDuration, formatCost } from '../../lib/utils';

const nodeTypeIcons: Record<string, typeof Clock> = {
  trigger: Clock,
  ai_action: Brain,
  integration: Plug,
  decision: GitBranch,
  escalation: AlertTriangle,
};

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-400',
    label: 'Success',
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-400',
    label: 'Failed',
  },
  running: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-400',
    label: 'Running',
  },
  pending: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    label: 'Pending',
  },
  skipped: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-300',
    label: 'Skipped',
  },
};

function StatusDot({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
  if (status === 'running') return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
  if (status === 'skipped') return <SkipForward className="w-4 h-4 text-slate-400" />;
  return <div className="w-4 h-4 rounded-full bg-slate-300" />;
}

function JsonBlock({ label, data }: { label: string; data: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const isEmpty = !data || Object.keys(data).length === 0;

  if (isEmpty) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-1"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {label}
      </button>
      {open && (
        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-64">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

interface NodeLogCardProps {
  log: ExecutionNodeLog;
}

export default function NodeLogCard({ log }: NodeLogCardProps) {
  const [expanded, setExpanded] = useState(log.status === 'failed');
  const Icon = nodeTypeIcons[log.node_type] || Clock;
  const config = statusConfig[log.status] || statusConfig.pending;

  const hasDetails =
    (log.input_data && Object.keys(log.input_data).length > 0) ||
    (log.output_data && Object.keys(log.output_data).length > 0) ||
    log.llm_usage ||
    log.error_message;

  return (
    <div className={cn('border-l-4 rounded-lg bg-white border border-slate-200 overflow-hidden', config.border)}>
      {/* Collapsed header */}
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left',
          hasDetails && 'cursor-pointer hover:bg-slate-50 transition-colors',
          !hasDetails && 'cursor-default',
        )}
      >
        <StatusDot status={log.status} />
        <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="text-sm font-medium text-slate-900 flex-1 min-w-0 truncate">
          {log.node_label || log.node_type}
        </span>
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.bg, config.text)}>
          {config.label}
        </span>
        {log.duration_ms != null && (
          <span className="text-xs text-slate-400 tabular-nums">{formatDuration(log.duration_ms)}</span>
        )}
        {hasDetails && (
          expanded
            ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded details */}
      {expanded && hasDetails && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          {log.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-medium text-red-700 mb-1">Error</p>
              <p className="text-xs text-red-600 font-mono whitespace-pre-wrap">{log.error_message}</p>
            </div>
          )}

          {log.llm_usage && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-xs font-medium text-indigo-700 mb-2">LLM Usage</p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-indigo-500">Model</span>
                  <p className="text-indigo-900 font-medium">{log.llm_usage.model}</p>
                </div>
                <div>
                  <span className="text-indigo-500">Input Tokens</span>
                  <p className="text-indigo-900 font-medium">{log.llm_usage.input_tokens.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-indigo-500">Output Tokens</span>
                  <p className="text-indigo-900 font-medium">{log.llm_usage.output_tokens.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-indigo-500">Cost</span>
                  <p className="text-indigo-900 font-medium">{formatCost(log.llm_usage.cost)}</p>
                </div>
              </div>
            </div>
          )}

          <JsonBlock label="Input Data" data={log.input_data} />
          <JsonBlock label="Output Data" data={log.output_data} />
        </div>
      )}
    </div>
  );
}
