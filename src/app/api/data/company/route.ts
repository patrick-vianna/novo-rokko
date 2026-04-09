import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { company } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/db-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const result = await db.select().from(company).limit(1);
  if (!result[0]) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await request.json();
  const { id, ...updates } = body;
  updates.updatedAt = new Date().toISOString();

  const result = await db.update(company).set(updates).where(eq(company.id, id)).returning();
  if (!result[0]) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(result[0]);
}
