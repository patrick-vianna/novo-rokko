"use client";

import React, { useState } from "react";
import { useAppStore } from "@/providers/app-provider";
import { Project } from "@/types";
import {
  CheckCircle2, CircleDashed, Clock, Loader2,
  MessageSquare, FolderOpen, Globe, Pencil, Save, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceCreationButton } from "@/components/WorkspaceCreationButton";
import toast from "react-hot-toast";

const ENV_CONFIG = [
  { key: "gchat" as const, label: "Google Chat", icon: MessageSquare, linkField: "gchatLink", statusField: "gchat" as const },
  { key: "whatsapp" as const, label: "WhatsApp", icon: MessageSquare, linkField: "wppGroupLink", statusField: "whatsapp" as const },
  { key: "gdrive" as const, label: "Google Drive", icon: FolderOpen, linkField: "gdriveFolderLink", statusField: "gdrive" as const },
  { key: "ekyte" as const, label: "Ekyte", icon: Globe, linkField: "ekyteLink", statusField: "ekyte" as const },
];

function getStatus(wsStatus: string | undefined, link: string | undefined) {
  if (wsStatus === "created" || link) return "created";
  if (wsStatus === "pending") return "pending";
  return "none";
}

const STATUS_UI = {
  created: { icon: <CheckCircle2 size={14} />, color: "text-emerald-400", label: "Criado" },
  pending: { icon: <Clock size={14} />, color: "text-amber-400", label: "Pendente" },
  none: { icon: <CircleDashed size={14} />, color: "text-[var(--color-v4-text-disabled)]", label: "Nao adicionado" },
};

export function TabWorkspace({ project }: { project: Project }) {
  const { updateProject } = useAppStore();
  const ws = project.workspaceStatus;

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [editingShared, setEditingShared] = useState(false);
  const [sharedValue, setSharedValue] = useState("");

  const handleStartEdit = (e: React.MouseEvent, key: string, currentLink: string) => {
    e.stopPropagation();
    setEditingKey(key);
    setEditValue(currentLink || "");
  };

  const handleCancel = () => { setEditingKey(null); setEditValue(""); };

  const handleSave = async (statusField: string, linkField: string) => {
    setIsSaving(true);
    try {
      const updates: Record<string, any> = { [linkField]: editValue || null };
      if (editValue) updates.workspaceStatus = { [statusField]: "created" };
      else updates.workspaceStatus = { [statusField]: "pending" };
      updateProject(project.id, updates);
      setEditingKey(null);
      setEditValue("");
      toast.success("Link salvo!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
    finally { setIsSaving(false); }
  };

  const handleSaveShared = async () => {
    setIsSaving(true);
    try {
      updateProject(project.id, { gdriveSharedFolderLink: sharedValue || null } as any);
      setEditingShared(false);
      setSharedValue("");
      toast.success("Link salvo!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
    finally { setIsSaving(false); }
  };

  const sharedLink = (project as any).gdriveSharedFolderLink as string | undefined;
  const sharedStatus = sharedLink ? "created" : "none";
  const sharedUi = STATUS_UI[sharedStatus];

  return (
    <div className="space-y-6">
      <section className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider">Workspaces</h3>
          {(() => {
            const allCreated = ws?.gchat === "created" && ws?.whatsapp === "created" && ws?.gdrive === "created" && ws?.ekyte === "created";
            return !allCreated ? <WorkspaceCreationButton project={project} compact /> : null;
          })()}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ENV_CONFIG.map(({ key, label, icon: Icon, linkField, statusField }) => {
            const link = (project as any)[linkField] as string | undefined;
            const status = getStatus(ws?.[statusField], link);
            const ui = STATUS_UI[status];
            const isEditing = editingKey === key;
            const isClickable = status === "created" && link && !isEditing;

            return (
              <div
                key={key}
                onClick={isClickable ? () => window.open(link, "_blank") : undefined}
                className={cn(
                  "rounded-lg border group relative",
                  isClickable
                    ? "bg-[var(--color-v4-surface)] border-emerald-500/20 cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-colors"
                    : "bg-[var(--color-v4-surface)] border-[var(--color-v4-border)]",
                )}
              >
                <div className="flex items-center gap-3 p-4">
                  <Icon size={18} className="text-[var(--color-v4-text-muted)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={ui.color}>{ui.icon}</span>
                      <span className={cn("text-xs", ui.color)}>{ui.label}</span>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={(e) => handleStartEdit(e, key, link || "")}
                      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-bg)] transition-all"
                      title="Editar link"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                </div>

                {isEditing && (
                  <div className="px-4 pb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="url"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Cole o link aqui..."
                      autoFocus
                      className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white placeholder:text-[var(--color-v4-text-disabled)] focus:ring-1 focus:ring-[var(--color-v4-red)]"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button onClick={handleCancel} disabled={isSaving} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-medium text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-bg)] transition-colors">
                        <X size={11} /> Cancelar
                      </button>
                      <button onClick={() => handleSave(statusField, linkField)} disabled={isSaving} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-medium bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white transition-colors disabled:opacity-60">
                        {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Salvar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Pasta compartilhada */}
      <div
        onClick={sharedStatus === "created" && sharedLink && !editingShared ? () => window.open(sharedLink, "_blank") : undefined}
        className={cn(
          "bg-[var(--color-v4-card)] border rounded-xl group",
          sharedStatus === "created" && !editingShared
            ? "border-emerald-500/20 cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-colors"
            : "border-[var(--color-v4-border)]",
        )}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider">Pasta Compartilhada</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={sharedUi.color}>{sharedUi.icon}</span>
              <span className={cn("text-xs", sharedUi.color)}>{sharedUi.label}</span>
            </div>
          </div>
          {!editingShared && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditingShared(true); setSharedValue(sharedLink || ""); }}
              className="p-1.5 rounded-md opacity-40 group-hover:opacity-100 text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-surface)] transition-all"
              title="Editar"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>

        {editingShared && (
          <div className="px-5 pb-5 space-y-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="url"
              value={sharedValue}
              onChange={(e) => setSharedValue(e.target.value)}
              placeholder="Cole o link da pasta compartilhada..."
              autoFocus
              className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-sm text-white placeholder:text-[var(--color-v4-text-disabled)] focus:ring-1 focus:ring-[var(--color-v4-red)]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingShared(false)} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-surface)] transition-colors">
                <X size={13} /> Cancelar
              </button>
              <button onClick={handleSaveShared} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white transition-colors disabled:opacity-60">
                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
