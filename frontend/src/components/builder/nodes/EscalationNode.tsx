import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

type EscalationNodeData = {
  label?: string;
  config?: { recipient_email?: string };
};

type EscalationNodeType = Node<EscalationNodeData, 'escalation'>;

export default function EscalationNode({ data, selected }: NodeProps<EscalationNodeType>) {
  const email = data.config?.recipient_email;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[180px] bg-red-50 ${
        selected ? 'border-red-500 shadow-md' : 'border-red-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !w-3 !h-3"
      />
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <div>
          <div className="text-sm font-semibold text-red-900">
            {data.label || 'Escalation'}
          </div>
          <div className="text-xs text-red-600">
            {email || 'Escalation'}
          </div>
        </div>
      </div>
    </div>
  );
}
