"use client";

import React, { useState } from "react";
import { Project } from "@/types";
import { PIPELINE_LIST, getPipelineStages } from "@/lib/pipeline-config";
import { X, Loader2, ArrowRightLeft } from "lucide-react";
import toast from "react-hot-toast";

interface MovePipelineDialogProps {
  project: Project;
  onClose: () => void;
  onMoved?: () => void;
}

export function MovePipelineDialog({ project, onClose, onMoved }: MovePipelineDialogProps) {
  const [targetPipeline, setTargetPipeline] = useState("");
  const [targetStage, setTargetStage] = useState("");
  const [loading, setLoading] = useState(false);

  const stages = targetPipeline ? getPipelineStages(targetPipeline) : [];

  const handleMove = async () => {
    if (!targetPipeline || !targetStage) { toast.error("Selecione pipeline e estagio"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/data/projects/${project.id}/route-pipeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move_pipeline", targetPipeline, targetStage }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Erro"); }
      toast.success("Projeto movido com sucesso!");
      onMoved?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <ArrowRightLeft size={18} /> Mover para pipeline
            </h3>
            <button onClick={onClose} className="text-[var(--color-v4-text-muted)] hover:text-white"><X size={18} /></button>
          </div>

          <p className="text-sm text-[var(--color-v4-text-muted)] mb-5">{project.name}</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs text-[var(--color-v4-text-muted)] uppercase tracking-wider mb-1">Pipeline destino</label>
              <select
                value={targetPipeline}
                onChange={(e) => { setTargetPipeline(e.target.value); setTargetStage(""); }}
                className="w-full p-2.5 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-lg text-sm text-white"
              >
                <option value="">Selecione...</option>
                {PIPELINE_LIST.map((pl) => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
            </div>

            {targetPipeline && (
              <div>
                <label className="block text-xs text-[var(--color-v4-text-muted)] uppercase tracking-wider mb-1">Estagio</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  className="w-full p-2.5 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-lg text-sm text-white"
                >
                  <option value="">Selecione...</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-[var(--color-v4-surface)] hover:bg-[var(--color-v4-border)] text-white rounded-xl text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleMove}
              disabled={loading || !targetPipeline || !targetStage}
              className="flex-1 py-2.5 bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Mover
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
