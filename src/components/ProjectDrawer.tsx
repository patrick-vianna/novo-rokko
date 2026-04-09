"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/providers/app-provider";
import { Project, Stage } from "@/types";
import { X, ChevronRight, ExternalLink, User, Calendar, Package, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getProjectPipeline, isRoutingStage, getStageLabel } from "@/lib/pipeline-config";
import { OnboardingRoutingDialog, EEFinishDialog, ChurnDialog } from "./PipelineRoutingDialog";
import { WorkspaceCreationButton } from "./WorkspaceCreationButton";

export const ProjectDrawer: React.FC<{
  project: Project | null;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const { members, moveProject, projects } = useAppStore();
  const [routingDialog, setRoutingDialog] = useState<"onboarding" | "ee" | "churn" | null>(null);

  if (!project) return null;

  const freshProject = projects.find(p => p.id === project.id) || project;
  const pipeline = getProjectPipeline(freshProject);
  const coordinator = freshProject.assignedCoordinatorId ? members.find((m) => m.id === freshProject.assignedCoordinatorId) : null;
  const soldBy = (freshProject as any).soldBy || ((freshProject as any).soldById ? members.find(m => m.id === (freshProject as any).soldById) : null);
  const products = [...(freshProject.produtosEscopo || []), ...(freshProject.produtosRecorrente || [])].filter(Boolean);
  const productLabels = products.map(p => p === "ee" ? "EE" : p === "byline" ? "Byline" : p);

  const stages = pipeline.stages;
  const currentIdx = stages.findIndex((s) => s.id === freshProject.stage);
  const nextStage = currentIdx >= 0 && currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;

  const pipelineId = freshProject.pipeline || "onboarding";
  const isRouting = isRoutingStage(pipelineId, freshProject.stage);
  const isOngoing = pipelineId === "recorrente" && freshProject.stage === "ongoing";
  const isChurned = freshProject.lifecycleStatus === "churned";
  const isInactive = freshProject.lifecycleStatus && freshProject.lifecycleStatus !== "active";

  const handleAdvance = () => {
    if (isRouting && pipelineId === "onboarding") { setRoutingDialog("onboarding"); return; }
    if (isRouting && pipelineId === "estruturacao_estrategica") { setRoutingDialog("ee"); return; }
    if (nextStage) { moveProject(freshProject.id, nextStage.id as Stage); onClose(); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--color-v4-bg)] border-l border-[var(--color-v4-border)] shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-v4-border)] bg-[var(--color-v4-card)]">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-display font-bold text-white truncate">{freshProject.name}</h2>
            <p className="text-sm text-[var(--color-v4-text-muted)]">{freshProject.clientName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-v4-surface)] rounded-full text-[var(--color-v4-text-muted)] hover:text-white transition-colors shrink-0 ml-3">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Pipeline + Stage badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: pipeline.color, borderColor: `${pipeline.color}40`, backgroundColor: `${pipeline.color}15` }}>
              {pipeline.shortName}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[var(--color-v4-border)] text-[var(--color-v4-text-muted)]">
              {getStageLabel(freshProject.stage)}
            </span>
            {isInactive && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 uppercase">
                {freshProject.lifecycleStatus}
              </span>
            )}
          </div>

          {/* Quick info */}
          <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-4 space-y-3">
            {coordinator && (
              <div className="flex items-center gap-2.5">
                <User size={14} className="text-[var(--color-v4-text-disabled)] shrink-0" />
                <div><p className="text-xs text-[var(--color-v4-text-muted)]">Coordenador</p><p className="text-sm text-white">{coordinator.name}</p></div>
              </div>
            )}
            {soldBy && (
              <div className="flex items-center gap-2.5">
                <User size={14} className="text-[var(--color-v4-text-disabled)] shrink-0" />
                <div><p className="text-xs text-[var(--color-v4-text-muted)]">Vendedor</p><p className="text-sm text-white">{soldBy.name}</p></div>
              </div>
            )}
            {productLabels.length > 0 && (
              <div className="flex items-center gap-2.5">
                <Package size={14} className="text-[var(--color-v4-text-disabled)] shrink-0" />
                <div><p className="text-xs text-[var(--color-v4-text-muted)]">Produtos</p><p className="text-sm text-white">{productLabels.join(", ")}</p></div>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Calendar size={14} className="text-[var(--color-v4-text-disabled)] shrink-0" />
              <div><p className="text-xs text-[var(--color-v4-text-muted)]">Criado em</p><p className="text-sm text-white">{freshProject.createdAt ? format(new Date(freshProject.createdAt), "dd MMM yyyy", { locale: ptBR }) : "—"}</p></div>
            </div>
          </div>

          {freshProject.kommoLink && (
            <a href={freshProject.kommoLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <ExternalLink size={14} /> Ver no Kommo
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--color-v4-border)] bg-[var(--color-v4-card)] space-y-3">
          {/* Workspace creation button — only in criar_workspace stage */}
          {freshProject.stage === "criar_workspace" && (
            <WorkspaceCreationButton project={freshProject} />
          )}

          {!isInactive && !isOngoing && (nextStage || isRouting) && (
            <button onClick={handleAdvance} className="w-full py-3 bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              {isRouting ? "Escolher destino" : `Avancar para ${nextStage!.label}`}
              <ChevronRight size={16} />
            </button>
          )}

          {pipelineId === "recorrente" && !isChurned && freshProject.lifecycleStatus === "active" && (
            <button onClick={() => setRoutingDialog("churn")} className="w-full py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors">
              Mover para Churn
            </button>
          )}

          {isChurned && (
            <button
              onClick={async () => {
                await fetch(`/api/data/projects/${freshProject.id}/route-pipeline`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reactivate" }) });
                onClose();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Reativar projeto
            </button>
          )}

          <Link href={`/projetos/${freshProject.id}`} onClick={onClose} className="w-full py-3 border border-[var(--color-v4-border)] hover:bg-[var(--color-v4-surface)] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            Abrir Projeto Completo <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {routingDialog === "onboarding" && <OnboardingRoutingDialog project={freshProject} onClose={() => setRoutingDialog(null)} onRouted={onClose} />}
      {routingDialog === "ee" && <EEFinishDialog project={freshProject} onClose={() => setRoutingDialog(null)} onRouted={onClose} />}
      {routingDialog === "churn" && <ChurnDialog project={freshProject} onClose={() => setRoutingDialog(null)} onRouted={onClose} />}
    </>
  );
};
