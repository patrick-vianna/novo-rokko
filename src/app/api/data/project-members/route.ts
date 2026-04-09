import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectMember, member, onboardingLog } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession, getCurrentMember } from "@/lib/db-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const result = await db.select().from(projectMember);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await request.json();
  const result = await db.insert(projectMember).values(body).returning();

  // Log member assignment
  const currentMember = await getCurrentMember();
  if (currentMember && result[0]) {
    const [assigned] = await db.select({ name: member.name }).from(member).where(eq(member.id, result[0].memberId)).limit(1);
    await db.insert(onboardingLog).values({
      projectId: result[0].projectId,
      action: "member_assigned",
      details: { memberName: assigned?.name || "", memberId: result[0].memberId, role: result[0].roleInProject },
      performedBy: currentMember.id,
    });
  }

  return NextResponse.json(result[0], { status: 201 });
}
