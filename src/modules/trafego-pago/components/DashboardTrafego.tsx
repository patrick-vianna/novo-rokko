"use client";

import { Badge } from "@/components/ui/badge";
import type { Campanha } from "../types";

const mockCampanhas: Campanha[] = [
  {
    id: "1",
    nome: "Black Friday 2026",
    plataforma: "meta_ads",
    orcamento_diario: 500,
    status: "ativa",
    impressoes: 45000,
    cliques: 2300,
    conversoes: 89,
    ctr: 5.1,
    cpc: 2.15,
    created_at: "2026-03-15",
  },
  {
    id: "2",
    nome: "Captacao Leads B2B",
    plataforma: "google_ads",
    orcamento_diario: 300,
    status: "pausada",
    impressoes: 12000,
    cliques: 890,
    conversoes: 34,
    ctr: 7.4,
    cpc: 3.5,
    created_at: "2026-02-01",
  },
];

export function DashboardTrafego() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Trafego Pago</h1>
        <p className="text-[var(--color-v4-text-muted)]">
          Gerencie suas campanhas de midia paga
        </p>
      </div>

      <div className="grid gap-4">
        {mockCampanhas.map((campanha) => (
          <div
            key={campanha.id}
            className="border border-[var(--color-v4-border)] bg-[var(--color-v4-card)] rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium text-white">{campanha.nome}</h3>
              <p className="text-sm text-[var(--color-v4-text-muted)]">
                {campanha.plataforma.replace(/_/g, " ").toUpperCase()} ·
                R$ {campanha.orcamento_diario}/dia
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-[var(--color-v4-text-muted)]">
                <p>{campanha.impressoes.toLocaleString("pt-BR")} impressoes</p>
                <p>{campanha.conversoes} conversoes</p>
              </div>
              <Badge
                variant={campanha.status === "ativa" ? "default" : "secondary"}
              >
                {campanha.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--color-v4-text-muted)] italic">
        Este e um modulo de exemplo com dados mockados.
        Serve como referencia de estrutura para os demais modulos.
      </p>
    </div>
  );
}
