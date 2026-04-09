import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workflow } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.select().from(workflow).orderBy(desc(workflow.updatedAt));
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(workflow).values({
      name: body.name || "Sem titulo",
      description: body.description || null,
      flowData: body.flow_data || { nodes: [], edges: [] },
      active: body.active || false,
      createdBy: "system",
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
