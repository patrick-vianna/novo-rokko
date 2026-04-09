import {
  LayoutDashboard,
  Route,
  FolderKanban,
  Users,
  Contact,
  Building2,
  Briefcase,
  Target,
  Palette,
  BarChart3,
  Workflow,
  UserPlus,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Principal",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Jornada", href: "/jornada", icon: Route },
      { name: "Projetos", href: "/projetos", icon: FolderKanban },
      { name: "Colaboradores", href: "/membros", icon: Users },
      { name: "Stakeholders", href: "/stakeholders", icon: Contact },
      { name: "Empresa", href: "/empresa", icon: Building2 },
    ],
  },
  {
    title: "Modulos",
    items: [
      { name: "Comercial", href: "/comercial", icon: Briefcase, badge: "Em breve", disabled: true },
      { name: "Trafego Pago", href: "/trafego-pago", icon: Target },
      { name: "Design", href: "/design", icon: Palette, badge: "Em breve", disabled: true },
      { name: "Tracking", href: "/tracking", icon: BarChart3, badge: "Em breve", disabled: true },
      { name: "Automacoes", href: "/automacoes", icon: Workflow },
      { name: "Accounts", href: "/accounts", icon: UserPlus, badge: "Em breve", disabled: true },
      { name: "Financeiro", href: "/financeiro", icon: DollarSign, badge: "Em breve", disabled: true },
      { name: "Gestao de Projetos", href: "/gestao-projetos", icon: FolderKanban, badge: "Em breve", disabled: true },
    ],
  },
];
