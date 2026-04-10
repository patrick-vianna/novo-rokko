import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userShortcut } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getSession, getCurrentMember } from "@/lib/db-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const currentMember = await getCurrentMember();
  if (!currentMember) return NextResponse.json([], { status: 200 });

  const shortcuts = await db.select().from(userShortcut)
    .where(eq(userShortcut.memberId, currentMember.id))
    .orderBy(userShortcut.sortOrder);

  return NextResponse.json(shortcuts);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const currentMember = await getCurrentMember();
  if (!currentMember) return NextResponse.json({ error: "Membro nao encontrado" }, { status: 403 });

  const body = await request.json();
  const { systemId, pageName, pageHref, icon } = body;

  if (!systemId || !pageName || !pageHref) {
    return NextResponse.json({ error: "systemId, pageName e pageHref obrigatorios" }, { status: 400 });
  }

  const result = await db.insert(userShortcut).values({
    memberId: currentMember.id,
    systemId,
    pageName,
    pageHref,
    icon: icon || null,
  }).returning();

  return NextResponse.json(result[0], { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const currentMember = await getCurrentMember();
  if (!currentMember) return NextResponse.json({ error: "Membro nao encontrado" }, { status: 403 });

  const shortcutId = request.nextUrl.searchParams.get("id");
  if (!shortcutId) return NextResponse.json({ error: "id obrigatorio" }, { status: 400 });

  await db.delete(userShortcut).where(
    and(eq(userShortcut.id, shortcutId), eq(userShortcut.memberId, currentMember.id))
  );

  return NextResponse.json({ success: true });
}
