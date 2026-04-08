"use client";

import { WorkflowEditor } from "@/components/workflow/WorkflowEditor";

export default function NovoWorkflowPage() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-0px)] overflow-hidden">
      <WorkflowEditor initialName="Novo Workflow" />
    </div>
  );
}
