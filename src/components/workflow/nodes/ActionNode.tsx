"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function ActionNode({ data, selected }: NodeProps) {
  const d = data as any;

  return (
    <BaseNode
      nodeType="action"
      icon={<Play size={14} />}
      label={d.label || "Ação"}
      description={d.description || "Executar uma ação"}
      status={d.status}
      selected={selected}
    >
      {d.config?.actionType && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
          {d.config.actionType}
        </span>
      )}
    </BaseNode>
  );
}
