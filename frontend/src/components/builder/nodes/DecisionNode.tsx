import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

type DecisionNodeData = {
  label?: string;
  config?: { left_operand?: string; operator?: string; right_operand?: string };
};

type DecisionNodeType = Node<DecisionNodeData, 'decision'>;

const ACCENT = '#d97706';

export default function DecisionNode({ data, selected }: NodeProps<DecisionNodeType>) {
  const condition = data.config?.left_operand && data.config?.operator
    ? `${data.config.left_operand} ${data.config.operator} ${data.config.right_operand || '?'}`
    : 'If / Else';

  return (
    <div
      style={{
        background: '#fff',
        border: selected ? `2px solid ${ACCENT}` : '1px solid #e8e3f4',
        borderRadius: '12px',
        borderTop: `3px solid ${ACCENT}`,
        minWidth: '200px',
        boxShadow: selected
          ? `0 0 0 3px ${ACCENT}22, 0 2px 8px rgba(50,0,128,.09)`
          : '0 1px 4px rgba(50,0,128,.06)',
        padding: '12px 16px',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: ACCENT,
          width: '10px',
          height: '10px',
          border: '2px solid #fff',
          boxShadow: `0 0 0 1px ${ACCENT}`,
        }}
      />
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${ACCENT}14` }}
        >
          <GitBranch className="w-3.5 h-3.5" style={{ color: ACCENT }} />
        </div>
        <div>
          <div
            className="font-semibold"
            style={{ fontSize: '14px', color: '#1d1530', lineHeight: '1.3' }}
          >
            {data.label || 'Decision'}
          </div>
          <div style={{ fontSize: '11px', color: '#837b97', marginTop: '1px' }}>
            {condition}
          </div>
        </div>
      </div>
      {/* Two source handles: true on bottom-left, false on bottom-right */}
      <div
        className="flex justify-between mt-2 font-medium px-1"
        style={{ fontSize: '10px', color: '#837b97' }}
      >
        <span style={{ color: '#16a34a' }}>True</span>
        <span style={{ color: '#e11d48' }}>False</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{
          background: '#16a34a',
          width: '10px',
          height: '10px',
          border: '2px solid #fff',
          boxShadow: '0 0 0 1px #16a34a',
          left: '25%',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{
          background: '#e11d48',
          width: '10px',
          height: '10px',
          border: '2px solid #fff',
          boxShadow: '0 0 0 1px #e11d48',
          left: '75%',
        }}
      />
    </div>
  );
}
