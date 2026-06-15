import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Briefcase, PenTool, Mail, Users, Sparkles, Loader2 } from 'lucide-react';
import { useCreateAgent, useGenerateAgent, useTemplates } from '../../hooks/useAgents';
import type { AgentTemplate } from '../../types';

const agentTypes = [
  { value: 'sales', label: 'Sales', icon: Briefcase },
  { value: 'marketing', label: 'Marketing', icon: PenTool },
  { value: 'support', label: 'Support', icon: Mail },
  { value: 'custom', label: 'Custom', icon: Users },
];

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTemplate?: AgentTemplate;
}

export default function CreateAgentModal({ isOpen, onClose, preselectedTemplate }: CreateAgentModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(preselectedTemplate?.type || 'custom');
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(preselectedTemplate?.id);
  const [error, setError] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [aiError, setAiError] = useState('');

  const navigate = useNavigate();
  const createAgent = useCreateAgent();
  const generateAgent = useGenerateAgent();
  const { data: templates } = useTemplates();

  const filteredTemplates = templates?.filter((t) => t.type === type) || [];

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setAiError('');
    if (!aiDescription.trim()) {
      setAiError('Please describe what you want your agent to do');
      return;
    }
    try {
      const result = await generateAgent.mutateAsync(aiDescription.trim());
      onClose();
      navigate(`/agents/${result.id}/builder`);
    } catch (err: any) {
      setAiError(err.response?.data?.detail || 'Failed to generate agent. Try again.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Agent name is required');
      return;
    }

    try {
      const result = await createAgent.mutateAsync({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        template_id: selectedTemplate,
      });
      onClose();
      navigate(`/agents/${result.id}/builder`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create agent');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(29,21,48,.5)' }} onClick={onClose} />

      {/* Modal */}
      <div style={{
        position: 'relative',
        background: 'var(--gc-surface)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: 500,
        margin: '0 16px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Purple gradient top border */}
        <div style={{
          height: 4,
          background: 'var(--gc-grad)',
          borderRadius: '14px 14px 0 0',
        }} />

        {/* Header */}
        <div className="flex items-center justify-between" style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--gc-border)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--gc-text)' }}>Create New Agent</h2>
          <button
            onClick={onClose}
            style={{
              color: 'var(--gc-muted)',
              padding: 4,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* AI Generation Section */}
        <div style={{ padding: '22px 22px 0 22px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(73,2,162,.04), rgba(124,58,237,.06))',
            border: '1px solid rgba(73,2,162,.12)',
            borderRadius: 12,
            padding: 18,
          }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <Sparkles style={{ width: 16, height: 16, color: '#4902A2' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4902A2' }}>
                Describe your agent
              </span>
            </div>
            <textarea
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                border: '1px solid rgba(73,2,162,.15)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--gc-text)',
                outline: 'none',
                background: '#fff',
                resize: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#4902A2')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(73,2,162,.15)')}
              placeholder="e.g., Every morning, search for the latest AI news, summarize the top 5 stories, and email the summary to the team"
              disabled={generateAgent.isPending}
            />
            {aiError && (
              <div style={{
                color: 'var(--gc-red)',
                fontSize: 12,
                marginTop: 8,
              }}>
                {aiError}
              </div>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generateAgent.isPending || !aiDescription.trim()}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '10px 16px',
                borderRadius: 11,
                border: 'none',
                background: 'var(--gc-primary)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: generateAgent.isPending || !aiDescription.trim() ? 'not-allowed' : 'pointer',
                opacity: generateAgent.isPending || !aiDescription.trim() ? 0.6 : 1,
                transition: 'background .15s, opacity .15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {generateAgent.isPending ? (
                <>
                  <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                  Generating workflow...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: 14, height: 14 }} />
                  Generate Agent
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gc-border)' }} />
            <span style={{ fontSize: 11, color: 'var(--gc-muted)', fontWeight: 500 }}>
              Or create manually
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--gc-border)' }} />
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '0 22px 22px 22px' }}>
          {error && (
            <div style={{
              background: 'rgba(225,29,72,.08)',
              color: 'var(--gc-red)',
              fontSize: 13,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(225,29,72,.2)',
              marginBottom: 18,
            }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 6 }}>
              Agent Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid var(--gc-border2)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--gc-text)',
                outline: 'none',
                background: 'var(--gc-surface)',
                transition: 'border-color .15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#4902A2')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--gc-border2)')}
              placeholder="e.g., Lead Follow-up Bot"
              autoFocus
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 6 }}>
              Description <span style={{ color: 'var(--gc-muted)' }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                border: '1px solid var(--gc-border2)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--gc-text)',
                outline: 'none',
                background: 'var(--gc-surface)',
                resize: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#4902A2')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--gc-border2)')}
              placeholder="What does this agent do?"
            />
          </div>

          {/* Type Selection */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 8 }}>
              Agent Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {agentTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setType(t.value);
                      setSelectedTemplate(undefined);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `2px solid ${isSelected ? '#4902A2' : 'var(--gc-border)'}`,
                      background: isSelected ? 'rgba(73,2,162,.06)' : 'var(--gc-surface)',
                      color: isSelected ? '#4902A2' : 'var(--gc-text2)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .15s',
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Selection */}
          {filteredTemplates.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 8 }}>
                Start from a template
              </label>
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() =>
                      setSelectedTemplate(selectedTemplate === template.id ? undefined : template.id)
                    }
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `2px solid ${selectedTemplate === template.id ? '#4902A2' : 'var(--gc-border)'}`,
                      background: selectedTemplate === template.id ? 'rgba(73,2,162,.06)' : 'var(--gc-surface)',
                      color: selectedTemplate === template.id ? '#4902A2' : 'var(--gc-text2)',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    <p style={{ fontWeight: 500 }}>{template.name}</p>
                    {template.description && (
                      <p style={{ fontSize: 11, color: 'var(--gc-muted)', marginTop: 2 }}>{template.description}</p>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(undefined)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `2px dashed ${!selectedTemplate ? '#4902A2' : 'var(--gc-border)'}`,
                    background: !selectedTemplate ? 'rgba(73,2,162,.06)' : 'var(--gc-surface)',
                    color: !selectedTemplate ? '#4902A2' : 'var(--gc-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  Start from scratch
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3" style={{ paddingTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 11,
                border: '1px solid var(--gc-border)',
                background: 'var(--gc-surface)',
                color: 'var(--gc-text2)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background .15s',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAgent.isPending}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 11,
                border: 'none',
                background: 'var(--gc-primary)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: createAgent.isPending ? 'not-allowed' : 'pointer',
                opacity: createAgent.isPending ? 0.6 : 1,
                transition: 'background .15s',
              }}
            >
              {createAgent.isPending ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
