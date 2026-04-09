import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { project } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/db-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { id } = await params;
  const { stage } = await request.json();

  const result = await db
    .update(project)
    .set({ stage, stageChangedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(project.id, id))
    .returning();

  if (!result[0]) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(result[0]);
}
