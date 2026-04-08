# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

**V4 Rokko** — Client onboarding dashboard for V4 Company. A Next.js 16 app (React 19) that manages the lifecycle of client projects through a Kanban-style pipeline with 8 stages (from `aguardando_comercial` to `ongoing`). Portuguese (pt-BR) is the primary UI language.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm start` — start production server

## Architecture

### Auth & Data — Two Separate Systems
- **Auth**: Better Auth with Google OAuth, restricted to `@v4company.com` emails. Server config in `src/lib/auth.ts`, client in `src/lib/auth-client.ts`. Session cookie: `better-auth.session_token`. Route handler at `src/app/api/auth/[...all]/route.ts`.
- **Data**: Supabase client (`src/lib/supabase.ts`) used only for database queries and realtime subscriptions — NOT for auth.

### State Management — Single Context Provider
All app state lives in `src/providers/app-provider.tsx` via `AppContext`. Access it with the `useAppStore()` hook. This provider:
- Fetches all data from Supabase on login (members, projects, project_members, stakeholders, company, logs)
- Sets up Supabase realtime subscriptions for `project` and `member` tables
- Uses optimistic updates with rollback on error for all mutations
- Maps between camelCase (frontend types in `src/types.ts`) and snake_case (Supabase DB columns)

### Supabase Tables
`member`, `project`, `project_member`, `stakeholder`, `company`, `onboarding_log`. All field mapping (camelCase ↔ snake_case) is done manually in `app-provider.tsx`.

### Middleware
`src/middleware.ts` protects all routes except `/login` and `/api/auth` by checking for the Better Auth session cookie.

### External Integrations via n8n Webhooks
`src/lib/webhooks.ts` proxies all external automation through `/api/webhooks/n8n`. Integrations: WhatsApp notifications, Google Chat spaces, WhatsApp groups, Google Drive folders, Ekyte workspaces, welcome sequences.

### AI Endpoint
`src/app/api/ai/route.ts` uses `@google/genai` (Gemini).

### Key Types
`src/types.ts` defines all domain models. The `Stage` type defines the 8-stage onboarding pipeline. The `Role` type defines team roles (owner, admin, coord_geral, coord_equipe, comercial, copywriter, designer, gestor_trafego, gestor_projetos, membro).

### UI
- Layout: `src/components/layout/app-shell.tsx` + `sidebar.tsx`
- Kanban board: `src/components/KanbanBoard.tsx` (uses `@hello-pangea/dnd`)
- Styling: Tailwind CSS v4 with `clsx` + `tailwind-merge`
- Animations: `motion` (Framer Motion)
- Notifications: `react-hot-toast`

### Environment Variables Required
`DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
