import { useParams } from 'react-router-dom';
import { ReactFlowProvider, useNodesState, useEdgesState } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';

import ComponentSidebar from '../components/builder/ComponentSidebar';
import WorkflowCanvas from '../components/builder/WorkflowCanvas';
import NodeConfigPanel from '../components/builder/NodeConfigPanel';
import { useBuilderStore } from '../stores/builderStore';
import { useCallback } from 'react';

function WorkflowBuilderInner() {
  const { id: agentId } = useParams<{ id: string }>();
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const setDirty = useBuilderStore((s) => s.setDirty);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const handleUpdateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data } : n)),
      );
      setDirty(true);
    },
    [setNodes, setDirty],
  );

  if (!agentId) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ color: '#837b97', background: '#f3f0f9' }}
      >
        No agent ID provided
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: '#f3f0f9' }}>
      {/* Left sidebar */}
      <ComponentSidebar />

      {/* Center canvas */}
      <WorkflowCanvas
        agentId={agentId}
        onUpdateNodeData={handleUpdateNodeData}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />

      {/* Right sidebar - only when node selected */}
      {selectedNodeId && (
        <NodeConfigPanel
          nodes={nodes}
          onUpdateNodeData={handleUpdateNodeData}
        />
      )}
    </div>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}
