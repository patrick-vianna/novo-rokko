"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/providers/app-provider";
import {
  Key, Eye, EyeOff, Copy, Plus, Trash2, Edit2, X, Shield, Clock, ExternalLink, Save, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getServiceIcon, SERVICE_OPTIONS, SERVICE_CATEGORIES } from "@/lib/service-icons";
import toast from "react-hot-toast";

interface Credential {
  id: string;
  projectId: string;
  serviceName: string;
  serviceCategory: string;
  login: string;
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccessLog {
  id: string;
  action: string;
  ipAddress?: string;
  createdAt: string;
  memberName?: string;
  memberEmail?: string;
}

import { COORD_ROLES, VIEWER_ROLES, ADMIN_ROLES } from "@/lib/roles";

async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...opts?.headers } });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || res.statusText); }
  return res.json();
}

export function CredentialsPanel({ projectId }: { projectId: string }) {
  const { currentUser } = useAppStore();
  const role = currentUser?.role || "";

  const canWrite = COORD_ROLES.includes(role);
  const canViewPassword = VIEWER_ROLES.includes(role);
  const canViewLogs = ADMIN_ROLES.includes(role);
  const canDelete = ADMIN_ROLES.includes(role);

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [revealTimers, setRevealTimers] = useState<Record<string, number>>({});
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const [logModal, setLogModal] = useState<{ credentialId: string; serviceName: string } | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Form state
  const [formServiceName, setFormServiceName] = useState("");
  const [formCustomService, setFormCustomService] = useState("");
  const [formCategory, setFormCategory] = useState("other");
  const [formLogin, setFormLogin] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formShowPw, setFormShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCredentials = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/data/credentials?projectId=${projectId}`);
      setCredentials(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  // Cleanup timers
  useEffect(() => {
    return () => { Object.values(timerRefs.current).forEach(clearInterval); };
  }, []);

  const resetForm = () => {
    setFormServiceName(""); setFormCustomService(""); setFormCategory("other");
    setFormLogin(""); setFormPassword(""); setFormUrl(""); setFormNotes("");
    setFormShowPw(false); setEditingId(null); setShowForm(false);
  };

  const handleReveal = async (id: string) => {
    if (revealedPasswords[id]) {
      // Hide
      setRevealedPasswords(prev => { const n = { ...prev }; delete n[id]; return n; });
      setRevealTimers(prev => { const n = { ...prev }; delete n[id]; return n; });
      if (timerRefs.current[id]) { clearInterval(timerRefs.current[id]); delete timerRefs.current[id]; }
      return;
    }

    try {
      const data = await apiFetch(`/api/data/credentials/${id}`);
      setRevealedPasswords(prev => ({ ...prev, [id]: data.password }));
      setRevealTimers(prev => ({ ...prev, [id]: 10 }));

      // 10s countdown
      const interval = setInterval(() => {
        setRevealTimers(prev => {
          const remaining = (prev[id] || 0) - 1;
          if (remaining <= 0) {
            clearInterval(interval);
            delete timerRefs.current[id];
            setRevealedPasswords(p => { const n = { ...p }; delete n[id]; return n; });
            const { [id]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [id]: remaining };
        });
      }, 1000);
      timerRefs.current[id] = interval;
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCopyPassword = async (id: string) => {
    try {
      const data = await apiFetch(`/api/data/credentials/${id}`);
      await navigator.clipboard.writeText(data.password);
      toast.success("Senha copiada!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCopyLogin = async (login: string) => {
    await navigator.clipboard.writeText(login);
    toast.success("Login copiado!");
  };

  const handleSubmit = async () => {
    const service = formServiceName === "__custom" ? formCustomService : formServiceName;
    if (!service || !formLogin || (!editingId && !formPassword)) {
      toast.error("Preencha servico, login e senha"); return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await apiFetch(`/api/data/credentials/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            serviceName: service, serviceCategory: formCategory,
            login: formLogin, url: formUrl || null, notes: formNotes || null,
            ...(formPassword ? { password: formPassword } : {}),
          }),
        });
        toast.success("Credencial atualizada!");
      } else {
        await apiFetch("/api/data/credentials", {
          method: "POST",
          body: JSON.stringify({
            projectId, serviceName: service, serviceCategory: formCategory,
            login: formLogin, password: formPassword, url: formUrl || null, notes: formNotes || null,
          }),
        });
        toast.success("Credencial salva!");
      }
      resetForm();
      fetchCredentials();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cred: Credential) => {
    setEditingId(cred.id);
    setFormServiceName(SERVICE_OPTIONS.includes(cred.serviceName) ? cred.serviceName : "__custom");
    setFormCustomService(SERVICE_OPTIONS.includes(cred.serviceName) ? "" : cred.serviceName);
    setFormCategory(cred.serviceCategory || "other");
    setFormLogin(cred.login);
    setFormPassword("");
    setFormUrl(cred.url || "");
    setFormNotes(cred.notes || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta credencial?")) return;
    try {
      await apiFetch(`/api/data/credentials/${id}`, { method: "DELETE" });
      setCredentials(prev => prev.filter(c => c.id !== id));
      toast.success("Credencial excluida!");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleViewLogs = async (credentialId: string, serviceName: string) => {
    setLogModal({ credentialId, serviceName });
    setLogsLoading(true);
    try {
      const data = await apiFetch(`/api/data/credentials/${credentialId}/log`);
      setLogs(data);
    } catch (err: any) { toast.error(err.message); }
    finally { setLogsLoading(false); }
  };

  const actionLabels: Record<string, string> = { view: "Visualizou", copy: "Copiou", create: "Criou", update: "Editou", delete: "Excluiu" };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider flex items-center gap-2">
          <Key size={16} /> Credenciais
        </h3>
        {canWrite && !showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1 text-xs text-[var(--color-v4-red)] hover:text-white transition-colors">
            <Plus size={14} /> Adicionar
          </button>
        )}
      </div>

      <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl">
        {/* Add/Edit form */}
        {showForm && (
          <div className="p-4 border-b border-[var(--color-v4-border)] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white">{editingId ? "Editar credencial" : "Nova credencial"}</p>
              <button onClick={resetForm} className="text-[var(--color-v4-text-muted)] hover:text-white"><X size={14} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Servico *</label>
                <select value={formServiceName} onChange={(e) => setFormServiceName(e.target.value)} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white">
                  <option value="">Selecione...</option>
                  {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="__custom">Outro...</option>
                </select>
                {formServiceName === "__custom" && (
                  <input value={formCustomService} onChange={(e) => setFormCustomService(e.target.value)} placeholder="Nome do servico" className="w-full mt-1 p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" />
                )}
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Categoria</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white">
                  {SERVICE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Login *</label>
              <input value={formLogin} onChange={(e) => setFormLogin(e.target.value)} placeholder="email ou usuario" className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Senha {editingId ? "(deixe vazio pra manter)" : "*"}</label>
              <div className="relative">
                <input type={formShowPw ? "text" : "password"} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="••••••••" className="w-full p-2 pr-8 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" />
                <button type="button" onClick={() => setFormShowPw(!formShowPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-v4-text-muted)] hover:text-white">
                  {formShowPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">URL do servico</label>
              <input type="url" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://..." className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Observacoes</label>
              <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} placeholder="Notas..." className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-xs text-white resize-none" />
            </div>

            <button onClick={handleSubmit} disabled={submitting} className="w-full py-2 bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5">
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {editingId ? "Salvar alteracoes" : "Salvar credencial"}
            </button>
          </div>
        )}

        {/* Credentials list */}
        {loading ? (
          <div className="p-6 flex justify-center"><Loader2 size={18} className="animate-spin text-[var(--color-v4-text-muted)]" /></div>
        ) : credentials.length === 0 && !showForm ? (
          <div className="p-6 text-center">
            <Key size={24} className="mx-auto mb-2 text-[var(--color-v4-text-disabled)]" />
            <p className="text-xs text-[var(--color-v4-text-muted)]">Nenhuma credencial cadastrada</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-v4-border)]">
            {credentials.map((cred) => {
              const Icon = getServiceIcon(cred.serviceName);
              const revealed = revealedPasswords[cred.id];
              const timer = revealTimers[cred.id];

              return (
                <div key={cred.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-v4-surface)] flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-[var(--color-v4-text-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{cred.serviceName}</p>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5 shrink-0">
                          <Shield size={8} /> Encriptada
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-[var(--color-v4-text-muted)] truncate">{cred.login}</p>
                        <button onClick={() => handleCopyLogin(cred.login)} className="text-[var(--color-v4-text-disabled)] hover:text-white shrink-0" title="Copiar login">
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {cred.url && (
                        <a href={cred.url} target="_blank" rel="noreferrer" className="p-1.5 text-[var(--color-v4-text-disabled)] hover:text-blue-400" title="Abrir URL">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {canWrite && (
                        <button onClick={() => handleEdit(cred)} className="p-1.5 text-[var(--color-v4-text-disabled)] hover:text-white" title="Editar">
                          <Edit2 size={13} />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(cred.id)} className="p-1.5 text-[var(--color-v4-text-disabled)] hover:text-red-400" title="Excluir">
                          <Trash2 size={13} />
                        </button>
                      )}
                      {canViewLogs && (
                        <button onClick={() => handleViewLogs(cred.id, cred.serviceName)} className="p-1.5 text-[var(--color-v4-text-disabled)] hover:text-yellow-400" title="Historico">
                          <Clock size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Password row */}
                  {canViewPassword && (
                    <div className="flex items-center gap-2 pl-11">
                      <div className="flex-1 font-mono text-xs bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded px-2 py-1.5 text-[var(--color-v4-text-muted)] select-none overflow-hidden">
                        {revealed || "••••••••••••"}
                      </div>
                      <button onClick={() => handleReveal(cred.id)} className={cn("p-1.5 rounded text-xs transition-colors", revealed ? "text-yellow-400 bg-yellow-500/10" : "text-[var(--color-v4-text-disabled)] hover:text-white")} title={revealed ? "Ocultar" : "Revelar"}>
                        {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      {timer && <span className="text-[10px] font-mono text-yellow-400 w-5 text-center">{timer}s</span>}
                      <button onClick={() => handleCopyPassword(cred.id)} className="p-1.5 text-[var(--color-v4-text-disabled)] hover:text-white" title="Copiar senha">
                        <Copy size={13} />
                      </button>
                    </div>
                  )}

                  {cred.notes && (
                    <p className="text-[10px] text-[var(--color-v4-text-disabled)] pl-11 italic">{cred.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Access log modal */}
      {logModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setLogModal(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-2xl p-5 max-w-md w-full shadow-2xl pointer-events-auto max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Historico de acessos — {logModal.serviceName}</h3>
                <button onClick={() => setLogModal(null)} className="text-[var(--color-v4-text-muted)] hover:text-white"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {logsLoading ? (
                  <div className="py-8 flex justify-center"><Loader2 size={18} className="animate-spin text-[var(--color-v4-text-muted)]" /></div>
                ) : logs.length === 0 ? (
                  <p className="text-xs text-[var(--color-v4-text-muted)] text-center py-4">Nenhum registro</p>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 text-xs p-2 rounded bg-[var(--color-v4-surface)]">
                      <span className={cn("font-medium", log.action === "delete" ? "text-red-400" : log.action === "view" ? "text-blue-400" : "text-white")}>
                        {actionLabels[log.action] || log.action}
                      </span>
                      <span className="text-[var(--color-v4-text-muted)] flex-1 truncate">{log.memberName || log.memberEmail}</span>
                      <span className="text-[var(--color-v4-text-disabled)] font-mono text-[10px] shrink-0">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
