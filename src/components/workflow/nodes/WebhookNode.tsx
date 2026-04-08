"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Globe } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function WebhookNode({ data, selected }: NodeProps) {
  const d = data as any;
  const method = d.config?.method || "POST";
  const url = d.config?.url || "";

  return (
    <BaseNode
      nodeType="webhook"
      icon={<Globe size={14} />}
      label={d.label || "Webhook"}
      description={d.description || "Chamar API externa"}
      status={d.status}
      selected={selected}
    >
      <div className="space-y-1">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {method}
        </span>
        {url && (
          <p className="text-[10px] font-mono text-zinc-500 truncate">{url}</p>
        )}
      </div>
    </BaseNode>
  );
}
