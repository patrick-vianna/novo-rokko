export interface Campanha {
  id: string;
  nome: string;
  plataforma: "google_ads" | "meta_ads" | "tiktok_ads";
  orcamento_diario: number;
  status: "ativa" | "pausada" | "encerrada";
  impressoes: number;
  cliques: number;
  conversoes: number;
  ctr: number;
  cpc: number;
  created_at: string;
}
