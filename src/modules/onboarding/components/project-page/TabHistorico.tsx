"use client";

import React from "react";
import { useAppStore } from "@/providers/app-provider";
import { ArrowRight, UserPlus, Settings, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const STAGE_LABELS: Record<string, string> = {
  aguardando_comercial: "Aguardando Comercial",
  atribuir_coordenador: "Atribuir Coordenador",
  atribuir_equipe: "Atribuir Equipe",
  criar_workspace: "Criar Workspace",
  boas_vindas: "Boas-vindas",
  kickoff: "Kickoff",
  planejamento: "Planejamento",
  ongoing: "Ongoing",
};

function getActionInfo(action: string, details: any) {
  switch (action) {
    case "stage_changed":
      return {
        icon: <ArrowRight size={14} />,
        color: "text-blue-400 bg-blue-500/10",
        label: `Moveu de ${STAGE_LABELS[details?.from] || details?.from || "?"} para ${STAGE_LABELS[details?.to] || details?.to || "?"}`,
      };
    case "member_assigned":
      return { icon: <UserPlus size={14} />, color: "text-emerald-400 bg-emerald-500/10", label: "Membro atribuido" };
    case "workspace_created":
      return { icon: <Settings size={14} />, color: "text-purple-400 bg-purple-500/10", label: "Workspace criado" };
    default:
      return { icon: <Clock size={14} />, color: "text-[var(--color-v4-text-muted)] bg-[var(--color-v4-surface)]", label: action.replace(/_/g, " ") };
  }
}

export function TabHistorico({ projectId }: { projectId: string }) {
  const { logs, members } = useAppStore();
  const projectLogs = logs.filter((l) => l.projectId === projectId);

  if (projectLogs.length === 0) {
    return (
      <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-8 text-center">
        <Clock size={24} className="mx-auto mb-2 text-[var(--color-v4-text-disabled)]" />
        <p className="text-sm text-[var(--color-v4-text-muted)]">Nenhum registro de atividade</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider mb-4">Timeline de Atividades</h3>
      <div className="space-y-0">
        {projectLogs.map((log, idx) => {
          const info = getActionInfo(log.action, log.details);
          const performer = log.performedBy ? members.find((m) => m.id === log.performedBy) : null;
          const isLast = idx === projectLogs.length - 1;

          return (
            <div key={log.id} className="flex gap-3">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${info.color}`}>
                  {info.icon}
                </div>
                {!isLast && <div className="w-px flex-1 bg-[var(--color-v4-border)] my-1" />}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4 min-w-0">
                <p className="text-sm text-white">{info.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {performer && <span className="text-xs text-[var(--color-v4-text-muted)]">{performer.name}</span>}
                  <span className="text-[10px] text-[var(--color-v4-text-disabled)]">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
