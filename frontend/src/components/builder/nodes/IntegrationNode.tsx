import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Plug } from 'lucide-react';

type IntegrationNodeData = {
  label?: string;
  config?: { service?: string };
};

type IntegrationNodeType = Node<IntegrationNodeData, 'integration'>;

export default function IntegrationNode({ data, selected }: NodeProps<IntegrationNodeType>) {
  const service = data.config?.service;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[180px] bg-green-50 ${
        selected ? 'border-green-500 shadow-md' : 'border-green-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500 !w-3 !h-3"
      />
      <div className="flex items-center gap-2">
        <Plug className="w-4 h-4 text-green-600" />
        <div>
          <div className="text-sm font-semibold text-green-900">
            {data.label || 'Integration'}
          </div>
          <div className="text-xs text-green-600">
            {service ? service.charAt(0).toUpperCase() + service.slice(1) : 'Integration'}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !w-3 !h-3"
      />
    </div>
  );
}
