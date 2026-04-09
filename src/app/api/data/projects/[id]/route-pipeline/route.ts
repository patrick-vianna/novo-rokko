import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { project, projectMember, clientCredential, onboardingLog } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession, getCurrentMember } from "@/lib/db-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const currentMember = await getCurrentMember();
  if (!currentMember) return NextResponse.json({ error: "Membro nao encontrado" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  // Fetch the project
  const [proj] = await db.select().from(project).where(eq(project.id, id)).limit(1);
  if (!proj) return NextResponse.json({ error: "Projeto nao encontrado" }, { status: 404 });

  try {
    if (action === "route_to_recorrente") {
      await db.update(project).set({
        pipeline: "recorrente",
        productType: "byline",
        stage: "boas_vindas",
        updatedAt: new Date().toISOString(),
      }).where(eq(project.id, id));

      await db.insert(onboardingLog).values({
        projectId: id,
        action: "pipeline_routed",
        details: { from: "onboarding", to: "recorrente", targetStage: "boas_vindas" },
        performedBy: currentMember.id,
      });

      return NextResponse.json({ success: true, pipeline: "recorrente", stage: "boas_vindas" });
    }

    if (action === "route_to_ee") {
      await db.update(project).set({
        pipeline: "estruturacao_estrategica",
        productType: "estruturacao_estrategica",
        stage: "ee_semana_1",
        updatedAt: new Date().toISOString(),
      }).where(eq(project.id, id));

      await db.insert(onboardingLog).values({
        projectId: id,
        action: "pipeline_routed",
        details: { from: "onboarding", to: "estruturacao_estrategica", targetStage: "ee_semana_1" },
        performedBy: currentMember.id,
      });

      return NextResponse.json({ success: true, pipeline: "estruturacao_estrategica", stage: "ee_semana_1" });
    }

    if (action === "convert_to_recorrente") {
      // 1. Mark EE as converted
      await db.update(project).set({
        lifecycleStatus: "converted",
        convertedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).where(eq(project.id, id));

      // 2. Create new recorrente project
      const [newProj] = await db.insert(project).values({
        name: `${proj.clientName} — Recorrente`,
        clientName: proj.clientName,
        clientCnpj: proj.clientCnpj,
        clientPhone: proj.clientPhone,
        clientEmail: proj.clientEmail,
        pipeline: "recorrente",
        productType: "byline",
        stage: "ongoing",
        lifecycleStatus: "active",
        convertedFromId: id,
        assignedCoordinatorId: proj.assignedCoordinatorId,
        assignedById: proj.assignedById,
        soldById: proj.soldById,
        gchatSpaceId: proj.gchatSpaceId,
        gchatLink: proj.gchatLink,
        wppGroupId: proj.wppGroupId,
        wppGroupLink: proj.wppGroupLink,
        gdriveFolderId: proj.gdriveFolderId,
        gdriveFolderLink: proj.gdriveFolderLink,
        gdriveSharedFolderId: proj.gdriveSharedFolderId,
        gdriveSharedFolderLink: proj.gdriveSharedFolderLink,
        ekyteId: proj.ekyteId,
        ekyteLink: proj.ekyteLink,
        workspaceStatus: proj.workspaceStatus,
      }).returning();

      // 3. Copy team members
      const teamMembers = await db.select().from(projectMember).where(eq(projectMember.projectId, id));
      if (teamMembers.length > 0) {
        await db.insert(projectMember).values(
          teamMembers.map((tm) => ({
            projectId: newProj.id,
            memberId: tm.memberId,
            roleInProject: tm.roleInProject,
          })),
        );
      }

      // 4. Copy credentials
      const creds = await db.select().from(clientCredential).where(eq(clientCredential.projectId, id));
      if (creds.length > 0) {
        await db.insert(clientCredential).values(
          creds.map((c) => ({
            projectId: newProj.id,
            serviceName: c.serviceName,
            serviceCategory: c.serviceCategory,
            login: c.login,
            encryptedPassword: c.encryptedPassword,
            encryptionIv: c.encryptionIv,
            encryptionTag: c.encryptionTag,
            url: c.url,
            notes: c.notes,
            createdBy: currentMember.id,
            updatedBy: currentMember.id,
          })),
        );
      }

      // 5. Log
      await db.insert(onboardingLog).values({
        projectId: id,
        action: "ee_converted",
        details: { newProjectId: newProj.id },
        performedBy: currentMember.id,
      });

      return NextResponse.json({ success: true, newProjectId: newProj.id });
    }

    if (action === "complete_ee") {
      await db.update(project).set({
        lifecycleStatus: "completed",
        updatedAt: new Date().toISOString(),
      }).where(eq(project.id, id));

      await db.insert(onboardingLog).values({
        projectId: id,
        action: "ee_completed",
        details: {},
        performedBy: currentMember.id,
      });

      return NextResponse.json({ success: true });
    }

    if (action === "churn") {
      const { reason } = body;
      await db.update(project).set({
        stage: "churn",
        lifecycleStatus: "churned",
        churnedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).where(eq(project.id, id));

      await db.insert(onboardingLog).values({
        projectId: id,
        action: "churned",
        details: { reason: reason || "" },
        performedBy: currentMember.id,
      });

      return NextResponse.json({ success: true });
    }

    if (action === "reactivate") {
      await db.update(project).set({
        stage: "ongoing",
        lifecycleStatus: "active",
        churnedAt: null,
        updatedAt: new Date().toISOString(),
      }).where(eq(project.id, id));

      await db.insert(onboardingLog).values({
        projectId: id,
        action: "reactivated",
        details: {},
        performedBy: currentMember.id,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acao desconhecida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
