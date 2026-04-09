"use client";

import React, { useState } from "react";
import { useAppStore } from "@/providers/app-provider";
import { Project } from "@/types";
import { MessageSquare, Pencil, Save, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function TabObservacoes({ project }: { project: Project }) {
  const { updateProject } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(project.observacoes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setText(project.observacoes || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setText(project.observacoes || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateProject(project.id, { observacoes: text || null } as any);
      setIsEditing(false);
      toast.success("Observacoes salvas!");
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl group">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider flex items-center gap-2">
          <MessageSquare size={14} /> Observacoes da Equipe
        </h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-md opacity-40 group-hover:opacity-100 text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-surface)] transition-all"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      <div className="px-5 pb-5">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            autoFocus
            placeholder="Notas livres sobre o projeto, decisoes, pontos de atencao..."
            className="w-full p-3 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-lg text-sm text-white placeholder:text-[var(--color-v4-text-disabled)] focus:ring-1 focus:ring-[var(--color-v4-red)] resize-y min-h-[200px]"
          />
        ) : (
          <div className="min-h-[60px]">
            {project.observacoes ? (
              <p className="text-sm text-white whitespace-pre-wrap">{project.observacoes}</p>
            ) : (
              <p className="text-sm text-[var(--color-v4-text-disabled)]">—</p>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--color-v4-border)] bg-[var(--color-v4-surface)]/30 rounded-b-xl">
          <button onClick={handleCancel} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-surface)] transition-colors">
            <X size={13} /> Cancelar
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white transition-colors disabled:opacity-60">
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Salvar
          </button>
        </div>
      )}
    </section>
  );
}
