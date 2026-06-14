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

const typeBadge: Record<string, { bg: string; color: string }> = {
  sales: { bg: 'rgba(59,130,246,.1)', color: '#2563eb' },
  marketing: { bg: 'rgba(73,2,162,.1)', color: '#4902A2' },
  support: { bg: 'rgba(22,163,74,.1)', color: '#16a34a' },
  custom: { bg: 'rgba(234,88,12,.1)', color: '#ea580c' },
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
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gc-text)' }}>Agent Templates</h1>
        <p style={{ fontSize: 13, color: 'var(--gc-muted)', marginTop: 4 }}>
          Start with a pre-built template or build from scratch
        </p>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--gc-card)', border: '1px solid var(--gc-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }} className="animate-pulse">
              <div className="h-24" style={{ background: 'var(--gc-border)' }} />
              <div style={{ padding: 20 }} className="space-y-3">
                <div className="h-5 rounded w-3/4" style={{ background: 'var(--gc-border)' }} />
                <div className="h-3 rounded w-full" style={{ background: 'var(--gc-border)' }} />
                <div className="h-9 rounded-lg mt-4" style={{ background: 'var(--gc-border)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates?.map((template) => {
            const Icon = typeIcons[template.type] || Users;
            const badge = typeBadge[template.type] || typeBadge.custom;

            return (
              <div
                key={template.id}
                style={{
                  background: 'var(--gc-card)',
                  border: '1px solid var(--gc-border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  transition: 'transform .2s ease, box-shadow .2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Gradient Header */}
                <div style={{
                  height: 96,
                  background: 'var(--gc-grad)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon style={{ width: 28, height: 28, color: '#ffffff' }} />
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: 20 }}>
                  {/* Type badge */}
                  <span style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.8px',
                    background: badge.bg,
                    color: badge.color,
                    padding: '3px 9px',
                    borderRadius: 5,
                    marginBottom: 10,
                  }}>
                    {template.type}
                  </span>

                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 4 }}>{template.name}</h3>
                  {template.description && (
                    <p style={{ fontSize: 12, color: 'var(--gc-muted)', marginBottom: 12 }}>{template.description}</p>
                  )}

                  {/* Features */}
                  {template.features.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {template.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2" style={{ fontSize: 11, color: 'var(--gc-text2)' }}>
                          <CheckCircle style={{ width: 13, height: 13, color: 'var(--gc-green)', marginTop: 1, flexShrink: 0 }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => handleDuplicate(template)}
                    style={{
                      width: '100%',
                      padding: '9px 16px',
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
            style={{
              background: 'var(--gc-card)',
              border: '2px dashed var(--gc-border2)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color .15s, background .15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 20px',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4902A2';
              e.currentTarget.style.background = 'rgba(73,2,162,.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--gc-border2)';
              e.currentTarget.style.background = 'var(--gc-card)';
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'var(--gc-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}>
              <Plus style={{ width: 28, height: 28, color: 'var(--gc-muted)' }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 4 }}>Build from Scratch</h3>
            <p style={{ fontSize: 12, color: 'var(--gc-muted)' }}>
              Create a custom agent with your own workflow
            </p>
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
