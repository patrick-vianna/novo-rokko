import { pgTable, unique, text, boolean, timestamp, index, foreignKey, pgPolicy, check, uuid, jsonb, numeric, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("user_email_key").on(table.email),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_fkey"
		}).onDelete("cascade"),
	unique("session_token_key").on(table.token),
]);

export const projectMember = pgTable("project_member", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	memberId: uuid("member_id").notNull(),
	roleInProject: text("role_in_project").notNull(),
	assignedAt: timestamp("assigned_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [member.id],
			name: "project_member_member_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [project.id],
			name: "project_member_project_id_fkey"
		}).onDelete("cascade"),
	unique("project_member_project_id_role_in_project_key").on(table.projectId, table.roleInProject),
	pgPolicy("Authenticated users full access", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.role() = 'authenticated'::text)` }),
	check("project_member_role_in_project_check", sql`role_in_project = ANY (ARRAY['coord_equipe'::text, 'copywriter'::text, 'designer'::text, 'gestor_trafego'::text, 'gestor_projetos'::text])`),
]);

export const stakeholder = pgTable("stakeholder", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	phone: text(),
	email: text(),
	role: text(),
	projectId: uuid("project_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [project.id],
			name: "stakeholder_project_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Authenticated users full access", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.role() = 'authenticated'::text)` }),
]);

export const company = pgTable("company", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	cnpj: text(),
	address: text(),
	phone: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("company_cnpj_key").on(table.cnpj),
	pgPolicy("Authenticated users full access", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.role() = 'authenticated'::text)` }),
]);

export const member = pgTable("member", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	authUserId: uuid("auth_user_id"),
	name: text().notNull(),
	nickname: text(),
	email: text().notNull(),
	phone: text().notNull(),
	role: text().notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.authUserId],
			foreignColumns: [users.id],
			name: "member_auth_user_id_fkey"
		}).onDelete("set null"),
	unique("member_auth_user_id_key").on(table.authUserId),
	unique("member_email_key").on(table.email),
	pgPolicy("Authenticated users full access", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.role() = 'authenticated'::text)` }),
	check("member_role_check", sql`role = ANY (ARRAY['owner'::text, 'admin'::text, 'coord_geral'::text, 'coord_equipe'::text, 'comercial'::text, 'copywriter'::text, 'designer'::text, 'gestor_trafego'::text, 'gestor_projetos'::text])`),
]);

export const onboardingLog = pgTable("onboarding_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	action: text().notNull(),
	details: jsonb(),
	performedBy: uuid("performed_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.performedBy],
			foreignColumns: [member.id],
			name: "onboarding_log_performed_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [project.id],
			name: "onboarding_log_project_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Authenticated users full access", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.role() = 'authenticated'::text)` }),
]);

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
	contractValue: numeric("contract_value", { precision: 12, scale:  2 }),
	firstPaymentDate: date("first_payment_date"),
	projectStartDate: date("project_start_date"),
	meetingLinks: text("meeting_links").array().default([""]),
	assignedCoordinatorId: uuid("assigned_coordinator_id"),
	assignedById: uuid("assigned_by_id"),
	gchatSpaceId: text("gchat_space_id"),
	gchatLink: text("gchat_link"),
	wppGroupId: text("wpp_group_id"),
	wppGroupLink: text("wpp_group_link"),
	gdriveFolderId: text("gdrive_folder_id"),
	gdriveFolderLink: text("gdrive_folder_link"),
	ekyteLink: text("ekyte_link"),
	metaAdsAccountId: text("meta_ads_account_id"),
	googleAdsAccountId: text("google_ads_account_id"),
	workspaceStatus: jsonb("workspace_status").default({"ekyte":"pending","gchat":"pending","gdrive":"pending","whatsapp":"pending"}),
	stage: text().default('aguardando_comercial').notNull(),
	welcomeSent: boolean("welcome_sent").default(false),
	stageChangedAt: timestamp("stage_changed_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	soldById: uuid("sold_by_id"),
	gdriveSharedFolderId: text("gdrive_shared_folder_id"),
	gdriveSharedFolderLink: text("gdrive_shared_folder_link"),
	contractUrl: text("contract_url"),
	contractFilename: text("contract_filename"),
	groupImageUrl: text("group_image_url"),
	produtosEscopo: text("produtos_escopo").array().default([""]),
	valorEscopo: numeric("valor_escopo", { precision: 12, scale:  2 }),
	dataInicioEscopo: date("data_inicio_escopo"),
	dataPgtoEscopo: date("data_pgto_escopo"),
	produtosRecorrente: text("produtos_recorrente").array().default([""]),
	valorRecorrente: numeric("valor_recorrente", { precision: 12, scale:  2 }),
	dataInicioRecorrente: date("data_inicio_recorrente"),
	dataPgtoRecorrente: date("data_pgto_recorrente"),
	linkCallVendas: text("link_call_vendas"),
	linkTranscricao: text("link_transcricao"),
	observacoes: text(),
	workspaceCreationStarted: boolean("workspace_creation_started").default(false),
}, (table) => [
	foreignKey({
			columns: [table.assignedById],
			foreignColumns: [member.id],
			name: "project_assigned_by_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.assignedCoordinatorId],
			foreignColumns: [member.id],
			name: "project_assigned_coordinator_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.soldById],
			foreignColumns: [member.id],
			name: "project_sold_by_id_fkey"
		}).onDelete("set null"),
	unique("project_kommo_lead_id_key").on(table.kommoLeadId),
	unique("project_ekyte_id_key").on(table.ekyteId),
	pgPolicy("Authenticated users full access", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.role() = 'authenticated'::text)` }),
	check("project_stage_check", sql`stage = ANY (ARRAY['aguardando_comercial'::text, 'atribuir_coordenador'::text, 'atribuir_equipe'::text, 'criar_workspace'::text, 'boas_vindas'::text, 'kickoff'::text, 'planejamento'::text, 'ongoing'::text])`),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_fkey"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const workflow = pgTable("workflow", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	flowData: jsonb("flow_data").default({"edges":[],"nodes":[]}).notNull(),
	active: boolean().default(false),
	createdBy: text("created_by").notNull(),
	lastRun: timestamp("last_run", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const workflowExecution = pgTable("workflow_execution", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workflowId: uuid("workflow_id"),
	status: text().default('running'),
	triggerRunId: text("trigger_run_id"),
	results: jsonb(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	error: text(),
}, (table) => [
	foreignKey({
			columns: [table.workflowId],
			foreignColumns: [workflow.id],
			name: "workflow_execution_workflow_id_fkey"
		}).onDelete("cascade"),
]);
