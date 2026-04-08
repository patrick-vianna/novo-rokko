"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { ArrowRightLeft } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { STAGE_LABELS } from "@/lib/workflow-types";

export function StageChangeNode({ data, selected }: NodeProps) {
  const d = data as any;
  const fromStage = d.config?.fromStage || "*";
  const toStage = d.config?.toStage || "*";

  const fromLabel = fromStage === "*" ? "Qualquer" : (STAGE_LABELS[fromStage] || fromStage);
  const toLabel = toStage === "*" ? "Qualquer" : (STAGE_LABELS[toStage] || toStage);

  return (
    <BaseNode
      nodeType="stage_change"
      icon={<ArrowRightLeft size={14} />}
      label={d.label || "Mudança de Estágio"}
      description={d.description}
      status={d.status}
      selected={selected}
      hasTargetHandle={false}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 truncate max-w-[80px]">
            {fromLabel}
          </span>
          <span className="text-zinc-600">→</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 truncate max-w-[80px]">
            {toLabel}
          </span>
        </div>
      </div>
    </BaseNode>
  );
}
