"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Database } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function DatabaseNode({ data, selected }: NodeProps) {
  const d = data as any;
  const operation = d.config?.operation || "update";
  const table = d.config?.table || "";

  const opLabels: Record<string, string> = {
    select: "SELECT",
    insert: "INSERT",
    update: "UPDATE",
    delete: "DELETE",
  };

  return (
    <BaseNode
      nodeType="database"
      icon={<Database size={14} />}
      label={d.label || "Banco de Dados"}
      description={d.description || "Operação no Supabase"}
      status={d.status}
      selected={selected}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
          {opLabels[operation] || operation}
        </span>
        {table && (
          <span className="text-[10px] font-mono text-zinc-500">{table}</span>
        )}
      </div>
    </BaseNode>
  );
}
