import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { WorkflowCanvasWithProvider } from './WorkflowCanvas';
import { Toolbar } from './Toolbar';

export function WorkflowBuilder() {
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex relative overflow-hidden">
        <LeftSidebar />
        <WorkflowCanvasWithProvider />
        <RightSidebar />
      </div>
    </div>
  );
}
