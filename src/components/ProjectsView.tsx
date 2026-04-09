"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/providers/app-provider";
import { Pipeline } from "@/types";
import { FolderKanban, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PIPELINE_LIST, getStageLabel } from "@/lib/pipeline-config";
import { MANAGEMENT_ROLES } from "@/lib/roles";
import { CreateProjectDrawer } from "@/components/CreateProjectDrawer";

const STATUS_FILTERS = [
  { id: "active", label: "Ativos" },
  { id: "churned", label: "Churn" },
  { id: "converted", label: "Convertidos" },
  { id: "completed", label: "Encerrados" },
  { id: "all", label: "Todos" },
];

export const ProjectsView: React.FC<{ onProjectClick?: (p: any) => void }> = () => {
  const router = useRouter();
  const { projects, members, currentUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      const search = searchTerm.toLowerCase();
      if (search && !p.name.toLowerCase().includes(search) && !p.clientName.toLowerCase().includes(search) && !((p as any).soldBy?.name || "").toLowerCase().includes(search)) return false;
      // Pipeline
      if (pipelineFilter !== "all" && (p.pipeline || "onboarding") !== pipelineFilter) return false;
      // Status
      if (statusFilter !== "all" && (p.lifecycleStatus || "active") !== statusFilter) return false;
      return true;
    });
  }, [projects, searchTerm, pipelineFilter, statusFilter]);

  return (
    <>
      <div className="flex-1 h-full overflow-y-auto bg-[var(--color-v4-bg)] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Projetos</h2>
              <p className="text-sm text-[var(--color-v4-text-muted)]">Lista completa de projetos.</p>
            </div>
            {MANAGEMENT_ROLES.includes(currentUser?.role || "") && (
              <button onClick={() => setIsCreatingProject(true)} className="px-4 py-2 border border-[var(--color-v4-border)] hover:bg-[var(--color-v4-surface)] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                <Plus size={16} /> Novo Projeto
              </button>
            )}
          </div>

          <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-2xl overflow-hidden shadow-sm">
            {/* Filters bar */}
            <div className="p-4 border-b border-[var(--color-v4-border)] flex flex-wrap items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-v4-text-muted)]" size={18} />
                <input type="text" placeholder="Buscar projeto ou cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-lg text-sm text-white focus:ring-2 focus:ring-[var(--color-v4-red)] focus:border-transparent" />
              </div>

              {/* Pipeline filter */}
              <div className="flex gap-1">
                <button onClick={() => setPipelineFilter("all")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium border transition-colors", pipelineFilter === "all" ? "bg-[var(--color-v4-surface)] text-white border-[var(--color-v4-text-muted)]" : "text-[var(--color-v4-text-muted)] border-[var(--color-v4-border)] hover:text-white")}>
                  Todas
                </button>
                {PIPELINE_LIST.map((pl) => (
                  <button key={pl.id} onClick={() => setPipelineFilter(pl.id)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium border transition-colors", pipelineFilter === pl.id ? "text-white" : "text-[var(--color-v4-text-muted)] border-[var(--color-v4-border)] hover:text-white")} style={pipelineFilter === pl.id ? { backgroundColor: `${pl.color}20`, borderColor: `${pl.color}40`, color: pl.color } : undefined}>
                    {pl.shortName}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white">
                {STATUS_FILTERS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--color-v4-text-muted)]">
                <thead className="text-xs uppercase bg-slate-900/50 border-b border-[var(--color-v4-border)]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Projeto</th>
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Pipeline</th>
                    <th className="px-6 py-4 font-semibold">Estagio</th>
                    <th className="px-6 py-4 font-semibold">Valor</th>
                    <th className="px-6 py-4 font-semibold">Coordenador</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-v4-border)]">
                  {filteredProjects.map((project) => {
                    const coord = members.find((m) => m.id === project.assignedCoordinatorId);
                    const pl = PIPELINE_LIST.find(p => p.id === (project.pipeline || "onboarding"));
                    const isInactive = project.lifecycleStatus && project.lifecycleStatus !== "active";

                    return (
                      <tr key={project.id} onClick={() => router.push(`/projetos/${project.id}`)} className={cn("hover:bg-slate-800/30 transition-colors cursor-pointer", isInactive && "opacity-50")}>
                        <td className="px-6 py-4 font-medium text-white">{project.name}</td>
                        <td className="px-6 py-4">{project.clientName}</td>
                        <td className="px-6 py-4">
                          {pl && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: pl.color, borderColor: `${pl.color}40`, backgroundColor: `${pl.color}15` }}>
                              {pl.shortName}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-[var(--color-v4-border)] text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                            {getStageLabel(project.stage)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          R$ {((Number(project.valorEscopo) || 0) + (Number(project.valorRecorrente) || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          {coord ? <span className="text-xs">{coord.name}</span> : <span className="text-xs text-slate-500">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase",
                            (project.lifecycleStatus || "active") === "active" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
                            project.lifecycleStatus === "churned" ? "text-red-400 border-red-500/30 bg-red-500/10" :
                            project.lifecycleStatus === "converted" ? "text-blue-400 border-blue-500/30 bg-blue-500/10" :
                            "text-zinc-400 border-zinc-500/30 bg-zinc-500/10"
                          )}>
                            {project.lifecycleStatus || "active"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProjects.length === 0 && (
                <div className="p-12 text-center">
                  <FolderKanban className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                  <p className="text-slate-400">Nenhum projeto encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isCreatingProject && <CreateProjectDrawer onClose={() => setIsCreatingProject(false)} />}
    </>
  );
};
