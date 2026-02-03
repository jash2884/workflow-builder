import { Node, Edge } from "reactflow";

// Node types
export type NodeType = "text" | "image" | "video" | "llm" | "crop" | "frame";

export interface NodeData {
  label: string;
  type: NodeType;
  // Text node
  content?: string;
  // Image/Video upload
  fileUrl?: string;
  fileName?: string;
  // LLM node
  model?: string;
  systemPrompt?: string;
  userMessage?: string;
  output?: string;
  // Crop node
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  heightPercent?: number;
  // Frame extraction
  timestamp?: string;
  // Execution state
  status?: "idle" | "running" | "success" | "error";
  error?: string;
  // Connected inputs (disable manual input when connected)
  connectedInputs?: string[];
}

export type WorkflowNode = Node<NodeData>;
export type WorkflowEdge = Edge;

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: "running" | "success" | "failed" | "partial";
  scope: "full" | "single" | "selected";
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  nodeRuns: NodeRun[];
}

export interface NodeRun {
  nodeId: string;
  status: "pending" | "running" | "success" | "error";
  inputs: Record<string, unknown>;
  output?: unknown;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
}

// Node configuration for the sidebar
export interface NodeConfig {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  inputs: HandleConfig[];
  outputs: HandleConfig[];
}

export interface HandleConfig {
  id: string;
  label: string;
  type: "text" | "image" | "video" | "any";
  required?: boolean;
  multiple?: boolean;
}

// LLM Models
export const LLM_MODELS = [
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Most capable model",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Fast and efficient",
  },
  {
    id: "gemini-pro-vision",
    name: "Gemini Pro Vision",
    description: "Vision capabilities",
  },
] as const;

export const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  text: {
    type: "text",
    label: "Text",
    description: "Simple text input",
    icon: "Type",
    color: "text",
    // Allow text nodes to accept input from other nodes
    inputs: [{ id: "input", label: "Text input", type: "text" }],
    outputs: [{ id: "output", label: "Text", type: "text" }],
  },
  image: {
    type: "image",
    label: "Upload Image",
    description: "Upload image file",
    icon: "Image",
    color: "image",
    // Accept image inputs from other nodes (uploads or generated images)
    inputs: [
      { id: "image_url", label: "Image", type: "image", required: true },
    ],
    outputs: [{ id: "output", label: "Image URL", type: "image" }],
  },
  video: {
    type: "video",
    label: "Upload Video",
    description: "Upload video file",
    icon: "Video",
    color: "video",
    // Accept video inputs from other nodes (uploads or generated video links)
    inputs: [
      { id: "video_url", label: "Video", type: "video", required: true },
    ],
    outputs: [{ id: "output", label: "Video URL", type: "video" }],
  },
  llm: {
    type: "llm",
    label: "Run Any LLM",
    description: "Execute LLM with prompts",
    icon: "Sparkles",
    color: "llm",
    inputs: [
      { id: "system_prompt", label: "System Prompt", type: "text" },
      {
        id: "user_message",
        label: "User Message",
        type: "text",
        required: true,
      },
      { id: "images", label: "Images", type: "image", multiple: true },
    ],
    outputs: [{ id: "output", label: "Response", type: "text" }],
  },
  crop: {
    type: "crop",
    label: "Crop Image",
    description: "Crop image with parameters",
    icon: "Crop",
    color: "crop",
    inputs: [
      { id: "image_url", label: "Image", type: "image", required: true },
      { id: "x_percent", label: "X %", type: "text" },
      { id: "y_percent", label: "Y %", type: "text" },
      { id: "width_percent", label: "Width %", type: "text" },
      { id: "height_percent", label: "Height %", type: "text" },
    ],
    outputs: [{ id: "output", label: "Cropped Image", type: "image" }],
  },
  frame: {
    type: "frame",
    label: "Extract Frame",
    description: "Extract frame from video",
    icon: "Film",
    color: "frame",
    inputs: [
      { id: "video_url", label: "Video", type: "video", required: true },
      { id: "timestamp", label: "Timestamp", type: "text" },
    ],
    outputs: [{ id: "output", label: "Frame Image", type: "image" }],
  },
};
