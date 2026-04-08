"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Bell } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function NotificationNode({ data, selected }: NodeProps) {
  const d = data as any;
  const channel = d.config?.channel || "whatsapp";
  const channelLabels: Record<string, string> = {
    whatsapp: "WhatsApp",
    email: "E-mail",
    slack: "Slack",
  };

  return (
    <BaseNode
      nodeType="notification"
      icon={<Bell size={14} />}
      label={d.label || "Notificação"}
      description={d.description || "Enviar notificação"}
      status={d.status}
      selected={selected}
    >
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
        {channelLabels[channel] || channel}
      </span>
      {d.config?.message && (
        <p className="text-[10px] text-zinc-500 truncate mt-1">{d.config.message}</p>
      )}
    </BaseNode>
  );
}
