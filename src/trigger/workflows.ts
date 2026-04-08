import { task } from "@trigger.dev/sdk/v3";
import { callWebhook } from "./actions/call-webhook";
import { sendNotification } from "./actions/send-notification";
import { updateDatabase } from "./actions/update-database";
import { delay } from "./actions/delay";
import { resolveConfigTemplates } from "../lib/template";

export const executeWorkflow = task({
  id: "execute-workflow",
  maxDuration: 300,
  run: async (payload: {
    workflowId: string;
    nodes: any[];
    edges: any[];
    context?: Record<string, string>;
  }) => {
    const { nodes, edges, context = {} } = payload;

    // Encontrar nó trigger/stage_change (entry point)
    const triggerNode = nodes.find(
      (n: any) => n.type === "trigger" || n.type === "stage_change",
    );
    if (!triggerNode) throw new Error("Workflow sem nó trigger");

    // Executar em sequência seguindo as edges
    let currentNodeId: string | null = triggerNode.id;
    const results: Record<string, any> = {};

    while (currentNodeId) {
      const node = nodes.find((n: any) => n.id === currentNodeId);
      if (!node) break;

      console.log(`Executando nó: ${node.data?.label || node.id} (${node.type})`);

      // Resolve template variables in config before executing
      const resolvedConfig = node.data?.config
        ? resolveConfigTemplates(node.data.config, context)
        : node.data?.config;

      const nodeWithResolvedConfig = {
        ...node,
        data: { ...node.data, config: resolvedConfig },
      };

      const result: any = await executeNode(nodeWithResolvedConfig, results);
      results[node.id] = result;

      // Encontrar próximo nó via edges
      if (node.type === "condition") {
        const edge = edges.find(
          (e: any) =>
            e.source === currentNodeId &&
            e.sourceHandle === (result.condition ? "true" : "false"),
        );
        currentNodeId = edge?.target ?? null;
      } else {
        const edge = edges.find((e: any) => e.source === currentNodeId);
        currentNodeId = edge?.target ?? null;
      }
    }

    return { success: true, results };
  },
});

async function executeNode(
  node: any,
  previousResults: Record<string, any>,
) {
  switch (node.type) {
    case "trigger":
    case "stage_change":
      return { triggered: true };

    case "webhook":
      return await callWebhook(node.data.config);

    case "notification":
      return await sendNotification(node.data.config);

    case "database":
      return await updateDatabase(node.data.config);

    case "delay":
      return await delay(node.data.config);

    case "condition":
      return evaluateCondition(node.data.config, previousResults);

    case "action":
      return { executed: true, type: node.data.config?.actionType };

    default:
      return { skipped: true };
  }
}

function evaluateCondition(
  config: any,
  previousResults: Record<string, any>,
) {
  try {
    const allSucceeded = Object.values(previousResults).every(
      (r: any) => !r.error,
    );
    return { condition: allSucceeded };
  } catch {
    return { condition: false };
  }
}
