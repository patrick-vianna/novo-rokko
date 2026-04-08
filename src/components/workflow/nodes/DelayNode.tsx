"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Timer } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function DelayNode({ data, selected }: NodeProps) {
  const d = data as any;
  const seconds = d.config?.seconds || 0;

  const formatDelay = (s: number) => {
    if (s >= 3600) return `${Math.floor(s / 3600)}h`;
    if (s >= 60) return `${Math.floor(s / 60)}min`;
    return `${s}s`;
  };

  return (
    <BaseNode
      nodeType="delay"
      icon={<Timer size={14} />}
      label={d.label || "Delay"}
      description={d.description || "Aguardar antes de continuar"}
      status={d.status}
      selected={selected}
    >
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
        {seconds > 0 ? formatDelay(seconds) : "Configurar"}
      </span>
    </BaseNode>
  );
}
