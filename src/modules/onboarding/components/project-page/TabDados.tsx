"use client";

import React, { useState } from "react";
import { useAppStore } from "@/providers/app-provider";
import { Project } from "@/types";
import { Pencil, Save, X, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Shared field components ───

function StaticField({ label, value, href }: { label: string; value?: string | number | null; href?: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-v4-text-muted)] uppercase tracking-wider mb-0.5">{label}</p>
      {!value && value !== 0 ? (
        <p className="text-sm text-[var(--color-v4-text-disabled)]">—</p>
      ) : href ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
          {String(value)} <ExternalLink size={11} />
        </a>
      ) : (
        <p className="text-sm text-white">{String(value)}</p>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--color-v4-text-muted)] uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "—"}
        className="w-full p-2 bg-[var(--color-v4-bg)] border border-[var(--color-v4-border)] rounded-md text-sm text-white placeholder:text-[var(--color-v4-text-disabled)] focus:ring-1 focus:ring-[var(--color-v4-red)] focus:border-[var(--color-v4-red)] transition-colors"
      />
    </div>
  );
}

function formatCurrency(val?: number | null) {
  if (val == null) return null;
  return `R$ ${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

// ─── Editable section wrapper ───

function EditableSection({
  title,
  sectionId,
  editingSection,
  onRequestEdit,
  onSave,
  onCancel,
  isSaving,
  readContent,
  editContent,
}: {
  title: string;
  sectionId: string;
  editingSection: string | null;
  onRequestEdit: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  readContent: React.ReactNode;
  editContent: React.ReactNode;
}) {
  const isEditing = editingSection === sectionId;
  const isOtherEditing = editingSection !== null && editingSection !== sectionId;

  return (
    <section className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-xl group">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-[var(--color-v4-text-muted)] uppercase tracking-wider">{title}</h3>
        {!isEditing && (
          <button
            onClick={() => onRequestEdit(sectionId)}
            disabled={isOtherEditing}
            className={cn(
              "p-1.5 rounded-md transition-all",
              isOtherEditing
                ? "opacity-20 cursor-not-allowed"
                : "opacity-40 group-hover:opacity-100 text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-surface)]",
            )}
            title="Editar secao"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {isEditing ? editContent : readContent}
      </div>

      {/* Save/Cancel toolbar */}
      {isEditing && (
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--color-v4-border)] bg-[var(--color-v4-surface)]/30 rounded-b-xl">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--color-v4-text-muted)] hover:text-white hover:bg-[var(--color-v4-surface)] transition-colors"
          >
            <X size={13} /> Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white transition-colors disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Salvar
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Main component ───

export function TabDados({ project }: { project: Project }) {
  const { updateProject } = useAppStore();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<string | null>(null);

  // Section-local form states
  const [projectForm, setProjectForm] = useState({
    name: project.name || "",
    produtosEscopo: (project.produtosEscopo || []).filter(Boolean),
    produtosRecorrente: (project.produtosRecorrente || []).filter(Boolean),
    valorEscopo: project.valorEscopo != null ? String(project.valorEscopo) : "",
    valorRecorrente: project.valorRecorrente != null ? String(project.valorRecorrente) : "",
    projectStartDate: project.projectStartDate || "",
    firstPaymentDate: project.firstPaymentDate || "",
  });

  const resetProjectForm = () => setProjectForm({
    name: project.name || "",
    produtosEscopo: (project.produtosEscopo || []).filter(Boolean),
    produtosRecorrente: (project.produtosRecorrente || []).filter(Boolean),
    valorEscopo: project.valorEscopo != null ? String(project.valorEscopo) : "",
    valorRecorrente: project.valorRecorrente != null ? String(project.valorRecorrente) : "",
    projectStartDate: project.projectStartDate || "",
    firstPaymentDate: project.firstPaymentDate || "",
  });

  const toggleProduct = (list: string[], product: string) =>
    list.includes(product) ? list.filter(p => p !== product) : [...list, product];

  const [clientForm, setClientForm] = useState({
    clientName: project.clientName || "",
    clientCnpj: project.clientCnpj || "",
    clientPhone: project.clientPhone || "",
    clientEmail: project.clientEmail || "",
  });

  const [linksForm, setLinksForm] = useState({
    kommoLink: project.kommoLink || "",
    linkCallVendas: (project as any).linkCallVendas || "",
    linkTranscricao: (project as any).linkTranscricao || "",
    metaAdsAccountId: project.metaAdsAccountId || "",
    googleAdsAccountId: project.googleAdsAccountId || "",
  });

  const resetClientForm = () => setClientForm({
    clientName: project.clientName || "",
    clientCnpj: project.clientCnpj || "",
    clientPhone: project.clientPhone || "",
    clientEmail: project.clientEmail || "",
  });

  const resetLinksForm = () => setLinksForm({
    kommoLink: project.kommoLink || "",
    linkCallVendas: (project as any).linkCallVendas || "",
    linkTranscricao: (project as any).linkTranscricao || "",
    metaAdsAccountId: project.metaAdsAccountId || "",
    googleAdsAccountId: project.googleAdsAccountId || "",
  });

  const hasUnsavedChanges = () => {
    if (editingSection === "projeto") {
      return JSON.stringify(projectForm) !== JSON.stringify({
        name: project.name || "",
        produtosEscopo: (project.produtosEscopo || []).filter(Boolean),
        produtosRecorrente: (project.produtosRecorrente || []).filter(Boolean),
        valorEscopo: project.valorEscopo != null ? String(project.valorEscopo) : "",
        valorRecorrente: project.valorRecorrente != null ? String(project.valorRecorrente) : "",
        projectStartDate: project.projectStartDate || "",
        firstPaymentDate: project.firstPaymentDate || "",
      });
    }
    if (editingSection === "cliente") {
      return JSON.stringify(clientForm) !== JSON.stringify({
        clientName: project.clientName || "", clientCnpj: project.clientCnpj || "",
        clientPhone: project.clientPhone || "", clientEmail: project.clientEmail || "",
      });
    }
    if (editingSection === "links") {
      return JSON.stringify(linksForm) !== JSON.stringify({
        kommoLink: project.kommoLink || "", linkCallVendas: (project as any).linkCallVendas || "",
        linkTranscricao: (project as any).linkTranscricao || "",
        metaAdsAccountId: project.metaAdsAccountId || "", googleAdsAccountId: project.googleAdsAccountId || "",
      });
    }
    return false;
  };

  const handleRequestEdit = (sectionId: string) => {
    if (editingSection && editingSection !== sectionId && hasUnsavedChanges()) {
      setPendingSwitch(sectionId);
      return;
    }
    if (editingSection) handleCancel();
    setEditingSection(sectionId);
  };

  const handleConfirmSwitch = () => {
    handleCancel();
    if (pendingSwitch) {
      setEditingSection(pendingSwitch);
      setPendingSwitch(null);
    }
  };

  const handleCancel = () => {
    if (editingSection === "projeto") resetProjectForm();
    if (editingSection === "cliente") resetClientForm();
    if (editingSection === "links") resetLinksForm();
    setEditingSection(null);
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      updateProject(project.id, {
        name: projectForm.name || undefined,
        produtosEscopo: projectForm.produtosEscopo,
        produtosRecorrente: projectForm.produtosRecorrente,
        valorEscopo: projectForm.valorEscopo ? Number(projectForm.valorEscopo) : null,
        valorRecorrente: projectForm.valorRecorrente ? Number(projectForm.valorRecorrente) : null,
        projectStartDate: projectForm.projectStartDate || undefined,
        firstPaymentDate: projectForm.firstPaymentDate || undefined,
      } as any);
      setEditingSection(null);
      toast.success("Dados do projeto salvos!");
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClient = async () => {
    setIsSaving(true);
    try {
      updateProject(project.id, {
        clientName: clientForm.clientName || undefined,
        clientCnpj: clientForm.clientCnpj || undefined,
        clientPhone: clientForm.clientPhone || undefined,
        clientEmail: clientForm.clientEmail || undefined,
      } as any);
      setEditingSection(null);
      toast.success("Dados do cliente salvos!");
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLinks = async () => {
    setIsSaving(true);
    try {
      updateProject(project.id, {
        kommoLink: linksForm.kommoLink || undefined,
        linkCallVendas: linksForm.linkCallVendas || undefined,
        linkTranscricao: linksForm.linkTranscricao || undefined,
        metaAdsAccountId: linksForm.metaAdsAccountId || undefined,
        googleAdsAccountId: linksForm.googleAdsAccountId || undefined,
      } as any);
      setEditingSection(null);
      toast.success("Links salvos!");
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const products = [...(project.produtosEscopo || []), ...(project.produtosRecorrente || [])].filter(Boolean);
  const productLabels = products.map(p => p === "ee" ? "EE" : p === "byline" ? "Byline" : p);

  return (
    <div className="space-y-6">
      {/* Informacoes do Projeto — editable */}
      <EditableSection
        title="Informacoes do Projeto"
        sectionId="projeto"
        editingSection={editingSection}
        onRequestEdit={handleRequestEdit}
        onSave={handleSaveProject}
        onCancel={handleCancel}
        isSaving={isSaving}
        readContent={
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StaticField label="Nome" value={project.name} />
            <StaticField label="Produtos" value={productLabels.length > 0 ? productLabels.join(", ") : null} />
            <StaticField label="Valor Escopo" value={formatCurrency(project.valorEscopo)} />
            <StaticField label="Valor Recorrente" value={formatCurrency(project.valorRecorrente)} />
            <StaticField label="Inicio Projeto" value={project.projectStartDate} />
            <StaticField label="1o Pagamento" value={project.firstPaymentDate} />
          </div>
        }
        editContent={
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InputField label="Nome" value={projectForm.name} onChange={(v) => setProjectForm({ ...projectForm, name: v })} />
              <InputField label="Valor Escopo (R$)" value={projectForm.valorEscopo} onChange={(v) => setProjectForm({ ...projectForm, valorEscopo: v })} type="number" placeholder="0.00" />
              <InputField label="Valor Recorrente (R$)" value={projectForm.valorRecorrente} onChange={(v) => setProjectForm({ ...projectForm, valorRecorrente: v })} type="number" placeholder="0.00" />
              <InputField label="Inicio Projeto" value={projectForm.projectStartDate} onChange={(v) => setProjectForm({ ...projectForm, projectStartDate: v })} type="date" />
              <InputField label="1o Pagamento" value={projectForm.firstPaymentDate} onChange={(v) => setProjectForm({ ...projectForm, firstPaymentDate: v })} type="date" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-v4-text-muted)] uppercase tracking-wider mb-2">Produtos Escopo</p>
              <div className="flex gap-2">
                {["ee", "byline"].map((p) => (
                  <button key={p} type="button" onClick={() => setProjectForm({ ...projectForm, produtosEscopo: toggleProduct(projectForm.produtosEscopo, p) })}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", projectForm.produtosEscopo.includes(p) ? "bg-[var(--color-v4-red)]/20 border-[var(--color-v4-red)] text-white" : "bg-[var(--color-v4-surface)] border-[var(--color-v4-border)] text-[var(--color-v4-text-muted)]")}>
                    {p === "ee" ? "EE" : "Byline"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[var(--color-v4-text-muted)] uppercase tracking-wider mb-2">Produtos Recorrente</p>
              <div className="flex gap-2">
                {["ee", "byline"].map((p) => (
                  <button key={p} type="button" onClick={() => setProjectForm({ ...projectForm, produtosRecorrente: toggleProduct(projectForm.produtosRecorrente, p) })}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", projectForm.produtosRecorrente.includes(p) ? "bg-indigo-500/20 border-indigo-500 text-white" : "bg-[var(--color-v4-surface)] border-[var(--color-v4-border)] text-[var(--color-v4-text-muted)]")}>
                    {p === "ee" ? "EE" : "Byline"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />

      {/* Informacoes do Cliente — editable */}
      <EditableSection
        title="Informacoes do Cliente"
        sectionId="cliente"
        editingSection={editingSection}
        onRequestEdit={handleRequestEdit}
        onSave={handleSaveClient}
        onCancel={handleCancel}
        isSaving={isSaving}
        readContent={
          <div className="grid grid-cols-2 gap-4">
            <StaticField label="Empresa" value={project.clientName} />
            <StaticField label="CNPJ" value={project.clientCnpj} />
            <StaticField label="Telefone" value={project.clientPhone} />
            <StaticField label="Email" value={project.clientEmail} />
          </div>
        }
        editContent={
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Empresa" value={clientForm.clientName} onChange={(v) => setClientForm({ ...clientForm, clientName: v })} />
            <InputField label="CNPJ" value={clientForm.clientCnpj} onChange={(v) => setClientForm({ ...clientForm, clientCnpj: v })} placeholder="00.000.000/0000-00" />
            <InputField label="Telefone" value={clientForm.clientPhone} onChange={(v) => setClientForm({ ...clientForm, clientPhone: v })} placeholder="(00) 00000-0000" />
            <InputField label="Email" value={clientForm.clientEmail} onChange={(v) => setClientForm({ ...clientForm, clientEmail: v })} type="email" placeholder="email@empresa.com" />
          </div>
        }
      />

      {/* Links e Integracoes — editable */}
      <EditableSection
        title="Links e Integracoes"
        sectionId="links"
        editingSection={editingSection}
        onRequestEdit={handleRequestEdit}
        onSave={handleSaveLinks}
        onCancel={handleCancel}
        isSaving={isSaving}
        readContent={
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StaticField label="Kommo" value={project.kommoLink ? "Ver no Kommo" : null} href={project.kommoLink} />
            <StaticField label="Call Vendas" value={(project as any).linkCallVendas ? "Abrir" : null} href={(project as any).linkCallVendas} />
            <StaticField label="Transcricao" value={(project as any).linkTranscricao ? "Abrir" : null} href={(project as any).linkTranscricao} />
            <StaticField label="ID Meta Ads" value={project.metaAdsAccountId} />
            <StaticField label="ID Google Ads" value={project.googleAdsAccountId} />
          </div>
        }
        editContent={
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Link Kommo" value={linksForm.kommoLink} onChange={(v) => setLinksForm({ ...linksForm, kommoLink: v })} type="url" placeholder="https://..." />
            <InputField label="Link Call Vendas" value={linksForm.linkCallVendas} onChange={(v) => setLinksForm({ ...linksForm, linkCallVendas: v })} type="url" placeholder="https://..." />
            <InputField label="Link Transcricao" value={linksForm.linkTranscricao} onChange={(v) => setLinksForm({ ...linksForm, linkTranscricao: v })} type="url" placeholder="https://..." />
            <InputField label="ID Meta Ads" value={linksForm.metaAdsAccountId} onChange={(v) => setLinksForm({ ...linksForm, metaAdsAccountId: v })} placeholder="act_..." />
            <InputField label="ID Google Ads" value={linksForm.googleAdsAccountId} onChange={(v) => setLinksForm({ ...linksForm, googleAdsAccountId: v })} placeholder="000-000-0000" />
          </div>
        }
      />

      {/* Confirm discard dialog */}
      {pendingSwitch && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setPendingSwitch(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-[var(--color-v4-card)] border border-[var(--color-v4-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl pointer-events-auto">
              <h3 className="text-lg font-bold text-white mb-2">Descartar alteracoes?</h3>
              <p className="text-sm text-[var(--color-v4-text-muted)] mb-5">
                Voce tem alteracoes nao salvas nesta secao. Deseja descartar e editar outra?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setPendingSwitch(null)} className="flex-1 py-2.5 bg-[var(--color-v4-surface)] hover:bg-[var(--color-v4-border)] text-white rounded-xl text-sm font-medium transition-colors">
                  Ficar
                </button>
                <button onClick={handleConfirmSwitch} className="flex-1 py-2.5 bg-[var(--color-v4-red)] hover:bg-[var(--color-v4-red-hover)] text-white rounded-xl text-sm font-medium transition-colors">
                  Descartar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
