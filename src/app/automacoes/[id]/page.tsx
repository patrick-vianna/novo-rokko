"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkflowEditor } from "@/components/workflow/WorkflowEditor";
import { Loader2 } from "lucide-react";

export default function EditWorkflowPage() {
  const params = useParams();
  const workflowId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const res = await fetch(`/api/workflows/${workflowId}`);
        if (!res.ok) throw new Error("Workflow não encontrado");
        const data = await res.json();
        setWorkflow(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [workflowId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <Loader2 size={24} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <p className="text-sm text-red-400">{error || "Erro ao carregar workflow"}</p>
      </div>
    );
  }

  const flowData = workflow.flow_data || { nodes: [], edges: [] };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-0px)] overflow-hidden">
      <WorkflowEditor
        workflowId={workflowId}
        initialName={workflow.name}
        initialNodes={flowData.nodes}
        initialEdges={flowData.edges}
        initialActive={workflow.active}
      />
    </div>
  );
}
