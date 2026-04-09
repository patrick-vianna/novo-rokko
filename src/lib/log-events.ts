import {
  ArrowRight, GitBranch, Plus, Pencil, UserPlus, UserMinus,
  FolderPlus, FolderPen, KeyRound, Eye, MessageSquare, Flag, RefreshCw,
  type LucideIcon,
} from "lucide-react";

export interface LogEventConfig {
  icon: LucideIcon;
  color: string;
  label: string;
  category: string;
}

export const LOG_EVENTS: Record<string, LogEventConfig> = {
  stage_changed:       { icon: ArrowRight,    color: "text-blue-400 bg-blue-500/10",    label: "Mudanca de estagio", category: "estagios" },
  pipeline_routed:     { icon: GitBranch,     color: "text-purple-400 bg-purple-500/10", label: "Roteamento de pipeline", category: "estagios" },
  pipeline_moved:      { icon: GitBranch,     color: "text-purple-400 bg-purple-500/10", label: "Movido de pipeline", category: "estagios" },
  project_created:     { icon: Plus,          color: "text-emerald-400 bg-emerald-500/10", label: "Projeto criado", category: "edicoes" },
  project_edited:      { icon: Pencil,        color: "text-yellow-400 bg-yellow-500/10", label: "Projeto editado", category: "edicoes" },
  member_assigned:     { icon: UserPlus,      color: "text-emerald-400 bg-emerald-500/10", label: "Membro adicionado", category: "equipe" },
  member_removed:      { icon: UserMinus,     color: "text-red-400 bg-red-500/10",       label: "Membro removido", category: "equipe" },
  workspace_created:   { icon: FolderPlus,    color: "text-cyan-400 bg-cyan-500/10",     label: "Workspace criado", category: "edicoes" },
  workspace_edited:    { icon: FolderPen,     color: "text-yellow-400 bg-yellow-500/10", label: "Workspace editado", category: "edicoes" },
  credential_created:  { icon: KeyRound,      color: "text-emerald-400 bg-emerald-500/10", label: "Credencial criada", category: "credenciais" },
  credential_updated:  { icon: KeyRound,      color: "text-yellow-400 bg-yellow-500/10", label: "Credencial atualizada", category: "credenciais" },
  credential_deleted:  { icon: KeyRound,      color: "text-red-400 bg-red-500/10",       label: "Credencial removida", category: "credenciais" },
  credential_viewed:   { icon: Eye,           color: "text-zinc-400 bg-zinc-500/10",     label: "Senha visualizada", category: "credenciais" },
  note_added:          { icon: MessageSquare, color: "text-blue-400 bg-blue-500/10",     label: "Observacao editada", category: "edicoes" },
  churned:             { icon: Flag,          color: "text-orange-400 bg-orange-500/10", label: "Churn", category: "estagios" },
  reactivated:         { icon: RefreshCw,     color: "text-emerald-400 bg-emerald-500/10", label: "Reativado", category: "estagios" },
  ee_converted:        { icon: RefreshCw,     color: "text-emerald-400 bg-emerald-500/10", label: "Convertido para recorrente", category: "estagios" },
  ee_completed:        { icon: Flag,          color: "text-zinc-400 bg-zinc-500/10",     label: "EE encerrado", category: "estagios" },
  welcome_sent:        { icon: MessageSquare, color: "text-pink-400 bg-pink-500/10",     label: "Boas-vindas enviadas", category: "estagios" },
};

export const LOG_CATEGORIES = [
  { id: "todos", label: "Todos" },
  { id: "edicoes", label: "Edicoes" },
  { id: "estagios", label: "Estagios" },
  { id: "credenciais", label: "Credenciais" },
  { id: "equipe", label: "Equipe" },
];

const STAGE_LABELS: Record<string, string> = {
  aguardando_comercial: "Aguardando Comercial", atribuir_coordenador: "Atribuir Coordenador",
  atribuir_equipe: "Atribuir Equipe", criar_workspace: "Criar Workspace",
  boas_vindas: "Boas-vindas", kickoff: "Kickoff", planejamento: "Planejamento",
  ongoing: "Ongoing", churn: "Churn",
  ee_semana_1: "Semana 1", ee_semana_2: "Semana 2", ee_semana_3: "Semana 3",
  ee_semana_4: "Semana 4", ee_semana_5: "Semana 5", encerrado: "Encerrado",
};

const FIELD_LABELS: Record<string, string> = {
  clientName: "Nome do cliente", clientCnpj: "CNPJ", clientPhone: "Telefone", clientEmail: "Email",
  kommoLink: "Link Kommo", linkCallVendas: "Link Call Vendas", linkTranscricao: "Link Transcricao",
  metaAdsAccountId: "ID Meta Ads", googleAdsAccountId: "ID Google Ads",
  name: "Nome do projeto", valorEscopo: "Valor Escopo", valorRecorrente: "Valor Recorrente",
  projectStartDate: "Inicio Projeto", firstPaymentDate: "1o Pagamento",
  observacoes: "Observacoes", gchatLink: "Link GChat", wppGroupLink: "Link WhatsApp",
  gdriveFolderLink: "Link GDrive", ekyteLink: "Link Ekyte", gdriveSharedFolderLink: "Pasta Compartilhada",
};

export function formatLogDescription(action: string, details: any): string {
  if (!details) return LOG_EVENTS[action]?.label || action;

  switch (action) {
    case "stage_changed":
      return `Avancou de ${STAGE_LABELS[details.from] || details.from || "?"} para ${STAGE_LABELS[details.to] || details.to || "?"}`;
    case "pipeline_routed":
      return `Roteado para pipeline ${details.to || "?"} — estagio ${STAGE_LABELS[details.targetStage] || details.targetStage || "?"}`;
    case "pipeline_moved":
      return `Movido de ${details.fromPipeline || "?"} (${STAGE_LABELS[details.fromStage] || "?"}) para ${details.toPipeline || "?"} (${STAGE_LABELS[details.toStage] || "?"})`;
    case "project_edited":
      if (details.changes && Array.isArray(details.changes)) {
        return details.changes.map((c: any) => `${FIELD_LABELS[c.field] || c.field}: "${c.from || "—"}" → "${c.to || "—"}"`).join(", ");
      }
      if (details.field) return `${FIELD_LABELS[details.field] || details.field}: "${details.from || "—"}" → "${details.to || "—"}"`;
      return "Projeto editado";
    case "member_assigned":
      return `Adicionou ${details.memberName || "membro"} como ${details.role || "membro"}`;
    case "member_removed":
      return `Removeu ${details.memberName || "membro"} do projeto`;
    case "credential_created":
      return `Credencial ${details.serviceName || ""} adicionada`;
    case "credential_updated":
      return `Credencial ${details.serviceName || ""} atualizada`;
    case "credential_deleted":
      return `Credencial ${details.serviceName || ""} removida`;
    case "credential_viewed":
      return `Visualizou senha de ${details.serviceName || ""}`;
    case "workspace_edited":
      return `Link ${details.workspace || ""} atualizado`;
    case "note_added":
      return "Observacoes atualizadas";
    case "churned":
      return `Movido para churn${details.reason ? `: ${details.reason}` : ""}`;
    case "ee_converted":
      return "Convertido de EE para Recorrente";
    case "ee_completed":
      return "Projeto EE encerrado";
    default:
      return LOG_EVENTS[action]?.label || action.replace(/_/g, " ");
  }
}

export function getLogEventConfig(action: string): LogEventConfig {
  return LOG_EVENTS[action] || { icon: ArrowRight, color: "text-zinc-400 bg-zinc-500/10", label: action, category: "edicoes" };
}
