"use client";

import React, { type ReactNode } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NODE_COLORS, type NodeType } from "@/lib/workflow-types";
import { cn } from "@/lib/utils";

interface BaseNodeProps {
  nodeType: NodeType;
  icon: ReactNode;
  label: string;
  description?: string;
  status?: "idle" | "running" | "success" | "error";
  children?: ReactNode;
  selected?: boolean;
  hasSourceHandle?: boolean;
  hasTargetHandle?: boolean;
  sourceHandles?: { id: string; label?: string; position?: number }[];
}

const statusColors = {
  idle: "bg-zinc-500",
  running: "bg-yellow-400 animate-pulse",
  success: "bg-emerald-400",
  error: "bg-red-500",
};

export function BaseNode({
  nodeType,
  icon,
  label,
  description,
  status = "idle",
  children,
  selected,
  hasSourceHandle = true,
  hasTargetHandle = true,
  sourceHandles,
}: BaseNodeProps) {
  const color = NODE_COLORS[nodeType];

  return (
    <div
      className={cn(
        "relative w-56 rounded-lg border bg-black/80 backdrop-blur-sm transition-all duration-200",
        selected ? "scale-[1.02]" : "hover:scale-[1.02]",
      )}
      style={{
        borderColor: selected ? color : `${color}60`,
        boxShadow: selected
          ? `0 0 20px ${color}40, 0 0 40px ${color}20`
          : `0 0 15px ${color}20, 0 0 30px ${color}10`,
      }}
    >
      {/* Corner brackets HUD */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: color }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: color }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: color }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: color }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: `${color}30` }}>
        <span style={{ color }}>{icon}</span>
        <span className="font-mono text-xs uppercase tracking-wider text-white flex-1 truncate">
          {label}
        </span>
        {/* Status indicator */}
        <span className={cn("w-2 h-2 rounded-full shrink-0", statusColors[status])} />
      </div>

      {/* Body */}
      {(description || children) && (
        <div className="px-3 py-2 space-y-2">
          {description && (
            <p className="text-[10px] text-zinc-400 leading-relaxed">{description}</p>
          )}
          {children}
        </div>
      )}

      {/* Target handle (input) */}
      {hasTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !rounded-full !border-2 !bg-black"
          style={{
            borderColor: color,
            boxShadow: `0 0 6px ${color}80`,
          }}
        />
      )}

      {/* Source handle(s) (output) */}
      {sourceHandles ? (
        sourceHandles.map((handle, idx) => (
          <Handle
            key={handle.id}
            type="source"
            position={Position.Bottom}
            id={handle.id}
            className="!w-3 !h-3 !rounded-full !border-2 !bg-black"
            style={{
              borderColor: color,
              boxShadow: `0 0 6px ${color}80`,
              left: `${((idx + 1) / (sourceHandles.length + 1)) * 100}%`,
            }}
          />
        ))
      ) : hasSourceHandle ? (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !rounded-full !border-2 !bg-black"
          style={{
            borderColor: color,
            boxShadow: `0 0 6px ${color}80`,
          }}
        />
      ) : null}
    </div>
  );
}
