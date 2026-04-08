import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
        variant === "default" && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        variant === "secondary" && "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20",
        variant === "outline" && "border border-[var(--color-v4-border)] text-[var(--color-v4-text-muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
