import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { credentialAccessLog, member } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession, getMemberByEmail } from "@/lib/db-utils";
import { ADMIN_ROLES } from "@/lib/roles";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const currentMember = await getMemberByEmail(session.user.email);
  if (!currentMember || !ADMIN_ROLES.includes(currentMember.role)) {
    return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
  }

  const { id } = await params;

  const logs = await db
    .select({
      id: credentialAccessLog.id,
      action: credentialAccessLog.action,
      ipAddress: credentialAccessLog.ipAddress,
      createdAt: credentialAccessLog.createdAt,
      memberName: member.name,
      memberEmail: member.email,
    })
    .from(credentialAccessLog)
    .leftJoin(member, eq(credentialAccessLog.accessedBy, member.id))
    .where(eq(credentialAccessLog.credentialId, id))
    .orderBy(desc(credentialAccessLog.createdAt))
    .limit(50);

  return NextResponse.json(logs);
}
