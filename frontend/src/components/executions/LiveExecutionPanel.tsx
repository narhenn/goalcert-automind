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
  Copy,
  Check,
  ExternalLink,
  Cpu,
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

const nodeTypeColors: Record<string, string> = {
  trigger: '#6366f1',
  ai_action: '#7c3aed',
  integration: '#0891b2',
  decision: '#d97706',
  escalation: '#e11d48',
  web_search: '#2563eb',
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
    for (const val of Object.values(vars)) {
      if (Array.isArray(val) && val.length > 0) {
        return (val as any[]).map((r: any, i: number) => `${i + 1}. ${r.title || r.name || JSON.stringify(r)}\n   ${r.url || r.link || ''}`).join('\n');
      }
    }
    return JSON.stringify(vars, null, 2);
  }

  if (nodeType === 'integration') {
    if (vars.service === 'email') return `Email sent to ${(vars.recipients || []).join(', ')} -- Subject: "${vars.subject}"`;
    if (vars.service === 'slack') return `Slack message sent to ${vars.channel || 'channel'}`;
    return `Integration: ${vars.service || 'unknown'}`;
  }

  if (nodeType === 'decision') {
    return `Condition evaluated -> ${vars.branch === 'true' || vars.result === true ? 'TRUE' : 'FALSE'}`;
  }

  if (nodeType === 'escalation') {
    return `Escalation sent to ${vars.recipient || vars.recipient_email || 'unknown'}`;
  }

  if (Object.keys(vars).length === 0) return 'No output';
  return JSON.stringify(vars, null, 2);
}

function getWebSearchResults(outputData: any): { title: string; url: string; snippet?: string }[] | null {
  const vars = outputData?.output_variables || outputData || {};
  const results = vars.search_results;
  if (Array.isArray(results) && results.length > 0) return results;
  for (const val of Object.values(vars)) {
    if (Array.isArray(val) && val.length > 0 && typeof (val as any[])[0] === 'object') {
      return val as any[];
    }
  }
  return null;
}

// Simple markdown-ish rendering for AI output
function renderAIOutput(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      elements.push(<h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: 'var(--gc-text)', margin: '8px 0 4px' }}>{trimmed.slice(2)}</h3>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h4 key={i} style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', margin: '6px 0 3px' }}>{trimmed.slice(3)}</h4>);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h5 key={i} style={{ fontSize: 13, fontWeight: 600, color: 'var(--gc-text)', margin: '4px 0 2px' }}>{trimmed.slice(4)}</h5>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
          <span style={{ color: 'var(--gc-primary)', flexShrink: 0 }}>&#x2022;</span>
          <span>{trimmed.slice(2)}</span>
        </div>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div key={i} style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
            <span style={{ color: 'var(--gc-primary)', fontWeight: 600, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{match[1]}.</span>
            <span>{match[2]}</span>
          </div>
        );
      }
    } else if (trimmed === '') {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      elements.push(<p key={i} style={{ margin: '2px 0' }}>{trimmed}</p>);
    }
  });

  return elements;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle style={{ width: 16, height: 16, color: '#16a34a' }} />;
  if (status === 'failed') return <XCircle style={{ width: 16, height: 16, color: '#e11d48' }} />;
  if (status === 'running') return <Loader2 style={{ width: 16, height: 16, color: '#4902A2' }} className="animate-spin" />;
  if (status === 'skipped') return <SkipForward style={{ width: 16, height: 16, color: '#9ca3af' }} />;
  return <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#d1d5db' }} />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1"
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: copied ? 'var(--gc-green)' : 'var(--gc-muted)',
        background: copied ? 'rgba(22,163,74,.08)' : 'rgba(0,0,0,.04)',
        border: `1px solid ${copied ? 'rgba(22,163,74,.2)' : 'var(--gc-border)'}`,
        borderRadius: 5,
        padding: '3px 8px',
        cursor: 'pointer',
        transition: 'all .15s',
      }}
    >
      {copied ? <Check style={{ width: 10, height: 10 }} /> : <Copy style={{ width: 10, height: 10 }} />}
      {copied ? 'Copied' : 'Copy output'}
    </button>
  );
}

function TokenBar({ input, output }: { input: number; output: number }) {
  const total = input + output;
  if (total === 0) return null;
  const inputPct = (input / total) * 100;

  return (
    <div className="flex items-center gap-2" style={{ minWidth: 100 }}>
      <div style={{
        flex: 1,
        height: 6,
        borderRadius: 3,
        background: 'var(--gc-soft)',
        overflow: 'hidden',
        display: 'flex',
      }}>
        <div style={{
          width: `${inputPct}%`,
          height: '100%',
          background: 'rgba(73,2,162,.25)',
          borderRadius: '3px 0 0 3px',
        }} />
        <div style={{
          width: `${100 - inputPct}%`,
          height: '100%',
          background: 'var(--gc-primary)',
          borderRadius: '0 3px 3px 0',
        }} />
      </div>
      <span style={{ fontSize: 10, color: 'var(--gc-muted)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
        {input.toLocaleString()}+{output.toLocaleString()}
      </span>
    </div>
  );
}

function NodeCard({ log }: { log: ExecutionNodeLog }) {
  const [activeTab, setActiveTab] = useState<'output' | 'raw' | 'metadata'>('output');
  const [showBody, setShowBody] = useState(true);
  const Icon = nodeTypeIcons[log.node_type] || Clock;
  const barColor = statusBarColors[log.status] || '#9ca3af';
  const isRunning = log.status === 'running';
  const formattedOutput = formatNodeOutput(log.node_type, log.output_data);
  const isAiAction = log.node_type === 'ai_action';
  const isWebSearch = log.node_type === 'web_search';
  const webResults = isWebSearch ? getWebSearchResults(log.output_data) : null;

  const tabs = [
    { key: 'output' as const, label: 'Output' },
    { key: 'raw' as const, label: 'Raw JSON', show: log.output_data && Object.keys(log.output_data).length > 0 },
    { key: 'metadata' as const, label: 'Metadata', show: !!log.llm_usage || log.started_at != null },
  ].filter((t) => t.show !== false);

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
        <div className="flex items-center gap-2" style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setShowBody(!showBody)}>
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

          {/* Token bar inline */}
          {log.llm_usage && (
            <div style={{ marginLeft: 8 }}>
              <TokenBar input={log.llm_usage.input_tokens} output={log.llm_usage.output_tokens} />
            </div>
          )}

          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--gc-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            {log.duration_ms != null ? formatDuration(log.duration_ms) : isRunning ? '...' : '--'}
          </span>
          {showBody
            ? <ChevronDown style={{ width: 14, height: 14, color: 'var(--gc-muted)' }} />
            : <ChevronRight style={{ width: 14, height: 14, color: 'var(--gc-muted)' }} />
          }
        </div>

        {showBody && (
          <>
            {/* Tabs */}
            {log.status !== 'pending' && tabs.length > 1 && (
              <div className="flex items-center gap-0" style={{ marginBottom: 10, borderBottom: '1px solid var(--gc-border)' }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: activeTab === tab.key ? 'var(--gc-primary)' : 'var(--gc-muted)',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === tab.key ? '2px solid var(--gc-primary)' : '2px solid transparent',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      transition: 'color .15s',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Body - formatted output */}
            {activeTab === 'output' && (
              <>
                {log.status === 'running' && !formattedOutput ? (
                  <div style={{ background: 'rgba(73,2,162,.04)', borderRadius: 8, padding: '12px 14px' }}>
                    <div className="animate-pulse" style={{ height: 14, background: 'rgba(73,2,162,.08)', borderRadius: 4, width: '60%', marginBottom: 8 }} />
                    <div className="animate-pulse" style={{ height: 14, background: 'rgba(73,2,162,.06)', borderRadius: 4, width: '40%' }} />
                  </div>
                ) : log.status !== 'pending' && (
                  <>
                    {/* Web search: render as clickable links */}
                    {isWebSearch && webResults ? (
                      <div style={{
                        background: 'rgba(0,0,0,.02)',
                        borderRadius: 8,
                        padding: '12px 14px',
                        maxHeight: 240,
                        overflow: 'auto',
                      }}>
                        {webResults.map((r: any, i: number) => (
                          <div key={i} style={{ marginBottom: i < webResults.length - 1 ? 10 : 0 }}>
                            <a
                              href={r.url || r.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5"
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#2563eb',
                                textDecoration: 'none',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                            >
                              <ExternalLink style={{ width: 12, height: 12, flexShrink: 0 }} />
                              {r.title || r.name || r.url}
                            </a>
                            {r.snippet && (
                              <p style={{ fontSize: 12, color: 'var(--gc-muted)', margin: '2px 0 0 18px', lineHeight: 1.4 }}>
                                {r.snippet}
                              </p>
                            )}
                            {r.url && (
                              <span style={{ fontSize: 11, color: 'var(--gc-green)', marginLeft: 18, fontFamily: "'JetBrains Mono', monospace" }}>
                                {r.url.length > 60 ? r.url.slice(0, 60) + '...' : r.url}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : isAiAction ? (
                      <div style={{
                        background: 'rgba(73,2,162,.04)',
                        borderRadius: 8,
                        padding: '12px 14px',
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: 'var(--gc-text)',
                        maxHeight: 240,
                        overflow: 'auto',
                      }}>
                        {renderAIOutput(formattedOutput)}
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(0,0,0,.02)',
                        borderRadius: 8,
                        padding: '12px 14px',
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: 'var(--gc-text)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: 200,
                        overflow: 'auto',
                      }}>
                        {formattedOutput}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Raw JSON tab */}
            {activeTab === 'raw' && log.output_data && (
              <pre style={{
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

            {/* Metadata tab */}
            {activeTab === 'metadata' && (
              <div style={{
                background: 'var(--gc-soft)',
                borderRadius: 8,
                padding: '12px 14px',
              }}>
                <div className="grid grid-cols-2 gap-x-12 gap-y-2" style={{ fontSize: 12 }}>
                  {log.llm_usage && (
                    <>
                      <div>
                        <span style={{ color: 'var(--gc-muted)' }}>Model:</span>{' '}
                        <span style={{ fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
                          {log.llm_usage.model}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--gc-muted)' }}>Cost:</span>{' '}
                        <span style={{ fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
                          {formatCost(log.llm_usage.cost)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--gc-muted)' }}>Input tokens:</span>{' '}
                        <span style={{ fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
                          {log.llm_usage.input_tokens.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--gc-muted)' }}>Output tokens:</span>{' '}
                        <span style={{ fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
                          {log.llm_usage.output_tokens.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                  {log.started_at && (
                    <div>
                      <span style={{ color: 'var(--gc-muted)' }}>Started:</span>{' '}
                      <span style={{ fontWeight: 500, color: 'var(--gc-text2)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {new Date(log.started_at).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {log.ended_at && (
                    <div>
                      <span style={{ color: 'var(--gc-muted)' }}>Ended:</span>{' '}
                      <span style={{ fontWeight: 500, color: 'var(--gc-text2)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {new Date(log.ended_at).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {log.duration_ms != null && (
                    <div>
                      <span style={{ color: 'var(--gc-muted)' }}>Duration:</span>{' '}
                      <span style={{ fontWeight: 600, color: 'var(--gc-text)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatDuration(log.duration_ms)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Token usage bar */}
                {log.llm_usage && (
                  <div style={{ marginTop: 10 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}>Token usage</span>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gc-text2)' }}>
                        {(log.llm_usage.input_tokens + log.llm_usage.output_tokens).toLocaleString()} total
                      </span>
                    </div>
                    <TokenBar input={log.llm_usage.input_tokens} output={log.llm_usage.output_tokens} />
                    <div className="flex items-center gap-4" style={{ marginTop: 4 }}>
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(73,2,162,.25)', display: 'inline-block' }} />
                        <span style={{ fontSize: 10, color: 'var(--gc-muted)' }}>Input</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--gc-primary)', display: 'inline-block' }} />
                        <span style={{ fontSize: 10, color: 'var(--gc-muted)' }}>Output</span>
                      </div>
                    </div>
                  </div>
                )}
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

            {/* Footer - LLM usage + Copy button */}
            <div className="flex items-center gap-3" style={{ marginTop: 10 }}>
              {log.llm_usage && activeTab === 'output' && (
                <span style={{ fontSize: 11, color: 'var(--gc-muted)' }}>
                  {log.llm_usage.model} | {log.llm_usage.input_tokens + log.llm_usage.output_tokens} tokens | {formatCost(log.llm_usage.cost)}
                </span>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {formattedOutput && log.status !== 'pending' && (
                  <CopyButton text={formattedOutput} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Execution Waterfall visualization
function ExecutionWaterfall({ logs }: { logs: ExecutionNodeLog[] }) {
  const completedLogs = logs.filter((l) => l.duration_ms != null && l.duration_ms > 0);
  if (completedLogs.length === 0) return null;

  const maxDuration = Math.max(...completedLogs.map((l) => l.duration_ms!));

  return (
    <div style={{
      background: 'var(--gc-soft)',
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 14,
    }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--gc-muted)' }}>
          Execution Waterfall
        </span>
        <span style={{ fontSize: 11, color: 'var(--gc-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          Total: {formatDuration(completedLogs.reduce((s, l) => s + (l.duration_ms || 0), 0))}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {completedLogs.map((log) => {
          const pct = maxDuration > 0 ? Math.max((log.duration_ms! / maxDuration) * 100, 4) : 4;
          const color = nodeTypeColors[log.node_type] || '#9ca3af';
          return (
            <div key={log.id} className="flex items-center gap-2">
              <span style={{
                fontSize: 10,
                color: 'var(--gc-muted)',
                width: 72,
                flexShrink: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {log.node_label || log.node_type}
              </span>
              <div style={{ flex: 1, height: 14, background: 'rgba(0,0,0,.04)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 4,
                  transition: 'width .5s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 6,
                }}>
                  {pct > 20 && (
                    <span style={{ fontSize: 9, color: '#ffffff', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatDuration(log.duration_ms!)}
                    </span>
                  )}
                </div>
              </div>
              {pct <= 20 && (
                <span style={{ fontSize: 10, color: 'var(--gc-muted)', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                  {formatDuration(log.duration_ms!)}
                </span>
              )}
            </div>
          );
        })}
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
  const totalInputTokens = logs.reduce((sum, l) => sum + (l.llm_usage?.input_tokens || 0), 0);
  const totalOutputTokens = logs.reduce((sum, l) => sum + (l.llm_usage?.output_tokens || 0), 0);
  const totalTokens = totalInputTokens + totalOutputTokens;

  // Cost breakdown by node type
  const costByType: Record<string, number> = {};
  logs.forEach((l) => {
    if (l.llm_usage?.cost) {
      const label = nodeTypeLabels[l.node_type] || l.node_type;
      costByType[label] = (costByType[label] || 0) + l.llm_usage.cost;
    }
  });

  // Detect primary model used
  const modelUsed = logs.find((l) => l.llm_usage?.model)?.llm_usage?.model;

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
        flexWrap: 'wrap',
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

        {/* Model badge */}
        {modelUsed && (
          <span className="flex items-center gap-1" style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,.9)',
            background: 'rgba(255,255,255,.12)',
            padding: '3px 9px',
            borderRadius: 6,
          }}>
            <Cpu style={{ width: 10, height: 10 }} />
            {modelUsed}
          </span>
        )}

        {/* Summary stats */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'rgba(255,255,255,.85)' }}>
          {execution.duration_ms != null && (
            <span>Completed in {formatDuration(execution.duration_ms)}</span>
          )}
          {totalTokens > 0 && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {totalTokens.toLocaleString()} tokens
            </span>
          )}
          {totalCost > 0 && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatCost(totalCost)}</span>
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

      {/* Cost breakdown row (if there are multiple node types with cost) */}
      {Object.keys(costByType).length > 1 && (
        <div style={{
          background: 'rgba(73,2,162,.03)',
          borderBottom: '1px solid var(--gc-border)',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 11,
        }}>
          <span style={{ color: 'var(--gc-muted)', fontWeight: 600 }}>Cost by node:</span>
          {Object.entries(costByType).map(([type, cost]) => (
            <span key={type} style={{ color: 'var(--gc-text2)' }}>
              {type}: <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{formatCost(cost)}</span>
            </span>
          ))}
        </div>
      )}

      {/* Node pipeline */}
      <div style={{ padding: '18px 20px' }}>
        {/* Execution waterfall */}
        <ExecutionWaterfall logs={logs} />

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
