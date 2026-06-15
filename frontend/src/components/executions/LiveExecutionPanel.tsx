import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  SkipForward,
  Clock,
  Brain,
  Plug,
  GitBranch,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { useExecutionWithLogs } from '../../hooks/useExecutions';
import { cn, formatDuration, formatCost } from '../../lib/utils';
import type { ExecutionNodeLog } from '../../types';

const nodeTypeIcons: Record<string, typeof Clock> = {
  trigger: Clock,
  ai_action: Brain,
  integration: Plug,
  decision: GitBranch,
  escalation: AlertTriangle,
  web_search: Search,
};

const nodeTypeLabels: Record<string, string> = {
  trigger: 'Trigger',
  ai_action: 'AI Action',
  integration: 'Integration',
  decision: 'Decision',
  escalation: 'Escalation',
  web_search: 'Web Search',
};

const statusBarColors: Record<string, string> = {
  success: '#16a34a',
  failed: '#e11d48',
  running: '#4902A2',
  pending: '#9ca3af',
  skipped: '#9ca3af',
};

function formatNodeOutput(nodeType: string, outputData: any): string {
  const vars = outputData?.output_variables || outputData || {};

  if (nodeType === 'trigger') {
    return `Triggered at ${vars.trigger_time || 'unknown time'} (${vars.triggered_by || 'manual'})`;
  }

  if (nodeType === 'ai_action') {
    for (const val of Object.values(vars)) {
      if (typeof val === 'object' && val !== null && (val as any)?.output) return (val as any).output;
      if (typeof val === 'string' && val.length > 0) return val;
    }
    return JSON.stringify(vars, null, 2);
  }

  if (nodeType === 'web_search') {
    const results = vars.search_results || [];
    if (Array.isArray(results) && results.length > 0) {
      return results.map((r: any, i: number) => `${i + 1}. ${r.title}\n   ${r.url}`).join('\n');
    }
    // Try finding any array in the output
    for (const val of Object.values(vars)) {
      if (Array.isArray(val) && val.length > 0) {
        return (val as any[]).map((r: any, i: number) => `${i + 1}. ${r.title || r.name || JSON.stringify(r)}\n   ${r.url || r.link || ''}`).join('\n');
      }
    }
    return JSON.stringify(vars, null, 2);
  }

  if (nodeType === 'integration') {
    if (vars.service === 'email') return `Email sent to ${(vars.recipients || []).join(', ')} — Subject: "${vars.subject}"`;
    if (vars.service === 'slack') return `Slack message sent to ${vars.channel || 'channel'}`;
    return `Integration: ${vars.service || 'unknown'}`;
  }

  if (nodeType === 'decision') {
    return `Condition evaluated → ${vars.branch === 'true' || vars.result === true ? 'TRUE' : 'FALSE'}`;
  }

  if (nodeType === 'escalation') {
    return `Escalation sent to ${vars.recipient || vars.recipient_email || 'unknown'}`;
  }

  if (Object.keys(vars).length === 0) return 'No output';
  return JSON.stringify(vars, null, 2);
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle style={{ width: 16, height: 16, color: '#16a34a' }} />;
  if (status === 'failed') return <XCircle style={{ width: 16, height: 16, color: '#e11d48' }} />;
  if (status === 'running') return <Loader2 style={{ width: 16, height: 16, color: '#4902A2' }} className="animate-spin" />;
  if (status === 'skipped') return <SkipForward style={{ width: 16, height: 16, color: '#9ca3af' }} />;
  return <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#d1d5db' }} />;
}

function NodeCard({ log }: { log: ExecutionNodeLog }) {
  const [showRaw, setShowRaw] = useState(false);
  const Icon = nodeTypeIcons[log.node_type] || Clock;
  const barColor = statusBarColors[log.status] || '#9ca3af';
  const isRunning = log.status === 'running';
  const formattedOutput = formatNodeOutput(log.node_type, log.output_data);
  const isAiAction = log.node_type === 'ai_action';
  const isJson = formattedOutput.startsWith('{') || formattedOutput.startsWith('[');

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--gc-border)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        position: 'relative',
      }}
      className={cn(isRunning && 'animate-pulse')}
    >
      {/* Left status bar */}
      <div style={{ width: 3, minHeight: '100%', background: barColor, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '14px 16px' }}>
        {/* Header */}
        <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
          <StatusIcon status={log.status} />
          <Icon style={{ width: 14, height: 14, color: 'var(--gc-muted)' }} />
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.6px',
            color: barColor,
            background: `${barColor}15`,
            padding: '2px 7px',
            borderRadius: 4,
          }}>
            {nodeTypeLabels[log.node_type] || log.node_type}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gc-text)' }}>
            {log.node_label || log.node_type}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--gc-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            {log.duration_ms != null ? formatDuration(log.duration_ms) : isRunning ? '...' : '--'}
          </span>
        </div>

        {/* Body - formatted output */}
        {log.status === 'running' && !formattedOutput ? (
          <div style={{ background: 'rgba(73,2,162,.04)', borderRadius: 8, padding: '12px 14px' }}>
            <div className="animate-pulse" style={{ height: 14, background: 'rgba(73,2,162,.08)', borderRadius: 4, width: '60%', marginBottom: 8 }} />
            <div className="animate-pulse" style={{ height: 14, background: 'rgba(73,2,162,.06)', borderRadius: 4, width: '40%' }} />
          </div>
        ) : log.status !== 'pending' && (
          <div style={{
            background: isAiAction ? 'rgba(73,2,162,.04)' : 'rgba(0,0,0,.02)',
            borderRadius: 8,
            padding: '12px 14px',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--gc-text)',
            whiteSpace: isJson ? 'pre' : 'pre-wrap',
            fontFamily: isJson ? "'JetBrains Mono', monospace" : 'inherit',
            maxHeight: 200,
            overflow: 'auto',
          }}>
            {formattedOutput}
          </div>
        )}

        {/* Error message */}
        {log.error_message && (
          <div style={{
            background: 'rgba(225,29,72,.06)',
            border: '1px solid rgba(225,29,72,.15)',
            borderRadius: 8,
            padding: '10px 14px',
            marginTop: 8,
            fontSize: 12,
            color: '#be123c',
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'pre-wrap',
          }}>
            {log.error_message}
          </div>
        )}

        {/* Footer - LLM usage + Raw toggle */}
        <div className="flex items-center gap-3" style={{ marginTop: 10 }}>
          {log.llm_usage && (
            <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}>
              {log.llm_usage.model} | {log.llm_usage.input_tokens + log.llm_usage.output_tokens} tokens | {formatCost(log.llm_usage.cost)}
            </span>
          )}
          {log.output_data && Object.keys(log.output_data).length > 0 && (
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center gap-1"
              style={{
                marginLeft: 'auto',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--gc-muted)',
                background: 'rgba(0,0,0,.04)',
                border: '1px solid var(--gc-border)',
                borderRadius: 5,
                padding: '3px 8px',
                cursor: 'pointer',
              }}
            >
              {showRaw ? <ChevronDown style={{ width: 10, height: 10 }} /> : <ChevronRight style={{ width: 10, height: 10 }} />}
              Raw JSON
            </button>
          )}
        </div>

        {/* Raw JSON toggle */}
        {showRaw && (
          <pre style={{
            marginTop: 8,
            background: '#1e1b2e',
            color: '#a5f3b4',
            padding: 14,
            borderRadius: 8,
            fontSize: 11,
            overflow: 'auto',
            maxHeight: 240,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {JSON.stringify(log.output_data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

interface LiveExecutionPanelProps {
  executionId: string | null;
  onClose?: () => void;
}

export default function LiveExecutionPanel({ executionId, onClose }: LiveExecutionPanelProps) {
  const { data, isLoading } = useExecutionWithLogs(
    executionId,
    // Poll if execution is running or pending
    true,
  );

  if (!executionId) return null;

  const execution = data?.execution;
  const logs = data?.node_logs || [];
  const isActive = execution?.status === 'running' || execution?.status === 'pending';

  // Stop polling if execution is done
  // (the hook will still refetch, but the component can track this)

  if (isLoading) {
    return (
      <div style={{
        background: 'var(--gc-card)',
        border: '1px solid var(--gc-border)',
        borderRadius: 'var(--radius)',
        padding: 22,
        marginBottom: 22,
      }}>
        <div className="flex items-center gap-3">
          <Loader2 style={{ width: 18, height: 18, color: 'var(--gc-primary)' }} className="animate-spin" />
          <span style={{ fontSize: 13, color: 'var(--gc-muted)' }}>Loading execution details...</span>
        </div>
      </div>
    );
  }

  if (!execution) return null;

  const totalCost = logs.reduce((sum, l) => sum + (l.llm_usage?.cost || 0), 0) || execution.total_cost;

  return (
    <div style={{
      background: 'var(--gc-card)',
      border: '1px solid var(--gc-border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      marginBottom: 22,
    }}>
      {/* Summary bar */}
      <div style={{
        background: 'var(--gc-grad)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
          {isActive ? 'Live Execution' : 'Latest Execution'}
        </span>
        {isActive && <Loader2 style={{ width: 14, height: 14, color: '#ffffff' }} className="animate-spin" />}

        {/* Status badge */}
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.5px',
          color: '#ffffff',
          background: 'rgba(255,255,255,.2)',
          padding: '3px 9px',
          borderRadius: 6,
        }}>
          {execution.status}
        </span>

        {/* Summary stats */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'rgba(255,255,255,.85)' }}>
          {execution.duration_ms != null && (
            <span>Completed in {formatDuration(execution.duration_ms)}</span>
          )}
          {totalCost > 0 && (
            <span>{formatCost(totalCost)} cost</span>
          )}
          <span>{logs.length} nodes</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', padding: 2 }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {/* Node pipeline */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {logs.length === 0 && isActive && (
            <div className="flex items-center gap-3" style={{ padding: '20px 0' }}>
              <Loader2 style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} className="animate-spin" />
              <span style={{ fontSize: 13, color: 'var(--gc-muted)' }}>Waiting for nodes to execute...</span>
            </div>
          )}
          {logs.length === 0 && !isActive && (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--gc-muted)' }}>No node logs recorded for this execution.</span>
            </div>
          )}
          {logs.map((log) => (
            <NodeCard key={log.id} log={log} />
          ))}
        </div>
      </div>
    </div>
  );
}
