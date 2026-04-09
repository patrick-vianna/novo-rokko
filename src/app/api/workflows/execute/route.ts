import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { workflow, workflowExecution } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { executeWorkflow } from "@/trigger/workflows";

export async function POST(request: NextRequest) {
  try {
    const { workflowId, nodes, edges, context } = await request.json();

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ error: "Workflow sem nos para executar" }, { status: 400 });
    }

    const handle = await tasks.trigger<typeof executeWorkflow>(
      "execute-workflow",
      { workflowId, nodes, edges, context },
    );

    if (workflowId && workflowId !== "draft") {
      await db.insert(workflowExecution).values({
        workflowId,
        status: "running",
        triggerRunId: handle.id,
      });

      await db.update(workflow).set({ lastRun: new Date().toISOString() }).where(eq(workflow.id, workflowId));
    }

    return NextResponse.json({ success: true, runId: handle.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
