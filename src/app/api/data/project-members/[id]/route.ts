import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectMember, member, onboardingLog } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession, getCurrentMember } from "@/lib/db-utils";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { id } = await params;

  // Fetch before delete for logging
  const [pm] = await db.select().from(projectMember).where(eq(projectMember.id, id)).limit(1);
  if (pm) {
    const currentMember = await getCurrentMember();
    if (currentMember) {
      const [removed] = await db.select({ name: member.name }).from(member).where(eq(member.id, pm.memberId)).limit(1);
      await db.insert(onboardingLog).values({
        projectId: pm.projectId,
        action: "member_removed",
        details: { memberName: removed?.name || "", memberId: pm.memberId, role: pm.roleInProject },
        performedBy: currentMember.id,
      });
    }
  }

  await db.delete(projectMember).where(eq(projectMember.id, id));
  return NextResponse.json({ success: true });
}
