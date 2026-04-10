"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubdomain } from "@/hooks/useSubdomain";
import { useAppStore } from "@/providers/app-provider";
import { SUBDOMAIN_LIST, getSubdomainUrl, type SubdomainConfig } from "@/lib/subdomains";
import { isDev } from "@/lib/roles";
import { ExternalLink, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

interface Shortcut {
  id: string;
  systemId: string;
  pageName: string;
  pageHref: string;
  icon?: string;
}

function SystemCard({ config }: { config: SubdomainConfig }) {
  const isActive = config.status === "active";
  const Icon = config.icon;

  return (
    <a
      href={isActive ? getSubdomainUrl(config.subdomain) : undefined}
      className={cn(
        "block rounded-2xl border p-6 transition-all",
        isActive
          ? "bg-[var(--color-v4-card)] border-[var(--color-v4-border)] hover:border-white/20 hover:shadow-lg cursor-pointer"
          : "bg-[var(--color-v4-card)] border-[var(--color-v4-border)] opacity-50 cursor-default",
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
          <Icon size={20} style={{ color: config.color }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">{config.fullName}</h3>
            {config.status === "placeholder" && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700/50">Em breve</span>
            )}
          </div>
          <p className="text-xs text-[var(--color-v4-text-muted)]">{config.description}</p>
        </div>
      </div>
      {config.features.length > 0 && (
        <ul className="space-y-1 mb-4">
          {config.features.map((f) => (
            <li key={f} className="text-xs text-[var(--color-v4-text-muted)] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
              {f}
            </li>
          ))}
        </ul>
      )}
      {isActive && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: config.color }}>
          Acessar <ExternalLink size={11} />
        </div>
      )}
    </a>
  );
}

export default function HomePage() {
  const router = useRouter();
  const config = useSubdomain();
  const { currentUser } = useAppStore();

  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loadingShortcuts, setLoadingShortcuts] = useState(true);
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [newSystem, setNewSystem] = useState("");
  const [newPage, setNewPage] = useState("");
  const [newHref, setNewHref] = useState("");

  // If on a system subdomain (not hub), redirect to its default page
  useEffect(() => {
    if (config.id === "ops") { router.replace("/jornada"); return; }
    if (config.id !== "hub" && config.status === "placeholder") { /* stay on hub page */ }
  }, [config.id, router]);

  // Fetch shortcuts
  useEffect(() => {
    if (config.id !== "hub") return;
    fetch("/api/data/shortcuts").then(r => r.json()).then(setShortcuts).catch(() => {}).finally(() => setLoadingShortcuts(false));
  }, [config.id]);

  const handleAddShortcut = async () => {
    if (!newSystem || !newPage || !newHref) return;
    try {
      const res = await fetch("/api/data/shortcuts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId: newSystem, pageName: newPage, pageHref: newHref }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setShortcuts((prev) => [...prev, data]);
      setShowAddShortcut(false);
      setNewSystem(""); setNewPage(""); setNewHref("");
      toast.success("Atalho adicionado!");
    } catch { toast.error("Erro ao adicionar atalho"); }
  };

  const handleDeleteShortcut = async (id: string) => {
    try {
      await fetch(`/api/data/shortcuts?id=${id}`, { method: "DELETE" });
      setShortcuts((prev) => prev.filter((s) => s.id !== id));
    } catch { toast.error("Erro ao remover"); }
  };

  // If not hub, show nothing (redirect will happen)
  if (config.id !== "hub") return null;

  const userIsDev = isDev(currentUser?.role || "");
  const greeting = getGreeting();

  // Available pages for shortcuts
  const systemPages: Record<string, { name: string; href: string }[]> = {
    ops: [
      { name: "Dashboard", href: "/dashboard" }, { name: "Jornada", href: "/jornada" },
      { name: "Projetos", href: "/projetos" }, { name: "Colaboradores", href: "/membros" },
      { name: "Automacoes", href: "/automacoes" },
    ],
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        {/* Greeting */}
        <div className="mb-10">
          <p className="text-sm text-[var(--color-v4-text-muted)] uppercase tracking-wider mb-1">{greeting}</p>
          <h1 className="text-3xl font-display font-bold text-white mb-2">{currentUser?.name || "Usuario"}</h1>
          <p className="text-sm text-[var(--color-v4-text-muted)] max-w-lg">
            Acesse os sistemas Rokko para gerenciar operacoes, vendas, financas e pessoas em um so lugar.
          </p>
        </div>

        {/* System cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {SUBDOMAIN_LIST.map((sys) => (
            <SystemCard key={sys.id} config={sys} />
          ))}
        </div>

        {/* Shortcuts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Seus Atalhos</h2>
            <button onClick={() => setShowAddShortcut(true)} className="flex items-center gap-1.5 text-xs text-[var(--color-v4-red)] hover:text-white transition-colors">
              <Plus size={14} /> Adicionar atalho
            </button>
          </div>

          {showAddShortcut && (
            <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-[var(--color-v4-text-muted)] mb-1">Sistema</label>
                  <select value={newSystem} onChange={(e) => { setNewSystem(e.target.value); setNewPage(""); setNewHref(""); }} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white">
                    <option value="">Selecione...</option>
                    {SUBDOMAIN_LIST.filter(s => s.status === "active").map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--color-v4-text-muted)] mb-1">Pagina</label>
                  <select value={newHref} onChange={(e) => { setNewHref(e.target.value); const p = systemPages[newSystem]?.find(p => p.href === e.target.value); if (p) setNewPage(p.name); }} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" disabled={!newSystem}>
                    <option value="">Selecione...</option>
                    {(systemPages[newSystem] || []).map(p => <option key={p.href} value={p.href}>{p.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={handleAddShortcut} disabled={!newSystem || !newHref} className="px-4 py-2 bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors">
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadingShortcuts ? (
            <div className="py-8 flex justify-center"><Loader2 size={18} className="animate-spin text-[var(--color-v4-text-muted)]" /></div>
          ) : shortcuts.length === 0 ? (
            <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-8 text-center">
              <p className="text-sm text-[var(--color-v4-text-muted)]">Nenhum atalho. Adicione paginas que voce acessa com frequencia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {shortcuts.map((s) => {
                const sys = SUBDOMAIN_LIST.find(sd => sd.id === s.systemId);
                return (
                  <a
                    key={s.id}
                    href={`${getSubdomainUrl(s.systemId)}${s.pageHref}`}
                    className="group relative bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl p-4 hover:border-white/20 transition-colors"
                  >
                    <p className="text-sm font-medium text-white">{s.pageName}</p>
                    <p className="text-[10px] text-[var(--color-v4-text-muted)] mt-0.5" style={{ color: sys?.color }}>{sys?.name || s.systemId}</p>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteShortcut(s.id); }}
                      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 text-[var(--color-v4-text-disabled)] hover:text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Dev: subdomain navigation buttons */}
        {userIsDev && typeof window !== "undefined" && window.location.hostname === "localhost" && (
          <div className="mt-10 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
            <p className="text-xs font-mono text-purple-400 mb-2">Dev: Navegar para subdomain</p>
            <div className="flex gap-2">
              {SUBDOMAIN_LIST.map(s => (
                <a key={s.id} href={`/?subdomain=${s.subdomain}`} className="px-3 py-1.5 rounded text-xs font-mono border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors">
                  {s.subdomain}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
