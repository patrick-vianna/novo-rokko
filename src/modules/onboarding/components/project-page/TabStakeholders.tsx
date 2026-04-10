"use client";

import React, { useState } from "react";
import { useAppStore } from "@/providers/app-provider";
import { Project, Stakeholder } from "@/types";
import { Users, Plus, Trash2, Edit2, Save, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function TabStakeholders({ project }: { project: Project }) {
  const { stakeholders, addStakeholder, updateStakeholder, removeStakeholder } = useAppStore();
  const projectStakeholders = stakeholders.filter((s) => s.projectId === project.id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "" });

  const resetForm = () => { setForm({ name: "", email: "", phone: "", role: "" }); setEditingId(null); setShowForm(false); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Nome obrigatorio"); return; }
    if (editingId) {
      updateStakeholder(editingId, { name: form.name, email: form.email || undefined, phone: form.phone || undefined, role: form.role || undefined });
      toast.success("Stakeholder atualizado!");
    } else {
      addStakeholder({ id: "", name: form.name, email: form.email || undefined, phone: form.phone || undefined, role: form.role || undefined, projectId: project.id } as Stakeholder);
    }
    resetForm();
  };

  const handleEdit = (s: Stakeholder) => {
    setEditingId(s.id);
    setForm({ name: s.name, email: s.email || "", phone: s.phone || "", role: s.role || "" });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remover este stakeholder?")) return;
    removeStakeholder(id);
  };

  return (
    <div className="space-y-6">
      <section className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider flex items-center gap-2">
              <Users size={14} /> Stakeholders
            </h3>
            <p className="text-xs text-[var(--color-v4-text-disabled)] mt-0.5">Pessoas relacionadas ao projeto do lado do cliente</p>
          </div>
          {!showForm && (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1 text-xs text-[var(--color-v4-red)] hover:text-white transition-colors">
              <Plus size={14} /> Adicionar
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="mx-5 mb-4 p-4 rounded-lg bg-[var(--color-v4-surface)] border border-[var(--color-v4-border)] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white">{editingId ? "Editar stakeholder" : "Novo stakeholder"}</p>
              <button onClick={resetForm} className="text-[var(--color-v4-text-muted)] hover:text-white"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[var(--color-v4-text-muted)] mb-1">Nome *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" placeholder="Nome do contato" />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--color-v4-text-muted)] mb-1">Cargo</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" placeholder="CEO, Marketing, etc." />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--color-v4-text-muted)] mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" placeholder="email@empresa.com" />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--color-v4-text-muted)] mb-1">Telefone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" placeholder="(00) 00000-0000" />
              </div>
            </div>
            <button onClick={handleSave} className="w-full py-2 bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5">
              <Save size={13} /> {editingId ? "Salvar" : "Adicionar"}
            </button>
          </div>
        )}

        {/* List */}
        <div className="px-5 pb-5">
          {projectStakeholders.length === 0 ? (
            <p className="text-sm text-[var(--color-v4-text-disabled)] py-4 text-center">Nenhum stakeholder cadastrado</p>
          ) : (
            <div className="space-y-2">
              {projectStakeholders.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-v4-surface)]">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400 uppercase shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-v4-text-muted)]">
                      {s.role && <span>{s.role}</span>}
                      {s.email && <span className="truncate">{s.email}</span>}
                      {s.phone && <span>{s.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleEdit(s)} className="p-1.5 text-[var(--color-v4-text-disabled)] hover:text-white transition-colors"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-[var(--color-v4-text-disabled)] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
