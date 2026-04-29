"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/providers/app-provider";
import { ArrowLeft, ChevronRight, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Stage } from "@/types";
import { getProjectPipeline, isRoutingStage, getStageLabel } from "@/lib/pipeline-config";
import { ADMIN_ROLES } from "@/lib/roles";
import { OnboardingRoutingDialog, EEFinishDialog, ChurnDialog } from "@/components/PipelineRoutingDialog";
import { MovePipelineDialog } from "@/components/MovePipelineDialog";
import { TabDados } from "./TabDados";
import { TabEquipe } from "./TabEquipe";
import { TabWorkspace } from "./TabWorkspace";
import { TabCredenciais } from "./TabCredenciais";
import { TabHistorico } from "./TabHistorico";
import { TabAutomacoes } from "./TabAutomacoes";
import { TabObservacoes } from "./TabObservacoes";
import { TabStakeholders } from "./TabStakeholders";

const TABS = [
  { id: "dados", label: "Dados" },
  { id: "equipe", label: "Equipe" },
  { id: "stakeholders", label: "Stakeholders" },
  { id: "workspace", label: "Workspace" },
  { id: "credenciais", label: "Credenciais" },
  { id: "historico", label: "Historico" },
  { id: "automacoes", label: "Automacoes" },
  { id: "observacoes", label: "Observacoes" },
] as const;

type TabId = typeof TABS[number]["id"];

export function ProjectPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { projects, members, moveProject, currentUser } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  const [activeTab, setActiveTab] = useState<TabId>("dados");
  const [routingDialog, setRoutingDialog] = useState<"onboarding" | "ee" | "churn" | null>(null);
  const [showMovePipeline, setShowMovePipeline] = useState(false);
  const canMovePipeline = ADMIN_ROLES.includes(currentUser?.role || "");

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--color-v4-text-muted)]">Projeto nao encontrado</p>
      </div>
    );
  }

  const pipeline = getProjectPipeline(project);
  const coordinator = project.assignedCoordinatorId ? members.find((m) => m.id === project.assignedCoordinatorId) : null;

  const stages = pipeline.stages;
  const currentIdx = stages.findIndex((s) => s.id === project.stage);
  const nextStage = currentIdx >= 0 && currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;

  const pipelineId = project.pipeline || "onboarding";
  const isRouting = isRoutingStage(pipelineId, project.stage);
  const isOngoing = pipelineId === "recorrente" && project.stage === "ongoing";
  const isInactive = project.lifecycleStatus && project.lifecycleStatus !== "active";

  const handleAdvance = () => {
    if (isRouting && pipelineId === "onboarding") { setRoutingDialog("onboarding"); return; }
    if (isRouting && pipelineId === "estruturacao_estrategica") { setRoutingDialog("ee"); return; }
    if (nextStage) moveProject(project.id, nextStage.id as Stage);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-v4-bg)]">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-[var(--color-v4-card)]/95 backdrop-blur-sm border-b border-[var(--color-v4-border)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 pt-4 pb-2">
            <button onClick={() => router.back()} className="p-1.5 rounded-lg text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-surface)] transition-colors shrink-0">
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-white truncate">{project.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-[var(--color-v4-text-muted)]">
                  {project.clientName}
                  {(project as any).clientEmail && <span className="text-[var(--color-v4-text-disabled)]"> · {(project as any).clientEmail}</span>}
                </span>
                {/* Pipeline badge */}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: pipeline.color, borderColor: `${pipeline.color}40`, backgroundColor: `${pipeline.color}15` }}>
                  {pipeline.shortName}
                </span>
                {/* Stage badge */}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[var(--color-v4-border)] text-[var(--color-v4-text-muted)]">
                  {getStageLabel(project.stage)}
                </span>
                {isInactive && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 uppercase">
                    {project.lifecycleStatus}
                  </span>
                )}
                {coordinator && (
                  <span className="text-xs text-[var(--color-v4-text-disabled)]">· {coordinator.name}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canMovePipeline && (
                <button
                  onClick={() => setShowMovePipeline(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-v4-text-muted)] border border-[var(--color-v4-border)] hover:text-white hover:bg-[var(--color-v4-surface)] transition-colors"
                  title="Mover para outra pipeline"
                >
                  <ArrowRightLeft size={14} />
                </button>
              )}
              {/* Admin: select para alterar status livremente em qualquer estagio da pipeline */}
              {canMovePipeline && (
                <select
                  value={project.stage}
                  onChange={(e) => {
                    const newStage = e.target.value as Stage;
                    if (newStage !== project.stage) moveProject(project.id, newStage);
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-v4-surface)] border border-[var(--color-v4-border)] hover:border-[var(--color-v4-text-muted)] transition-colors cursor-pointer"
                  title="Alterar status (admin)"
                >
                  {pipeline.stages.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              )}

              {!isInactive && !isOngoing && (nextStage || isRouting) && (
                <button onClick={handleAdvance} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white transition-colors">
                  {isRouting ? "Escolher destino" : `Avancar para ${nextStage!.label}`}
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-[var(--color-v4-red)] text-white"
                    : "border-transparent text-[var(--color-v4-text-muted)] hover:text-white hover:border-[var(--color-v4-text-disabled)]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {activeTab === "dados" && <TabDados project={project} />}
          {activeTab === "equipe" && <TabEquipe project={project} />}
          {activeTab === "stakeholders" && <TabStakeholders project={project} />}
          {activeTab === "workspace" && <TabWorkspace project={project} />}
          {activeTab === "credenciais" && <TabCredenciais projectId={project.id} />}
          {activeTab === "historico" && <TabHistorico projectId={project.id} />}
          {activeTab === "automacoes" && <TabAutomacoes projectId={project.id} />}
          {activeTab === "observacoes" && <TabObservacoes project={project} />}
        </div>
      </div>

      {/* Routing dialogs */}
      {routingDialog === "onboarding" && <OnboardingRoutingDialog project={project} onClose={() => setRoutingDialog(null)} onRouted={() => setRoutingDialog(null)} />}
      {routingDialog === "ee" && <EEFinishDialog project={project} onClose={() => setRoutingDialog(null)} onRouted={() => setRoutingDialog(null)} />}
      {routingDialog === "churn" && <ChurnDialog project={project} onClose={() => setRoutingDialog(null)} onRouted={() => setRoutingDialog(null)} />}
      {showMovePipeline && <MovePipelineDialog project={project} onClose={() => setShowMovePipeline(false)} />}
    </div>
  );
}
