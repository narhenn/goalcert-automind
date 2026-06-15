import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Code2 } from 'lucide-react';

type CodeExecNodeData = {
  label?: string;
  config?: { code?: string };
};

type CodeExecNodeType = Node<CodeExecNodeData, 'code_exec'>;

const ACCENT = '#b45309';

export default function CodeExecNode({ data, selected }: NodeProps<CodeExecNodeType>) {
  const code = data.config?.code;
  const firstLine = code
    ? code.split('\n')[0].length > 30
      ? code.split('\n')[0].slice(0, 30) + '...'
      : code.split('\n')[0]
    : 'No code set';

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
          <Code2 className="w-3.5 h-3.5" style={{ color: ACCENT }} />
        </div>
        <div>
          <div
            className="font-semibold"
            style={{ fontSize: '14px', color: '#1d1530', lineHeight: '1.3' }}
          >
            {data.label || 'Code Exec'}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#837b97',
              marginTop: '1px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {firstLine}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: ACCENT,
          width: '10px',
          height: '10px',
          border: '2px solid #fff',
          boxShadow: `0 0 0 1px ${ACCENT}`,
        }}
      />
    </div>
  );
}
