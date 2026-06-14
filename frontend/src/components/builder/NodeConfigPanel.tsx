import { useBuilderStore } from '../../stores/builderStore';
import { X } from 'lucide-react';
import type { Node } from '@xyflow/react';

interface NodeConfigPanelProps {
  nodes: Node[];
  onUpdateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
}

export default function NodeConfigPanel({ nodes, onUpdateNodeData }: NodeConfigPanelProps) {
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const setSelectedNode = useBuilderStore((s) => s.setSelectedNode);

  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const nodeData = node.data as Record<string, unknown>;
  const config = (nodeData.config ?? {}) as Record<string, unknown>;

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdateNodeData(node.id, {
      ...nodeData,
      config: { ...config, ...updates },
    });
  };

  const updateLabel = (label: string) => {
    onUpdateNodeData(node.id, { ...nodeData, label });
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Node Config</h2>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Common: Label */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Label</label>
          <input
            type="text"
            value={(nodeData.label as string) || ''}
            onChange={(e) => updateLabel(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {node.type === 'trigger' && <TriggerConfigForm config={config} updateConfig={updateConfig} />}
        {node.type === 'ai_action' && <AIActionConfigForm config={config} updateConfig={updateConfig} />}
        {node.type === 'integration' && <IntegrationConfigForm config={config} updateConfig={updateConfig} />}
        {node.type === 'decision' && <DecisionConfigForm config={config} updateConfig={updateConfig} />}
        {node.type === 'escalation' && <EscalationConfigForm config={config} updateConfig={updateConfig} />}
      </div>
    </div>
  );
}

// --- Sub-forms ---

interface ConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

function TriggerConfigForm({ config, updateConfig }: ConfigFormProps) {
  const frequency = (config.frequency as string) || 'manual';

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Frequency</label>
        <select
          value={frequency}
          onChange={(e) => updateConfig({ frequency: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="manual">Manual</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom (cron)</option>
        </select>
      </div>
      {frequency === 'custom' && (
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Cron Expression</label>
          <input
            type="text"
            value={(config.cron as string) || ''}
            onChange={(e) => updateConfig({ cron: e.target.value })}
            placeholder="0 9 * * *"
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Timezone</label>
        <select
          value={(config.timezone as string) || 'UTC'}
          onChange={(e) => updateConfig({ timezone: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="UTC">UTC</option>
          <option value="US/Eastern">US/Eastern</option>
          <option value="US/Central">US/Central</option>
          <option value="US/Pacific">US/Pacific</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Asia/Singapore">Asia/Singapore</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
        </select>
      </div>
    </>
  );
}

function AIActionConfigForm({ config, updateConfig }: ConfigFormProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Prompt</label>
        <textarea
          rows={5}
          value={(config.prompt as string) || ''}
          onChange={(e) => updateConfig({ prompt: e.target.value })}
          placeholder="You are a helpful assistant..."
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Model</label>
        <select
          value={(config.model as string) || 'claude-sonnet-4-20250514'}
          onChange={(e) => updateConfig({ model: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
          <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Temperature: {((config.temperature as number) ?? 0.7).toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={(config.temperature as number) ?? 0.7}
          onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
          className="w-full accent-indigo-600"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Max Tokens</label>
        <input
          type="number"
          value={(config.max_tokens as number) ?? 1024}
          onChange={(e) => updateConfig({ max_tokens: parseInt(e.target.value, 10) || 1024 })}
          min={1}
          max={8192}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Output Variable</label>
        <input
          type="text"
          value={(config.output_variable as string) || ''}
          onChange={(e) => updateConfig({ output_variable: e.target.value })}
          placeholder="result"
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
    </>
  );
}

function IntegrationConfigForm({ config, updateConfig }: ConfigFormProps) {
  const service = (config.service as string) || 'email';

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Service</label>
        <select
          value={service}
          onChange={(e) => updateConfig({ service: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="email">Email</option>
          <option value="slack">Slack</option>
        </select>
      </div>
      {service === 'email' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Recipients</label>
            <input
              type="text"
              value={(config.recipients as string) || ''}
              onChange={(e) => updateConfig({ recipients: e.target.value })}
              placeholder="user@example.com"
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={(config.subject as string) || ''}
              onChange={(e) => updateConfig({ subject: e.target.value })}
              placeholder="Email subject"
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Body</label>
            <textarea
              rows={4}
              value={(config.body as string) || ''}
              onChange={(e) => updateConfig({ body: e.target.value })}
              placeholder="Email body..."
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
            />
          </div>
        </>
      )}
      {service === 'slack' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Channel</label>
            <input
              type="text"
              value={(config.channel as string) || ''}
              onChange={(e) => updateConfig({ channel: e.target.value })}
              placeholder="#general"
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
            <textarea
              rows={4}
              value={(config.message as string) || ''}
              onChange={(e) => updateConfig({ message: e.target.value })}
              placeholder="Slack message..."
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
            />
          </div>
        </>
      )}
    </>
  );
}

function DecisionConfigForm({ config, updateConfig }: ConfigFormProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Left Operand</label>
        <input
          type="text"
          value={(config.left_operand as string) || ''}
          onChange={(e) => updateConfig({ left_operand: e.target.value })}
          placeholder="{variable_name}"
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Operator</label>
        <select
          value={(config.operator as string) || '=='}
          onChange={(e) => updateConfig({ operator: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="==">== (equals)</option>
          <option value="!=">!= (not equals)</option>
          <option value=">">{'>'} (greater than)</option>
          <option value="<">{'<'} (less than)</option>
          <option value=">=">{'>'} = (greater or equal)</option>
          <option value="<=">{'<'}= (less or equal)</option>
          <option value="contains">contains</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Right Operand</label>
        <input
          type="text"
          value={(config.right_operand as string) || ''}
          onChange={(e) => updateConfig({ right_operand: e.target.value })}
          placeholder="value"
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
    </>
  );
}

function EscalationConfigForm({ config, updateConfig }: ConfigFormProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Recipient Email</label>
        <input
          type="email"
          value={(config.recipient_email as string) || ''}
          onChange={(e) => updateConfig({ recipient_email: e.target.value })}
          placeholder="manager@example.com"
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Message Template</label>
        <textarea
          rows={4}
          value={(config.message_template as string) || ''}
          onChange={(e) => updateConfig({ message_template: e.target.value })}
          placeholder="Alert: {reason}..."
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
        />
      </div>
    </>
  );
}
