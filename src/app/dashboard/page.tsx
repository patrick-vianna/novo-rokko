"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-sm text-[var(--color-v4-text-muted)] mb-8">
          Metricas e indicadores do onboarding
        </p>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-v4-surface)] border border-[var(--color-v4-border)] flex items-center justify-center mb-4">
            <BarChart3 size={28} className="text-[var(--color-v4-text-disabled)]" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">Metricas em breve</h2>
          <p className="text-sm text-[var(--color-v4-text-muted)] max-w-md">
            Indicadores de performance, taxa de conversao EE → Recorrente, tempo medio de onboarding, MRR e churn serao exibidos aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
