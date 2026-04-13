"use client";

import React, { useState } from "react";
import { useAppStore } from "@/providers/app-provider";
import { Project } from "@/types";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  createGChatSpace,
  createWppGroup,
  createDriveFolders,
  createEkyteWorkspace,
} from "@/lib/webhooks";
import toast from "react-hot-toast";

export function WorkspaceCreationButton({ project }: { project: Project }) {
  const { updateProject, members, projectMembers, stakeholders } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);

  const ws = project.workspaceStatus || { gchat: "pending", whatsapp: "pending", gdrive: "pending", ekyte: "pending" };
  const allCreated = ws.gchat === "created" && ws.whatsapp === "created" && ws.gdrive === "created" && ws.ekyte === "created";

  const handleCreate = async () => {
    if (project.workspaceCreationStarted || allCreated) return;
    setIsCreating(true);

    const prevStatus = { ...ws };
    const newStatus: any = { ...prevStatus };
    if (prevStatus.gchat !== "created") newStatus.gchat = "creating";
    if (prevStatus.whatsapp !== "created") newStatus.whatsapp = "creating";
    if (prevStatus.gdrive !== "created") newStatus.gdrive = "creating";
    if (prevStatus.ekyte !== "created") newStatus.ekyte = "creating";

    updateProject(project.id, {
      workspaceCreationStarted: true,
      workspaceStatus: newStatus,
    });

    try {
      // Persist to DB
      await supabase.from("project").update({
        workspace_creation_started: true,
        workspace_status: newStatus,
      }).eq("id", project.id);

      // Gather team data
      const team = projectMembers.filter((pm) => pm.projectId === project.id);
      const teamMemberObjs = team.map((t) => members.find((m) => m.id === t.memberId)).filter(Boolean);
      const teamEmails = teamMemberObjs.map((m) => m!.email);
      const teamPhones = teamMemberObjs.map((m) => m!.phone).filter(Boolean);

      const fixedEmails = ["tiago.bardini@v4company.com", "patrick.rosavianna@v4company.com", "gabriel.sartori@v4company.com"];

      let coordEmail = "";
      let coordPhone = "";
      if (project.assignedCoordinatorId) {
        const coord = members.find((m) => m.id === project.assignedCoordinatorId);
        if (coord) { coordEmail = coord.email; coordPhone = coord.phone; }
      }

      const allEmails = [...new Set([...fixedEmails, coordEmail, ...teamEmails])].filter(Boolean);

      const projectStakeholders = stakeholders.filter((s) => s.projectId === project.id);
      const stakeholderPhones = projectStakeholders.map((s) => s.phone).filter(Boolean) as string[];

      const fixedPhones = ["554796769946"];
      const fixedAdminPhones = ["554796769946"];

      // Gabriel Soligo: admin fixo em todos os grupos
      const gabriel = members.find((m) => m.email === "gabriel.bianchini@v4company.com");
      const gabrielPhone = gabriel?.phone || "";

      const allPhones = [...new Set([...fixedPhones, gabrielPhone, coordPhone, ...teamPhones, ...stakeholderPhones])].filter(Boolean);
      const adminPhones = [...new Set([...fixedAdminPhones, gabrielPhone, coordPhone])].filter(Boolean);

      // Fire webhooks (fire-and-forget per env)
      if (prevStatus.gchat !== "created") {
        createGChatSpace(project.id, project.clientName, allEmails).catch((err) => {
          console.error("GChat falhou:", err);
          supabase.from("project").update({ workspace_status: { ...ws, gchat: "error" } }).eq("id", project.id);
        });
      }

      if (prevStatus.whatsapp !== "created") {
        createWppGroup(project.id, project.clientName, allPhones, adminPhones).catch((err) => {
          console.error("WhatsApp falhou:", err);
          supabase.from("project").update({ workspace_status: { ...ws, whatsapp: "error" } }).eq("id", project.id);
        });
      }

      if (prevStatus.gdrive !== "created") {
        createDriveFolders(project.id, project.clientName, coordEmail).catch((err) => {
          console.error("Drive falhou:", err);
          supabase.from("project").update({ workspace_status: { ...ws, gdrive: "error" } }).eq("id", project.id);
        });
      }

      if (prevStatus.ekyte !== "created") {
        createEkyteWorkspace(project.id, project.clientName, allEmails).catch((err) => {
          console.error("Ekyte falhou:", err);
          supabase.from("project").update({ workspace_status: { ...ws, ekyte: "error" } }).eq("id", project.id);
        });
      }

      toast.success("Criacao de ambientes iniciada!");
    } catch (err) {
      console.error("Erro geral criar workspace:", err);
      toast.error("Erro ao iniciar criacao de ambientes");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isCreating || allCreated || project.workspaceCreationStarted}
      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
    >
      {isCreating ? (
        <><Loader2 size={18} className="animate-spin" /> Criando ambientes...</>
      ) : allCreated ? (
        <><CheckCircle2 size={18} /> Ambientes Criados</>
      ) : project.workspaceCreationStarted ? (
        <><Building2 size={18} /> Criacao Inicializada</>
      ) : (
        <><Building2 size={18} /> Criar Ambientes (Automatico)</>
      )}
    </button>
  );
}
