"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Workflow, Play, Edit, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  flowData: any;
  active: boolean;
  lastRun?: string;
}

export function TabAutomacoes({ projectId }: { projectId: string }) {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const res = await fetch("/api/workflows");
        if (!res.ok) throw new Error();
        const all = await res.json();
        // Filter workflows that have a stage_change node (they're relevant to projects)
        const relevant = (all as WorkflowItem[]).filter((w) => {
          const fd = w.flowData || (w as any).flow_data;
          return fd?.nodes?.some((n: any) => n.type === "stage_change" || n.type === "trigger");
        });
        setWorkflows(relevant);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchWorkflows();
  }, []);

  const handleExecute = async (wf: WorkflowItem) => {
    try {
      const fd = wf.flowData || (wf as any).flow_data;
      const res = await fetch("/api/workflows/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: wf.id, nodes: fd.nodes, edges: fd.edges }),
      });
      if (!res.ok) throw new Error();
      toast.success("Execucao iniciada!");
    } catch { toast.error("Erro ao executar"); }
  };

  if (loading) return <div className="py-12 flex justify-center"><Loader2 size={20} className="animate-spin text-[var(--color-v4-text-muted)]" /></div>;

  if (workflows.length === 0) {
    return (
      <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-8 text-center">
        <Workflow size={24} className="mx-auto mb-2 text-[var(--color-v4-text-disabled)]" />
        <p className="text-sm text-[var(--color-v4-text-muted)]">Nenhuma automacao vinculada</p>
        <Link href="/automacoes" className="text-xs text-[var(--color-v4-red)] hover:underline mt-2 inline-block">Criar automacao</Link>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl divide-y divide-[var(--color-v4-border)]">
      {workflows.map((wf) => (
        <div key={wf.id} className="p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{wf.name}</p>
            {wf.description && <p className="text-xs text-[var(--color-v4-text-muted)] truncate">{wf.description}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded-full border", wf.active ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-zinc-500 border-zinc-700")}>
                {wf.active ? "Ativo" : "Inativo"}
              </span>
              {wf.lastRun && <span className="text-[10px] text-[var(--color-v4-text-disabled)]">Ultima exec: {new Date(wf.lastRun).toLocaleDateString("pt-BR")}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => handleExecute(wf)} className="p-2 text-[var(--color-v4-text-disabled)] hover:text-cyan-400 transition-colors" title="Executar">
              <Play size={14} />
            </button>
            <Link href={`/automacoes/${wf.id}`} className="p-2 text-[var(--color-v4-text-disabled)] hover:text-white transition-colors" title="Editar no builder">
              <Edit size={14} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
