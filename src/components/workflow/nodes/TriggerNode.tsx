"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function TriggerNode({ data, selected }: NodeProps) {
  const d = data as any;
  const triggerType = d.config?.triggerType || "manual";
  const triggerLabels: Record<string, string> = {
    webhook: "Webhook recebido",
    cron: "Agendamento",
    manual: "Execução manual",
  };

  return (
    <BaseNode
      nodeType="trigger"
      icon={<Zap size={14} />}
      label={d.label || "Trigger"}
      description={d.description || triggerLabels[triggerType]}
      status={d.status}
      selected={selected}
      hasTargetHandle={false}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {triggerType.toUpperCase()}
        </span>
        {triggerType === "cron" && d.config?.cron && (
          <span className="text-[10px] text-zinc-500 font-mono">{d.config.cron}</span>
        )}
      </div>
    </BaseNode>
  );
}
