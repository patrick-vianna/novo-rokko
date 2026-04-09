"use client";

import React, { useState } from "react";
import { Project } from "@/types";
import { PIPELINES } from "@/lib/pipeline-config";
import { Repeat, Target, CheckCircle, X, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface PipelineRoutingDialogProps {
  project: Project;
  onClose: () => void;
  onRouted: () => void;
}

async function routeProject(projectId: string, action: string, extra?: Record<string, any>) {
  const res = await fetch(`/api/data/projects/${projectId}/route-pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Erro"); }
  return res.json();
}

// Dialog: Onboarding → choose Recorrente or EE
export function OnboardingRoutingDialog({ project, onClose, onRouted }: PipelineRoutingDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (action: string) => {
    setLoading(action);
    try {
      await routeProject(project.id, action);
      toast.success("Projeto roteado com sucesso!");
      onRouted();
      onClose();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(null); }
  };

  return (
    <DialogShell onClose={onClose} title="Para onde enviar este projeto?">
      <p className="text-sm text-[var(--color-v4-text-muted)] mb-5">{project.name}</p>

      <div className="space-y-3">
        <button
          onClick={() => handle("route_to_recorrente")}
          disabled={!!loading}
          className="w-full p-4 rounded-xl border border-[var(--color-v4-border)] hover:border-emerald-500/40 hover:bg-emerald-500/5 text-left transition-colors disabled:opacity-50 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${PIPELINES.recorrente.color}20` }}>
              <Repeat size={16} style={{ color: PIPELINES.recorrente.color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Recorrente (Byline)</p>
              <p className="text-xs text-[var(--color-v4-text-muted)]">Contrato mensal recorrente → Boas-vindas</p>
            </div>
            {loading === "route_to_recorrente" && <Loader2 size={16} className="animate-spin text-white" />}
          </div>
        </button>

        <button
          onClick={() => handle("route_to_ee")}
          disabled={!!loading}
          className="w-full p-4 rounded-xl border border-[var(--color-v4-border)] hover:border-amber-500/40 hover:bg-amber-500/5 text-left transition-colors disabled:opacity-50 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${PIPELINES.estruturacao_estrategica.color}20` }}>
              <Target size={16} style={{ color: PIPELINES.estruturacao_estrategica.color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Estruturacao Estrategica</p>
              <p className="text-xs text-[var(--color-v4-text-muted)]">Projeto one-time com entregas → Semana 1</p>
            </div>
            {loading === "route_to_ee" && <Loader2 size={16} className="animate-spin text-white" />}
          </div>
        </button>
      </div>
    </DialogShell>
  );
}

// Dialog: EE finished → Convert or Complete
export function EEFinishDialog({ project, onClose, onRouted }: PipelineRoutingDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (action: string) => {
    setLoading(action);
    try {
      await routeProject(project.id, action);
      toast.success(action === "convert_to_recorrente" ? "Convertido com sucesso!" : "Projeto encerrado!");
      onRouted();
      onClose();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(null); }
  };

  return (
    <DialogShell onClose={onClose} title="Projeto concluido! Qual o destino?">
      <p className="text-sm text-[var(--color-v4-text-muted)] mb-5">{project.name}</p>

      <div className="space-y-3">
        <button
          onClick={() => handle("convert_to_recorrente")}
          disabled={!!loading}
          className="w-full p-4 rounded-xl border border-[var(--color-v4-border)] hover:border-emerald-500/40 hover:bg-emerald-500/5 text-left transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/20">
              <Repeat size={16} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Converter em Recorrente</p>
              <p className="text-xs text-[var(--color-v4-text-muted)]">Cria novo projeto Byline no Ongoing</p>
            </div>
            {loading === "convert_to_recorrente" && <Loader2 size={16} className="animate-spin text-white" />}
          </div>
        </button>

        <button
          onClick={() => handle("complete_ee")}
          disabled={!!loading}
          className="w-full p-4 rounded-xl border border-[var(--color-v4-border)] hover:border-zinc-500/40 hover:bg-zinc-500/5 text-left transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-500/20">
              <CheckCircle size={16} className="text-zinc-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Encerrar projeto</p>
              <p className="text-xs text-[var(--color-v4-text-muted)]">Marcar como concluido sem conversao</p>
            </div>
            {loading === "complete_ee" && <Loader2 size={16} className="animate-spin text-white" />}
          </div>
        </button>
      </div>
    </DialogShell>
  );
}

// Dialog: Churn
export function ChurnDialog({ project, onClose, onRouted }: PipelineRoutingDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await routeProject(project.id, "churn", { reason });
      toast.success("Projeto movido para churn");
      onRouted();
      onClose();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <DialogShell onClose={onClose} title="Mover para Churn">
      <div className="flex items-center gap-2 mb-4 text-amber-500">
        <AlertTriangle size={16} />
        <p className="text-sm">{project.name}</p>
      </div>
      <div className="mb-5">
        <label className="block text-xs text-[var(--color-v4-text-muted)] mb-1">Motivo do churn</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Descreva o motivo..."
          className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-sm text-white resize-none"
        />
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 bg-[var(--color-v4-surface)] hover:bg-[var(--color-v4-border)] text-white rounded-xl text-sm font-medium transition-colors">
          Cancelar
        </button>
        <button onClick={handle} disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          Confirmar Churn
        </button>
      </div>
    </DialogShell>
  );
}

// Shared shell
function DialogShell({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-white">{title}</h3>
            <button onClick={onClose} className="text-[var(--color-v4-text-muted)] hover:text-white"><X size={18} /></button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
