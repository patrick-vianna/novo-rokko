export type NodeType =
  | "trigger"
  | "stage_change"
  | "action"
  | "condition"
  | "delay"
  | "webhook"
  | "notification"
  | "database";

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    icon: string;
    config: Record<string, any>;
    status?: "idle" | "running" | "success" | "error";
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  data?: {
    condition?: string;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  createdBy: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: "running" | "completed" | "failed";
  triggerRunId?: string;
  results?: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export const NODE_COLORS: Record<NodeType, string> = {
  trigger: "#00fff5",
  stage_change: "#06b6d4",
  action: "#e63946",
  condition: "#fbbf24",
  delay: "#a855f7",
  webhook: "#22c55e",
  notification: "#3b82f6",
  database: "#f97316",
};

export const NODE_LABELS: Record<NodeType, string> = {
  trigger: "Trigger",
  stage_change: "Mudança de Estágio",
  action: "Ação",
  condition: "Condição",
  delay: "Delay",
  webhook: "Webhook",
  notification: "Notificação",
  database: "Banco de Dados",
};

export const STAGE_LABELS: Record<string, string> = {
  aguardando_comercial: "Aguardando Comercial",
  atribuir_coordenador: "Atribuir Coordenador",
  atribuir_equipe: "Atribuir Equipe",
  criar_workspace: "Criar Workspace",
  boas_vindas: "Boas-vindas",
  kickoff: "Kickoff",
  planejamento: "Planejamento",
  ongoing: "Ongoing",
};

export const STAGE_OPTIONS = [
  { value: "*", label: "Qualquer" },
  ...Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label })),
];

/** Variables available when a workflow is triggered by a stage change */
export const PROJECT_CONTEXT_VARS = [
  { key: "projeto.id", description: "ID do projeto" },
  { key: "projeto.nome", description: "Nome do projeto" },
  { key: "projeto.empresa", description: "Nome do cliente" },
  { key: "projeto.email", description: "E-mail do cliente" },
  { key: "projeto.telefone", description: "Telefone do cliente" },
  { key: "projeto.estagioAnterior", description: "Estágio de origem" },
  { key: "projeto.estagioNovo", description: "Estágio de destino" },
  { key: "projeto.coordenador", description: "Nome do coordenador" },
  { key: "projeto.coordenadorId", description: "ID do coordenador" },
] as const;

export interface ProjectContext {
  "projeto.id": string;
  "projeto.nome": string;
  "projeto.empresa": string;
  "projeto.email": string;
  "projeto.telefone": string;
  "projeto.estagioAnterior": string;
  "projeto.estagioNovo": string;
  "projeto.coordenador": string;
  "projeto.coordenadorId": string;
  [key: string]: string;
}
