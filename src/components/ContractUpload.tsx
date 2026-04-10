"use client";

import React, { useState } from "react";
import { useAppStore } from "@/providers/app-provider";
import { Project } from "@/types";
import { UploadCloud, FileText, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function ContractUpload({ project }: { project: Project }) {
  const { updateProject } = useAppStore();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo muito grande (max 10MB)"); return; }
    if (file.type !== "application/pdf") { toast.error("Apenas arquivos PDF"); return; }

    setUploading(true);
    try {
      const path = `contratos/${project.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from("contracts").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("contracts").getPublicUrl(path);

      updateProject(project.id, { contractUrl: publicUrl, contractFilename: file.name } as any);
      toast.success("Contrato enviado!");
    } catch (err: any) {
      toast.error(`Erro no upload: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    updateProject(project.id, { contractUrl: null, contractFilename: null } as any);
    toast.success("Contrato removido");
  };

  return (
    <div>
      {project.contractUrl && project.contractFilename ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-v4-surface)] border border-[var(--color-v4-border)]">
          <FileText size={18} className="text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{project.contractFilename}</p>
            <a href={project.contractUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              Visualizar <ExternalLink size={10} />
            </a>
          </div>
          <button onClick={handleRemove} className="p-1.5 text-[var(--color-v4-text-disabled)] hover:text-red-400 transition-colors" title="Remover">
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-[var(--color-v4-border)] hover:border-[var(--color-v4-text-muted)] cursor-pointer transition-colors">
          {uploading ? (
            <><Loader2 size={16} className="animate-spin text-[var(--color-v4-text-muted)]" /> <span className="text-xs text-[var(--color-v4-text-muted)]">Enviando...</span></>
          ) : (
            <><UploadCloud size={16} className="text-[var(--color-v4-text-disabled)]" /> <span className="text-xs text-[var(--color-v4-text-disabled)]">Upload contrato (PDF, max 10MB)</span></>
          )}
          <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
