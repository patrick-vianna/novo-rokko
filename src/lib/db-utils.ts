import { db } from "./db";
import { member } from "./schema";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { headers } from "next/headers";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getMemberByEmail(email: string) {
  const result = await db
    .select()
    .from(member)
    .where(eq(member.email, email))
    .limit(1);
  return result[0] ?? null;
}

export async function getCurrentMember() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  return getMemberByEmail(session.user.email);
}

// Re-export from centralized roles module
export { hasAccess as hasRole, ADMIN_ROLES, MANAGEMENT_ROLES, ALL_ROLES } from "./roles";
