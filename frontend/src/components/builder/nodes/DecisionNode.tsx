import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

type DecisionNodeData = {
  label?: string;
  config?: { left_operand?: string; operator?: string; right_operand?: string };
};

type DecisionNodeType = Node<DecisionNodeData, 'decision'>;

export default function DecisionNode({ data, selected }: NodeProps<DecisionNodeType>) {
  const condition = data.config?.left_operand && data.config?.operator
    ? `${data.config.left_operand} ${data.config.operator} ${data.config.right_operand || '?'}`
    : null;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[200px] bg-orange-50 ${
        selected ? 'border-orange-500 shadow-md' : 'border-orange-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-orange-500 !w-3 !h-3"
      />
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-orange-600" />
        <div>
          <div className="text-sm font-semibold text-orange-900">
            {data.label || 'Decision'}
          </div>
          <div className="text-xs text-orange-600">
            {condition || 'Decision'}
          </div>
        </div>
      </div>
      {/* Two source handles: true on bottom-left, false on bottom-right */}
      <div className="flex justify-between mt-2 text-[10px] text-orange-500 font-medium px-1">
        <span>True</span>
        <span>False</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-green-500 !w-3 !h-3"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500 !w-3 !h-3"
        style={{ left: '75%' }}
      />
    </div>
  );
}
