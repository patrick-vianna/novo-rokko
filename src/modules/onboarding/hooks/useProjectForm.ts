"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Project } from "@/types";
import { useAppStore } from "@/providers/app-provider";
import toast from "react-hot-toast";

export interface ProjectFormData {
  clientName: string;
  clientCnpj: string;
  clientPhone: string;
  clientEmail: string;
  kommoLink: string;
  linkCallVendas: string;
  linkTranscricao: string;
  metaAdsAccountId: string;
  googleAdsAccountId: string;
  observacoes: string;
}

function extractFormData(project: Project): ProjectFormData {
  return {
    clientName: project.clientName || "",
    clientCnpj: project.clientCnpj || "",
    clientPhone: project.clientPhone || "",
    clientEmail: project.clientEmail || "",
    kommoLink: project.kommoLink || "",
    linkCallVendas: (project as any).linkCallVendas || "",
    linkTranscricao: (project as any).linkTranscricao || "",
    metaAdsAccountId: project.metaAdsAccountId || "",
    googleAdsAccountId: project.googleAdsAccountId || "",
    observacoes: project.observacoes || "",
  };
}

export function useProjectForm(project: Project) {
  const { updateProject } = useAppStore();
  const [originalData, setOriginalData] = useState(() => extractFormData(project));
  const [formData, setFormData] = useState(() => extractFormData(project));
  const [isSaving, setIsSaving] = useState(false);

  // Sync when project changes from store (e.g. realtime update)
  useEffect(() => {
    const fresh = extractFormData(project);
    setOriginalData(fresh);
    setFormData(fresh);
  }, [project.id, project.updatedAt]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  const updateField = useCallback(<K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const updates: Record<string, any> = {};
      for (const key of Object.keys(formData) as (keyof ProjectFormData)[]) {
        if (formData[key] !== originalData[key]) {
          updates[key] = formData[key] || null;
        }
      }
      if (Object.keys(updates).length > 0) {
        updateProject(project.id, updates as any);
      }
      setOriginalData({ ...formData });
      toast.success("Projeto atualizado com sucesso");
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [formData, originalData, project.id, updateProject]);

  const handleCancel = useCallback(() => {
    setFormData({ ...originalData });
  }, [originalData]);

  // Prevent accidental navigation
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  return {
    formData,
    updateField,
    hasUnsavedChanges,
    isSaving,
    handleSave,
    handleCancel,
  };
}
