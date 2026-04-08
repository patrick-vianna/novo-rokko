"use client";

import React, { useState } from "react";
import {
  Save, Play, Power, History, ZoomIn, ZoomOut, Maximize,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowToolbarProps {
  name: string;
  onNameChange: (name: string) => void;
  active: boolean;
  onToggleActive: () => void;
  onSave: () => void;
  onExecute: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  saving?: boolean;
  executing?: boolean;
  historyHref?: string;
}

export function WorkflowToolbar({
  name,
  onNameChange,
  active,
  onToggleActive,
  onSave,
  onExecute,
  onZoomIn,
  onZoomOut,
  onFitView,
  saving,
  executing,
  historyHref,
}: WorkflowToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="h-14 bg-zinc-950 border-b border-zinc-800/60 flex items-center justify-between px-4 gap-4">
      {/* Left: workflow name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isEditing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white font-medium outline-none focus:border-cyan-500/50 min-w-0 flex-1"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-white hover:text-cyan-400 transition-colors truncate"
          >
            {name || "Sem título"}
          </button>
        )}
      </div>

      {/* Center: zoom controls */}
      <div className="flex items-center gap-1 bg-zinc-900/50 rounded-md border border-zinc-800/50 px-1">
        <button onClick={onZoomOut} className="p-1.5 text-zinc-400 hover:text-white transition-colors" title="Diminuir zoom">
          <ZoomOut size={14} />
        </button>
        <button onClick={onFitView} className="p-1.5 text-zinc-400 hover:text-white transition-colors" title="Ajustar à tela">
          <Maximize size={14} />
        </button>
        <button onClick={onZoomIn} className="p-1.5 text-zinc-400 hover:text-white transition-colors" title="Aumentar zoom">
          <ZoomIn size={14} />
        </button>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2">
        {historyHref && (
          <a
            href={historyHref}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-white border border-zinc-800/50 hover:border-zinc-700 transition-colors"
          >
            <History size={13} />
            Histórico
          </a>
        )}

        <button
          onClick={onToggleActive}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
            active
              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
              : "text-zinc-400 border-zinc-800/50 hover:border-zinc-700 hover:text-white",
          )}
        >
          <Power size={13} />
          {active ? "Ativo" : "Inativo"}
        </button>

        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white border border-zinc-700 hover:border-cyan-500/40 hover:text-cyan-400 transition-colors disabled:opacity-50"
        >
          <Save size={13} />
          {saving ? "Salvando..." : "Salvar"}
        </button>

        <button
          onClick={onExecute}
          disabled={executing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-50"
        >
          <Play size={13} />
          {executing ? "Executando..." : "Executar"}
        </button>
      </div>
    </div>
  );
}
