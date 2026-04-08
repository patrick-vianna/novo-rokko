"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  onClick?: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // Clamp position so the menu doesn't go off-screen
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const el = menuRef.current;
    if (rect.right > window.innerWidth) {
      el.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      el.style.top = `${y - rect.height}px`;
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] py-1.5 rounded-lg border border-zinc-700/60 bg-zinc-950/95 backdrop-blur-md shadow-2xl"
      style={{
        left: x,
        top: y,
        boxShadow: "0 0 20px rgba(0,255,245,0.06), 0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {items.map((item, idx) => {
        if (item.separator) {
          return (
            <div
              key={`sep-${idx}`}
              className="my-1 mx-2 border-t border-zinc-800/60"
            />
          );
        }

        return (
          <button
            key={`${item.label}-${idx}`}
            disabled={item.disabled}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            className={cn(
              "flex items-center gap-2.5 w-full px-3 py-1.5 text-xs text-left transition-colors",
              item.disabled
                ? "text-zinc-600 cursor-not-allowed"
                : item.danger
                  ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white",
            )}
          >
            {item.icon && (
              <span className="w-4 h-4 flex items-center justify-center shrink-0 opacity-70">
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] font-mono text-zinc-600 ml-4">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
