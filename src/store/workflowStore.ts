import { create } from "zustand";
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
} from "reactflow";
import {
  NodeData,
  NodeType,
  WorkflowRun,
  NODE_CONFIGS,
} from "@/types/workflow";

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

  setNodeStatus: (
    nodeId: string,
    status: NodeData["status"],
    error?: string,
  ) => void;

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
    // Basic validation: must have source and target
    if (!connection.source || !connection.target) return;

    // Prevent self-connection
    if (connection.source === connection.target) return;

    // Defensive defaults: if a handle id wasn't provided by the UI, try reasonable defaults
    let sourceHandle = connection.sourceHandle;
    let targetHandle = connection.targetHandle;

    if (!sourceHandle) {
      // default to common output id
      sourceHandle = "output";
    }

    if (!targetHandle) {
      // try to infer from the target node's config
      const targetNode = get().nodes.find((n) => n.id === connection.target);
      if (targetNode) {
        const cfg = NODE_CONFIGS[targetNode.data.type];
        targetHandle = cfg.inputs?.[0]?.id || "input";
      } else {
        targetHandle = "input";
      }
    }

    // Build a stable edge id to avoid duplicates
    const edgeId = `${connection.source}:${sourceHandle}->${connection.target}:${targetHandle}`;

    // Prevent duplicate edges
    const existing = get().edges.find((e) => e.id === edgeId);
    if (existing) return;

    const newEdge: Edge = {
      id: edgeId,
      source: connection.source,
      target: connection.target,
      sourceHandle,
      targetHandle,
      animated: true,
      style: { strokeWidth: 2 },
    };

    // Debug log to help diagnose attachment issues
    try {
      // eslint-disable-next-line no-console
      console.debug("[onConnect] adding edge", {
        connection,
        newEdge,
        existingEdges: get().edges,
      });
    } catch {}

    set({
      edges: addEdge(newEdge, get().edges),
    });

    // Update connected inputs on target node (avoid duplicates)
    if (connection.target && targetHandle) {
      const targetNode = get().nodes.find((n) => n.id === connection.target);
      if (targetNode) {
        const prev = targetNode.data.connectedInputs || [];
        const connectedInputs = prev.includes(targetHandle)
          ? prev
          : [...prev, targetHandle];
        get().updateNodeData(connection.target, { connectedInputs });
      }
    }
  },

  addNode: (type: NodeType, position: { x: number; y: number }) => {
    const config = NODE_CONFIGS[type];
    const newNode: Node<NodeData> = {
      id: getNodeId(),
      type: "workflow",
      position,
      data: {
        label: config.label,
        type,
        status: "idle",
        connectedInputs: [],
        // Default values
        ...(type === "crop" && {
          xPercent: 0,
          yPercent: 0,
          widthPercent: 100,
          heightPercent: 100,
        }),
        ...(type === "frame" && {
          timestamp: "0",
        }),
        ...(type === "llm" && {
          model: "gemini-1.5-flash",
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
          : node,
      ),
    });
  },

  deleteNode: (nodeId: string) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      ),
      selectedNodeId:
        get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  setNodeStatus: (
    nodeId: string,
    status: NodeData["status"],
    error?: string,
  ) => {
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

    // Execute nodes sequentially using runNode which will propagate outputs
    for (const node of nodes) {
      await get().runNode(node.id);
    }
  },

  runNode: async (nodeId: string) => {
    get().setNodeStatus(nodeId, "running");

    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Random success/error for demo
    const success = Math.random() > 0.05; // mostly succeed
    if (!success) {
      get().setNodeStatus(nodeId, "error", "Execution failed");
      return;
    }

    // Mark success and compute output for demo nodes
    get().setNodeStatus(nodeId, "success");
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Demo output generation for multiple node types
    let output: unknown = undefined;
    if (node.data.type === "llm") {
      output =
        "This is a sample LLM response. In production, this would be the actual output from the Gemini API.";
      get().updateNodeData(nodeId, { output: output as string });
    } else if (node.data.type === "text") {
      output = node.data.content || "";
      get().updateNodeData(nodeId, { output: output as string });
    } else if (node.data.type === "image") {
      // For uploaded images, echo the file URL as output
      output = node.data.fileUrl || null;
      get().updateNodeData(nodeId, { output: output as string | undefined });
    } else if (node.data.type === "video") {
      // For uploaded videos, echo the file URL as output
      output = node.data.fileUrl || null;
      get().updateNodeData(nodeId, { output: output as string | undefined });
    } else if (node.data.type === "crop") {
      // Crop requires an input image URL. Prefer connected input or manual `image_url` field.
      const sourceImage = node.data.image_url || node.data.output || null;
      if (!sourceImage) {
        get().setNodeStatus(nodeId, "error", "No image provided to crop");
        output = null;
      } else {
        const x = node.data.xPercent ?? 0;
        const y = node.data.yPercent ?? 0;
        const w = node.data.widthPercent ?? 100;
        const h = node.data.heightPercent ?? 100;
        // Simulate a cropped image URL by appending parameters
        output = `${sourceImage}?crop=${x},${y},${w},${h}`;
        get().updateNodeData(nodeId, { output: output as string });
      }
    } else if (node.data.type === "frame") {
      // Frame extraction requires a video URL
      const sourceVideo = node.data.video_url || node.data.output || null;
      if (!sourceVideo) {
        get().setNodeStatus(
          nodeId,
          "error",
          "No video provided to extract frame",
        );
        output = null;
      } else {
        const ts = node.data.timestamp || "0";
        // Simulate a frame image URL
        output = `${sourceVideo}?frame=${encodeURIComponent(ts)}`;
        get().updateNodeData(nodeId, { output: output as string });
      }
    }

    // Propagate outputs to downstream nodes based on edges
    const outgoing = get().edges.filter((e) => e.source === nodeId);
    for (const e of outgoing) {
      const targetId = e.target;
      const targetHandle = e.targetHandle;
      if (!targetId || !targetHandle) continue;

      const targetNode = get().nodes.find((n) => n.id === targetId);
      if (!targetNode) continue;

      get().updateNodeData(targetId, {
        ...({ [targetHandle]: output } as any),
      });
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
