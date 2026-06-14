import { useState } from 'react';
import { Mail, MessageSquare, Plug, Loader2 } from 'lucide-react';
import { useIntegrations, useConnectIntegration, useDisconnectIntegration } from '../hooks/useIntegrations';
import type { Integration } from '../types';

interface ServiceDefinition {
  service: string;
  name: string;
  description: string;
  icon: typeof Mail;
  configFields: { key: string; label: string; placeholder: string; type: string }[];
}

const SERVICES: ServiceDefinition[] = [
  {
    service: 'resend',
    name: 'Email (Resend)',
    description: 'Send emails from your agents. Get a free API key at resend.com',
    icon: Mail,
    configFields: [
      { key: 'api_key', label: 'API Key', placeholder: 're_xxxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
  {
    service: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels',
    icon: MessageSquare,
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...', type: 'text' },
    ],
  },
];

function IntegrationCard({
  serviceDef,
  integration,
}: {
  serviceDef: ServiceDefinition;
  integration: Integration | undefined;
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const connectMutation = useConnectIntegration();
  const disconnectMutation = useDisconnectIntegration();

  const isConnected = integration?.status === 'active';
  const Icon = serviceDef.icon;

  const handleConnect = () => {
    setIsConnecting(true);
    setConfigValues({});
  };

  const handleSave = async () => {
    const allFilled = serviceDef.configFields.every((f) => configValues[f.key]?.trim());
    if (!allFilled) return;

    await connectMutation.mutateAsync({
      service: serviceDef.service,
      config: configValues,
    });
    setIsConnecting(false);
    setConfigValues({});
  };

  const handleDisconnect = async () => {
    if (!integration) return;
    await disconnectMutation.mutateAsync(integration.id);
    setIsConfirmingDisconnect(false);
  };

  const getMaskedValue = (key: string, value: string): string => {
    if (!value) return '';
    if (key === 'api_key') {
      if (value.length <= 4) return '****';
      return '****' + value.slice(-4);
    }
    if (key === 'webhook_url') {
      try {
        const url = new URL(value);
        return url.origin + '/****';
      } catch {
        return '****';
      }
    }
    return '****';
  };

  return (
    <div style={{
      background: 'var(--gc-card)',
      border: '1px solid var(--gc-border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div className="flex items-start justify-between" style={{ marginBottom: 16 }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'var(--gc-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon style={{ width: 20, height: 20, color: 'var(--gc-primary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)' }}>{serviceDef.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--gc-muted)' }}>{serviceDef.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={isConnected ? 'pulse-dot' : ''} style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isConnected ? 'var(--gc-green)' : 'var(--gc-border2)',
              display: 'inline-block',
            }} />
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: isConnected ? 'var(--gc-green)' : 'var(--gc-muted)',
            }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Connected state */}
        {isConnected && integration && !isConfirmingDisconnect && (
          <div className="space-y-3">
            {serviceDef.configFields.map((field) => (
              <div key={field.key} className="flex items-center justify-between" style={{
                background: 'var(--gc-soft)',
                borderRadius: 10,
                padding: '8px 14px',
              }}>
                <span style={{ fontSize: 12, color: 'var(--gc-muted)' }}>{field.label}</span>
                <code style={{ fontSize: 12, color: 'var(--gc-text2)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {getMaskedValue(field.key, integration.config[field.key] as string || '')}
                </code>
              </div>
            ))}
            <button
              onClick={() => setIsConfirmingDisconnect(true)}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '9px 16px',
                borderRadius: 11,
                border: 'none',
                background: 'rgba(225,29,72,.08)',
                color: 'var(--gc-red)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Disconnect confirmation */}
        {isConfirmingDisconnect && (
          <div style={{
            background: 'rgba(225,29,72,.06)',
            border: '1px solid rgba(225,29,72,.15)',
            borderRadius: 12,
            padding: 16,
          }}>
            <p style={{ fontSize: 13, color: 'var(--gc-red)', marginBottom: 12 }}>
              Are you sure? Agents using this integration will stop working.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 11,
                  border: 'none',
                  background: 'var(--gc-red)',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: disconnectMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: disconnectMutation.isPending ? 0.6 : 1,
                }}
              >
                {disconnectMutation.isPending ? (
                  <Loader2 style={{ width: 14, height: 14, margin: '0 auto' }} className="animate-spin" />
                ) : (
                  'Yes, disconnect'
                )}
              </button>
              <button
                onClick={() => setIsConfirmingDisconnect(false)}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 11,
                  border: '1px solid var(--gc-border)',
                  background: 'var(--gc-surface)',
                  color: 'var(--gc-text2)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Not connected */}
        {!isConnected && !isConnecting && (
          <button
            onClick={handleConnect}
            style={{
              width: '100%',
              marginTop: 8,
              padding: '10px 16px',
              borderRadius: 11,
              border: 'none',
              background: 'var(--gc-primary)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#5a16b8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#4902A2')}
          >
            Connect
          </button>
        )}

        {/* Connect form */}
        {!isConnected && isConnecting && (
          <div className="space-y-3" style={{ marginTop: 8 }}>
            {serviceDef.configFields.map((field) => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 4 }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={configValues[field.key] || ''}
                  onChange={(e) =>
                    setConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    border: '1px solid var(--gc-border2)',
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 13,
                    color: 'var(--gc-text)',
                    outline: 'none',
                    background: 'var(--gc-surface)',
                    transition: 'border-color .15s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#4902A2')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--gc-border2)')}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={
                  connectMutation.isPending ||
                  !serviceDef.configFields.every((f) => configValues[f.key]?.trim())
                }
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 11,
                  border: 'none',
                  background: 'var(--gc-primary)',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: (connectMutation.isPending || !serviceDef.configFields.every((f) => configValues[f.key]?.trim())) ? 0.6 : 1,
                }}
              >
                {connectMutation.isPending ? (
                  <Loader2 style={{ width: 14, height: 14, margin: '0 auto' }} className="animate-spin" />
                ) : (
                  'Save'
                )}
              </button>
              <button
                onClick={() => {
                  setIsConnecting(false);
                  setConfigValues({});
                }}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 11,
                  border: '1px solid var(--gc-border)',
                  background: 'var(--gc-surface)',
                  color: 'var(--gc-text2)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
            {connectMutation.isError && (
              <p style={{ fontSize: 12, color: 'var(--gc-red)' }}>
                Failed to connect. Please check your credentials and try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const { data: integrations, isLoading } = useIntegrations();

  const getIntegrationForService = (service: string): Integration | undefined => {
    return integrations?.find((i) => i.service === service);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--gc-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Plug style={{ width: 20, height: 20, color: 'var(--gc-primary)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gc-text)' }}>Integrations</h1>
          <p style={{ fontSize: 13, color: 'var(--gc-muted)' }}>Connect your tools to power agent workflows</p>
        </div>
      </div>

      {/* Integration cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', padding: 24 }} className="animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-lg" style={{ background: 'var(--gc-border)' }} />
                <div className="space-y-2">
                  <div className="h-4 rounded w-32" style={{ background: 'var(--gc-border)' }} />
                  <div className="h-3 rounded w-48" style={{ background: 'var(--gc-border)' }} />
                </div>
              </div>
              <div className="h-10 rounded-lg" style={{ background: 'var(--gc-border)' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICES.map((serviceDef) => (
            <IntegrationCard
              key={serviceDef.service}
              serviceDef={serviceDef}
              integration={getIntegrationForService(serviceDef.service)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
