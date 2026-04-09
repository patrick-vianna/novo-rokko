import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientCredential, credentialAccessLog } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/vault";
import { getSession, getMemberByEmail } from "@/lib/db-utils";
import { COORD_ROLES, VIEWER_ROLES, ADMIN_ROLES } from "@/lib/roles";

// GET — credential WITH decrypted password
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const currentMember = await getMemberByEmail(session.user.email);
  if (!currentMember || !VIEWER_ROLES.includes(currentMember.role)) {
    return NextResponse.json({ error: "Sem permissao para ver senhas" }, { status: 403 });
  }

  const { id } = await params;
  const result = await db.select().from(clientCredential).where(eq(clientCredential.id, id)).limit(1);
  const credential = result[0];
  if (!credential) return NextResponse.json({ error: "Nao encontrada" }, { status: 404 });

  const password = decrypt(credential.encryptedPassword, credential.encryptionIv, credential.encryptionTag);

  // Log access
  await db.insert(credentialAccessLog).values({
    credentialId: credential.id,
    accessedBy: currentMember.id,
    action: "view",
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
  });

  return NextResponse.json({
    id: credential.id,
    projectId: credential.projectId,
    serviceName: credential.serviceName,
    serviceCategory: credential.serviceCategory,
    login: credential.login,
    password,
    url: credential.url,
    notes: credential.notes,
  });
}

// PUT — update credential
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const currentMember = await getMemberByEmail(session.user.email);
  if (!currentMember || !COORD_ROLES.includes(currentMember.role)) {
    return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, any> = {
    updatedBy: currentMember.id,
    updatedAt: new Date().toISOString(),
  };

  if (body.serviceName !== undefined) updateData.serviceName = body.serviceName;
  if (body.serviceCategory !== undefined) updateData.serviceCategory = body.serviceCategory;
  if (body.login !== undefined) updateData.login = body.login;
  if (body.url !== undefined) updateData.url = body.url;
  if (body.notes !== undefined) updateData.notes = body.notes;

  if (body.password) {
    const { encrypted, iv, tag } = encrypt(body.password);
    updateData.encryptedPassword = encrypted;
    updateData.encryptionIv = iv;
    updateData.encryptionTag = tag;
  }

  await db.update(clientCredential).set(updateData).where(eq(clientCredential.id, id));

  await db.insert(credentialAccessLog).values({
    credentialId: id,
    accessedBy: currentMember.id,
    action: "update",
  });

  return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(
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

  await db.insert(credentialAccessLog).values({
    credentialId: id,
    accessedBy: currentMember.id,
    action: "delete",
  });

  await db.delete(clientCredential).where(eq(clientCredential.id, id));
  return NextResponse.json({ success: true });
}
