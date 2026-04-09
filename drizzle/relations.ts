import { relations } from "drizzle-orm/relations";
import { user, session, member, projectMember, project, stakeholder, usersInAuth, onboardingLog, account, workflow, workflowExecution } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
}));

export const projectMemberRelations = relations(projectMember, ({one}) => ({
	member: one(member, {
		fields: [projectMember.memberId],
		references: [member.id]
	}),
	project: one(project, {
		fields: [projectMember.projectId],
		references: [project.id]
	}),
}));

export const memberRelations = relations(member, ({one, many}) => ({
	projectMembers: many(projectMember),
	usersInAuth: one(usersInAuth, {
		fields: [member.authUserId],
		references: [usersInAuth.id]
	}),
	onboardingLogs: many(onboardingLog),
	projects_assignedById: many(project, {
		relationName: "project_assignedById_member_id"
	}),
	projects_assignedCoordinatorId: many(project, {
		relationName: "project_assignedCoordinatorId_member_id"
	}),
	projects_soldById: many(project, {
		relationName: "project_soldById_member_id"
	}),
}));

export const projectRelations = relations(project, ({one, many}) => ({
	projectMembers: many(projectMember),
	stakeholders: many(stakeholder),
	onboardingLogs: many(onboardingLog),
	member_assignedById: one(member, {
		fields: [project.assignedById],
		references: [member.id],
		relationName: "project_assignedById_member_id"
	}),
	member_assignedCoordinatorId: one(member, {
		fields: [project.assignedCoordinatorId],
		references: [member.id],
		relationName: "project_assignedCoordinatorId_member_id"
	}),
	member_soldById: one(member, {
		fields: [project.soldById],
		references: [member.id],
		relationName: "project_soldById_member_id"
	}),
}));

export const stakeholderRelations = relations(stakeholder, ({one}) => ({
	project: one(project, {
		fields: [stakeholder.projectId],
		references: [project.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	members: many(member),
}));

export const onboardingLogRelations = relations(onboardingLog, ({one}) => ({
	member: one(member, {
		fields: [onboardingLog.performedBy],
		references: [member.id]
	}),
	project: one(project, {
		fields: [onboardingLog.projectId],
		references: [project.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const workflowExecutionRelations = relations(workflowExecution, ({one}) => ({
	workflow: one(workflow, {
		fields: [workflowExecution.workflowId],
		references: [workflow.id]
	}),
}));

export const workflowRelations = relations(workflow, ({many}) => ({
	workflowExecutions: many(workflowExecution),
}));