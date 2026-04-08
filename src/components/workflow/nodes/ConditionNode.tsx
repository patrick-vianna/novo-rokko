"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function ConditionNode({ data, selected }: NodeProps) {
  const d = data as any;

  return (
    <BaseNode
      nodeType="condition"
      icon={<GitBranch size={14} />}
      label={d.label || "Condição"}
      description={d.description || "Se/Senão"}
      status={d.status}
      selected={selected}
      sourceHandles={[
        { id: "true", label: "Sim" },
        { id: "false", label: "Não" },
      ]}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          SIM
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
          NÃO
        </span>
      </div>
      {d.config?.expression && (
        <p className="text-[10px] font-mono text-zinc-500 truncate mt-1">
          {d.config.expression}
        </p>
      )}
    </BaseNode>
  );
}
