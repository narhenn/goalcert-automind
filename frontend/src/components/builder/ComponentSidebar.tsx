import { Clock, Brain, Plug, GitBranch, AlertTriangle, Search, Code2 } from 'lucide-react';
import type { DragEvent } from 'react';

const components = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Start your workflow on a schedule or event',
    icon: Clock,
    accent: '#7c3aed',
    bg: '#f5f0ff',
    bgHover: '#ede5ff',
  },
  {
    type: 'ai_action',
    label: 'AI Action',
    description: 'Run an AI prompt to process or generate data',
    icon: Brain,
    accent: '#4902A2',
    bg: '#f3ecfc',
    bgHover: '#ebe0fa',
  },
  {
    type: 'integration',
    label: 'Integration',
    description: 'Send email, Slack message, or call APIs',
    icon: Plug,
    accent: '#0e9aa7',
    bg: '#edfaf9',
    bgHover: '#dff5f4',
  },
  {
    type: 'decision',
    label: 'Decision',
    description: 'Branch workflow based on a condition',
    icon: GitBranch,
    accent: '#d97706',
    bg: '#fef9ed',
    bgHover: '#fef3d9',
  },
  {
    type: 'web_search',
    label: 'Web Search',
    description: 'Search the web for real-time information',
    icon: Search,
    accent: '#0d9488',
    bg: '#f0fdfa',
    bgHover: '#ccfbf1',
  },
  {
    type: 'code_exec',
    label: 'Code Exec',
    description: 'Run Python code in a sandboxed environment',
    icon: Code2,
    accent: '#b45309',
    bg: '#fef9ed',
    bgHover: '#fef3d9',
  },
  {
    type: 'escalation',
    label: 'Escalation',
    description: 'Notify a person when human action is needed',
    icon: AlertTriangle,
    accent: '#e11d48',
    bg: '#fef2f4',
    bgHover: '#fde8ec',
  },
] as const;

export default function ComponentSidebar() {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="w-60 flex flex-col h-full"
      style={{ background: '#fff', borderRight: '1px solid #e8e3f4' }}
    >
      <div className="p-4" style={{ borderBottom: '1px solid #e8e3f4' }}>
        <h2 className="text-sm font-semibold" style={{ color: '#1d1530' }}>
          Components
        </h2>
        <p className="text-xs mt-1" style={{ color: '#837b97' }}>
          Drag to canvas to add
        </p>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto flex-1">
        {components.map((comp) => {
          const Icon = comp.icon;
          return (
            <div
              key={comp.type}
              draggable
              onDragStart={(e) => onDragStart(e, comp.type)}
              className="p-3 cursor-grab active:cursor-grabbing transition-all"
              style={{
                background: comp.bg,
                border: `1px solid #e8e3f4`,
                borderRadius: '11px',
                borderLeft: `3px solid ${comp.accent}`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = comp.bgHover;
                el.style.borderColor = comp.accent;
                el.style.borderLeftColor = comp.accent;
                el.style.boxShadow = `0 2px 8px rgba(50,0,128,.09)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = comp.bg;
                el.style.borderColor = '#e8e3f4';
                el.style.borderLeftColor = comp.accent;
                el.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: `${comp.accent}18` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: comp.accent }} />
                </div>
                <span className="text-sm font-medium" style={{ color: '#1d1530' }}>
                  {comp.label}
                </span>
              </div>
              <p className="text-xs pl-8" style={{ color: '#837b97' }}>
                {comp.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
