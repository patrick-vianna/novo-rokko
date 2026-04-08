"use client";

import React from "react";
import { type Node } from "@xyflow/react";
import { X } from "lucide-react";
import { NODE_COLORS, STAGE_OPTIONS, STAGE_LABELS, PROJECT_CONTEXT_VARS, type NodeType } from "@/lib/workflow-types";

interface WorkflowConfigPanelProps {
  node: Node;
  onUpdate: (data: Record<string, any>) => void;
  onClose: () => void;
}

function ConfigField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600"
        />
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-zinc-600"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TriggerConfig({ data, onUpdate }: { data: any; onUpdate: (d: any) => void }) {
  const config = data.config || {};
  return (
    <div className="space-y-3">
      <SelectField
        label="Tipo de trigger"
        value={config.triggerType || "manual"}
        onChange={(v) => onUpdate({ config: { ...config, triggerType: v } })}
        options={[
          { value: "manual", label: "Execução manual" },
          { value: "webhook", label: "Webhook recebido" },
          { value: "cron", label: "Agendamento (cron)" },
        ]}
      />
      {config.triggerType === "cron" && (
        <ConfigField
          label="Expressão cron"
          value={config.cron || ""}
          onChange={(v) => onUpdate({ config: { ...config, cron: v } })}
          placeholder="0 9 * * *"
        />
      )}
      {config.triggerType === "webhook" && (
        <ConfigField
          label="Path do webhook"
          value={config.webhookPath || ""}
          onChange={(v) => onUpdate({ config: { ...config, webhookPath: v } })}
          placeholder="/meu-webhook"
        />
      )}
    </div>
  );
}

function WebhookConfig({ data, onUpdate }: { data: any; onUpdate: (d: any) => void }) {
  const config = data.config || {};
  return (
    <div className="space-y-3">
      <SelectField
        label="Método HTTP"
        value={config.method || "POST"}
        onChange={(v) => onUpdate({ config: { ...config, method: v } })}
        options={[
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "DELETE", label: "DELETE" },
        ]}
      />
      <ConfigField
        label="URL"
        value={config.url || ""}
        onChange={(v) => onUpdate({ config: { ...config, url: v } })}
        placeholder="https://api.exemplo.com/endpoint"
      />
      <ConfigField
        label="Headers (JSON)"
        value={config.headers || ""}
        onChange={(v) => onUpdate({ config: { ...config, headers: v } })}
        type="textarea"
        placeholder='{"Authorization": "Bearer ..."}'
      />
      <ConfigField
        label="Body (JSON)"
        value={config.body || ""}
        onChange={(v) => onUpdate({ config: { ...config, body: v } })}
        type="textarea"
        placeholder='{"key": "value"}'
      />
    </div>
  );
}

function NotificationConfig({ data, onUpdate }: { data: any; onUpdate: (d: any) => void }) {
  const config = data.config || {};
  return (
    <div className="space-y-3">
      <SelectField
        label="Canal"
        value={config.channel || "whatsapp"}
        onChange={(v) => onUpdate({ config: { ...config, channel: v } })}
        options={[
          { value: "whatsapp", label: "WhatsApp" },
          { value: "email", label: "E-mail" },
          { value: "slack", label: "Slack" },
        ]}
      />
      <ConfigField
        label="Destinatário"
        value={config.to || ""}
        onChange={(v) => onUpdate({ config: { ...config, to: v } })}
        placeholder={config.channel === "email" ? "email@exemplo.com" : "5511999999999"}
      />
      <ConfigField
        label="Mensagem"
        value={config.message || ""}
        onChange={(v) => onUpdate({ config: { ...config, message: v } })}
        type="textarea"
        placeholder="Texto da notificação..."
      />
    </div>
  );
}

function ConditionConfig({ data, onUpdate }: { data: any; onUpdate: (d: any) => void }) {
  const config = data.config || {};
  return (
    <div className="space-y-3">
      <ConfigField
        label="Expressão condicional"
        value={config.expression || ""}
        onChange={(v) => onUpdate({ config: { ...config, expression: v } })}
        type="textarea"
        placeholder='resultado.status === "success"'
      />
    </div>
  );
}

function DelayConfig({ data, onUpdate }: { data: any; onUpdate: (d: any) => void }) {
  const config = data.config || {};
  return (
    <div className="space-y-3">
      <ConfigField
        label="Segundos de espera"
        value={String(config.seconds || "")}
        onChange={(v) => onUpdate({ config: { ...config, seconds: parseInt(v) || 0 } })}
        type="number"
        placeholder="60"
      />
    </div>
  );
}

function StageChangeConfig({ data, onUpdate }: { data: any; onUpdate: (d: any) => void }) {
  const config = data.config || {};
  const fromStage = config.fromStage || "*";
  const toStage = config.toStage || "*";
  const fromLabel = fromStage === "*" ? "Qualquer" : (STAGE_LABELS[fromStage] || fromStage);
  const toLabel = toStage === "*" ? "Qualquer" : (STAGE_LABELS[toStage] || toStage);

  return (
    <div className="space-y-3">
      <SelectField
        label="De (estágio de origem)"
        value={fromStage}
        onChange={(v) => onUpdate({ config: { ...config, fromStage: v } })}
        options={STAGE_OPTIONS}
      />
      <SelectField
        label="Para (estágio de destino)"
        value={toStage}
        onChange={(v) => onUpdate({ config: { ...config, toStage: v } })}
        options={STAGE_OPTIONS}
      />

      {/* Preview */}
      <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/50">
        <p className="text-[10px] text-zinc-400">
          <span className="text-zinc-600">Quando projeto mover de </span>
          <span className="text-cyan-400 font-medium">{fromLabel}</span>
          <span className="text-zinc-600"> para </span>
          <span className="text-cyan-400 font-medium">{toLabel}</span>
        </p>
      </div>

      {/* Variáveis disponíveis */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Variáveis de contexto
        </p>
        <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/50 space-y-1 max-h-36 overflow-y-auto">
          {PROJECT_CONTEXT_VARS.map((v) => (
            <div key={v.key} className="flex items-center gap-2">
              <code className="text-[10px] font-mono text-cyan-400/80">{`{{${v.key}}}`}</code>
              <span className="text-[10px] text-zinc-600">{v.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DatabaseConfig({ data, onUpdate }: { data: any; onUpdate: (d: any) => void }) {
  const config = data.config || {};
  return (
    <div className="space-y-3">
      <SelectField
        label="Operação"
        value={config.operation || "update"}
        onChange={(v) => onUpdate({ config: { ...config, operation: v } })}
        options={[
          { value: "select", label: "SELECT" },
          { value: "insert", label: "INSERT" },
          { value: "update", label: "UPDATE" },
          { value: "delete", label: "DELETE" },
        ]}
      />
      <ConfigField
        label="Tabela"
        value={config.table || ""}
        onChange={(v) => onUpdate({ config: { ...config, table: v } })}
        placeholder="project"
      />
      <ConfigField
        label="Filtro (JSON)"
        value={config.filter || ""}
        onChange={(v) => onUpdate({ config: { ...config, filter: v } })}
        type="textarea"
        placeholder='{"id": "abc-123"}'
      />
      <ConfigField
        label="Dados (JSON)"
        value={config.data || ""}
        onChange={(v) => onUpdate({ config: { ...config, data: v } })}
        type="textarea"
        placeholder='{"stage": "ongoing"}'
      />
    </div>
  );
}

const configComponents: Record<string, React.FC<{ data: any; onUpdate: (d: any) => void }>> = {
  trigger: TriggerConfig,
  stage_change: StageChangeConfig,
  webhook: WebhookConfig,
  notification: NotificationConfig,
  condition: ConditionConfig,
  delay: DelayConfig,
  database: DatabaseConfig,
};

export function WorkflowConfigPanel({ node, onUpdate, onClose }: WorkflowConfigPanelProps) {
  const nodeType = node.type as NodeType;
  const color = NODE_COLORS[nodeType] || "#00fff5";
  const data = node.data as any;

  const ConfigComponent = configComponents[nodeType];

  return (
    <aside className="w-72 bg-zinc-950 border-l border-zinc-800/60 flex flex-col overflow-y-auto">
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: `${color}30` }}
      >
        <h3 className="font-mono text-xs uppercase tracking-wider text-white">
          Configuração
        </h3>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <ConfigField
          label="Nome do nó"
          value={data.label || ""}
          onChange={(v) => onUpdate({ label: v })}
          placeholder="Nome..."
        />
        <ConfigField
          label="Descrição"
          value={data.description || ""}
          onChange={(v) => onUpdate({ description: v })}
          type="textarea"
          placeholder="Descrição opcional..."
        />

        {ConfigComponent && (
          <div className="pt-2 border-t border-zinc-800/40">
            <ConfigComponent data={data} onUpdate={onUpdate} />
          </div>
        )}
      </div>
    </aside>
  );
}
