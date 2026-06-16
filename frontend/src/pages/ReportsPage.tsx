import { FileText, Bot, CheckCircle, DollarSign, Clock, Loader2 } from 'lucide-react';
import { useAgents } from '../hooks/useAgents';
import { useLatestExecutionLogs } from '../hooks/useExecutions';
import { timeAgo, formatCost } from '../lib/utils';
import type { Agent, ExecutionNodeLog } from '../types';

function extractText(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return typeof obj === 'string' ? obj : null;
  // Direct text fields
  if (typeof obj.output === 'string') return obj.output;
  if (typeof obj.result === 'string') return obj.result;
  if (typeof obj.text === 'string') return obj.text;
  if (typeof obj.content === 'string') return obj.content;
  // Recurse into values (skip llm_usage, error)
  for (const [key, val] of Object.entries(obj)) {
    if (key === 'llm_usage' || key === 'error') continue;
    if (typeof val === 'string' && val.length > 50) return val;
    if (typeof val === 'object' && val !== null) {
      const found = extractText(val);
      if (found && found.length > 50) return found;
    }
  }
  return null;
}

function getAiOutput(logs: ExecutionNodeLog[]): string | null {
  // Find all ai_action nodes that succeeded, prefer the one with the longest output
  const aiLogs = logs.filter((l) => l.node_type === 'ai_action' && l.status === 'success' && l.output_data);
  if (aiLogs.length === 0) return null;

  let bestText: string | null = null;
  for (const log of aiLogs) {
    const out = log.output_data;
    // Try output_variables first (the standard structure)
    const ov = out?.output_variables || out;
    const text = extractText(ov);
    if (text && (!bestText || text.length > bestText.length)) {
      bestText = text;
    }
  }
  return bestText;
}

function renderAiText(text: string) {
  // Simple markdown-like rendering: headers and line breaks
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      return (
        <p key={i} style={{ fontSize: 13, fontWeight: 700, color: 'var(--gc-text)', marginTop: i > 0 ? 10 : 0, marginBottom: 2 }}>
          {trimmed.slice(4)}
        </p>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <p key={i} style={{ fontSize: 14, fontWeight: 700, color: 'var(--gc-text)', marginTop: i > 0 ? 12 : 0, marginBottom: 2 }}>
          {trimmed.slice(3)}
        </p>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <p key={i} style={{ fontSize: 15, fontWeight: 700, color: 'var(--gc-text)', marginTop: i > 0 ? 14 : 0, marginBottom: 4 }}>
          {trimmed.slice(2)}
        </p>
      );
    }
    if (trimmed === '') {
      return <br key={i} />;
    }
    // Bold markers **text**
    const parts = trimmed.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} style={{ fontSize: 12.5, color: 'var(--gc-text2)', lineHeight: 1.6, margin: 0 }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} style={{ fontWeight: 600, color: 'var(--gc-text)' }}>{part}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  });
}

const typeBadge: Record<string, { bg: string; color: string }> = {
  sales: { bg: 'rgba(59,130,246,.1)', color: '#2563eb' },
  marketing: { bg: 'rgba(73,2,162,.1)', color: '#4902A2' },
  support: { bg: 'rgba(22,163,74,.1)', color: '#16a34a' },
  custom: { bg: 'rgba(234,88,12,.1)', color: '#ea580c' },
};

const statusDot: Record<string, string> = {
  active: 'var(--gc-green)',
  paused: 'var(--gc-orange)',
  error: 'var(--gc-red)',
  draft: 'var(--gc-muted)',
};

function AgentReportCard({ agent }: { agent: Agent }) {
  const { data, isLoading } = useLatestExecutionLogs(agent.id);

  const badge = typeBadge[agent.type] || typeBadge.custom;
  const aiOutput = data?.node_logs ? getAiOutput(data.node_logs) : null;

  return (
    <div style={{
      background: 'var(--gc-card)',
      border: '1px solid var(--gc-border)',
      borderRadius: 'var(--radius)',
      padding: 24,
    }}>
      {/* Agent header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: statusDot[agent.status] || 'var(--gc-muted)',
              display: 'inline-block',
            }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gc-text)', margin: 0 }}>
              {agent.name}
            </h3>
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.7px',
            background: badge.bg,
            color: badge.color,
            padding: '3px 9px',
            borderRadius: 5,
          }}>
            {agent.type}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '.5px',
            color: 'var(--gc-muted)',
          }}>
            {agent.status}
          </span>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="flex items-center gap-5" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-1.5">
          <Clock style={{ width: 12, height: 12, color: 'var(--gc-muted)' }} />
          <span style={{ fontSize: 11, color: 'var(--gc-text2)' }}>
            Last run: {agent.last_execution_at ? timeAgo(agent.last_execution_at) : 'Never'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle style={{ width: 12, height: 12, color: 'var(--gc-muted)' }} />
          <span style={{ fontSize: 11, color: 'var(--gc-text2)' }}>
            {agent.total_executions ?? 0} runs
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 11, color: 'var(--gc-text2)' }}>
            Success: {agent.success_rate != null ? `${Math.round(agent.success_rate)}%` : '--'}
          </span>
        </div>
        {data?.execution && (
          <div className="flex items-center gap-1.5">
            <DollarSign style={{ width: 12, height: 12, color: 'var(--gc-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--gc-text2)', fontFamily: "'JetBrains Mono', monospace" }}>
              {formatCost(data.execution.total_cost)}
            </span>
          </div>
        )}
      </div>

      {/* AI Output */}
      {isLoading ? (
        <div className="flex items-center gap-2" style={{ padding: '16px 0' }}>
          <Loader2 style={{ width: 14, height: 14, color: 'var(--gc-muted)' }} className="animate-spin" />
          <span style={{ fontSize: 12, color: 'var(--gc-muted)' }}>Loading latest output...</span>
        </div>
      ) : aiOutput ? (
        <div style={{
          background: 'rgba(73,2,162,.04)',
          border: '1px solid rgba(73,2,162,.1)',
          borderRadius: 12,
          padding: '16px 18px',
        }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.6px',
            color: 'var(--gc-primary)',
            display: 'block',
            marginBottom: 8,
          }}>
            Latest AI Output
          </span>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {renderAiText(aiOutput)}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--gc-soft)',
          borderRadius: 10,
          padding: '14px 16px',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--gc-muted)' }}>
            No AI output available. Run this agent to generate output.
          </span>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const { data: agents, isLoading: agentsLoading } = useAgents();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalAgents = agents?.length ?? 0;
  const activeAgents = agents?.filter((a) => a.status === 'active').length ?? 0;
  const totalExecutions = agents?.reduce((sum, a) => sum + (a.total_executions ?? 0), 0) ?? 0;
  const avgSuccess = agents?.length
    ? agents.reduce((sum, a) => sum + (a.success_rate ?? 0), 0) / agents.length
    : 0;
  const estimatedTotalCost = totalExecutions * 0.0008; // simulated

  // Agents that have at least one execution
  const agentsWithRuns = (agents || []).filter((a) => (a.total_executions ?? 0) > 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 6 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'rgba(73,2,162,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FileText style={{ width: 20, height: 20, color: 'var(--gc-primary)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 700, color: 'var(--gc-text)', letterSpacing: '-.3px' }}>
            Consolidated Agent Report
          </h1>
          <p style={{ fontSize: 13, color: 'var(--gc-muted)', marginTop: 2 }}>
            {today}
          </p>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--gc-muted)', marginBottom: 24, marginLeft: 53 }}>
        Daily intelligence brief across all agents
      </p>

      {/* Executive Summary */}
      <div style={{
        background: 'var(--gc-grad)',
        borderRadius: 'var(--radius)',
        padding: '28px 32px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '30%',
          height: '100%',
          background: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,.06) 0%, transparent 70%)',
        }} />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16, position: 'relative' }}>
          Executive Summary
        </h2>

        {agentsLoading ? (
          <div className="flex items-center gap-2" style={{ position: 'relative' }}>
            <Loader2 style={{ width: 16, height: 16, color: 'rgba(255,255,255,.7)' }} className="animate-spin" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6" style={{ position: 'relative' }}>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 4, fontWeight: 500 }}>
                Total Agents
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                {totalAgents}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                {activeAgents} active
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 4, fontWeight: 500 }}>
                Total Executions
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                {totalExecutions}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                across all agents
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 4, fontWeight: 500 }}>
                Total Cost
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                ${estimatedTotalCost.toFixed(4)}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                estimated spend
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 4, fontWeight: 500 }}>
                Success Rate
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                {Math.round(avgSuccess)}%
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                average across agents
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Per-Agent Reports */}
      {agentsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              background: 'var(--gc-card)',
              border: '1px solid var(--gc-border)',
              borderRadius: 'var(--radius)',
              padding: 24,
            }} className="animate-pulse">
              <div className="h-5 rounded w-48 mb-3" style={{ background: 'var(--gc-border)' }} />
              <div className="h-3 rounded w-72 mb-4" style={{ background: 'var(--gc-border)' }} />
              <div className="h-24 rounded" style={{ background: 'var(--gc-soft)' }} />
            </div>
          ))}
        </div>
      ) : agentsWithRuns.length === 0 ? (
        <div style={{
          background: 'var(--gc-card)',
          border: '1px solid var(--gc-border)',
          borderRadius: 'var(--radius)',
          padding: 48,
          textAlign: 'center',
        }}>
          <Bot style={{ width: 36, height: 36, color: 'var(--gc-muted)', margin: '0 auto 14px', opacity: 0.5 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 6 }}>
            No agent reports yet
          </h3>
          <p style={{ fontSize: 13, color: 'var(--gc-muted)' }}>
            Run your agents to see their consolidated output here.
          </p>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 14 }}>
            Per-Agent Reports ({agentsWithRuns.length})
          </h2>
          <div className="space-y-4">
            {agentsWithRuns.map((agent) => (
              <AgentReportCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
