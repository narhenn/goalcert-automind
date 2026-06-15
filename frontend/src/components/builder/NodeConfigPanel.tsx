import { useBuilderStore } from '../../stores/builderStore';
import { X } from 'lucide-react';
import type { Node } from '@xyflow/react';

interface NodeConfigPanelProps {
  nodes: Node[];
  onUpdateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #e8e3f4',
  borderRadius: '10px',
  padding: '7px 12px',
  fontSize: '13px',
  outline: 'none',
  color: '#1d1530',
  background: '#fff',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#443a5e',
  marginBottom: '4px',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'auto' as const,
};

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
    <div
      className="w-80 flex flex-col h-full overflow-hidden"
      style={{ background: '#fff', borderLeft: '1px solid #e8e3f4' }}
    >
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #e8e3f4' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: '#1d1530' }}>
          Node Configuration
        </h2>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded-lg transition-colors"
          style={{ color: '#837b97' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f6f4fc';
            e.currentTarget.style.color = '#4902A2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#837b97';
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Common: Label */}
        <div>
          <label style={labelStyle}>Label</label>
          <input
            type="text"
            value={(nodeData.label as string) || ''}
            onChange={(e) => updateLabel(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#4902A2';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(73,2,162,.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e8e3f4';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ height: '1px', background: '#e8e3f4' }} />

        {node.type === 'trigger' && <TriggerConfigForm config={config} updateConfig={updateConfig} />}
        {node.type === 'ai_action' && <AIActionConfigForm config={config} updateConfig={updateConfig} />}
        {node.type === 'integration' && <IntegrationConfigForm config={config} updateConfig={updateConfig} />}
        {node.type === 'decision' && <DecisionConfigForm config={config} updateConfig={updateConfig} />}
        {node.type === 'escalation' && <EscalationConfigForm config={config} updateConfig={updateConfig} />}
        {node.type === 'web_search' && <WebSearchConfigForm config={config} updateConfig={updateConfig} />}
      </div>
    </div>
  );
}

// --- Sub-forms ---

interface ConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
}

function GcInput({ value, onChange, placeholder, type = 'text', mono = false }: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        ...inputStyle,
        fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#4902A2';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(73,2,162,.08)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e8e3f4';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function GcSelect({ value, onChange, children }: {
  value: string;
  onChange: (val: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#4902A2';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(73,2,162,.08)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e8e3f4';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
    </select>
  );
}

function GcTextarea({ value, onChange, placeholder, rows = 4 }: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, resize: 'vertical' as const }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#4902A2';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(73,2,162,.08)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e8e3f4';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function TriggerConfigForm({ config, updateConfig }: ConfigFormProps) {
  const frequency = (config.frequency as string) || 'manual';

  return (
    <>
      <div>
        <label style={labelStyle}>Frequency</label>
        <GcSelect value={frequency} onChange={(v) => updateConfig({ frequency: v })}>
          <option value="manual">Manual</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom (cron)</option>
        </GcSelect>
      </div>
      {frequency === 'custom' && (
        <div>
          <label style={labelStyle}>Cron Expression</label>
          <GcInput
            value={(config.cron as string) || ''}
            onChange={(v) => updateConfig({ cron: v })}
            placeholder="0 9 * * *"
            mono
          />
        </div>
      )}
      <div>
        <label style={labelStyle}>Timezone</label>
        <GcSelect
          value={(config.timezone as string) || 'UTC'}
          onChange={(v) => updateConfig({ timezone: v })}
        >
          <option value="UTC">UTC</option>
          <option value="US/Eastern">US/Eastern</option>
          <option value="US/Central">US/Central</option>
          <option value="US/Pacific">US/Pacific</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Asia/Singapore">Asia/Singapore</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
        </GcSelect>
      </div>
    </>
  );
}

function AIActionConfigForm({ config, updateConfig }: ConfigFormProps) {
  return (
    <>
      <div>
        <label style={labelStyle}>Prompt</label>
        <GcTextarea
          rows={5}
          value={(config.prompt as string) || ''}
          onChange={(v) => updateConfig({ prompt: v })}
          placeholder="You are a helpful assistant..."
        />
      </div>
      <div>
        <label style={labelStyle}>Model</label>
        <GcSelect
          value={(config.model as string) || 'gpt-4o-mini'}
          onChange={(v) => updateConfig({ model: v })}
        >
          <optgroup label="OpenAI">
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini (fast & cheap)</option>
            <option value="gpt-4.1">GPT-4.1</option>
            <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
          </optgroup>
          <optgroup label="Anthropic">
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
          </optgroup>
        </GcSelect>
      </div>
      <div>
        <label style={labelStyle}>
          Temperature: {((config.temperature as number) ?? 0.7).toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={(config.temperature as number) ?? 0.7}
          onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
          className="w-full"
          style={{ accentColor: '#4902A2' }}
        />
      </div>
      <div>
        <label style={labelStyle}>Max Tokens</label>
        <input
          type="number"
          value={(config.max_tokens as number) ?? 1024}
          onChange={(e) => updateConfig({ max_tokens: parseInt(e.target.value, 10) || 1024 })}
          min={1}
          max={8192}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#4902A2';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(73,2,162,.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e8e3f4';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
      <div>
        <label style={labelStyle}>Output Variable</label>
        <GcInput
          value={(config.output_variable as string) || ''}
          onChange={(v) => updateConfig({ output_variable: v })}
          placeholder="result"
          mono
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
        <label style={labelStyle}>Service</label>
        <GcSelect value={service} onChange={(v) => updateConfig({ service: v })}>
          <option value="email">Email</option>
          <option value="slack">Slack</option>
        </GcSelect>
      </div>
      {service === 'email' && (
        <>
          <div>
            <label style={labelStyle}>Recipients</label>
            <GcInput
              value={(config.recipients as string) || ''}
              onChange={(v) => updateConfig({ recipients: v })}
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Subject</label>
            <GcInput
              value={(config.subject as string) || ''}
              onChange={(v) => updateConfig({ subject: v })}
              placeholder="Email subject"
            />
          </div>
          <div>
            <label style={labelStyle}>Body</label>
            <GcTextarea
              value={(config.body as string) || ''}
              onChange={(v) => updateConfig({ body: v })}
              placeholder="Email body..."
            />
          </div>
        </>
      )}
      {service === 'slack' && (
        <>
          <div>
            <label style={labelStyle}>Channel</label>
            <GcInput
              value={(config.channel as string) || ''}
              onChange={(v) => updateConfig({ channel: v })}
              placeholder="#general"
            />
          </div>
          <div>
            <label style={labelStyle}>Message</label>
            <GcTextarea
              value={(config.message as string) || ''}
              onChange={(v) => updateConfig({ message: v })}
              placeholder="Slack message..."
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
        <label style={labelStyle}>Left Operand</label>
        <GcInput
          value={(config.left_operand as string) || ''}
          onChange={(v) => updateConfig({ left_operand: v })}
          placeholder="{variable_name}"
          mono
        />
      </div>
      <div>
        <label style={labelStyle}>Operator</label>
        <GcSelect
          value={(config.operator as string) || '=='}
          onChange={(v) => updateConfig({ operator: v })}
        >
          <option value="==">== (equals)</option>
          <option value="!=">!= (not equals)</option>
          <option value=">">{'>'} (greater than)</option>
          <option value="<">{'<'} (less than)</option>
          <option value=">=">{'>'} = (greater or equal)</option>
          <option value="<=">{'<'}= (less or equal)</option>
          <option value="contains">contains</option>
        </GcSelect>
      </div>
      <div>
        <label style={labelStyle}>Right Operand</label>
        <GcInput
          value={(config.right_operand as string) || ''}
          onChange={(v) => updateConfig({ right_operand: v })}
          placeholder="value"
          mono
        />
      </div>
    </>
  );
}

function EscalationConfigForm({ config, updateConfig }: ConfigFormProps) {
  return (
    <>
      <div>
        <label style={labelStyle}>Recipient Email</label>
        <GcInput
          value={(config.recipient_email as string) || ''}
          onChange={(v) => updateConfig({ recipient_email: v })}
          placeholder="manager@example.com"
          type="email"
        />
      </div>
      <div>
        <label style={labelStyle}>Message Template</label>
        <GcTextarea
          value={(config.message_template as string) || ''}
          onChange={(v) => updateConfig({ message_template: v })}
          placeholder="Alert: {reason}..."
        />
      </div>
    </>
  );
}

function WebSearchConfigForm({ config, updateConfig }: ConfigFormProps) {
  return (
    <>
      <div>
        <label style={labelStyle}>Search Query</label>
        <GcTextarea
          rows={3}
          value={(config.query as string) || ''}
          onChange={(v) => updateConfig({ query: v })}
          placeholder="Search for {topic}..."
        />
        <p style={{ fontSize: '11px', color: '#837b97', marginTop: '4px' }}>
          Use {'{'} variable {'}'} placeholders for dynamic queries
        </p>
      </div>
      <div>
        <label style={labelStyle}>Max Results</label>
        <input
          type="number"
          value={(config.max_results as number) ?? 5}
          onChange={(e) => updateConfig({ max_results: parseInt(e.target.value, 10) || 5 })}
          min={1}
          max={20}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#4902A2';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(73,2,162,.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e8e3f4';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
      <div>
        <label style={labelStyle}>Output Variable</label>
        <GcInput
          value={(config.output_variable as string) || ''}
          onChange={(v) => updateConfig({ output_variable: v })}
          placeholder="search_results"
          mono
        />
      </div>
    </>
  );
}
