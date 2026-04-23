import { Project, Member, ProjectMember } from "@/types";
import { MANAGEMENT_ROLES } from "./roles";

/**
 * Returns true if the given user can see the given project.
 *
 * Rules:
 * - dev/owner/admin/coord_geral: see everything
 * - comercial: only projects they sold (soldById) AND in "aguardando_comercial" OR any projeto they sold
 * - coord_equipe: projects where they are the assigned coordinator, OR projects awaiting team assignment
 * - copywriter/designer/gestor_trafego/gestor_projetos/membro: only projects where they are in project_members
 */
export function canSeeProject(
  project: Project,
  user: Member | null,
  projectMembers: ProjectMember[],
): boolean {
  if (!user) return false;

  // Management roles see everything
  if (MANAGEMENT_ROLES.includes(user.role)) return true;

  // Comercial: projects they sold
  if (user.role === "comercial") {
    return (project as any).soldById === user.id;
  }

  // Coord equipe: assigned coordinator OR projects awaiting team assignment
  if (user.role === "coord_equipe") {
    if (project.assignedCoordinatorId === user.id) return true;
    if (project.stage === "atribuir_equipe") return true;
    return false;
  }

  // Team roles: must be in project_members OR be the coordinator (edge case)
  const teamRoles = ["copywriter", "designer", "gestor_trafego", "gestor_projetos", "membro"];
  if (teamRoles.includes(user.role)) {
    if (project.assignedCoordinatorId === user.id) return true;
    return projectMembers.some((pm) => pm.projectId === project.id && pm.memberId === user.id);
  }

  return false;
}

/**
 * Filters a list of projects to only those visible to the current user.
 */
export function filterVisibleProjects(
  projects: Project[],
  user: Member | null,
  projectMembers: ProjectMember[],
): Project[] {
  if (!user) return [];
  if (MANAGEMENT_ROLES.includes(user.role)) return projects;
  return projects.filter((p) => canSeeProject(p, user, projectMembers));
}
