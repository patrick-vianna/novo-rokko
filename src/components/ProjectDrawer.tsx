"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/providers/app-provider";
import { Project, Stage } from "@/types";
import {
  X, ChevronRight, ChevronDown, ExternalLink, Package,
  RefreshCw, CheckCircle2, CircleDashed, Clock,
  Users, FolderOpen, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getProjectPipeline, isRoutingStage, getStageLabel } from "@/lib/pipeline-config";
import { OnboardingRoutingDialog, EEFinishDialog, ChurnDialog } from "./PipelineRoutingDialog";
import { WorkspaceCreationButton } from "./WorkspaceCreationButton";
import { ContractUpload } from "./ContractUpload";

function Section({ title, icon: Icon, defaultOpen = false, children }: { title: string; icon: React.ElementType; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center w-full gap-2.5 px-4 py-3 text-left hover:bg-[var(--color-v4-surface)] transition-colors">
        <Icon size={14} className="text-[var(--color-v4-text-muted)] shrink-0" />
        <span className="text-xs font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider flex-1">{title}</span>
        <ChevronDown size={14} className={cn("text-[var(--color-v4-text-disabled)] transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-4 pb-4 border-t border-[var(--color-v4-border)]">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-[var(--color-v4-text-muted)]">{label}</span>
      <span className="text-xs text-white text-right max-w-[55%] truncate">{value || "—"}</span>
    </div>
  );
}

function formatCurrency(val?: number | null) {
  if (val == null) return null;
  return `R$ ${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

const WS_STATUS = {
  created: { icon: CheckCircle2, color: "text-emerald-400", label: "Criado" },
  pending: { icon: Clock, color: "text-amber-400", label: "Pendente" },
  none: { icon: CircleDashed, color: "text-[var(--color-v4-text-disabled)]", label: "Nao adicionado" },
};

export const ProjectDrawer: React.FC<{ project: Project | null; onClose: () => void }> = ({ project, onClose }) => {
  const { members, moveProject, projects, projectMembers, stakeholders } = useAppStore();
  const [routingDialog, setRoutingDialog] = useState<"onboarding" | "ee" | "churn" | null>(null);

  if (!project) return null;

  const p = projects.find(pr => pr.id === project.id) || project;
  const pipeline = getProjectPipeline(p);
  const coordinator = p.assignedCoordinatorId ? members.find(m => m.id === p.assignedCoordinatorId) : null;
  const soldBy = (p as any).soldBy || ((p as any).soldById ? members.find(m => m.id === (p as any).soldById) : null);
  const products = [...(p.produtosEscopo || []), ...(p.produtosRecorrente || [])].filter(Boolean);
  const productLabels = products.map(pr => pr === "ee" ? "EE" : pr === "byline" ? "Byline" : pr);

  const team = projectMembers.filter(pm => pm.projectId === p.id);
  const projStakeholders = stakeholders.filter(s => s.projectId === p.id);
  const ws = p.workspaceStatus;

  const stages = pipeline.stages;
  const currentIdx = stages.findIndex(s => s.id === p.stage);
  const nextStage = currentIdx >= 0 && currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;

  const pipelineId = p.pipeline || "onboarding";
  const isRouting = isRoutingStage(pipelineId, p.stage);
  const isOngoing = pipelineId === "recorrente" && p.stage === "ongoing";
  const isChurned = p.lifecycleStatus === "churned";
  const isInactive = p.lifecycleStatus && p.lifecycleStatus !== "active";

  const handleAdvance = () => {
    if (isRouting && pipelineId === "onboarding") { setRoutingDialog("onboarding"); return; }
    if (isRouting && pipelineId === "estruturacao_estrategica") { setRoutingDialog("ee"); return; }
    if (nextStage) { moveProject(p.id, nextStage.id as Stage); onClose(); }
  };

  const getWsStatus = (key: string, linkField: string): "created" | "pending" | "none" => {
    const status = (ws as any)?.[key];
    const link = (p as any)[linkField];
    if (status === "created" || link) return "created";
    if (status === "pending") return "pending";
    return "none";
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[var(--color-v4-bg)] border-l border-[var(--color-v4-border)] shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-v4-border)] bg-[var(--color-v4-card)]">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-display font-bold text-white truncate">{p.name}</h2>
            <p className="text-sm text-[var(--color-v4-text-muted)]">{p.clientName}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: pipeline.color, borderColor: `${pipeline.color}40`, backgroundColor: `${pipeline.color}15` }}>
                {pipeline.shortName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[var(--color-v4-border)] text-[var(--color-v4-text-muted)]">
                {getStageLabel(p.stage)}
              </span>
              {isInactive && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 uppercase">{p.lifecycleStatus}</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-v4-surface)] rounded-full text-[var(--color-v4-text-muted)] hover:text-white transition-colors shrink-0 ml-3">
            <X size={20} />
          </button>
        </div>

        {/* Content — collapsible sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Dados — default open */}
          <Section title="Dados" icon={Package} defaultOpen>
            <div className="pt-3 space-y-0 divide-y divide-[var(--color-v4-border)]">
              <InfoRow label="Empresa" value={p.clientName} />
              {(p as any).clientEmail && <InfoRow label="Email" value={(p as any).clientEmail} />}
              {p.clientPhone && <InfoRow label="Telefone" value={p.clientPhone} />}
              {coordinator && <InfoRow label="Coordenador" value={coordinator.name} />}
              {soldBy && <InfoRow label="Vendedor" value={soldBy.name} />}
              {productLabels.length > 0 && <InfoRow label="Produtos" value={productLabels.join(", ")} />}
              <InfoRow label="Valor Escopo" value={formatCurrency(p.valorEscopo)} />
              <InfoRow label="Valor Recorrente" value={formatCurrency(p.valorRecorrente)} />
              <InfoRow label="Inicio Projeto" value={p.projectStartDate} />
              <InfoRow label="Criado em" value={p.createdAt ? format(new Date(p.createdAt), "dd/MM/yyyy", { locale: ptBR }) : null} />
            </div>
            {p.kommoLink && (
              <a href={p.kommoLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline mt-3">
                <ExternalLink size={11} /> Ver no Kommo
              </a>
            )}
          </Section>

          {/* Equipe + Stakeholders */}
          <Section title="Equipe & Stakeholders" icon={Users}>
            <div className="pt-3 space-y-2">
              {coordinator && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-v4-red)]/20 border border-[var(--color-v4-red)]/30 flex items-center justify-center text-[10px] font-bold text-[var(--color-v4-red)]">{coordinator.name.charAt(0)}</div>
                  <span className="text-white flex-1">{coordinator.name}</span>
                  <span className="text-[var(--color-v4-text-disabled)]">Coordenador</span>
                </div>
              )}
              {team.map(tm => {
                const m = members.find(mem => mem.id === tm.memberId);
                return m ? (
                  <div key={tm.id} className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400">{m.name.charAt(0)}</div>
                    <span className="text-white flex-1">{m.name}</span>
                    <span className="text-[var(--color-v4-text-disabled)]">{tm.roleInProject.replace(/_/g, " ")}</span>
                  </div>
                ) : null;
              })}
              {team.length === 0 && !coordinator && <p className="text-xs text-[var(--color-v4-text-disabled)]">Nenhum membro atribuido</p>}

              {projStakeholders.length > 0 && (
                <>
                  <div className="pt-2 mt-1 border-t border-[var(--color-v4-border)]">
                    <p className="text-[10px] text-[var(--color-v4-text-disabled)] uppercase tracking-wider mb-2">Stakeholders (cliente)</p>
                  </div>
                  {projStakeholders.map(s => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-400">{s.name.charAt(0)}</div>
                      <span className="text-white flex-1">{s.name}</span>
                      {s.role && <span className="text-[var(--color-v4-text-disabled)]">{s.role}</span>}
                    </div>
                  ))}
                </>
              )}
            </div>
          </Section>

          {/* Workspaces */}
          <Section title="Workspaces" icon={FolderOpen}>
            <div className="pt-3 space-y-2">
              {[
                { key: "gchat", label: "Google Chat", linkField: "gchatLink" },
                { key: "whatsapp", label: "WhatsApp", linkField: "wppGroupLink" },
                { key: "gdrive", label: "Google Drive", linkField: "gdriveFolderLink" },
                { key: "ekyte", label: "Ekyte", linkField: "ekyteLink" },
              ].map(({ key, label, linkField }) => {
                const status = getWsStatus(key, linkField);
                const cfg = WS_STATUS[status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={key} className="flex items-center gap-2.5 py-1">
                    <StatusIcon size={14} className={cfg.color} />
                    <span className="text-xs text-white flex-1">{label}</span>
                    <span className={cn("text-[10px]", cfg.color)}>{cfg.label}</span>
                  </div>
                );
              })}
              {p.stage === "criar_workspace" && <div className="pt-2"><WorkspaceCreationButton project={p} /></div>}
            </div>
          </Section>

          {/* Contrato */}
          <Section title="Contrato" icon={FileText}>
            <div className="pt-3">
              <ContractUpload project={p} />
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-v4-border)] bg-[var(--color-v4-card)] space-y-2.5">
          {!isInactive && !isOngoing && (nextStage || isRouting) && (
            <button onClick={handleAdvance} className="w-full py-3 bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              {isRouting ? "Escolher destino" : `Avancar para ${nextStage!.label}`}
              <ChevronRight size={16} />
            </button>
          )}
          {pipelineId === "recorrente" && !isChurned && p.lifecycleStatus === "active" && (
            <button onClick={() => setRoutingDialog("churn")} className="w-full py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors">
              Mover para Churn
            </button>
          )}
          {isChurned && (
            <button onClick={async () => { await fetch(`/api/data/projects/${p.id}/route-pipeline`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reactivate" }) }); onClose(); }} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              <RefreshCw size={16} /> Reativar projeto
            </button>
          )}
          <Link href={`/projetos/${p.id}`} onClick={onClose} className="w-full py-3 border border-[var(--color-v4-border)] hover:bg-[var(--color-v4-surface)] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            Abrir Projeto Completo <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {routingDialog === "onboarding" && <OnboardingRoutingDialog project={p} onClose={() => setRoutingDialog(null)} onRouted={onClose} />}
      {routingDialog === "ee" && <EEFinishDialog project={p} onClose={() => setRoutingDialog(null)} onRouted={onClose} />}
      {routingDialog === "churn" && <ChurnDialog project={p} onClose={() => setRoutingDialog(null)} onRouted={onClose} />}
    </>
  );
};
