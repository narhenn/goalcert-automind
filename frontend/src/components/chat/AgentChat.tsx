import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentChatProps {
  agentId: string;
  agentName: string;
  onClose: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function AgentChat({ agentId, agentName, onClose }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsStreaming(true);

    // Add placeholder for assistant
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    setMessages([...history, assistantMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const rawData = line.slice(5).trim();
            if (!rawData) continue;
            try {
              const parsed = JSON.parse(rawData);
              if (parsed.type === 'token') {
                accumulated += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: accumulated,
                  };
                  return updated;
                });
              } else if (parsed.type === 'error') {
                accumulated += `\n[Error: ${parsed.content}]`;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: accumulated,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 400,
        background: '#ffffff',
        borderLeft: '1px solid var(--gc-border, #e8e3f4)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(50,0,128,.08)',
        animation: 'slideInRight 0.25s ease-out',
      }}
    >
      {/* Inline keyframes for slide-in */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulseTyping {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: 'var(--gc-grad, linear-gradient(135deg, #4902A2 0%, #7c3aed 100%))',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot style={{ width: 18, height: 18, color: '#ffffff' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>
              {agentName}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>
              Agent Chat
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,.15)',
            border: 'none',
            borderRadius: 8,
            padding: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--gc-muted, #837b97)',
            }}
          >
            <Bot
              style={{
                width: 36,
                height: 36,
                margin: '0 auto 12px',
                opacity: 0.4,
              }}
            />
            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              Ask me about my past executions, findings, or status.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            {msg.role === 'assistant' && (
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'rgba(73,2,162,.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <Bot
                  style={{
                    width: 14,
                    height: 14,
                    color: 'var(--gc-primary, #4902A2)',
                  }}
                />
              </div>
            )}
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius:
                  msg.role === 'user'
                    ? '12px 12px 4px 12px'
                    : '12px 12px 12px 4px',
                background:
                  msg.role === 'user'
                    ? 'var(--gc-primary, #4902A2)'
                    : '#ffffff',
                color:
                  msg.role === 'user'
                    ? '#ffffff'
                    : 'var(--gc-text, #1d1530)',
                border:
                  msg.role === 'assistant'
                    ? '1px solid var(--gc-border, #e8e3f4)'
                    : 'none',
                fontSize: 13,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.content || (
                isStreaming && i === messages.length - 1 ? (
                  <span style={{ display: 'inline-flex', gap: 4, padding: '2px 0' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gc-primary, #4902A2)', animation: 'pulseTyping 1.2s infinite', animationDelay: '0s' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gc-primary, #4902A2)', animation: 'pulseTyping 1.2s infinite', animationDelay: '0.2s' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gc-primary, #4902A2)', animation: 'pulseTyping 1.2s infinite', animationDelay: '0.4s' }} />
                  </span>
                ) : null
              )}
            </div>
            {msg.role === 'user' && (
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--gc-primary, #4902A2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <User style={{ width: 14, height: 14, color: '#ffffff' }} />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '12px 16px 16px',
          borderTop: '1px solid var(--gc-border, #e8e3f4)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your agent..."
          rows={1}
          style={{
            flex: 1,
            border: '1px solid var(--gc-border, #e8e3f4)',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 13,
            outline: 'none',
            resize: 'none',
            color: 'var(--gc-text, #1d1530)',
            background: '#ffffff',
            lineHeight: 1.5,
            maxHeight: 120,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--gc-primary, #4902A2)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(73,2,162,.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--gc-border, #e8e3f4)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: input.trim() && !isStreaming ? 'var(--gc-primary, #4902A2)' : 'var(--gc-border, #e8e3f4)',
            border: 'none',
            cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          {isStreaming ? (
            <Loader2 style={{ width: 16, height: 16, color: '#ffffff' }} className="animate-spin" />
          ) : (
            <Send style={{ width: 16, height: 16, color: '#ffffff' }} />
          )}
        </button>
      </div>
    </div>
  );
}
