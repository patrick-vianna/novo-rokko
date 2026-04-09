"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabaseRealtime } from "@/lib/supabase-realtime";
import { useSession } from "@/lib/auth-client";
import {
  Member,
  Project,
  ProjectMember,
  Stakeholder,
  Company,
  OnboardingLog,
  Stage,
} from "@/types";
import toast from "react-hot-toast";
import { STAGE_LABELS, type ProjectContext } from "@/lib/workflow-types";

// Helper: map Drizzle row (camelCase from schema) to frontend types
function mapMember(m: any): Member {
  return { id: m.id, name: m.name, nickname: m.nickname, email: m.email, phone: m.phone, role: m.role, isActive: m.isActive ?? m.is_active };
}

function mapProject(p: any): Project {
  return {
    id: p.id, name: p.name, clientName: p.clientName ?? p.client_name, clientPhone: p.clientPhone ?? p.client_phone,
    clientCnpj: p.clientCnpj ?? p.client_cnpj, clientEmail: p.clientEmail ?? p.client_email,
    kommoLeadId: p.kommoLeadId ?? p.kommo_lead_id, kommoLink: p.kommoLink ?? p.kommo_link, ekyteId: p.ekyteId ?? p.ekyte_id,
    product: p.products, contractValue: p.contractValue ?? p.contract_value, meetingLinks: p.meetingLinks ?? p.meeting_links,
    produtosEscopo: p.produtosEscopo ?? p.produtos_escopo, valorEscopo: p.valorEscopo ?? p.valor_escopo,
    dataInicioEscopo: p.dataInicioEscopo ?? p.data_inicio_escopo, dataPgtoEscopo: p.dataPgtoEscopo ?? p.data_pgto_escopo,
    produtosRecorrente: p.produtosRecorrente ?? p.produtos_recorrente, valorRecorrente: p.valorRecorrente ?? p.valor_recorrente,
    dataInicioRecorrente: p.dataInicioRecorrente ?? p.data_inicio_recorrente, dataPgtoRecorrente: p.dataPgtoRecorrente ?? p.data_pgto_recorrente,
    linkCallVendas: p.linkCallVendas ?? p.link_call_vendas, linkTranscricao: p.linkTranscricao ?? p.link_transcricao,
    observacoes: p.observacoes, contractUrl: p.contractUrl ?? p.contract_url, contractFilename: p.contractFilename ?? p.contract_filename,
    firstPaymentDate: p.firstPaymentDate ?? p.first_payment_date, projectStartDate: p.projectStartDate ?? p.project_start_date,
    assignedCoordinatorId: p.assignedCoordinatorId ?? p.assigned_coordinator_id, assignedById: p.assignedById ?? p.assigned_by_id,
    soldById: p.soldById ?? p.sold_by_id, soldBy: p.soldBy ?? p.sold_by,
    gchatSpaceId: p.gchatSpaceId ?? p.gchat_space_id, gchatLink: p.gchatLink ?? p.gchat_link,
    wppGroupId: p.wppGroupId ?? p.wpp_group_id, wppGroupLink: p.wppGroupLink ?? p.wpp_group_link,
    gdriveFolderId: p.gdriveFolderId ?? p.gdrive_folder_id, gdriveFolderLink: p.gdriveFolderLink ?? p.gdrive_folder_link,
    gdriveSharedFolderId: p.gdriveSharedFolderId ?? p.gdrive_shared_folder_id, gdriveSharedFolderLink: p.gdriveSharedFolderLink ?? p.gdrive_shared_folder_link,
    ekyteLink: p.ekyteLink ?? p.ekyte_link,
    metaAdsAccountId: p.metaAdsAccountId ?? p.meta_ads_account_id, googleAdsAccountId: p.googleAdsAccountId ?? p.google_ads_account_id,
    workspaceStatus: p.workspaceStatus ?? p.workspace_status, workspaceCreationStarted: p.workspaceCreationStarted ?? p.workspace_creation_started,
    stage: p.stage, welcomeSent: p.welcomeSent ?? p.welcome_sent,
    stageChangedAt: p.stageChangedAt ?? p.stage_changed_at, createdAt: p.createdAt ?? p.created_at, updatedAt: p.updatedAt ?? p.updated_at,
  } as any;
}

function mapProjectMember(pm: any): ProjectMember {
  return { id: pm.id, projectId: pm.projectId ?? pm.project_id, memberId: pm.memberId ?? pm.member_id, roleInProject: pm.roleInProject ?? pm.role_in_project };
}

function mapStakeholder(s: any): Stakeholder {
  return { id: s.id, name: s.name, phone: s.phone, email: s.email, role: s.role, projectId: s.projectId ?? s.project_id };
}

function mapLog(l: any): OnboardingLog {
  return { id: l.id, projectId: l.projectId ?? l.project_id, action: l.action, details: l.details, performedBy: l.performedBy ?? l.performed_by, createdAt: l.createdAt ?? l.created_at };
}

// Helper: snake_case payload for API writes
function toSnake(updates: Record<string, any>): Record<string, any> {
  const map: Record<string, string> = {
    clientName: "clientName", clientPhone: "clientPhone", clientCnpj: "clientCnpj", clientEmail: "clientEmail",
    contractValue: "contractValue", meetingLinks: "meetingLinks", product: "products",
    produtosEscopo: "produtosEscopo", valorEscopo: "valorEscopo", dataInicioEscopo: "dataInicioEscopo", dataPgtoEscopo: "dataPgtoEscopo",
    produtosRecorrente: "produtosRecorrente", valorRecorrente: "valorRecorrente", dataInicioRecorrente: "dataInicioRecorrente", dataPgtoRecorrente: "dataPgtoRecorrente",
    linkCallVendas: "linkCallVendas", linkTranscricao: "linkTranscricao", contractUrl: "contractUrl", contractFilename: "contractFilename",
    assignedCoordinatorId: "assignedCoordinatorId", assignedById: "assignedById",
    gchatSpaceId: "gchatSpaceId", gchatLink: "gchatLink", wppGroupId: "wppGroupId", wppGroupLink: "wppGroupLink",
    gdriveFolderId: "gdriveFolderId", gdriveFolderLink: "gdriveFolderLink", gdriveSharedFolderId: "gdriveSharedFolderId", gdriveSharedFolderLink: "gdriveSharedFolderLink",
    ekyteId: "ekyteId", ekyteLink: "ekyteLink", welcomeSent: "welcomeSent", workspaceCreationStarted: "workspaceCreationStarted",
    workspaceStatus: "workspaceStatus", isActive: "isActive",
  };
  const payload: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    payload[map[key] || key] = value;
  }
  return payload;
}

interface AppState {
  currentUser: Member | null;
  isLoadingAuth: boolean;
  members: Member[];
  projects: Project[];
  projectMembers: ProjectMember[];
  stakeholders: Stakeholder[];
  company: Company;
  logs: OnboardingLog[];

  updateProject: (id: string, updates: Partial<Project>) => void;
  moveProject: (id: string, newStage: Stage) => void;
  addProject: (payload: any, teamRoles: any) => Promise<void>;

  addMember: (member: Member) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  removeMember: (id: string) => void;

  addProjectMember: (pm: ProjectMember) => void;
  removeProjectMember: (id: string) => void;

  addStakeholder: (stakeholder: Stakeholder) => void;
  updateStakeholder: (id: string, updates: Partial<Stakeholder>) => void;
  removeStakeholder: (id: string) => void;

  updateCompany: (updates: Partial<Company>) => void;

  addLog: (log: OnboardingLog) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, isPending: isSessionLoading } = useSession();

  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [company, setCompany] = useState<Company>({ id: "1", name: "Carregando...", cnpj: "", address: "", phone: "" });
  const [logs, setLogs] = useState<OnboardingLog[]>([]);

  // Auth: buscar member logado
  useEffect(() => {
    if (isSessionLoading) return;
    if (!session?.user?.email) { setCurrentUser(null); setIsLoadingAuth(false); return; }

    const fetchCurrentMember = async () => {
      try {
        const data = await apiFetch("/api/data/members");
        const me = (data as any[]).find((m: any) => m.email === session.user.email);
        if (me) {
          setCurrentUser(mapMember(me));
          fetchInitialData();
        }
      } catch (error) {
        console.error("Erro ao buscar member logado:", error);
        setCurrentUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    fetchCurrentMember();
  }, [session, isSessionLoading]);

  // Realtime subscriptions (Supabase SDK — only for realtime, no data queries)
  const channelsRef = useRef<ReturnType<typeof supabaseRealtime.channel>[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    channelsRef.current.forEach((ch) => supabaseRealtime.removeChannel(ch));
    channelsRef.current = [];

    const projectsChannel = supabaseRealtime
      .channel("projects-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "project" }, () => { fetchProjectsOnly(); })
      .subscribe();

    const membersChannel = supabaseRealtime
      .channel("members-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "member" }, () => { fetchMembersOnly(); })
      .subscribe();

    channelsRef.current = [projectsChannel, membersChannel];

    return () => {
      channelsRef.current.forEach((ch) => supabaseRealtime.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [currentUser]);

  // ─── Data fetching via API routes (Drizzle on the server) ───

  const fetchProjectsOnly = async () => {
    try {
      const data = await apiFetch("/api/data/projects");
      setProjects((data as any[]).map(mapProject));
    } catch (e) { console.error(e); }
  };

  const fetchMembersOnly = async () => {
    try {
      const data = await apiFetch("/api/data/members");
      setMembers((data as any[]).map(mapMember));
    } catch (e) { console.error(e); }
  };

  const fetchInitialData = async () => {
    try {
      await fetchMembersOnly();

      const companyData = await apiFetch("/api/data/company").catch(() => null);
      if (companyData) setCompany({ id: companyData.id, name: companyData.name, cnpj: companyData.cnpj, address: companyData.address, phone: companyData.phone });

      await fetchProjectsOnly();

      const pmData = await apiFetch("/api/data/project-members");
      setProjectMembers((pmData as any[]).map(mapProjectMember));

      const shData = await apiFetch("/api/data/stakeholders");
      setStakeholders((shData as any[]).map(mapStakeholder));

      const logsData = await apiFetch("/api/data/logs");
      setLogs((logsData as any[]).map(mapLog));
    } catch (err) {
      console.error("Erro ao buscar dados iniciais:", err);
    }
  };

  // ─── Mutations via API routes ───

  const getProjectName = (clientName: string, produtosEscopo?: string[], produtosRecorrente?: string[]) => {
    const allProducts = [...(produtosEscopo || []), ...(produtosRecorrente || [])];
    if (allProducts.length === 0) return clientName;
    const productsStr = allProducts.map(p => p === "ee" ? "EE" : p === "byline" ? "Byline" : p).join(" + ");
    return `${clientName} — ${productsStr}`;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const prevProjects = [...projects];
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates, workspaceStatus: updates.workspaceStatus ? { ...p.workspaceStatus, ...updates.workspaceStatus } : p.workspaceStatus, updatedAt: new Date().toISOString() };
          if (updates.clientName !== undefined || updates.produtosEscopo !== undefined || updates.produtosRecorrente !== undefined) {
            updated.name = getProjectName(updated.clientName || p.clientName, updated.produtosEscopo || p.produtosEscopo, updated.produtosRecorrente || p.produtosRecorrente);
          }
          return updated;
        }
        return p;
      }),
    );

    try {
      const payload = toSnake(updates);
      if (updates.workspaceStatus) {
        const target = projects.find(p => p.id === id);
        if (target) payload.workspaceStatus = { ...target.workspaceStatus, ...updates.workspaceStatus };
      }
      if (Object.keys(payload).length > 0) {
        await apiFetch(`/api/data/projects/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      }
    } catch (err: any) {
      toast.error(`Erro ao atualizar projeto: ${err.message}`);
      setProjects(prevProjects);
    }
  };

  const moveProject = async (id: string, newStage: Stage) => {
    const proj = projects.find(p => p.id === id);
    const prevStage = proj?.stage;
    const prevProjects = [...projects];
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, stage: newStage, updatedAt: new Date().toISOString() } : p));

    try {
      await apiFetch(`/api/data/projects/${id}/stage`, { method: "PUT", body: JSON.stringify({ stage: newStage }) });
      addLog({ projectId: id, action: "stage_changed", details: { from: prevStage, to: newStage }, performedBy: currentUser?.id } as any);

      if (proj && prevStage) dispatchStageChangeWorkflows(proj, prevStage, newStage);
    } catch (err: any) {
      toast.error(`Erro ao mudar etapa: ${err.message}`);
      setProjects(prevProjects);
    }
  };

  const dispatchStageChangeWorkflows = async (proj: Project, fromStage: Stage, toStage: Stage) => {
    try {
      const workflows = await apiFetch("/api/workflows");
      const activeWorkflows = (workflows as any[]).filter((w: any) => w.active);
      const matching = activeWorkflows.filter((w: any) => {
        const flowData = w.flowData ?? w.flow_data;
        if (!flowData?.nodes) return false;
        return flowData.nodes.some((node: any) => {
          if (node.type !== "stage_change") return false;
          const cfg = node.data?.config;
          if (!cfg) return false;
          return (cfg.fromStage === "*" || cfg.fromStage === fromStage) && (cfg.toStage === "*" || cfg.toStage === toStage);
        });
      });

      if (matching.length === 0) return;

      const coordinator = proj.assignedCoordinatorId ? members.find(m => m.id === proj.assignedCoordinatorId) : undefined;
      const context: ProjectContext = {
        "projeto.id": proj.id, "projeto.nome": proj.name, "projeto.empresa": proj.clientName,
        "projeto.email": proj.clientEmail || "", "projeto.telefone": proj.clientPhone || "",
        "projeto.estagioAnterior": STAGE_LABELS[fromStage] || fromStage, "projeto.estagioNovo": STAGE_LABELS[toStage] || toStage,
        "projeto.coordenador": coordinator?.name || "", "projeto.coordenadorId": proj.assignedCoordinatorId || "",
      };

      for (const wf of matching) {
        const fd = wf.flowData ?? wf.flow_data;
        fetch("/api/workflows/execute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workflowId: wf.id, nodes: fd.nodes, edges: fd.edges, context }) }).catch(console.error);
      }
    } catch (err) { console.error("Erro ao disparar workflows:", err); }
  };

  const addProject = async (payload: any, teamRoles: any) => {
    try {
      const newProject = await apiFetch("/api/data/projects", { method: "POST", body: JSON.stringify(payload) });
      if (teamRoles && Object.keys(teamRoles).length > 0) {
        const promises = Object.entries(teamRoles).map(([role, memberId]) => {
          if (memberId) return apiFetch("/api/data/project-members", { method: "POST", body: JSON.stringify({ projectId: newProject.id, memberId, roleInProject: role }) });
          return Promise.resolve();
        });
        await Promise.all(promises);
      }
      await fetchProjectsOnly();
      await fetchInitialData();
    } catch (err: any) { console.error(err); toast.error(`Erro ao criar projeto: ${err.message}`); throw err; }
  };

  const addMember = async (m: Member) => {
    try {
      const data = await apiFetch("/api/data/members", { method: "POST", body: JSON.stringify({ name: m.name, nickname: m.nickname, email: m.email, phone: m.phone, role: m.role, isActive: m.isActive }) });
      setMembers((prev) => [...prev, mapMember(data)]);
      toast.success("Membro adicionado!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    try {
      await apiFetch(`/api/data/members/${id}`, { method: "PUT", body: JSON.stringify(toSnake(updates)) });
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const removeMember = async (id: string) => {
    try {
      await apiFetch(`/api/data/members/${id}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Membro excluido!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const addProjectMember = async (pm: ProjectMember) => {
    try {
      const data = await apiFetch("/api/data/project-members", { method: "POST", body: JSON.stringify({ projectId: pm.projectId, memberId: pm.memberId, roleInProject: pm.roleInProject }) });
      setProjectMembers((prev) => [...prev, mapProjectMember(data)]);
    } catch (err: any) { toast.error(`Erro ao adicionar membro a equipe: ${err.message}`); }
  };

  const removeProjectMember = async (id: string) => {
    try {
      await apiFetch(`/api/data/project-members/${id}`, { method: "DELETE" });
      setProjectMembers((prev) => prev.filter((pm) => pm.id !== id));
    } catch (err: any) { toast.error(`Erro ao remover equipe: ${err.message}`); }
  };

  const addStakeholder = async (s: Stakeholder) => {
    try {
      const data = await apiFetch("/api/data/stakeholders", { method: "POST", body: JSON.stringify({ name: s.name, phone: s.phone, email: s.email, role: s.role, projectId: s.projectId }) });
      setStakeholders((prev) => [...prev, mapStakeholder(data)]);
      toast.success("Stakeholder adicionado!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const updateStakeholder = async (id: string, updates: Partial<Stakeholder>) => {
    try {
      await apiFetch(`/api/data/stakeholders/${id}`, { method: "PUT", body: JSON.stringify(updates) });
      setStakeholders((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const removeStakeholder = async (id: string) => {
    try {
      await apiFetch(`/api/data/stakeholders/${id}`, { method: "DELETE" });
      setStakeholders((prev) => prev.filter((s) => s.id !== id));
      toast.success("Stakeholder removido!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const updateCompany = async (updates: Partial<Company>) => {
    try {
      await apiFetch("/api/data/company", { method: "PUT", body: JSON.stringify({ id: company.id, ...updates }) });
      setCompany((prev) => ({ ...prev, ...updates }));
      toast.success("Empresa atualizada!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const addLog = async (log: OnboardingLog) => {
    try {
      const data = await apiFetch("/api/data/logs", { method: "POST", body: JSON.stringify({ projectId: log.projectId, action: log.action, details: log.details, performedBy: log.performedBy }) });
      setLogs((prev) => [mapLog(data), ...prev]);
    } catch (err: any) { console.error(err); }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, isLoadingAuth, members, projects, projectMembers, stakeholders, company, logs,
        updateProject, moveProject, addProject,
        addMember, updateMember, removeMember,
        addProjectMember, removeProjectMember,
        addStakeholder, updateStakeholder, removeStakeholder,
        updateCompany, addLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};
