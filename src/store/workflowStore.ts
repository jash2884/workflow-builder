import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { NodeData, NodeType, WorkflowRun, NODE_CONFIGS } from '@/types/workflow';

interface WorkflowState {
  // Nodes and edges
  nodes: Node<NodeData>[];
  edges: Edge[];
  
  // Selected node
  selectedNodeId: string | null;
  
  // History
  workflowRuns: WorkflowRun[];
  
  // UI state
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  
  // Actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  
  setNodeStatus: (nodeId: string, status: NodeData['status'], error?: string) => void;
  
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  
  // Workflow actions
  runWorkflow: () => Promise<void>;
  runNode: (nodeId: string) => Promise<void>;
  
  // Clear
  clearWorkflow: () => void;
}

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowRuns: [],
  leftSidebarOpen: true,
  rightSidebarOpen: true,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    const newEdge = {
      ...connection,
      animated: true,
      style: { strokeWidth: 2 },
    };
    set({
      edges: addEdge(newEdge, get().edges),
    });
    
    // Update connected inputs on target node
    if (connection.target && connection.targetHandle) {
      const { nodes } = get();
      const targetNode = nodes.find(n => n.id === connection.target);
      if (targetNode) {
        const connectedInputs = [
          ...(targetNode.data.connectedInputs || []),
          connection.targetHandle,
        ];
        get().updateNodeData(connection.target, { connectedInputs });
      }
    }
  },

  addNode: (type: NodeType, position: { x: number; y: number }) => {
    const config = NODE_CONFIGS[type];
    const newNode: Node<NodeData> = {
      id: getNodeId(),
      type: 'workflow',
      position,
      data: {
        label: config.label,
        type,
        status: 'idle',
        connectedInputs: [],
        // Default values
        ...(type === 'crop' && {
          xPercent: 0,
          yPercent: 0,
          widthPercent: 100,
          heightPercent: 100,
        }),
        ...(type === 'frame' && {
          timestamp: '0',
        }),
        ...(type === 'llm' && {
          model: 'gemini-1.5-flash',
        }),
      },
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },

  updateNodeData: (nodeId: string, data: Partial<NodeData>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    });
  },

  deleteNode: (nodeId: string) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  setNodeStatus: (nodeId: string, status: NodeData['status'], error?: string) => {
    get().updateNodeData(nodeId, { status, error });
  },

  toggleLeftSidebar: () => {
    set({ leftSidebarOpen: !get().leftSidebarOpen });
  },

  toggleRightSidebar: () => {
    set({ rightSidebarOpen: !get().rightSidebarOpen });
  },

  runWorkflow: async () => {
    const { nodes } = get();
    
    // Set all nodes to running
    nodes.forEach((node) => {
      get().setNodeStatus(node.id, 'running');
    });

    // Simulate execution with delays
    for (const node of nodes) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      get().setNodeStatus(node.id, 'success');
    }
  },

  runNode: async (nodeId: string) => {
    get().setNodeStatus(nodeId, 'running');
    
    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Random success/error for demo
    const success = Math.random() > 0.2;
    if (success) {
      get().setNodeStatus(nodeId, 'success');
      
      // Set demo output for LLM nodes
      const node = get().nodes.find(n => n.id === nodeId);
      if (node?.data.type === 'llm') {
        get().updateNodeData(nodeId, {
          output: 'This is a sample LLM response. In production, this would be the actual output from the Gemini API.',
        });
      }
    } else {
      get().setNodeStatus(nodeId, 'error', 'Execution failed');
    }
  },

  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
    });
  },
}));
