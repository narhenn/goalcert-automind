import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Clock } from 'lucide-react';

type TriggerNodeData = {
  label?: string;
  config?: { frequency?: string };
};

type TriggerNodeType = Node<TriggerNodeData, 'trigger'>;

export default function TriggerNode({ data, selected }: NodeProps<TriggerNodeType>) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[180px] bg-blue-50 ${
        selected ? 'border-blue-500 shadow-md' : 'border-blue-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <div>
          <div className="text-sm font-semibold text-blue-900">
            {data.label || 'Trigger'}
          </div>
          <div className="text-xs text-blue-600">Trigger</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
}
