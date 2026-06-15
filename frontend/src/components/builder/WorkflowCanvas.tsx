import { useCallback, useEffect, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';

import TriggerNode from './nodes/TriggerNode';
import AIActionNode from './nodes/AIActionNode';
import IntegrationNode from './nodes/IntegrationNode';
import DecisionNode from './nodes/DecisionNode';
import EscalationNode from './nodes/EscalationNode';
import WebSearchNode from './nodes/WebSearchNode';
import CodeExecNode from './nodes/CodeExecNode';
import { useWorkflow, useSaveWorkflow, useDeployWorkflow } from '../../hooks/useWorkflow';
import { useAgent } from '../../hooks/useAgents';
import { useTriggerExecution } from '../../hooks/useExecutions';
import { useBuilderStore } from '../../stores/builderStore';
import { ArrowLeft, Check, Loader2, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Must be defined OUTSIDE the component for stable reference
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  ai_action: AIActionNode,
  integration: IntegrationNode,
  decision: DecisionNode,
  escalation: EscalationNode,
  web_search: WebSearchNode,
  code_exec: CodeExecNode,
};

const defaultConfigs: Record<string, Record<string, unknown>> = {
  trigger: { frequency: 'manual' },
  ai_action: { prompt: '', model: 'gpt-4o-mini', max_tokens: 1024, temperature: 0.7 },
  integration: { service: 'email', action: 'send' },
  decision: { left_operand: '', operator: '==', right_operand: '' },
  escalation: { recipient_email: '', message_template: '' },
  web_search: { query: '', max_results: 5, output_variable: 'search_results' },
  code_exec: { code: '', timeout: 10, output_variable: 'code_result' },
};

const defaultLabels: Record<string, string> = {
  trigger: 'Trigger',
  ai_action: 'AI Action',
  integration: 'Integration',
  decision: 'Decision',
  escalation: 'Escalation',
  web_search: 'Web Search',
  code_exec: 'Code Exec',
};

let nodeIdCounter = 0;
function getNodeId() {
  return `node_${Date.now()}_${nodeIdCounter++}`;
}

interface WorkflowCanvasProps {
  agentId: string;
  onUpdateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: Parameters<typeof ReactFlow>[0]['onNodesChange'];
  onEdgesChange: Parameters<typeof ReactFlow>[0]['onEdgesChange'];
}

export default function WorkflowCanvas({
  agentId,
  onUpdateNodeData: _onUpdateNodeData,
  nodes,
  edges,
  setNodes,
  setEdges,
  onNodesChange,
  onEdgesChange,
}: WorkflowCanvasProps) {
  const navigate = useNavigate();
  const { screenToFlowPosition } = useReactFlow();
  const { data: agent } = useAgent(agentId);
  const { data: workflow, isLoading } = useWorkflow(agentId);
  const saveWorkflow = useSaveWorkflow(agentId);
  const deployWorkflow = useDeployWorkflow(agentId);
  void useTriggerExecution(agentId); // Run button planned
  const setSelectedNode = useBuilderStore((s) => s.setSelectedNode);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const setDirty = useBuilderStore((s) => s.setDirty);

  const hasLoadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load workflow from API on mount
  useEffect(() => {
    if (workflow && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      if (workflow.definition?.nodes) {
        setNodes(workflow.definition.nodes);
      }
      if (workflow.definition?.edges) {
        setEdges(workflow.definition.edges);
      }
    }
  }, [workflow, setNodes, setEdges]);

  // Auto-save with 3 second debounce
  useEffect(() => {
    if (!isDirty || !hasLoadedRef.current) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const definition = { nodes, edges };
      saveWorkflow.mutate(definition, {
        onSuccess: () => setDirty(false),
      });
    }, 3000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [isDirty, nodes, edges, saveWorkflow, setDirty]);

  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange?.(changes);
      setDirty(true);
    },
    [onNodesChange, setDirty],
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      onEdgesChange?.(changes);
      setDirty(true);
    },
    [onEdgesChange, setDirty],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
      setDirty(true);
    },
    [setEdges, setDirty],
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Drag and drop from sidebar
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getNodeId(),
        type,
        position,
        data: {
          label: defaultLabels[type] || type,
          config: { ...defaultConfigs[type] },
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setDirty(true);
    },
    [screenToFlowPosition, setNodes, setDirty],
  );


  const handleDeploy = useCallback(() => {
    deployWorkflow.mutate();
  }, [deployWorkflow]);

  const handleManualSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    const definition = { nodes, edges };
    saveWorkflow.mutate(definition, {
      onSuccess: () => setDirty(false),
    });
  }, [nodes, edges, saveWorkflow, setDirty]);

  // Save status text
  const saveStatus = saveWorkflow.isPending
    ? 'Saving...'
    : isDirty
      ? 'Unsaved changes'
      : 'Saved';

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#f3f0f9' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#837b97' }} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{
          height: '56px',
          background: '#fff',
          borderBottom: '1px solid #e8e3f4',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/agents/${agentId}`)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#837b97' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f6f4fc';
              e.currentTarget.style.color = '#4902A2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#837b97';
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold" style={{ fontSize: '14px', color: '#1d1530' }}>
            {agent?.name || 'Workflow'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <span
            className="flex items-center gap-1"
            style={{
              fontSize: '12px',
              color: saveWorkflow.isPending || isDirty ? '#d97706' : '#16a34a',
            }}
          >
            {!saveWorkflow.isPending && !isDirty && <Check className="w-3 h-3" />}
            {saveWorkflow.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            {saveStatus}
          </span>

          {/* Save button - ghost style */}
          <button
            onClick={handleManualSave}
            disabled={saveWorkflow.isPending || !isDirty}
            className="font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '11px',
              background: '#f6f4fc',
              color: '#443a5e',
              border: '1px solid #e8e3f4',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = '#ede5ff';
                e.currentTarget.style.borderColor = '#4902A2';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f6f4fc';
              e.currentTarget.style.borderColor = '#e8e3f4';
            }}
          >
            Save
          </button>

          {/* Deploy button - gc-primary */}
          <button
            onClick={handleDeploy}
            disabled={deployWorkflow.isPending || isDirty}
            className="font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '11px',
              background: '#4902A2',
              color: '#fff',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = '#3a0182';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4902A2';
            }}
          >
            {deployWorkflow.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Rocket className="w-3 h-3" />
            )}
            Deploy
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          proOptions={{ hideAttribution: true }}
          style={{ background: '#f3f0f9' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#dcd5ec" />
          <Controls
            style={{
              background: '#fff',
              border: '1px solid #e8e3f4',
              borderRadius: '11px',
              boxShadow: '0 2px 8px rgba(50,0,128,.06)',
            }}
          />
          <MiniMap
            style={{
              background: '#fff',
              border: '1px solid #e8e3f4',
              borderRadius: '11px',
              boxShadow: '0 2px 8px rgba(50,0,128,.06)',
            }}
            nodeStrokeWidth={3}
            nodeColor="#4902A2"
            zoomable
            pannable
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export { useNodesState, useEdgesState };
