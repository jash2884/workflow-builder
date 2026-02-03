import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion } from "framer-motion";
import {
  Type,
  Image,
  Video,
  Sparkles,
  Crop,
  Film,
  Play,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NodeData, NODE_CONFIGS } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflowStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const icons = {
  Type,
  Image,
  Video,
  Sparkles,
  Crop,
  Film,
};

const WorkflowNode = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const { updateNodeData, deleteNode, runNode } = useWorkflowStore();
  const [expanded, setExpanded] = useState(true);
  const config = NODE_CONFIGS[data.type];
  const Icon = icons[config.icon as keyof typeof icons];

  const accentClass = `node-accent-${config.color}`;

  const statusClass = {
    idle: "",
    running: "node-running",
    success: "node-success",
    error: "node-error",
  }[data.status || "idle"];

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    runNode(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  const isInputConnected = (inputId: string) => {
    return data.connectedInputs?.includes(inputId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "workflow-node min-w-[280px] max-w-[320px]",
        accentClass,
        statusClass,
        selected && "selected",
        "bg-card border-node-accent",
      )}
    >
      {/* Input handles */}
      {config.inputs.map((input, index) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{ top: 60 + index * 40 }}
          className={cn(
            "w-3 h-3 border-2 border-background transition-all",
            isInputConnected(input.id) ? "bg-primary" : "bg-muted-foreground",
          )}
        />
      ))}

      {/* Header */}
      <div
        data-drag-handle
        className={cn(
          "flex items-center justify-between p-3 rounded-t-xl border-b border-border",
          "bg-node-accent",
        )}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "bg-background/50",
            )}
          >
            <Icon className="w-4 h-4 text-node-accent" />
          </div>
          <div>
            <h3 className="font-medium text-sm text-foreground">
              {data.label}
            </h3>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-3 space-y-3">
          {/* Text Node */}
          {data.type === "text" && (
            <Textarea
              placeholder="Enter your text..."
              value={data.content || ""}
              onChange={(e) => updateNodeData(id, { content: e.target.value })}
              className="min-h-[80px] bg-background/50 border-border text-sm resize-none"
            />
          )}

          {/* Image Upload Node */}
          {data.type === "image" && (
            <div className="space-y-2">
              {data.fileUrl ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={data.fileUrl}
                    alt={data.fileName || "Uploaded"}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1">
                    <p className="text-xs truncate">{data.fileName}</p>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Image className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">
                    Click to upload image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        updateNodeData(id, {
                          fileUrl: url,
                          fileName: file.name,
                        });
                      }
                    }}
                  />
                </label>
              )}
            </div>
          )}

          {/* Video Upload Node */}
          {data.type === "video" && (
            <div className="space-y-2">
              {data.fileUrl ? (
                <div className="relative rounded-lg overflow-hidden">
                  <video
                    src={data.fileUrl}
                    className="w-full h-32 object-cover"
                    controls
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1">
                    <p className="text-xs truncate">{data.fileName}</p>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Video className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">
                    Click to upload video
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        updateNodeData(id, {
                          fileUrl: url,
                          fileName: file.name,
                        });
                      }
                    }}
                  />
                </label>
              )}
            </div>
          )}

          {/* LLM Node */}
          {data.type === "llm" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Model
                </label>
                <Select
                  value={data.model}
                  onValueChange={(v) => updateNodeData(id, { model: v })}
                >
                  <SelectTrigger className="h-8 text-xs bg-background/50">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-1.5-pro">
                      Gemini 1.5 Pro
                    </SelectItem>
                    <SelectItem value="gemini-1.5-flash">
                      Gemini 1.5 Flash
                    </SelectItem>
                    <SelectItem value="gemini-pro-vision">
                      Gemini Pro Vision
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isInputConnected("system_prompt") && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    System Prompt
                  </label>
                  <Textarea
                    placeholder="System instructions..."
                    value={data.systemPrompt || ""}
                    onChange={(e) =>
                      updateNodeData(id, { systemPrompt: e.target.value })
                    }
                    className="min-h-[60px] bg-background/50 border-border text-xs resize-none"
                  />
                </div>
              )}

              {!isInputConnected("user_message") && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    User Message
                  </label>
                  <Textarea
                    placeholder="Your message..."
                    value={data.userMessage || ""}
                    onChange={(e) =>
                      updateNodeData(id, { userMessage: e.target.value })
                    }
                    className="min-h-[60px] bg-background/50 border-border text-xs resize-none"
                  />
                </div>
              )}

              {/* Output display */}
              {data.output && (
                <div className="p-2 rounded-lg bg-execution-success/10 border border-execution-success/20">
                  <label className="text-xs text-execution-success mb-1 block">
                    Output
                  </label>
                  <p className="text-xs text-foreground">{data.output}</p>
                </div>
              )}
            </div>
          )}

          {/* Crop Node */}
          {data.type === "crop" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  X %
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={data.xPercent || 0}
                  onChange={(e) =>
                    updateNodeData(id, { xPercent: Number(e.target.value) })
                  }
                  className="h-8 text-xs bg-background/50"
                  disabled={isInputConnected("x_percent")}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Y %
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={data.yPercent || 0}
                  onChange={(e) =>
                    updateNodeData(id, { yPercent: Number(e.target.value) })
                  }
                  className="h-8 text-xs bg-background/50"
                  disabled={isInputConnected("y_percent")}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Width %
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={data.widthPercent || 100}
                  onChange={(e) =>
                    updateNodeData(id, { widthPercent: Number(e.target.value) })
                  }
                  className="h-8 text-xs bg-background/50"
                  disabled={isInputConnected("width_percent")}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Height %
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={data.heightPercent || 100}
                  onChange={(e) =>
                    updateNodeData(id, {
                      heightPercent: Number(e.target.value),
                    })
                  }
                  className="h-8 text-xs bg-background/50"
                  disabled={isInputConnected("height_percent")}
                />
              </div>
            </div>
          )}

          {/* Frame Extraction Node */}
          {data.type === "frame" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Timestamp (seconds or percentage like "50%")
              </label>
              <Input
                placeholder="0 or 50%"
                value={data.timestamp || "0"}
                onChange={(e) =>
                  updateNodeData(id, { timestamp: e.target.value })
                }
                className="h-8 text-xs bg-background/50"
                disabled={isInputConnected("timestamp")}
              />
            </div>
          )}

          {/* Error display */}
          {data.error && (
            <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{data.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer with actions */}
      <div className="flex items-center justify-between p-2 border-t border-border bg-background/30 rounded-b-xl">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs"
          onClick={handleRun}
          disabled={data.status === "running"}
        >
          <Play className="w-3 h-3 mr-1" />
          {data.status === "running" ? "Running..." : "Run"}
        </Button>
      </div>

      {/* Output handle */}
      {config.outputs.map((output, index) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{ top: 60 + index * 40 }}
          className="w-3 h-3 border-2 border-background bg-primary"
        />
      ))}
    </motion.div>
  );
});

WorkflowNode.displayName = "WorkflowNode";

export default WorkflowNode;
