"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
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

  // Quando a sessão do Better Auth resolve, buscar o member correspondente
  useEffect(() => {
    if (isSessionLoading) return;

    if (!session?.user?.email) {
      setCurrentUser(null);
      setIsLoadingAuth(false);
      return;
    }

    const fetchCurrentMember = async () => {
      try {
        const { data, error } = await supabase
          .from("member")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (error) throw error;

        if (data) {
          setCurrentUser({
            id: data.id,
            name: data.name,
            nickname: data.nickname,
            email: data.email,
            phone: data.phone,
            role: data.role,
            isActive: data.is_active,
          });
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

  // Realtime subscriptions — setup separado com cleanup
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Remover channels anteriores (StrictMode / hot reload)
    channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
    channelsRef.current = [];

    const projectsChannel = supabase
      .channel("projects-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "project" }, () => {
        fetchProjectsOnly();
      })
      .subscribe();

    const membersChannel = supabase
      .channel("members-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "member" }, () => {
        fetchMembersOnly();
      })
      .subscribe();

    channelsRef.current = [projectsChannel, membersChannel];

    return () => {
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [currentUser]);

  const fetchProjectsOnly = async () => {
    try {
      const { data: projectsData } = await supabase.from("project").select("*, sold_by:sold_by_id(id, name, nickname)").order("name");
      if (projectsData) {
        setProjects(projectsData.map(p => ({
          id: p.id, name: p.name, clientName: p.client_name, clientPhone: p.client_phone,
          clientCnpj: p.client_cnpj, clientEmail: p.client_email,
          kommoLeadId: p.kommo_lead_id, kommoLink: p.kommo_link, ekyteId: p.ekyte_id,
          product: p.products, contractValue: p.contract_value, meetingLinks: p.meeting_links,
          produtosEscopo: p.produtos_escopo, valorEscopo: p.valor_escopo,
          dataInicioEscopo: p.data_inicio_escopo, dataPgtoEscopo: p.data_pgto_escopo,
          produtosRecorrente: p.produtos_recorrente, valorRecorrente: p.valor_recorrente,
          dataInicioRecorrente: p.data_inicio_recorrente, dataPgtoRecorrente: p.data_pgto_recorrente,
          linkCallVendas: p.link_call_vendas, linkTranscricao: p.link_transcricao,
          observacoes: p.observacoes, contractUrl: p.contract_url, contractFilename: p.contract_filename,
          firstPaymentDate: p.first_payment_date, projectStartDate: p.project_start_date,
          assignedCoordinatorId: p.assigned_coordinator_id, assignedById: p.assigned_by_id,
          soldById: p.sold_by_id, soldBy: p.sold_by,
          gchatSpaceId: p.gchat_space_id, gchatLink: p.gchat_link, wppGroupId: p.wpp_group_id, wppGroupLink: p.wpp_group_link, gdriveFolderId: p.gdrive_folder_id,
          gdriveFolderLink: p.gdrive_folder_link, ekyteLink: p.ekyte_link, gdriveSharedFolderId: p.gdrive_shared_folder_id, gdriveSharedFolderLink: p.gdrive_shared_folder_link,
          metaAdsAccountId: p.meta_ads_account_id, googleAdsAccountId: p.google_ads_account_id,
          workspaceStatus: p.workspace_status, workspaceCreationStarted: p.workspace_creation_started, stage: p.stage, welcomeSent: p.welcome_sent,
          stageChangedAt: p.stage_changed_at, createdAt: p.created_at, updatedAt: p.updated_at
        } as any)));
      }
    } catch (e) { console.error(e); }
  };

  const fetchMembersOnly = async () => {
    try {
      const { data: membersData } = await supabase.from("member").select("*").order("name");
      if (membersData) {
        setMembers(membersData.map(m => ({
          id: m.id, name: m.name, nickname: m.nickname, email: m.email,
          phone: m.phone, role: m.role, isActive: m.is_active
        })));
      }
    } catch (e) { console.error(e); }
  };

  const fetchInitialData = async () => {
    try {
      await fetchMembersOnly();

      const { data: companyData } = await supabase.from("company").select("*").limit(1).single();
      if (companyData) {
        setCompany({ id: companyData.id, name: companyData.name, cnpj: companyData.cnpj, address: companyData.address, phone: companyData.phone });
      }

      await fetchProjectsOnly();

      const { data: pmData } = await supabase.from("project_member").select("*");
      if (pmData) {
        setProjectMembers(pmData.map(pm => ({
          id: pm.id, projectId: pm.project_id, memberId: pm.member_id, roleInProject: pm.role_in_project
        } as any)));
      }

      const { data: shData } = await supabase.from("stakeholder").select("*");
      if (shData) {
        setStakeholders(shData.map(s => ({
          id: s.id, name: s.name, phone: s.phone, email: s.email, role: s.role, projectId: s.project_id
        })));
      }

      const { data: logsData } = await supabase.from("onboarding_log").select("*").order("created_at", { ascending: false });
      if (logsData) {
        setLogs(logsData.map(l => ({
          id: l.id, projectId: l.project_id, action: l.action, details: l.details,
          performedBy: l.performed_by, createdAt: l.created_at
        })));
      }
    } catch (err) {
      console.error("Erro ao buscar dados iniciais:", err);
    }
  };

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
          const updated = {
            ...p, ...updates,
            workspaceStatus: updates.workspaceStatus ? { ...p.workspaceStatus, ...updates.workspaceStatus } : p.workspaceStatus,
            updatedAt: new Date().toISOString()
          };
          if (updates.clientName !== undefined || updates.produtosEscopo !== undefined || updates.produtosRecorrente !== undefined) {
            updated.name = getProjectName(updated.clientName || p.clientName, updated.produtosEscopo || p.produtosEscopo, updated.produtosRecorrente || p.produtosRecorrente);
          }
          return updated;
        }
        return p;
      }),
    );

    try {
      const payload: any = {};
      if (updates.clientName !== undefined) payload.client_name = updates.clientName;
      if (updates.clientPhone !== undefined) payload.client_phone = updates.clientPhone;
      if (updates.clientCnpj !== undefined) payload.client_cnpj = updates.clientCnpj;
      if (updates.clientEmail !== undefined) payload.client_email = updates.clientEmail;
      if (updates.product !== undefined) payload.products = updates.product;
      if (updates.contractValue !== undefined) payload.contract_value = updates.contractValue;
      if (updates.produtosEscopo !== undefined) payload.produtos_escopo = updates.produtosEscopo;
      if (updates.valorEscopo !== undefined) payload.valor_escopo = updates.valorEscopo;
      if (updates.dataInicioEscopo !== undefined) payload.data_inicio_escopo = updates.dataInicioEscopo;
      if (updates.dataPgtoEscopo !== undefined) payload.data_pgto_escopo = updates.dataPgtoEscopo;
      if (updates.produtosRecorrente !== undefined) payload.produtos_recorrente = updates.produtosRecorrente;
      if (updates.valorRecorrente !== undefined) payload.valor_recorrente = updates.valorRecorrente;
      if (updates.dataInicioRecorrente !== undefined) payload.data_inicio_recorrente = updates.dataInicioRecorrente;
      if (updates.dataPgtoRecorrente !== undefined) payload.data_pgto_recorrente = updates.dataPgtoRecorrente;
      if (updates.linkCallVendas !== undefined) payload.link_call_vendas = updates.linkCallVendas;
      if (updates.linkTranscricao !== undefined) payload.link_transcricao = updates.linkTranscricao;
      if (updates.observacoes !== undefined) payload.observacoes = updates.observacoes;
      if (updates.contractUrl !== undefined) payload.contract_url = updates.contractUrl;
      if (updates.contractFilename !== undefined) payload.contract_filename = updates.contractFilename;
      if (updates.meetingLinks !== undefined) payload.meeting_links = updates.meetingLinks;
      if (updates.workspaceStatus !== undefined) {
        const targetProject = projects.find(p => p.id === id);
        if (targetProject) {
          payload.workspace_status = { ...targetProject.workspaceStatus, ...updates.workspaceStatus };
        }
      }
      if (updates.assignedCoordinatorId !== undefined) payload.assigned_coordinator_id = updates.assignedCoordinatorId;
      if (updates.assignedById !== undefined) payload.assigned_by_id = updates.assignedById;
      if (updates.gchatSpaceId !== undefined) payload.gchat_space_id = updates.gchatSpaceId;
      if (updates.gchatLink !== undefined) payload.gchat_link = updates.gchatLink;
      if (updates.wppGroupId !== undefined) payload.wpp_group_id = updates.wppGroupId;
      if (updates.wppGroupLink !== undefined) payload.wpp_group_link = updates.wppGroupLink;
      if (updates.gdriveFolderId !== undefined) payload.gdrive_folder_id = updates.gdriveFolderId;
      if (updates.gdriveFolderLink !== undefined) payload.gdrive_folder_link = updates.gdriveFolderLink;
      if (updates.gdriveSharedFolderId !== undefined) payload.gdrive_shared_folder_id = updates.gdriveSharedFolderId;
      if (updates.gdriveSharedFolderLink !== undefined) payload.gdrive_shared_folder_link = updates.gdriveSharedFolderLink;
      if (updates.ekyteId !== undefined) payload.ekyte_id = updates.ekyteId;
      if (updates.ekyteLink !== undefined) payload.ekyte_link = updates.ekyteLink;
      if (updates.welcomeSent !== undefined) payload.welcome_sent = updates.welcomeSent;
      if (updates.workspaceCreationStarted !== undefined) payload.workspace_creation_started = updates.workspaceCreationStarted;

      if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from("project").update(payload).eq("id", id);
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(`Erro ao atualizar projeto: ${err.message}`);
      setProjects(prevProjects);
    }
  };

  const moveProject = async (id: string, newStage: Stage) => {
    const project = projects.find(p => p.id === id);
    const prevStage = project?.stage;
    const prevProjects = [...projects];
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, stage: newStage, updatedAt: new Date().toISOString() } : p));

    try {
      const { error } = await supabase.from("project").update({ stage: newStage }).eq("id", id);
      if (error) throw error;
      addLog({ projectId: id, action: "stage_changed", details: { from: prevStage, to: newStage }, performedBy: currentUser?.id } as any);

      // Disparar workflows internos de mudança de estágio (em paralelo com n8n)
      if (project && prevStage) {
        dispatchStageChangeWorkflows(project, prevStage, newStage);
      }
    } catch (err: any) {
      toast.error(`Erro ao mudar etapa: ${err.message}`);
      setProjects(prevProjects);
    }
  };

  const dispatchStageChangeWorkflows = async (
    project: Project,
    fromStage: Stage,
    toStage: Stage,
  ) => {
    try {
      // Buscar todos workflows ativos
      const { data: workflows, error } = await supabase
        .from("workflow")
        .select("*")
        .eq("active", true);

      if (error || !workflows) return;

      // Filtrar workflows que têm um nó stage_change que combina com a transição
      const matchingWorkflows = workflows.filter((w: any) => {
        const flowData = w.flow_data;
        if (!flowData?.nodes) return false;
        return flowData.nodes.some((node: any) => {
          if (node.type !== "stage_change") return false;
          const cfg = node.data?.config;
          if (!cfg) return false;
          const fromMatch = cfg.fromStage === "*" || cfg.fromStage === fromStage;
          const toMatch = cfg.toStage === "*" || cfg.toStage === toStage;
          return fromMatch && toMatch;
        });
      });

      if (matchingWorkflows.length === 0) return;

      // Montar contexto do projeto
      const coordinator = project.assignedCoordinatorId
        ? members.find(m => m.id === project.assignedCoordinatorId)
        : undefined;

      const context: ProjectContext = {
        "projeto.id": project.id,
        "projeto.nome": project.name,
        "projeto.empresa": project.clientName,
        "projeto.email": project.clientEmail || "",
        "projeto.telefone": project.clientPhone || "",
        "projeto.estagioAnterior": STAGE_LABELS[fromStage] || fromStage,
        "projeto.estagioNovo": STAGE_LABELS[toStage] || toStage,
        "projeto.coordenador": coordinator?.name || "",
        "projeto.coordenadorId": project.assignedCoordinatorId || "",
      };

      // Disparar cada workflow (fire-and-forget, não bloquear o Kanban)
      for (const workflow of matchingWorkflows) {
        fetch("/api/workflows/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowId: workflow.id,
            nodes: workflow.flow_data.nodes,
            edges: workflow.flow_data.edges,
            context,
          }),
        }).catch((err) => {
          console.error(`Erro ao disparar workflow ${workflow.id}:`, err);
        });
      }
    } catch (err) {
      // Não bloquear a UI se o dispatch falhar
      console.error("Erro ao disparar workflows de mudança de estágio:", err);
    }
  };

  const addProject = async (payload: any, teamRoles: any) => {
    try {
      const { data: newProjectData, error: insertError } = await supabase.from("project").insert(payload).select().single();
      if (insertError) throw insertError;

      if (teamRoles && Object.keys(teamRoles).length > 0) {
        const teamPromises = Object.entries(teamRoles).map(([role, memberId]) => {
          if (memberId) {
            return supabase.from("project_member").insert({ project_id: newProjectData.id, member_id: memberId, role_in_project: role });
          }
          return Promise.resolve();
        });
        await Promise.all(teamPromises);
      }

      await fetchProjectsOnly();
      await fetchInitialData();
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao criar projeto manual: ${err.message}`);
      throw err;
    }
  };

  const addMember = async (member: Member) => {
    try {
      const { data, error } = await supabase.from("member").insert({
        name: member.name, nickname: member.nickname, email: member.email, phone: member.phone, role: member.role, is_active: member.isActive
      }).select().single();
      if (error) throw error;
      setMembers((prev) => [...prev, { id: data.id, name: data.name, nickname: data.nickname, email: data.email, phone: data.phone, role: data.role, isActive: data.is_active }]);
      toast.success("Membro adicionado!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.nickname !== undefined) payload.nickname = updates.nickname;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      const { error } = await supabase.from("member").update(payload).eq("id", id);
      if (error) throw error;
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const removeMember = async (id: string) => {
    try {
      const { error } = await supabase.from("member").delete().eq("id", id);
      if (error) throw error;
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Membro excluído!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const addProjectMember = async (pm: ProjectMember) => {
    try {
      const { data, error } = await supabase.from("project_member").insert({
        project_id: pm.projectId, member_id: pm.memberId, role_in_project: pm.roleInProject
      }).select().single();
      if (error) throw error;
      setProjectMembers((prev) => [...prev, { id: data.id, projectId: data.project_id, memberId: data.member_id, roleInProject: data.role_in_project } as any]);
    } catch (err: any) { toast.error(`Erro ao adicionar membro à equipe: ${err.message}`); }
  };

  const removeProjectMember = async (id: string) => {
    try {
      const { error } = await supabase.from("project_member").delete().eq("id", id);
      if (error) throw error;
      setProjectMembers((prev) => prev.filter((pm) => pm.id !== id));
    } catch (err: any) { toast.error(`Erro ao remover equipe: ${err.message}`); }
  };

  const addStakeholder = async (stakeholder: Stakeholder) => {
    try {
      const { data, error } = await supabase.from("stakeholder").insert({
        name: stakeholder.name, phone: stakeholder.phone, email: stakeholder.email, role: stakeholder.role, project_id: stakeholder.projectId
      }).select().single();
      if (error) throw error;
      setStakeholders((prev) => [...prev, { id: data.id, name: data.name, phone: data.phone, email: data.email, role: data.role, projectId: data.project_id }]);
      toast.success("Stakeholder adicionado!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const updateStakeholder = async (id: string, updates: Partial<Stakeholder>) => {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.role !== undefined) payload.role = updates.role;
      const { error } = await supabase.from("stakeholder").update(payload).eq("id", id);
      if (error) throw error;
      setStakeholders((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const removeStakeholder = async (id: string) => {
    try {
      const { error } = await supabase.from("stakeholder").delete().eq("id", id);
      if (error) throw error;
      setStakeholders((prev) => prev.filter((s) => s.id !== id));
      toast.success("Stakeholder removido!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const updateCompany = async (updates: Partial<Company>) => {
    try {
      const { error } = await supabase.from("company").update(updates).eq("id", company.id);
      if (error) throw error;
      setCompany((prev) => ({ ...prev, ...updates }));
      toast.success("Empresa atualizada!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
  };

  const addLog = async (log: OnboardingLog) => {
    try {
      const { data, error } = await supabase.from("onboarding_log").insert({
        project_id: log.projectId, action: log.action, details: log.details, performed_by: log.performedBy
      }).select().single();
      if (error) throw error;
      setLogs((prev) => [{ id: data.id, projectId: data.project_id, action: data.action, details: data.details, performedBy: data.performed_by, createdAt: data.created_at } as any, ...prev]);
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
