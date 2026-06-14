import { useState } from 'react';
import { Briefcase, PenTool, Mail, Users, Plus, CheckCircle } from 'lucide-react';
import { useTemplates } from '../hooks/useAgents';
import CreateAgentModal from '../components/agents/CreateAgentModal';
import type { AgentTemplate } from '../types';

const typeIcons: Record<string, typeof Users> = {
  sales: Briefcase,
  marketing: PenTool,
  support: Mail,
  custom: Users,
};

const typeGradients: Record<string, string> = {
  sales: 'from-blue-500 to-cyan-500',
  marketing: 'from-purple-500 to-pink-500',
  support: 'from-green-500 to-emerald-500',
  custom: 'from-orange-500 to-amber-500',
};

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | undefined>();

  const handleDuplicate = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedTemplate(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Agent Templates</h1>
        <p className="text-sm text-slate-500 mt-1">
          Start with a pre-built template or build from scratch
        </p>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-24 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-9 bg-slate-200 rounded-lg mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => {
            const Icon = typeIcons[template.type] || Users;
            const gradient = typeGradients[template.type] || typeGradients.custom;

            return (
              <div
                key={template.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Colored Header */}
                <div className={`h-24 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-slate-500 mb-3">{template.description}</p>
                  )}

                  {/* Features */}
                  {template.features.length > 0 && (
                    <ul className="space-y-1.5 mb-4">
                      {template.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => handleDuplicate(template)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Duplicate & Configure
                  </button>
                </div>
              </div>
            );
          })}

          {/* Build from Scratch Card */}
          <div
            onClick={() => {
              setSelectedTemplate(undefined);
              setShowCreateModal(true);
            }}
            className="bg-white rounded-lg border-2 border-dashed border-slate-300 overflow-hidden hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer"
          >
            <div className="h-full flex flex-col items-center justify-center py-16 px-5 text-center">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <Plus className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Build from Scratch</h3>
              <p className="text-sm text-slate-500">
                Create a custom agent with your own workflow
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        preselectedTemplate={selectedTemplate}
      />
    </div>
  );
}
