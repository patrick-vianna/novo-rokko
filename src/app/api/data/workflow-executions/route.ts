import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workflowExecution } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const workflowId = request.nextUrl.searchParams.get("workflowId");
  if (!workflowId) return NextResponse.json({ error: "workflowId required" }, { status: 400 });

  const data = await db
    .select()
    .from(workflowExecution)
    .where(eq(workflowExecution.workflowId, workflowId))
    .orderBy(desc(workflowExecution.startedAt));

  return NextResponse.json(data);
}
