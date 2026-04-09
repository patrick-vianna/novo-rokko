-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "project_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"role_in_project" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "project_member_project_id_role_in_project_key" UNIQUE("project_id","role_in_project"),
	CONSTRAINT "project_member_role_in_project_check" CHECK (role_in_project = ANY (ARRAY['coord_equipe'::text, 'copywriter'::text, 'designer'::text, 'gestor_trafego'::text, 'gestor_projetos'::text]))
);
--> statement-breakpoint
ALTER TABLE "project_member" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "stakeholder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"role" text,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "stakeholder" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cnpj" text,
	"address" text,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "company_cnpj_key" UNIQUE("cnpj")
);
--> statement-breakpoint
ALTER TABLE "company" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid,
	"name" text NOT NULL,
	"nickname" text,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "member_auth_user_id_key" UNIQUE("auth_user_id"),
	CONSTRAINT "member_email_key" UNIQUE("email"),
	CONSTRAINT "member_role_check" CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'coord_geral'::text, 'coord_equipe'::text, 'comercial'::text, 'copywriter'::text, 'designer'::text, 'gestor_trafego'::text, 'gestor_projetos'::text]))
);
--> statement-breakpoint
ALTER TABLE "member" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "onboarding_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"action" text NOT NULL,
	"details" jsonb,
	"performed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "onboarding_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"client_name" text NOT NULL,
	"client_cnpj" text,
	"client_phone" text,
	"client_email" text,
	"kommo_lead_id" text,
	"kommo_link" text,
	"ekyte_id" text,
	"products" text[] DEFAULT '{""}',
	"contract_value" numeric(12, 2),
	"first_payment_date" date,
	"project_start_date" date,
	"meeting_links" text[] DEFAULT '{""}',
	"assigned_coordinator_id" uuid,
	"assigned_by_id" uuid,
	"gchat_space_id" text,
	"gchat_link" text,
	"wpp_group_id" text,
	"wpp_group_link" text,
	"gdrive_folder_id" text,
	"gdrive_folder_link" text,
	"ekyte_link" text,
	"meta_ads_account_id" text,
	"google_ads_account_id" text,
	"workspace_status" jsonb DEFAULT '{"ekyte":"pending","gchat":"pending","gdrive":"pending","whatsapp":"pending"}'::jsonb,
	"stage" text DEFAULT 'aguardando_comercial' NOT NULL,
	"welcome_sent" boolean DEFAULT false,
	"stage_changed_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"sold_by_id" uuid,
	"gdrive_shared_folder_id" text,
	"gdrive_shared_folder_link" text,
	"contract_url" text,
	"contract_filename" text,
	"group_image_url" text,
	"produtos_escopo" text[] DEFAULT '{""}',
	"valor_escopo" numeric(12, 2),
	"data_inicio_escopo" date,
	"data_pgto_escopo" date,
	"produtos_recorrente" text[] DEFAULT '{""}',
	"valor_recorrente" numeric(12, 2),
	"data_inicio_recorrente" date,
	"data_pgto_recorrente" date,
	"link_call_vendas" text,
	"link_transcricao" text,
	"observacoes" text,
	"workspace_creation_started" boolean DEFAULT false,
	CONSTRAINT "project_kommo_lead_id_key" UNIQUE("kommo_lead_id"),
	CONSTRAINT "project_ekyte_id_key" UNIQUE("ekyte_id"),
	CONSTRAINT "project_stage_check" CHECK (stage = ANY (ARRAY['aguardando_comercial'::text, 'atribuir_coordenador'::text, 'atribuir_equipe'::text, 'criar_workspace'::text, 'boas_vindas'::text, 'kickoff'::text, 'planejamento'::text, 'ongoing'::text]))
);
--> statement-breakpoint
ALTER TABLE "project" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"flow_data" jsonb DEFAULT '{"edges":[],"nodes":[]}'::jsonb NOT NULL,
	"active" boolean DEFAULT false,
	"created_by" text NOT NULL,
	"last_run" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_execution" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid,
	"status" text DEFAULT 'running',
	"trigger_run_id" text,
	"results" jsonb,
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"error" text
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stakeholder" ADD CONSTRAINT "stakeholder_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_log" ADD CONSTRAINT "onboarding_log_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_log" ADD CONSTRAINT "onboarding_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_assigned_coordinator_id_fkey" FOREIGN KEY ("assigned_coordinator_id") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_sold_by_id_fkey" FOREIGN KEY ("sold_by_id") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier" text_ops);--> statement-breakpoint
CREATE POLICY "Authenticated users full access" ON "project_member" AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));--> statement-breakpoint
CREATE POLICY "Authenticated users full access" ON "stakeholder" AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));--> statement-breakpoint
CREATE POLICY "Authenticated users full access" ON "company" AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));--> statement-breakpoint
CREATE POLICY "Authenticated users full access" ON "member" AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));--> statement-breakpoint
CREATE POLICY "Authenticated users full access" ON "onboarding_log" AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));--> statement-breakpoint
CREATE POLICY "Authenticated users full access" ON "project" AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
*/