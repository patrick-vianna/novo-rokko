"use client";

import React from "react";
import {
  Zap, Play, GitBranch, Timer, Globe, Bell, Database, ArrowRightLeft,
} from "lucide-react";
import { NODE_COLORS, type NodeType } from "@/lib/workflow-types";

interface SidebarItem {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  defaultData: Record<string, any>;
}

const categories: { title: string; items: SidebarItem[] }[] = [
  {
    title: "TRIGGERS",
    items: [
      {
        type: "trigger",
        label: "Webhook recebido",
        icon: <Zap size={14} />,
        defaultData: {
          label: "Webhook recebido",
          icon: "Zap",
          config: { triggerType: "webhook" },
        },
      },
      {
        type: "trigger",
        label: "Agendamento (cron)",
        icon: <Timer size={14} />,
        defaultData: {
          label: "Agendamento",
          icon: "Timer",
          config: { triggerType: "cron", cron: "0 9 * * *" },
        },
      },
      {
        type: "trigger",
        label: "Execução manual",
        icon: <Play size={14} />,
        defaultData: {
          label: "Execução manual",
          icon: "Play",
          config: { triggerType: "manual" },
        },
      },
      {
        type: "stage_change" as NodeType,
        label: "Mudança de estágio",
        icon: <ArrowRightLeft size={14} />,
        defaultData: {
          label: "Mudança de Estágio",
          icon: "ArrowRightLeft",
          config: { fromStage: "*", toStage: "*" },
        },
      },
    ],
  },
  {
    title: "AÇÕES",
    items: [
      {
        type: "action",
        label: "Executar ação",
        icon: <Play size={14} />,
        defaultData: {
          label: "Ação",
          icon: "Play",
          config: { actionType: "custom" },
        },
      },
      {
        type: "webhook",
        label: "Chamar webhook/API",
        icon: <Globe size={14} />,
        defaultData: {
          label: "Webhook",
          icon: "Globe",
          config: { method: "POST", url: "" },
        },
      },
      {
        type: "notification",
        label: "Enviar notificação",
        icon: <Bell size={14} />,
        defaultData: {
          label: "Notificação",
          icon: "Bell",
          config: { channel: "whatsapp", message: "" },
        },
      },
      {
        type: "database",
        label: "Atualizar banco",
        icon: <Database size={14} />,
        defaultData: {
          label: "Banco de Dados",
          icon: "Database",
          config: { operation: "update", table: "" },
        },
      },
    ],
  },
  {
    title: "LÓGICA",
    items: [
      {
        type: "condition",
        label: "Condição (se/senão)",
        icon: <GitBranch size={14} />,
        defaultData: {
          label: "Condição",
          icon: "GitBranch",
          config: { expression: "" },
        },
      },
      {
        type: "delay",
        label: "Aguardar (delay)",
        icon: <Timer size={14} />,
        defaultData: {
          label: "Delay",
          icon: "Timer",
          config: { seconds: 60 },
        },
      },
    ],
  },
];

export function WorkflowSidebar() {
  const onDragStart = (
    event: React.DragEvent,
    item: SidebarItem,
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type: item.type, data: item.defaultData }),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800/60 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-zinc-800/60">
        <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-400">
          Componentes
        </h2>
      </div>

      <div className="p-3 space-y-5 flex-1">
        {categories.map((cat) => (
          <div key={cat.title}>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mb-2 px-1">
              {cat.title}
            </h3>
            <div className="space-y-1.5">
              {cat.items.map((item, idx) => {
                const color = NODE_COLORS[item.type];
                return (
                  <div
                    key={`${item.type}-${idx}`}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-zinc-800/50 bg-zinc-900/50 cursor-grab hover:border-zinc-700 hover:bg-zinc-900 transition-colors active:cursor-grabbing"
                    style={{
                      borderLeftColor: `${color}60`,
                      borderLeftWidth: 2,
                    }}
                  >
                    <span style={{ color }}>{item.icon}</span>
                    <span className="text-xs text-zinc-300">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
