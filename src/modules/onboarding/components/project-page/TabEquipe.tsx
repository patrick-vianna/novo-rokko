"use client";

import React, { useState } from "react";
import { useAppStore } from "@/providers/app-provider";
import { Project, ProjectMember } from "@/types";
import { Users, Plus, Trash2, Crown, UserCheck, Pencil, X, Save } from "lucide-react";
import toast from "react-hot-toast";

const ROLE_LABELS: Record<string, string> = {
  coord_equipe: "Coordenador de Equipe",
  gestor_projetos: "Gestor de Projetos",
  designer: "Designer",
  gestor_trafego: "Gestor de Trafego",
  copywriter: "Copywriter",
};

const ASSIGNABLE_ROLES = ["gestor_projetos", "designer", "gestor_trafego", "copywriter"];

export function TabEquipe({ project }: { project: Project }) {
  const { members, projectMembers, addProjectMember, removeProjectMember, updateProject } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const [editingCoord, setEditingCoord] = useState(false);
  const [selectedCoordId, setSelectedCoordId] = useState(project.assignedCoordinatorId || "");

  const teamMembers = projectMembers.filter((pm) => pm.projectId === project.id);
  const coordinator = project.assignedCoordinatorId
    ? members.find((m) => m.id === project.assignedCoordinatorId)
    : null;
  const soldBy = (project as any).soldBy || ((project as any).soldById ? members.find(m => m.id === (project as any).soldById) : null);

  const handleAdd = () => {
    if (!newRole || !newMemberId) { toast.error("Selecione a funcao e o membro"); return; }
    addProjectMember({ id: "", projectId: project.id, memberId: newMemberId, roleInProject: newRole } as ProjectMember);
    setAdding(false); setNewRole(""); setNewMemberId("");
  };

  const availableMembers = newRole
    ? members.filter((m) => m.role === newRole && m.isActive && !teamMembers.some((tm) => tm.memberId === m.id))
    : [];

  return (
    <div className="space-y-6">
      {/* Coordenador e Vendedor */}
      <section className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Crown size={14} /> Lideranca
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-v4-surface)] group">
            <div className="w-9 h-9 rounded-full bg-[var(--color-v4-red)]/20 border border-[var(--color-v4-red)]/30 flex items-center justify-center text-xs font-bold text-[var(--color-v4-red)] uppercase shrink-0">
              {coordinator?.name?.charAt(0) || "?"}
            </div>
            {editingCoord ? (
              <div className="flex-1 flex items-center gap-2">
                <select
                  value={selectedCoordId}
                  onChange={(e) => setSelectedCoordId(e.target.value)}
                  className="flex-1 p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-sm text-white"
                >
                  <option value="">Selecione...</option>
                  {members.filter(m => (m.role === "coord_equipe" || m.role === "coord_geral") && m.isActive).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <button onClick={() => { if (selectedCoordId) { updateProject(project.id, { assignedCoordinatorId: selectedCoordId }); toast.success("Coordenador atribuido!"); } setEditingCoord(false); }} className="p-1.5 bg-[var(--color-v4-red)] text-white rounded-md"><Save size={14} /></button>
                <button onClick={() => { setSelectedCoordId(project.assignedCoordinatorId || ""); setEditingCoord(false); }} className="p-1.5 text-[var(--color-v4-text-muted)] hover:text-white"><X size={14} /></button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{coordinator?.name || "Nao atribuido"}</p>
                  <p className="text-xs text-[var(--color-v4-text-muted)]">Coordenador de Equipe</p>
                </div>
                <button onClick={() => { setSelectedCoordId(project.assignedCoordinatorId || ""); setEditingCoord(true); }} className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-bg)] transition-all">
                  <Pencil size={13} />
                </button>
              </>
            )}
          </div>
          {soldBy && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-v4-surface)]">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400 uppercase">
                {soldBy.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{soldBy.name}</p>
                <p className="text-xs text-[var(--color-v4-text-muted)]">Vendedor</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Time */}
      <section className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider flex items-center gap-2">
            <Users size={14} /> Equipe do Projeto
          </h3>
          <button onClick={() => setAdding(!adding)} className="flex items-center gap-1 text-xs text-[var(--color-v4-red)] hover:text-white transition-colors">
            <Plus size={14} /> Adicionar
          </button>
        </div>

        {adding && (
          <div className="flex items-end gap-2 mb-4 p-3 rounded-lg bg-[var(--color-v4-surface)] border border-[var(--color-v4-border)]">
            <div className="flex-1">
              <label className="block text-[10px] text-slate-400 mb-1">Funcao</label>
              <select value={newRole} onChange={(e) => { setNewRole(e.target.value); setNewMemberId(""); }} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white">
                <option value="">Selecione...</option>
                {ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-slate-400 mb-1">Membro</label>
              <select value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" disabled={!newRole}>
                <option value="">Selecione...</option>
                {availableMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <button onClick={handleAdd} className="px-3 py-2 bg-[var(--color-v4-red)] text-white rounded-md text-xs font-medium shrink-0">
              <UserCheck size={14} />
            </button>
          </div>
        )}

        {teamMembers.length === 0 ? (
          <p className="text-sm text-[var(--color-v4-text-disabled)] py-4 text-center">Nenhum membro atribuido ao projeto</p>
        ) : (
          <div className="space-y-2">
            {teamMembers.map((pm) => {
              const m = members.find((mem) => mem.id === pm.memberId);
              return (
                <div key={pm.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-v4-surface)]">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 uppercase">
                    {m?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{m?.name || "Desconhecido"}</p>
                    <p className="text-xs text-[var(--color-v4-text-muted)]">{ROLE_LABELS[pm.roleInProject] || pm.roleInProject}</p>
                  </div>
                  <button onClick={() => removeProjectMember(pm.id)} className="p-1.5 text-[var(--color-v4-text-disabled)] hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
