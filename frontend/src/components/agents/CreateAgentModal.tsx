import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Briefcase, PenTool, Mail, Users } from 'lucide-react';
import { useCreateAgent, useTemplates } from '../../hooks/useAgents';
import { cn } from '../../lib/utils';
import type { AgentTemplate } from '../../types';

const agentTypes = [
  { value: 'sales', label: 'Sales', icon: Briefcase, color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'marketing', label: 'Marketing', icon: PenTool, color: 'border-purple-500 bg-purple-50 text-purple-700' },
  { value: 'support', label: 'Support', icon: Mail, color: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'custom', label: 'Custom', icon: Users, color: 'border-orange-500 bg-orange-50 text-orange-700' },
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

  const navigate = useNavigate();
  const createAgent = useCreateAgent();
  const { data: templates } = useTemplates();

  const filteredTemplates = templates?.filter((t) => t.type === type) || [];

  if (!isOpen) return null;

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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Create New Agent</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="agent-name" className="block text-sm font-medium text-slate-700 mb-1">
              Agent Name
            </label>
            <input
              id="agent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Lead Follow-up Bot"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="agent-desc" className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="agent-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="What does this agent do?"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Agent Type</label>
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
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors text-left',
                      isSelected ? t.color : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Selection */}
          {filteredTemplates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
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
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-lg border-2 text-sm transition-colors',
                      selectedTemplate === template.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <p className="font-medium">{template.name}</p>
                    {template.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(undefined)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg border-2 border-dashed text-sm transition-colors',
                    !selectedTemplate
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  )}
                >
                  Start from scratch
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAgent.isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createAgent.isPending ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
