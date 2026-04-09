import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectMember } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/db-utils";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { id } = await params;
  await db.delete(projectMember).where(eq(projectMember.id, id));
  return NextResponse.json({ success: true });
}
