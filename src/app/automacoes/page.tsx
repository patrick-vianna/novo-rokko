"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Play, Power, Trash2, Edit, Workflow, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_COLORS } from "@/lib/workflow-types";
import toast from "react-hot-toast";

interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  flowData: { nodes: any[]; edges: any[] };
  active: boolean;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AutomacoesPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows");
      if (!res.ok) throw new Error("Erro ao buscar workflows");
      const data = await res.json();
      setWorkflows(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      setWorkflows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, active: !currentActive } : w)),
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este workflow?")) return;
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      toast.success("Workflow excluído!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleExecute = async (workflow: WorkflowItem) => {
    try {
      const res = await fetch("/api/workflows/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: workflow.id,
          nodes: workflow.flowData.nodes,
          edges: workflow.flowData.edges,
        }),
      });
      if (!res.ok) throw new Error("Erro ao executar");
      toast.success("Execução iniciada!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Automações</h1>
          <p className="text-sm text-[var(--color-v4-text-muted)] mt-1">
            Crie e gerencie fluxos automatizados
          </p>
        </div>
        <Link
          href="/automacoes/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Nova Automação
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{
              background: `radial-gradient(circle, ${NODE_COLORS.trigger}15 0%, transparent 70%)`,
              border: `1px solid ${NODE_COLORS.trigger}20`,
            }}
          >
            <Workflow size={32} className="text-cyan-400" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">
            Nenhuma automação ainda
          </h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-sm">
            Crie sua primeira automação para automatizar processos do onboarding
          </p>
          <Link
            href="/automacoes/novo"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Criar primeira automação
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5 hover:border-zinc-700 transition-all group"
              style={{
                boxShadow: workflow.active
                  ? `0 0 20px ${NODE_COLORS.trigger}08`
                  : undefined,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-white truncate">
                    {workflow.name}
                  </h3>
                  {workflow.description && (
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {workflow.description}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ml-2",
                    workflow.active
                      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                      : "text-zinc-500 border-zinc-700 bg-zinc-800/50",
                  )}
                >
                  {workflow.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono mb-4">
                <span>{workflow.flowData.nodes?.length || 0} nós</span>
                <span>·</span>
                <span>
                  {workflow.lastRun
                    ? `Última exec: ${new Date(workflow.lastRun).toLocaleDateString("pt-BR")}`
                    : "Nunca executado"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pt-3 border-t border-zinc-800/40">
                <Link
                  href={`/automacoes/${workflow.id}`}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <Edit size={12} />
                  Editar
                </Link>
                <button
                  onClick={() => handleExecute(workflow)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Play size={12} />
                  Executar
                </button>
                <button
                  onClick={() => handleToggleActive(workflow.id, workflow.active)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  <Power size={12} />
                </button>
                <button
                  onClick={() => handleDelete(workflow.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-auto"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
