import {
  pgTable,
  text,
  boolean,
  timestamp,
  uuid,
  jsonb,
  numeric,
  date,
  unique,
  check,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ==============================
// Tabela: member
// ==============================
export const member = pgTable("member", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  authUserId: uuid("auth_user_id"),
  name: text().notNull(),
  nickname: text(),
  email: text().notNull(),
  phone: text().notNull(),
  role: text().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
  unique("member_email_key").on(table.email),
  check("member_role_check", sql`role = ANY (ARRAY['dev'::text, 'owner'::text, 'admin'::text, 'coord_geral'::text, 'coord_equipe'::text, 'comercial'::text, 'copywriter'::text, 'designer'::text, 'gestor_trafego'::text, 'gestor_projetos'::text])`),
]);

// ==============================
// Tabela: project
// ==============================
export const project = pgTable("project", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  clientName: text("client_name").notNull(),
  clientCnpj: text("client_cnpj"),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  kommoLeadId: text("kommo_lead_id"),
  kommoLink: text("kommo_link"),
  ekyteId: text("ekyte_id"),
  products: text().array().default([""]),
  contractValue: numeric("contract_value", { precision: 12, scale: 2 }),
  firstPaymentDate: date("first_payment_date"),
  projectStartDate: date("project_start_date"),
  meetingLinks: text("meeting_links").array().default([""]),
  assignedCoordinatorId: uuid("assigned_coordinator_id"),
  assignedById: uuid("assigned_by_id"),
  soldById: uuid("sold_by_id"),
  gchatSpaceId: text("gchat_space_id"),
  gchatLink: text("gchat_link"),
  wppGroupId: text("wpp_group_id"),
  wppGroupLink: text("wpp_group_link"),
  gdriveFolderId: text("gdrive_folder_id"),
  gdriveFolderLink: text("gdrive_folder_link"),
  gdriveSharedFolderId: text("gdrive_shared_folder_id"),
  gdriveSharedFolderLink: text("gdrive_shared_folder_link"),
  ekyteLink: text("ekyte_link"),
  metaAdsAccountId: text("meta_ads_account_id"),
  googleAdsAccountId: text("google_ads_account_id"),
  workspaceStatus: jsonb("workspace_status").default({ ekyte: "pending", gchat: "pending", gdrive: "pending", whatsapp: "pending" }),
  stage: text().default("aguardando_comercial").notNull(),
  welcomeSent: boolean("welcome_sent").default(false),
  workspaceCreationStarted: boolean("workspace_creation_started").default(false),
  stageChangedAt: timestamp("stage_changed_at", { withTimezone: true, mode: "string" }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  contractUrl: text("contract_url"),
  contractFilename: text("contract_filename"),
  groupImageUrl: text("group_image_url"),
  produtosEscopo: text("produtos_escopo").array().default([""]),
  valorEscopo: numeric("valor_escopo", { precision: 12, scale: 2 }),
  dataInicioEscopo: date("data_inicio_escopo"),
  dataPgtoEscopo: date("data_pgto_escopo"),
  produtosRecorrente: text("produtos_recorrente").array().default([""]),
  valorRecorrente: numeric("valor_recorrente", { precision: 12, scale: 2 }),
  dataInicioRecorrente: date("data_inicio_recorrente"),
  dataPgtoRecorrente: date("data_pgto_recorrente"),
  linkCallVendas: text("link_call_vendas"),
  linkTranscricao: text("link_transcricao"),
  observacoes: text(),
  // Pipeline fields
  productType: text("product_type").default("pending"),
  pipeline: text().default("onboarding"),
  lifecycleStatus: text("lifecycle_status").default("active"),
  convertedFromId: uuid("converted_from_id"),
  churnedAt: timestamp("churned_at", { withTimezone: true, mode: "string" }),
  convertedAt: timestamp("converted_at", { withTimezone: true, mode: "string" }),
}, (table) => [
  foreignKey({ columns: [table.assignedById], foreignColumns: [member.id], name: "project_assigned_by_id_fkey" }).onDelete("set null"),
  foreignKey({ columns: [table.assignedCoordinatorId], foreignColumns: [member.id], name: "project_assigned_coordinator_id_fkey" }).onDelete("set null"),
  foreignKey({ columns: [table.soldById], foreignColumns: [member.id], name: "project_sold_by_id_fkey" }).onDelete("set null"),
  unique("project_kommo_lead_id_key").on(table.kommoLeadId),
  unique("project_ekyte_id_key").on(table.ekyteId),
  check("project_stage_check", sql`stage = ANY (ARRAY['aguardando_comercial'::text, 'atribuir_coordenador'::text, 'atribuir_equipe'::text, 'criar_workspace'::text, 'boas_vindas'::text, 'kickoff'::text, 'planejamento'::text, 'ongoing'::text])`),
]);

// ==============================
// Tabela: project_member
// ==============================
export const projectMember = pgTable("project_member", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  projectId: uuid("project_id").notNull(),
  memberId: uuid("member_id").notNull(),
  roleInProject: text("role_in_project").notNull(),
  assignedAt: timestamp("assigned_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
  foreignKey({ columns: [table.memberId], foreignColumns: [member.id], name: "project_member_member_id_fkey" }).onDelete("cascade"),
  foreignKey({ columns: [table.projectId], foreignColumns: [project.id], name: "project_member_project_id_fkey" }).onDelete("cascade"),
  unique("project_member_project_id_role_in_project_key").on(table.projectId, table.roleInProject),
  check("project_member_role_in_project_check", sql`role_in_project = ANY (ARRAY['coord_equipe'::text, 'copywriter'::text, 'designer'::text, 'gestor_trafego'::text, 'gestor_projetos'::text])`),
]);

// ==============================
// Tabela: stakeholder
// ==============================
export const stakeholder = pgTable("stakeholder", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  phone: text(),
  email: text(),
  role: text(),
  projectId: uuid("project_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
  foreignKey({ columns: [table.projectId], foreignColumns: [project.id], name: "stakeholder_project_id_fkey" }).onDelete("cascade"),
]);

// ==============================
// Tabela: company
// ==============================
export const company = pgTable("company", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  cnpj: text(),
  address: text(),
  phone: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
  unique("company_cnpj_key").on(table.cnpj),
]);

// ==============================
// Tabela: onboarding_log
// ==============================
export const onboardingLog = pgTable("onboarding_log", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  projectId: uuid("project_id").notNull(),
  action: text().notNull(),
  details: jsonb(),
  performedBy: uuid("performed_by"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
  foreignKey({ columns: [table.performedBy], foreignColumns: [member.id], name: "onboarding_log_performed_by_fkey" }).onDelete("set null"),
  foreignKey({ columns: [table.projectId], foreignColumns: [project.id], name: "onboarding_log_project_id_fkey" }).onDelete("cascade"),
]);

// ==============================
// Tabela: workflow
// ==============================
export const workflow = pgTable("workflow", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  description: text(),
  flowData: jsonb("flow_data").default({ edges: [], nodes: [] }).notNull(),
  active: boolean().default(false),
  createdBy: text("created_by").notNull(),
  lastRun: timestamp("last_run", { withTimezone: true, mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
});

// ==============================
// Tabela: workflow_execution
// ==============================
export const workflowExecution = pgTable("workflow_execution", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  workflowId: uuid("workflow_id"),
  status: text().default("running"),
  triggerRunId: text("trigger_run_id"),
  results: jsonb(),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: "string" }),
  error: text(),
}, (table) => [
  foreignKey({ columns: [table.workflowId], foreignColumns: [workflow.id], name: "workflow_execution_workflow_id_fkey" }).onDelete("cascade"),
]);

// ==============================
// Tabela: client_credential
// ==============================
export const clientCredential = pgTable("client_credential", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  projectId: uuid("project_id").notNull(),
  serviceName: text("service_name").notNull(),
  serviceCategory: text("service_category").default("other"),
  login: text().notNull(),
  encryptedPassword: text("encrypted_password").notNull(),
  encryptionIv: text("encryption_iv").notNull(),
  encryptionTag: text("encryption_tag").notNull(),
  url: text(),
  notes: text(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
  foreignKey({ columns: [table.projectId], foreignColumns: [project.id], name: "client_credential_project_id_fkey" }).onDelete("cascade"),
  foreignKey({ columns: [table.createdBy], foreignColumns: [member.id], name: "client_credential_created_by_fkey" }),
  foreignKey({ columns: [table.updatedBy], foreignColumns: [member.id], name: "client_credential_updated_by_fkey" }),
]);

// ==============================
// Tabela: credential_access_log
// ==============================
export const credentialAccessLog = pgTable("credential_access_log", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  credentialId: uuid("credential_id").notNull(),
  accessedBy: uuid("accessed_by").notNull(),
  action: text().notNull().default("view"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
}, (table) => [
  foreignKey({ columns: [table.credentialId], foreignColumns: [clientCredential.id], name: "credential_access_log_credential_id_fkey" }).onDelete("cascade"),
  foreignKey({ columns: [table.accessedBy], foreignColumns: [member.id], name: "credential_access_log_accessed_by_fkey" }),
]);

// ==============================
// Relations
// ==============================
export const memberRelations = relations(member, ({ many }) => ({
  projectMembers: many(projectMember),
  onboardingLogs: many(onboardingLog),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  projectMembers: many(projectMember),
  stakeholders: many(stakeholder),
  onboardingLogs: many(onboardingLog),
  assignedBy: one(member, { fields: [project.assignedById], references: [member.id], relationName: "project_assignedById" }),
  assignedCoordinator: one(member, { fields: [project.assignedCoordinatorId], references: [member.id], relationName: "project_assignedCoordinatorId" }),
  soldBy: one(member, { fields: [project.soldById], references: [member.id], relationName: "project_soldById" }),
}));

export const projectMemberRelations = relations(projectMember, ({ one }) => ({
  member: one(member, { fields: [projectMember.memberId], references: [member.id] }),
  project: one(project, { fields: [projectMember.projectId], references: [project.id] }),
}));

export const stakeholderRelations = relations(stakeholder, ({ one }) => ({
  project: one(project, { fields: [stakeholder.projectId], references: [project.id] }),
}));

export const onboardingLogRelations = relations(onboardingLog, ({ one }) => ({
  member: one(member, { fields: [onboardingLog.performedBy], references: [member.id] }),
  project: one(project, { fields: [onboardingLog.projectId], references: [project.id] }),
}));

export const workflowRelations = relations(workflow, ({ many }) => ({
  executions: many(workflowExecution),
}));

export const workflowExecutionRelations = relations(workflowExecution, ({ one }) => ({
  workflow: one(workflow, { fields: [workflowExecution.workflowId], references: [workflow.id] }),
}));
