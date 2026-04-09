# V4 Rokko

Sistema central de operações da V4 Company — gestão de onboarding, equipe, automações e módulos por vertical.

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Estilo**: Tailwind CSS 4 (tema escuro)
- **Banco de dados**: Supabase (PostgreSQL + Realtime)
- **Autenticação**: Better Auth (Google OAuth, restrito a @v4company.com)
- **Automações**: React Flow (editor visual) + Trigger.dev (execução)
- **Ícones**: Lucide React
- **Animações**: Motion (Framer Motion)
- **Datas**: date-fns (pt-BR)
- **Notificações**: react-hot-toast
- **Drag and drop**: @hello-pangea/dnd

## Primeiros passos

```bash
# Clonar o repositório
git clone https://github.com/Ruston-Assessoria/rokko-next.git
cd rokko-next

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher as variáveis no .env.local (ver seção abaixo)

# Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

## Variáveis de ambiente

```env
# Supabase (dados)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Better Auth (autenticação)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Trigger.dev (automações)
TRIGGER_PROJECT_ID=
TRIGGER_SECRET_KEY=

# Integrações (server-only)
N8N_WEBHOOK_URL=
GEMINI_API_KEY=
```

## Estrutura do projeto

```
src/
├── app/                          # Rotas (App Router)
│   ├── layout.tsx                # Layout global (sidebar, providers)
│   ├── dashboard/                # Kanban de onboarding
│   ├── projetos/                 # Tabela de projetos
│   ├── membros/                  # Gestão de equipe
│   ├── stakeholders/             # Stakeholders dos projetos
│   ├── empresa/                  # Dados da empresa
│   ├── automacoes/               # Workflow builder (React Flow)
│   ├── login/                    # Login com Google OAuth
│   ├── api/                      # API routes (server-side)
│   │   ├── auth/                 # Better Auth handler
│   │   ├── webhooks/             # Proxy pro N8N
│   │   ├── ai/                   # Proxy pro Gemini
│   │   └── workflows/            # CRUD + execução de workflows
│   ├── trafego-pago/             # Módulo: Tráfego Pago
│   ├── design/                   # Módulo: Design
│   ├── tracking/                 # Módulo: Tracking
│   ├── accounts/                 # Módulo: Accounts
│   ├── financeiro/               # Módulo: Financeiro
│   └── gestao-projetos/          # Módulo: Gestão de Projetos
│
├── modules/                      # Lógica de cada módulo
│   ├── README.md                 # Instruções pra colaboradores
│   ├── trafego-pago/             # Componentes, hooks, tipos
│   ├── design/
│   ├── tracking/
│   ├── automacoes/
│   ├── accounts/
│   ├── financeiro/
│   └── gestao-projetos/
│
├── components/                   # Componentes compartilhados (UI)
│   ├── layout/                   # Sidebar, AppShell
│   ├── ui/                       # shadcn/ui components
│   ├── workflow/                 # Editor de workflows (React Flow)
│   ├── KanbanBoard.tsx
│   ├── ProjectDrawer.tsx
│   └── ...
│
├── lib/                          # Bibliotecas e configurações
│   ├── auth.ts                   # Better Auth (servidor)
│   ├── auth-client.ts            # Better Auth (cliente)
│   ├── supabase.ts               # Cliente Supabase
│   ├── navigation.ts             # Itens da sidebar
│   ├── webhooks.ts               # Funções de webhook
│   └── workflow-types.ts         # Tipos dos workflows
│
├── providers/                    # Context providers
│   └── app-provider.tsx          # Store global (CRUD, realtime, state)
│
├── trigger/                      # Tasks do Trigger.dev
│   ├── workflows.ts              # Execução de workflows
│   └── actions/                  # Ações individuais
│
└── types.ts                      # Tipos globais (TeamMember, Role, etc.)
```

## Módulos

O projeto é modular. Cada vertical da empresa tem seu próprio módulo:

| Módulo | Rota | Status |
|--------|------|--------|
| Onboarding | `/dashboard` | ✅ Ativo |
| Automações | `/automacoes` | ✅ Ativo |
| Tráfego Pago | `/trafego-pago` | 🟡 Exemplo |
| Design | `/design` | ⏳ Em desenvolvimento |
| Tracking | `/tracking` | ⏳ Em desenvolvimento |
| Accounts | `/accounts` | ⏳ Em desenvolvimento |
| Financeiro | `/financeiro` | ⏳ Em desenvolvimento |
| Gestão de Projetos | `/gestao-projetos` | ⏳ Em desenvolvimento |

### Como criar um novo módulo

Ver instruções em `src/modules/README.md`.

Resumo:
1. Criar branch: `git checkout -b modulo/nome-do-modulo`
2. Criar pasta: `src/app/nome-do-modulo/page.tsx` (rota)
3. Criar pasta: `src/modules/nome-do-modulo/` (componentes, hooks, tipos)
4. Desenvolver usando componentes compartilhados de `@/components/`
5. Abrir Pull Request pra `main`

## Pipeline de onboarding

Projetos passam por 8 estágios:

```
Aguardando Comercial → Atribuir Coordenador → Atribuir Equipe → Criar Workspace → Boas-vindas → Kickoff → Planejamento → Ongoing
```

Cada transição pode disparar workflows automatizados configurados no módulo de Automações.

## Roles (controle de acesso)

| Role | Permissões |
|------|-----------|
| `owner` | Acesso total |
| `admin` | Acesso total |
| `coord_geral` | Criar projetos, gerenciar equipe |
| `coord_equipe` | Gerenciar equipe do projeto |
| `comercial` | Visualizar projetos |
| `copywriter` | Visualizar projetos |
| `designer` | Visualizar projetos |
| `gestor_trafego` | Visualizar projetos |
| `gestor_projetos` | Gerenciar projetos |
| `membro` | Visualização básica |

## Autenticação

- Login via Google OAuth (um clique)
- Restrito a emails `@v4company.com`
- O email do Google é pareado com o registro na tabela `member` do Supabase
- Sem login = sem acesso (middleware protege todas as rotas)

## Workflow Builder

Editor visual de automações em `/automacoes`:

- **React Flow** pra interface de nós e conexões
- **Estética GridCN/Tron** com glows e tema escuro
- **Trigger.dev** pra execução dos workflows
- Tipos de nós: Trigger (webhook, cron, mudança de estágio), Ação (email, webhook, notificação), Condição (if/else), Delay, Database
- Workflows salvos como JSONB no Supabase

## Scripts

```bash
npm run dev        # Servidor de desenvolvimento (localhost:3000)
npm run build      # Build de produção
npm run start      # Rodar build de produção
npm run lint       # Verificação de tipos TypeScript
```

## Git workflow

```bash
# Criar branch pro módulo
git checkout -b modulo/nome-do-modulo

# Commitar
git commit -m "feat(nome-modulo): descrição"

# Atualizar com main antes de trabalhar
git checkout main && git pull && git checkout modulo/nome && git merge main

# Push e abrir PR
git push origin modulo/nome-do-modulo
```

## Convenções

- Textos e comentários em **português brasileiro**
- Datas formatadas com `date-fns` e locale `pt-BR`
- Campos no banco: `snake_case` → frontend: `camelCase`
- Cor primária: `#e63946` (V4 Red)
- Fontes: DM Sans (body), Space Grotesk (headings)
- Tema escuro como padrão