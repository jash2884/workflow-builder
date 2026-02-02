import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  Image, 
  Video, 
  Sparkles, 
  Crop, 
  Film, 
  Search,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { NodeType, NODE_CONFIGS } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const icons = {
  Type,
  Image,
  Video,
  Sparkles,
  Crop,
  Film,
};

const colorClasses = {
  text: 'text-node-text bg-node-text-bg hover:bg-node-text/20 border-node-text/30',
  image: 'text-node-image bg-node-image-bg hover:bg-node-image/20 border-node-image/30',
  video: 'text-node-video bg-node-video-bg hover:bg-node-video/20 border-node-video/30',
  llm: 'text-node-llm bg-node-llm-bg hover:bg-node-llm/20 border-node-llm/30',
  crop: 'text-node-crop bg-node-crop-bg hover:bg-node-crop/20 border-node-crop/30',
  frame: 'text-node-frame bg-node-frame-bg hover:bg-node-frame/20 border-node-frame/30',
};

export function LeftSidebar() {
  const { leftSidebarOpen, toggleLeftSidebar, addNode } = useWorkflowStore();
  const [searchQuery, setSearchQuery] = useState('');

  const nodeTypes = Object.values(NODE_CONFIGS);
  const filteredNodes = nodeTypes.filter(
    (node) =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNode = (type: NodeType) => {
    // Add node at a reasonable position in the canvas
    const position = {
      x: 200 + Math.random() * 100,
      y: 100 + Math.random() * 100,
    };
    addNode(type, position);
  };

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Nodes</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLeftSidebar}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-sidebar-accent border-sidebar-border h-9"
                />
              </div>
            </div>

            {/* Quick Access */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Quick Access
                  </h3>
                  <div className="space-y-2">
                    {filteredNodes.map((config) => {
                      const Icon = icons[config.icon as keyof typeof icons];
                      return (
                        <motion.button
                          key={config.type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, config.type)}
                          onClick={() => handleAddNode(config.type)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing',
                            colorClasses[config.color as keyof typeof colorClasses]
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm text-foreground">{config.label}</p>
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Instructions */}
                <div className="sidebar-section">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">How to use</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Click or drag nodes to canvas</li>
                    <li>• Connect nodes by dragging handles</li>
                    <li>• Run individual or all nodes</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed toggle button */}
      {!leftSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={toggleLeftSidebar}
            className="rounded-l-none bg-sidebar border-sidebar-border h-12"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </>
  );
}
