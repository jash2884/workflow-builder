import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Play,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

// Demo data for workflow history
const demoRuns = [
  {
    id: '1',
    status: 'success' as const,
    scope: 'full' as const,
    startedAt: new Date(Date.now() - 1000 * 60 * 5),
    duration: 12.5,
    nodeRuns: [
      { nodeId: 'node_0', status: 'success' as const, duration: 2.1 },
      { nodeId: 'node_1', status: 'success' as const, duration: 5.3 },
      { nodeId: 'node_2', status: 'success' as const, duration: 5.1 },
    ],
  },
  {
    id: '2',
    status: 'failed' as const,
    scope: 'single' as const,
    startedAt: new Date(Date.now() - 1000 * 60 * 30),
    duration: 3.2,
    nodeRuns: [
      { nodeId: 'node_1', status: 'error' as const, duration: 3.2, error: 'API rate limit exceeded' },
    ],
  },
  {
    id: '3',
    status: 'partial' as const,
    scope: 'selected' as const,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    duration: 8.7,
    nodeRuns: [
      { nodeId: 'node_0', status: 'success' as const, duration: 2.0 },
      { nodeId: 'node_1', status: 'success' as const, duration: 4.5 },
      { nodeId: 'node_2', status: 'error' as const, duration: 2.2, error: 'Connection timeout' },
    ],
  },
];

const statusConfig = {
  running: { icon: Play, color: 'text-execution-running', bg: 'bg-execution-running/10' },
  success: { icon: CheckCircle2, color: 'text-execution-success', bg: 'bg-execution-success/10' },
  failed: { icon: XCircle, color: 'text-execution-error', bg: 'bg-execution-error/10' },
  partial: { icon: AlertCircle, color: 'text-execution-running', bg: 'bg-execution-running/10' },
  pending: { icon: Clock, color: 'text-execution-pending', bg: 'bg-execution-pending/10' },
  error: { icon: XCircle, color: 'text-execution-error', bg: 'bg-execution-error/10' },
};

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toFixed(0)}s`;
}

function RunItem({ run }: { run: typeof demoRuns[0] }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[run.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="border border-border rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-3 p-3 text-left transition-colors',
          'hover:bg-secondary/50'
        )}
      >
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bg)}>
          <StatusIcon className={cn('w-4 h-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium capitalize">{run.scope} Run</span>
            <span className={cn('text-xs px-1.5 py-0.5 rounded capitalize', config.bg, config.color)}>
              {run.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{formatTime(run.startedAt)}</span>
            <span>•</span>
            <span>{formatDuration(run.duration)}</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
          >
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Node Execution</h4>
              {run.nodeRuns.map((nodeRun) => {
                const nodeConfig = statusConfig[nodeRun.status];
                const NodeIcon = nodeConfig.icon;
                return (
                  <div
                    key={nodeRun.nodeId}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg',
                      nodeConfig.bg
                    )}
                  >
                    <NodeIcon className={cn('w-3 h-3', nodeConfig.color)} />
                    <span className="text-xs font-mono">{nodeRun.nodeId}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDuration(nodeRun.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RightSidebar() {
  const { rightSidebarOpen, toggleRightSidebar } = useWorkflowStore();

  return (
    <>
      <AnimatePresence>
        {rightSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-sidebar border-l border-sidebar-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">History</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRightSidebar}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Run History */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {demoRuns.map((run) => (
                  <RunItem key={run.id} run={run} />
                ))}

                {demoRuns.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No runs yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Run a workflow to see history
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed toggle button */}
      {!rightSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={toggleRightSidebar}
            className="rounded-r-none bg-sidebar border-sidebar-border h-12"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </>
  );
}
