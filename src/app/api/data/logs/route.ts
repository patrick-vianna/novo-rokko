import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { onboardingLog } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/db-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const result = await db.select().from(onboardingLog).orderBy(desc(onboardingLog.createdAt));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await request.json();
  const result = await db.insert(onboardingLog).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}
