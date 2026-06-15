import { useEffect, useRef, useState } from 'react';
import { Terminal, X } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  node_id: string | null;
  status: string;
}

interface LiveConsoleProps {
  executionId: string | null;
}

const statusColors: Record<string, string> = {
  success: '#16a34a',
  error: '#e11d48',
  running: '#a78bfa',
  info: '#94a3b8',
  done: '#64748b',
};

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '--:--:--';
  }
}

export default function LiveConsole({ executionId }: LiveConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!executionId) {
      setLogs([]);
      setConnected(false);
      return;
    }

    setLogs([]);
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    const url = `${apiBaseUrl}/api/executions/${executionId}/stream`;
    const es = new EventSource(url);

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const log: LogEntry = JSON.parse(e.data);
        if (log.message === '__STREAM_END__') {
          setConnected(false);
          es.close();
          return;
        }
        setLogs((prev) => [...prev, log]);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [executionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bottomRef.current && !minimized) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, minimized]);

  if (!executionId) return null;

  return (
    <div
      style={{
        background: '#0c1322',
        border: '1px solid rgba(73,2,162,.25)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        marginBottom: 22,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'rgba(73,2,162,.15)',
          borderBottom: '1px solid rgba(73,2,162,.2)',
          cursor: 'pointer',
        }}
        onClick={() => setMinimized(!minimized)}
      >
        <Terminal style={{ width: 14, height: 14, color: '#a78bfa' }} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#e2e8f0',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '.5px',
          }}
        >
          LIVE CONSOLE
        </span>
        {connected && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#16a34a',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }}
          />
        )}
        <span
          style={{
            fontSize: 10,
            color: connected ? '#16a34a' : '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {connected ? 'CONNECTED' : logs.length > 0 ? 'COMPLETED' : 'WAITING'}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            color: '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {logs.length} {logs.length === 1 ? 'event' : 'events'}
        </span>
        <X
          style={{ width: 14, height: 14, color: '#64748b' }}
          onClick={(e) => {
            e.stopPropagation();
            setMinimized(!minimized);
          }}
        />
      </div>

      {/* Log body */}
      {!minimized && (
        <div
          style={{
            maxHeight: 280,
            overflowY: 'auto',
            padding: '12px 16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          {logs.length === 0 && (
            <div style={{ color: '#475569', fontStyle: 'italic' }}>
              Waiting for execution logs...
            </div>
          )}
          {logs.map((log, i) => {
            const color = statusColors[log.status] || statusColors.info;
            return (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#475569', flexShrink: 0, userSelect: 'none' }}>
                  {String(i + 1).padStart(3, ' ')}
                </span>
                <span style={{ color: '#64748b', flexShrink: 0 }}>
                  {formatTimestamp(log.timestamp)}
                </span>
                <span style={{ color }}>
                  {log.message}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
