export interface PipelineStage {
  id: string;
  label: string;
  order: number;
}

export interface PipelineConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  stages: PipelineStage[];
}

export const PIPELINES: Record<string, PipelineConfig> = {
  onboarding: {
    id: "onboarding",
    name: "Onboarding",
    shortName: "Onboarding",
    description: "Entrada e preparacao de novos projetos",
    color: "#3b82f6",
    stages: [
      { id: "aguardando_comercial", label: "Aguardando Comercial", order: 1 },
      { id: "atribuir_coordenador", label: "Atribuir Coordenador", order: 2 },
      { id: "atribuir_equipe", label: "Atribuir Equipe", order: 3 },
      { id: "criar_workspace", label: "Criar Workspace", order: 4 },
    ],
  },
  recorrente: {
    id: "recorrente",
    name: "Recorrente (Byline)",
    shortName: "Recorrente",
    description: "Projetos com contrato recorrente",
    color: "#22c55e",
    stages: [
      { id: "boas_vindas", label: "Boas-vindas", order: 1 },
      { id: "kickoff", label: "Kickoff", order: 2 },
      { id: "planejamento", label: "Planejamento", order: 3 },
      { id: "ongoing", label: "Ongoing", order: 4 },
      { id: "churn", label: "Churn", order: 5 },
    ],
  },
  estruturacao_estrategica: {
    id: "estruturacao_estrategica",
    name: "Estruturacao Estrategica",
    shortName: "EE",
    description: "Projetos one-time com entregas semanais",
    color: "#f59e0b",
    stages: [
      { id: "ee_semana_1", label: "Semana 1 — Boas-vindas + Kickoff", order: 1 },
      { id: "ee_semana_2", label: "Semana 2 — Estudo de Mercado", order: 2 },
      { id: "ee_semana_3", label: "Semana 3 — Diagnostico de Midia", order: 3 },
      { id: "ee_semana_4", label: "Semana 4 — Comercial", order: 4 },
      { id: "ee_semana_5", label: "Semana 5 — Entregas Finais", order: 5 },
    ],
  },
};

export const PIPELINE_LIST = Object.values(PIPELINES);

export function getProjectPipeline(project: { pipeline?: string }): PipelineConfig {
  return PIPELINES[project.pipeline || "onboarding"] || PIPELINES.onboarding;
}

export function getPipelineStages(pipelineId: string): PipelineStage[] {
  return PIPELINES[pipelineId]?.stages || [];
}

export function isRoutingStage(pipelineId: string, stageId: string): boolean {
  return (pipelineId === "onboarding" && stageId === "criar_workspace") ||
    (pipelineId === "estruturacao_estrategica" && stageId === "ee_semana_5");
}

export function getStageLabel(stageId: string): string {
  for (const p of PIPELINE_LIST) {
    const s = p.stages.find((s) => s.id === stageId);
    if (s) return s.label;
  }
  return stageId;
}

export const ALL_STAGE_IDS = PIPELINE_LIST.flatMap((p) => p.stages.map((s) => s.id));
