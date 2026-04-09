"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Execution {
  id: string;
  status: string;
  triggerRunId?: string;
  results?: any;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export default function ExecucoesPage() {
  const params = useParams();
  const workflowId = params.id as string;

  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const res = await fetch(`/api/data/workflow-executions?workflowId=${workflowId}`);
        if (!res.ok) throw new Error("Erro ao buscar execucoes");
        const data = await res.json();
        setExecutions(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, [workflowId]);

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    running: { icon: <Clock size={14} />, color: "text-yellow-400", label: "Executando" },
    completed: { icon: <CheckCircle size={14} />, color: "text-emerald-400", label: "Concluído" },
    failed: { icon: <XCircle size={14} />, color: "text-red-400", label: "Falhou" },
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/automacoes/${workflowId}`}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Histórico de Execuções</h1>
          <p className="text-sm text-[var(--color-v4-text-muted)] mt-1">
            Acompanhe o status das execuções deste workflow
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : executions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-zinc-500">Nenhuma execução registrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {executions.map((exec) => {
            const status = statusConfig[exec.status] || statusConfig.running;
            return (
              <div
                key={exec.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50"
              >
                <span className={status.color}>{status.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", status.color)}>
                      {status.label}
                    </span>
                    {exec.triggerRunId && (
                      <span className="text-[10px] font-mono text-zinc-600">
                        {exec.triggerRunId}
                      </span>
                    )}
                  </div>
                  {exec.error && (
                    <p className="text-xs text-red-400 mt-0.5 truncate">{exec.error}</p>
                  )}
                </div>
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                  {new Date(exec.startedAt).toLocaleString("pt-BR")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
