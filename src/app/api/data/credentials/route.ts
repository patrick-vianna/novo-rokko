import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientCredential, credentialAccessLog, member, onboardingLog } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/vault";
import { getSession, getMemberByEmail } from "@/lib/db-utils";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId obrigatorio" }, { status: 400 });

  // Return list WITHOUT encrypted password fields
  const credentials = await db
    .select({
      id: clientCredential.id,
      projectId: clientCredential.projectId,
      serviceName: clientCredential.serviceName,
      serviceCategory: clientCredential.serviceCategory,
      login: clientCredential.login,
      url: clientCredential.url,
      notes: clientCredential.notes,
      createdAt: clientCredential.createdAt,
      updatedAt: clientCredential.updatedAt,
    })
    .from(clientCredential)
    .where(eq(clientCredential.projectId, projectId));

  return NextResponse.json(credentials);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const currentMember = await getMemberByEmail(session.user.email);
  if (!currentMember) {
    return NextResponse.json({ error: "Membro nao encontrado" }, { status: 403 });
  }

  const body = await request.json();
  const { projectId, serviceName, serviceCategory, login, password, url, notes } = body;

  if (!projectId || !serviceName || !login || !password) {
    return NextResponse.json({ error: "Campos obrigatorios: projectId, serviceName, login, password" }, { status: 400 });
  }

  const { encrypted, iv, tag } = encrypt(password);

  const result = await db.insert(clientCredential).values({
    projectId,
    serviceName,
    serviceCategory: serviceCategory || "other",
    login,
    encryptedPassword: encrypted,
    encryptionIv: iv,
    encryptionTag: tag,
    url: url || null,
    notes: notes || null,
    createdBy: currentMember.id,
    updatedBy: currentMember.id,
  }).returning({ id: clientCredential.id });

  await db.insert(credentialAccessLog).values({
    credentialId: result[0].id,
    accessedBy: currentMember.id,
    action: "create",
  });

  // Log to project timeline
  await db.insert(onboardingLog).values({
    projectId, action: "credential_created",
    details: { serviceName, credentialId: result[0].id },
    performedBy: currentMember.id,
  });

  return NextResponse.json({ id: result[0].id, serviceName, login }, { status: 201 });
}
