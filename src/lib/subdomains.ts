import {
  Settings, TrendingUp, DollarSign, Users,
  LayoutDashboard, Route, FolderOpen, UserPlus, Handshake, Building2,
  Workflow, Target, Palette, BarChart3, Briefcase, FolderKanban,
  Pin, Home,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
  devOnly?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface SubdomainConfig {
  id: string;
  name: string;
  fullName: string;
  description: string;
  subdomain: string;
  icon: LucideIcon;
  color: string;
  status: "active" | "coming_soon" | "placeholder";
  features: string[];
  navigation: NavSection[];
}

export const SUBDOMAINS: Record<string, SubdomainConfig> = {
  hub: {
    id: "hub",
    name: "Hub",
    fullName: "Rokko Hub",
    description: "Central de acesso aos sistemas",
    subdomain: "",
    icon: Home,
    color: "#e63946",
    status: "active",
    features: [],
    navigation: [
      { title: "", items: [
        { name: "Inicio", href: "/", icon: Home },
        { name: "Atalhos", href: "/atalhos", icon: Pin },
      ]},
    ],
  },

  ops: {
    id: "ops",
    name: "OPS",
    fullName: "Rokko Operacional",
    description: "Gestao de operacoes, onboarding e projetos",
    subdomain: "ops",
    icon: Settings,
    color: "#e63946",
    status: "active",
    features: ["Jornada do cliente", "Gestao de projetos", "Automacoes de workflow", "Vault de credenciais"],
    navigation: [
      { title: "Principal", items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Jornada", href: "/jornada", icon: Route },
        { name: "Projetos", href: "/projetos", icon: FolderOpen },
        { name: "Colaboradores", href: "/membros", icon: UserPlus },
        { name: "Stakeholders", href: "/stakeholders", icon: Handshake },
        { name: "Empresa", href: "/empresa", icon: Building2 },
      ]},
      { title: "Modulos", items: [
        { name: "Automacoes", href: "/automacoes", icon: Workflow, devOnly: true },
        { name: "Comercial", href: "/comercial", icon: Briefcase, badge: "Em breve", disabled: true },
        { name: "Trafego Pago", href: "/trafego-pago", icon: Target, badge: "Em breve", disabled: true },
        { name: "Design", href: "/design", icon: Palette, badge: "Em breve", disabled: true },
        { name: "Tracking", href: "/tracking", icon: BarChart3, badge: "Em breve", disabled: true },
        { name: "Gestao de Projetos", href: "/gestao-projetos", icon: FolderKanban, badge: "Em breve", disabled: true },
      ]},
    ],
  },

  sales: {
    id: "sales",
    name: "Sales",
    fullName: "Rokko Comercial",
    description: "Gestao comercial, pipeline de vendas e CRM",
    subdomain: "sales",
    icon: TrendingUp,
    color: "#22c55e",
    status: "placeholder",
    features: ["Pipeline de oportunidades", "Gestao de leads", "Reunioes e follow-ups", "Metricas de conversao"],
    navigation: [
      { title: "Principal", items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ]},
    ],
  },

  finance: {
    id: "finance",
    name: "Finance",
    fullName: "Rokko Financeiro",
    description: "Controle financeiro, orcamento e relatorios",
    subdomain: "finance",
    icon: DollarSign,
    color: "#f59e0b",
    status: "placeholder",
    features: ["Gestao de orcamento", "Relatorios financeiros", "Controle de custos", "Previsao de receita"],
    navigation: [
      { title: "Principal", items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ]},
    ],
  },

  people: {
    id: "people",
    name: "People",
    fullName: "Rokko People",
    description: "Gestao de pessoas, equipes e performance",
    subdomain: "people",
    icon: Users,
    color: "#8b5cf6",
    status: "placeholder",
    features: ["Gestao de equipes", "Alocacao de recursos", "Analise de performance", "Onboarding de membros"],
    navigation: [
      { title: "Principal", items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ]},
    ],
  },
};

export const SUBDOMAIN_LIST = Object.values(SUBDOMAINS).filter(s => s.id !== "hub");

export function getSubdomain(hostname: string): string {
  const parts = hostname.split(".");
  if (hostname.includes("rokko.rustontools.tech")) {
    if (parts.length >= 4) return parts[0]; // ops.rokko.rustontools.tech → ops
    return "";
  }
  if (hostname.includes("localhost")) return "";
  return "";
}

export function getSubdomainConfig(subdomain: string): SubdomainConfig {
  if (!subdomain || subdomain === "") return SUBDOMAINS.hub;
  return SUBDOMAINS[subdomain] || SUBDOMAINS.hub;
}

export function getSubdomainUrl(subdomain: string): string {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    if (!subdomain) return "/";
    return `/?subdomain=${subdomain}`;
  }
  if (!subdomain) return "https://rokko.rustontools.tech";
  return `https://${subdomain}.rokko.rustontools.tech`;
}
