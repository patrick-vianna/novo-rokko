export const DEV_ROLES = ["dev"];
export const ADMIN_ROLES = ["dev", "owner", "admin"];
export const MANAGEMENT_ROLES = ["dev", "owner", "admin", "coord_geral"];
export const COORD_ROLES = ["dev", "owner", "admin", "coord_geral", "coord_equipe"];
export const VIEWER_ROLES = ["dev", "owner", "admin", "coord_geral", "coord_equipe", "comercial", "gestor_trafego", "gestor_projetos"];
export const ALL_ROLES = ["dev", "owner", "admin", "coord_geral", "coord_equipe", "comercial", "copywriter", "designer", "gestor_trafego", "gestor_projetos", "membro"];

export function isDev(role: string): boolean {
  return role === "dev";
}

export function hasAccess(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

export function canAccessExperimental(role: string): boolean {
  return DEV_ROLES.includes(role) || ADMIN_ROLES.includes(role);
}
