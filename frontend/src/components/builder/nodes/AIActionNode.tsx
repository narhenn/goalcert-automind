import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Brain } from 'lucide-react';

type AIActionNodeData = {
  label?: string;
  config?: { model?: string };
};

type AIActionNodeType = Node<AIActionNodeData, 'ai_action'>;

export default function AIActionNode({ data, selected }: NodeProps<AIActionNodeType>) {
  const modelName = data.config?.model;
  const shortModel = modelName
    ? modelName.replace('claude-', '').split('-').slice(0, 2).join('-')
    : null;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[180px] bg-purple-50 ${
        selected ? 'border-purple-500 shadow-md' : 'border-purple-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-3 !h-3"
      />
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-600" />
        <div>
          <div className="text-sm font-semibold text-purple-900">
            {data.label || 'AI Action'}
          </div>
          <div className="text-xs text-purple-600">
            AI Action{shortModel ? ` - ${shortModel}` : ''}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !w-3 !h-3"
      />
    </div>
  );
}
