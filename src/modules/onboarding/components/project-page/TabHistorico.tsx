"use client";

import React, { useState } from "react";
import { useAppStore } from "@/providers/app-provider";
import { Clock } from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getLogEventConfig, formatLogDescription, LOG_CATEGORIES } from "@/lib/log-events";

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  if (isYesterday(date)) return `ontem ${format(date, "HH:mm")}`;
  return format(date, "dd/MM/yyyy HH:mm");
}

export function TabHistorico({ projectId }: { projectId: string }) {
  const { logs, members } = useAppStore();
  const [filter, setFilter] = useState("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const projectLogs = logs.filter((l) => l.projectId === projectId);

  const filteredLogs = filter === "todos"
    ? projectLogs
    : projectLogs.filter((l) => {
        const cfg = getLogEventConfig(l.action);
        return cfg.category === filter;
      });

  if (projectLogs.length === 0) {
    return (
      <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-8 text-center">
        <Clock size={24} className="mx-auto mb-2 text-[var(--color-v4-text-disabled)]" />
        <p className="text-sm text-[var(--color-v4-text-muted)]">Nenhum registro de atividade</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-1.5">
        {LOG_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
              filter === cat.id
                ? "bg-[var(--color-v4-surface)] text-white border-[var(--color-v4-text-muted)]"
                : "text-[var(--color-v4-text-muted)] border-[var(--color-v4-border)] hover:text-white",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-5">
        {filteredLogs.length === 0 ? (
          <p className="text-sm text-[var(--color-v4-text-disabled)] text-center py-4">Nenhum evento nesta categoria</p>
        ) : (
          <div className="space-y-0">
            {filteredLogs.map((log, idx) => {
              const cfg = getLogEventConfig(log.action);
              const Icon = cfg.icon;
              const performer = log.performedBy ? members.find((m) => m.id === log.performedBy) : null;
              const isLast = idx === filteredLogs.length - 1;
              const description = formatLogDescription(log.action, log.details);
              const isExpanded = expandedId === log.id;
              const isLong = description.length > 120;

              return (
                <div key={log.id} className="flex gap-3">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", cfg.color)}>
                      <Icon size={14} />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-[var(--color-v4-border)] my-1" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-5 min-w-0">
                    <p
                      className={cn(
                        "text-sm text-white",
                        !isExpanded && isLong && "line-clamp-2",
                        isLong && "cursor-pointer hover:text-[var(--color-v4-text-muted)]",
                      )}
                      onClick={isLong ? () => setExpandedId(isExpanded ? null : log.id) : undefined}
                      title={isLong && !isExpanded ? "Clique para expandir" : undefined}
                    >
                      {description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {performer && (
                        <span className="text-xs text-[var(--color-v4-text-muted)]">{performer.name}</span>
                      )}
                      <span className="text-[10px] text-[var(--color-v4-text-disabled)]">
                        {formatTimestamp(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
