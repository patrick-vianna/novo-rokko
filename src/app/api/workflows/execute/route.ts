import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { supabase } from "@/lib/supabase";
import type { executeWorkflow } from "@/trigger/workflows";

export async function POST(request: NextRequest) {
  try {
    const { workflowId, nodes, edges, context } = await request.json();

    if (!nodes || nodes.length === 0) {
      return NextResponse.json(
        { error: "Workflow sem nós para executar" },
        { status: 400 },
      );
    }

    const handle = await tasks.trigger<typeof executeWorkflow>(
      "execute-workflow",
      { workflowId, nodes, edges, context },
    );

    // Registrar execução no banco
    if (workflowId && workflowId !== "draft") {
      await supabase.from("workflow_execution").insert({
        workflow_id: workflowId,
        status: "running",
        trigger_run_id: handle.id,
      });

      await supabase
        .from("workflow")
        .update({ last_run: new Date().toISOString() })
        .eq("id", workflowId);
    }

    return NextResponse.json({ success: true, runId: handle.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
