"use client";

import React from "react";
import { AlertCircle, Save, Loader2, X } from "lucide-react";

interface FloatingActionBarProps {
  visible: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function FloatingActionBar({ visible, isSaving, onSave, onCancel }: FloatingActionBarProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-64 right-0 z-30 border-t border-[var(--color-v4-border)] bg-[var(--color-v4-card)]/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between"
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      <div className="flex items-center gap-2 text-sm text-amber-500">
        <AlertCircle size={16} />
        <span>Alteracoes nao salvas</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-surface)] transition-colors disabled:opacity-50"
        >
          <X size={14} />
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white transition-colors disabled:opacity-70"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? "Salvando..." : "Salvar alteracoes"}
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
