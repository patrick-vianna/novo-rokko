import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stakeholder } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/db-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const result = await db.update(stakeholder).set(body).where(eq(stakeholder.id, id)).returning();
  if (!result[0]) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { id } = await params;
  await db.delete(stakeholder).where(eq(stakeholder.id, id));
  return NextResponse.json({ success: true });
}
