import { Clock, Brain, Plug, GitBranch, AlertTriangle } from 'lucide-react';
import type { DragEvent } from 'react';

const components = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Start your workflow on a schedule or event',
    icon: Clock,
    bgClass: 'bg-blue-50 hover:bg-blue-100',
    borderClass: 'border-blue-200',
    iconClass: 'text-blue-600',
    textClass: 'text-blue-900',
    descClass: 'text-blue-600',
  },
  {
    type: 'ai_action',
    label: 'AI Action',
    description: 'Run an AI prompt to process or generate data',
    icon: Brain,
    bgClass: 'bg-purple-50 hover:bg-purple-100',
    borderClass: 'border-purple-200',
    iconClass: 'text-purple-600',
    textClass: 'text-purple-900',
    descClass: 'text-purple-600',
  },
  {
    type: 'integration',
    label: 'Integration',
    description: 'Send email, Slack message, or call APIs',
    icon: Plug,
    bgClass: 'bg-green-50 hover:bg-green-100',
    borderClass: 'border-green-200',
    iconClass: 'text-green-600',
    textClass: 'text-green-900',
    descClass: 'text-green-600',
  },
  {
    type: 'decision',
    label: 'Decision',
    description: 'Branch workflow based on a condition',
    icon: GitBranch,
    bgClass: 'bg-orange-50 hover:bg-orange-100',
    borderClass: 'border-orange-200',
    iconClass: 'text-orange-600',
    textClass: 'text-orange-900',
    descClass: 'text-orange-600',
  },
  {
    type: 'escalation',
    label: 'Escalation',
    description: 'Notify a person when human action is needed',
    icon: AlertTriangle,
    bgClass: 'bg-red-50 hover:bg-red-100',
    borderClass: 'border-red-200',
    iconClass: 'text-red-600',
    textClass: 'text-red-900',
    descClass: 'text-red-600',
  },
] as const;

export default function ComponentSidebar() {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-60 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Components</h2>
        <p className="text-xs text-slate-500 mt-1">Drag to canvas to add</p>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto flex-1">
        {components.map((comp) => {
          const Icon = comp.icon;
          return (
            <div
              key={comp.type}
              draggable
              onDragStart={(e) => onDragStart(e, comp.type)}
              className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${comp.bgClass} ${comp.borderClass}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${comp.iconClass}`} />
                <span className={`text-sm font-medium ${comp.textClass}`}>
                  {comp.label}
                </span>
              </div>
              <p className={`text-xs ${comp.descClass}`}>{comp.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
