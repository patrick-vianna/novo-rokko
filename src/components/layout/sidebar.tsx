"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/providers/app-provider";
import { useSubdomain } from "@/hooks/useSubdomain";
import { signOut } from "@/lib/auth-client";
import { LogOut, Menu, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDev } from "@/lib/roles";
import { getSubdomainUrl } from "@/lib/subdomains";

export const Sidebar: React.FC = () => {
  const { currentUser } = useAppStore();
  const config = useSubdomain();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  if (!currentUser) return null;

  const userIsDev = isDev(currentUser.role || "");

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-[var(--color-v4-card)] rounded-md text-white"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-[var(--color-v4-card)] border-r border-[var(--color-v4-border)] flex flex-col transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo — shows system name */}
        <div className="p-6 flex items-center justify-center border-b border-[var(--color-v4-border)]">
          <h1 className="text-xl font-display font-bold tracking-tight">
            <span className="text-white">Rokko</span>{" "}
            <span style={{ color: config.color }}>{config.name}</span>
          </h1>
        </div>

        {/* Navigation from subdomain config */}
        <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
          {config.navigation.map((section, sIdx) => (
            <div key={section.title || sIdx}>
              {section.title && (
                <p className="px-4 mb-2 text-[10px] font-mono uppercase tracking-widest text-[var(--color-v4-text-muted)]">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));

                  // devOnly items: hidden for non-dev users
                  if (item.devOnly && !userIsDev) return null;

                  // Disabled items: shown as non-clickable (unless dev)
                  if (item.disabled && !userIsDev) {
                    return (
                      <div
                        key={item.href}
                        className="flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-v4-text-muted)] opacity-40 cursor-not-allowed select-none"
                      >
                        <Icon size={18} />
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[var(--color-v4-red)] text-white shadow-md shadow-[var(--color-v4-red-muted)]"
                          : "text-[var(--color-v4-text-muted)] hover:bg-[var(--color-v4-card-hover)] hover:text-white",
                      )}
                    >
                      <Icon size={18} />
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.disabled && userIsDev && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                          Dev
                        </span>
                      )}
                      {item.devOnly && userIsDev && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                          Dev
                        </span>
                      )}
                      {item.badge && !item.disabled && (
                        <span
                          className={cn(
                            "text-[9px] font-mono px-1.5 py-0.5 rounded-full border",
                            item.badge === "Novo" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                              : item.badge === "Beta" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700/50",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Back to Hub (when not on hub) */}
        {config.id !== "hub" && (
          <div className="px-4 pb-2">
            <a
              href={getSubdomainUrl("")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-card-hover)] transition-colors"
            >
              <ArrowLeft size={14} /> Voltar ao Hub
            </a>
          </div>
        )}

        {/* User */}
        <div className="p-4 border-t border-[var(--color-v4-border)]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full bg-[var(--color-v4-surface)]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-[var(--color-v4-text-muted)] truncate">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-v4-text-muted)] hover:bg-[var(--color-v4-card-hover)] hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};
