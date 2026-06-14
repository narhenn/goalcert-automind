import { useState } from 'react';
import { Mail, MessageSquare, Plug, Loader2 } from 'lucide-react';
import { useIntegrations, useConnectIntegration, useDisconnectIntegration } from '../hooks/useIntegrations';
import type { Integration } from '../types';

interface ServiceDefinition {
  service: string;
  name: string;
  description: string;
  icon: typeof Mail;
  color: string;
  bgColor: string;
  borderColor: string;
  configFields: { key: string; label: string; placeholder: string; type: string }[];
}

const SERVICES: ServiceDefinition[] = [
  {
    service: 'resend',
    name: 'Email (Resend)',
    description: 'Send emails from your agents. Get a free API key at resend.com',
    icon: Mail,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    configFields: [
      { key: 'api_key', label: 'API Key', placeholder: 're_xxxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
  {
    service: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
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
    // Validate all fields are filled
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-lg ${serviceDef.bgColor} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${serviceDef.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{serviceDef.name}</h3>
              <p className="text-sm text-slate-500">{serviceDef.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-300'}`}
            />
            <span className={`text-xs font-medium ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Connected state: show masked config + disconnect */}
        {isConnected && integration && !isConfirmingDisconnect && (
          <div className="space-y-3">
            {serviceDef.configFields.map((field) => (
              <div key={field.key} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-500">{field.label}</span>
                <code className="text-xs text-slate-600 font-mono">
                  {getMaskedValue(field.key, integration.config[field.key] as string || '')}
                </code>
              </div>
            ))}
            <button
              onClick={() => setIsConfirmingDisconnect(true)}
              className="w-full mt-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Disconnect confirmation */}
        {isConfirmingDisconnect && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-3">
              Are you sure? Agents using this integration will stop working.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {disconnectMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Yes, disconnect'
                )}
              </button>
              <button
                onClick={() => setIsConfirmingDisconnect(false)}
                className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Not connected: show connect button or form */}
        {!isConnected && !isConnecting && (
          <button
            onClick={handleConnect}
            className={`w-full mt-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${serviceDef.bgColor} ${serviceDef.color} hover:opacity-80 border ${serviceDef.borderColor}`}
          >
            Connect
          </button>
        )}

        {/* Connect form */}
        {!isConnected && isConnecting && (
          <div className="space-y-3 mt-2">
            {serviceDef.configFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={configValues[field.key] || ''}
                  onChange={(e) =>
                    setConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {connectMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Save'
                )}
              </button>
              <button
                onClick={() => {
                  setIsConnecting(false);
                  setConfigValues({});
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
            {connectMutation.isError && (
              <p className="text-xs text-red-600">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Plug className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
          <p className="text-sm text-slate-500">Connect your tools to power agent workflows</p>
        </div>
      </div>

      {/* Integration cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-slate-200 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-32" />
                  <div className="h-3 bg-slate-200 rounded w-48" />
                </div>
              </div>
              <div className="h-10 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
