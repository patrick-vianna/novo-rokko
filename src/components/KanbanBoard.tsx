"use client";
import React, { useState, useMemo } from "react";
import { useAppStore } from "@/providers/app-provider";
import { Project, Pipeline } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PIPELINES, PIPELINE_LIST, type PipelineConfig } from "@/lib/pipeline-config";
import { MANAGEMENT_ROLES } from "@/lib/roles";
import { filterVisibleProjects } from "@/lib/project-visibility";
import { CreateProjectDrawer } from "@/components/CreateProjectDrawer";

const getTimeStatus = (updatedAt: string) => {
  const diffHours = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60);
  if (diffHours < 24) return "green";
  if (diffHours < 48) return "yellow";
  return "red";
};

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const { members } = useAppStore();
  const coordinator = members.find((m) => m.id === project.assignedCoordinatorId);
  const timeStatus = getTimeStatus(project.updatedAt);
  const isInactive = project.lifecycleStatus && project.lifecycleStatus !== "active";

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] p-4 rounded-xl shadow-sm mb-3 cursor-pointer transition-all hover:border-[var(--color-v4-text-muted)]",
        isInactive && "opacity-50",
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-white text-sm leading-tight line-clamp-2">{project.name}</h3>
        <div className={cn("w-2 h-2 rounded-full mt-1 shrink-0",
          timeStatus === "green" ? "bg-[var(--color-v4-success)]" : timeStatus === "yellow" ? "bg-[var(--color-v4-warning)]" : "bg-[var(--color-v4-error)]",
        )} />
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {[...(project.produtosEscopo || []), ...(project.produtosRecorrente || [])].filter(Boolean).map((p, i) => (
          <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--color-v4-surface)] border border-[var(--color-v4-border)] text-[9px] font-semibold tracking-wider text-[var(--color-v4-text-muted)]">
            {p === "ee" ? "EE" : p === "byline" ? "Byline" : p}
          </span>
        ))}
        {isInactive && (
          <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-semibold text-red-400 uppercase">
            {project.lifecycleStatus}
          </span>
        )}
      </div>

      <div className="text-xs text-[var(--color-v4-text-muted)] mb-3 space-y-1">
        <p className="truncate font-medium">{project.clientName}</p>
        {(project as any).clientEmail && <p className="truncate text-[10px] text-[var(--color-v4-text-disabled)]">{(project as any).clientEmail}</p>}
        <p className="font-mono text-[10px] bg-[var(--color-v4-surface)] px-1.5 py-0.5 rounded inline-block">
          R$ {((Number(project.valorEscopo) || 0) + (Number(project.valorRecorrente) || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-v4-border)]">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-v4-text-muted)]">
          <Clock size={12} />
          <span className="truncate max-w-[80px]">
            {formatDistanceToNow(new Date(project.updatedAt), { locale: ptBR, addSuffix: true })}
          </span>
        </div>
        {coordinator ? (
          <img src={coordinator.avatarUrl} alt={coordinator.name} title={coordinator.name} className="w-6 h-6 rounded-full bg-[var(--color-v4-surface)] border border-[var(--color-v4-border)]" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[var(--color-v4-surface)] border border-dashed border-[var(--color-v4-border)] flex items-center justify-center text-[10px] text-[var(--color-v4-text-disabled)]">?</div>
        )}
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC<{ onProjectClick: (p: Project) => void }> = ({ onProjectClick }) => {
  const { projects, currentUser, projectMembers } = useAppStore();
  const [activePipeline, setActivePipeline] = useState<Pipeline>("onboarding");
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const pipelineConfig = PIPELINES[activePipeline];

  // Apply role-based visibility first, then filter by pipeline
  const visibleProjects = useMemo(
    () => filterVisibleProjects(projects, currentUser, projectMembers),
    [projects, currentUser, projectMembers],
  );

  const filteredProjects = useMemo(
    () => visibleProjects.filter((p) => (p.pipeline || "onboarding") === activePipeline),
    [visibleProjects, activePipeline],
  );

  // Count per pipeline (only projects visible to current user)
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of PIPELINE_LIST) {
      counts[p.id] = visibleProjects.filter((proj) => (proj.pipeline || "onboarding") === p.id).length;
    }
    return counts;
  }, [visibleProjects]);

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-[var(--color-v4-bg)]">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-[var(--color-v4-bg)]/95 backdrop-blur-sm border-b border-[var(--color-v4-border)] px-6 py-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Jornada do Cliente</h2>
              <p className="text-sm text-[var(--color-v4-text-muted)]">Clique nos cards para visualizar e avancar as etapas.</p>
            </div>
            {MANAGEMENT_ROLES.includes(currentUser?.role || "") && (
              <button onClick={() => setIsCreatingProject(true)} className="px-4 py-2 border border-[var(--color-v4-border)] hover:bg-[var(--color-v4-surface)] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shrink-0">
                <Plus size={16} /> Novo Projeto
              </button>
            )}
          </div>

          {/* Pipeline tabs */}
          <div className="flex gap-2">
            {PIPELINE_LIST.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setActivePipeline(pl.id as Pipeline)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                  activePipeline === pl.id
                    ? "text-white border-transparent"
                    : "text-[var(--color-v4-text-muted)] border-[var(--color-v4-border)] hover:text-white hover:bg-[var(--color-v4-surface)]",
                )}
                style={activePipeline === pl.id ? { backgroundColor: `${pl.color}20`, borderColor: `${pl.color}40`, color: pl.color } : undefined}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pl.color }} />
                {pl.shortName}
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                  activePipeline === pl.id ? "bg-white/10" : "bg-[var(--color-v4-surface)]",
                )}>
                  {pipelineCounts[pl.id] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable kanban columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pt-4 pb-4">
          <div className="flex h-full gap-6">
            {pipelineConfig.stages.map((stage) => {
              const stageProjects = filteredProjects.filter((p) => p.stage === stage.id);

              return (
                <div key={stage.id} className="flex flex-col w-80 flex-shrink-0 h-full">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-medium text-sm text-[var(--color-v4-text-muted)] uppercase tracking-wider truncate">
                      {stage.label}
                    </h3>
                    <span className="bg-[var(--color-v4-card)] text-xs text-[var(--color-v4-text-muted)] px-2 py-0.5 rounded-full border border-[var(--color-v4-border)] shrink-0 ml-2">
                      {stageProjects.length}
                    </span>
                  </div>
                  <div className="flex-1 bg-black/20 rounded-2xl p-3 border border-dashed border-[var(--color-v4-border)] overflow-y-auto">
                    {stageProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} onClick={() => onProjectClick(project)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isCreatingProject && <CreateProjectDrawer onClose={() => setIsCreatingProject(false)} />}
    </>
  );
};
