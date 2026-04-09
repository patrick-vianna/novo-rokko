import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { project, member } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getSession, getMemberByEmail } from "@/lib/db-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const projects = await db.select().from(project).orderBy(project.name);

  // Enriquecer com soldBy
  const allMembers = await db.select({ id: member.id, name: member.name, nickname: member.nickname }).from(member);
  const memberMap = Object.fromEntries(allMembers.map(m => [m.id, m]));

  const enriched = projects.map(p => ({
    ...p,
    soldBy: p.soldById ? memberMap[p.soldById] || null : null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await request.json();
  const result = await db.insert(project).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}
