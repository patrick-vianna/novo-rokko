import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { project, onboardingLog } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession, getCurrentMember } from "@/lib/db-utils";

// Fields that should be logged when changed
const TRACKABLE_FIELDS = [
  "name", "clientName", "clientCnpj", "clientPhone", "clientEmail",
  "kommoLink", "linkCallVendas", "linkTranscricao",
  "metaAdsAccountId", "googleAdsAccountId",
  "valorEscopo", "valorRecorrente", "projectStartDate", "firstPaymentDate",
  "observacoes", "gchatLink", "wppGroupLink", "gdriveFolderLink", "ekyteLink", "gdriveSharedFolderLink",
];

// Workspace link fields — logged as workspace_edited
const WORKSPACE_FIELDS = ["gchatLink", "wppGroupLink", "gdriveFolderLink", "ekyteLink", "gdriveSharedFolderLink"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { id } = await params;
  const result = await db.select().from(project).where(eq(project.id, id)).limit(1);
  if (!result[0]) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  body.updatedAt = new Date().toISOString();

  // Fetch current state for diff
  const [current] = await db.select().from(project).where(eq(project.id, id)).limit(1);
  if (!current) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });

  const result = await db.update(project).set(body).where(eq(project.id, id)).returning();

  // Log changes
  const currentMember = await getCurrentMember();
  if (currentMember) {
    const changes: { field: string; from: any; to: any }[] = [];
    let hasWorkspaceChange = false;
    let hasNoteChange = false;

    for (const field of TRACKABLE_FIELDS) {
      const oldVal = (current as any)[field];
      const newVal = body[field];
      if (newVal !== undefined && String(oldVal || "") !== String(newVal || "")) {
        if (WORKSPACE_FIELDS.includes(field)) {
          hasWorkspaceChange = true;
          // Log individual workspace edit
          await db.insert(onboardingLog).values({
            projectId: id, action: "workspace_edited",
            details: { workspace: field, from: oldVal || null, to: newVal || null },
            performedBy: currentMember.id,
          });
        } else if (field === "observacoes") {
          hasNoteChange = true;
        } else {
          changes.push({ field, from: oldVal || null, to: newVal || null });
        }
      }
    }

    if (changes.length > 0) {
      await db.insert(onboardingLog).values({
        projectId: id, action: "project_edited",
        details: { changes },
        performedBy: currentMember.id,
      });
    }

    if (hasNoteChange) {
      await db.insert(onboardingLog).values({
        projectId: id, action: "note_added",
        details: {},
        performedBy: currentMember.id,
      });
    }
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { id } = await params;
  await db.delete(project).where(eq(project.id, id));
  return NextResponse.json({ success: true });
}
