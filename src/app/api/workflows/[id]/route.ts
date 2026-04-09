import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workflow } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await db.select().from(workflow).where(eq(workflow.id, id)).limit(1);
    if (!result[0]) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const payload: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (body.name !== undefined) payload.name = body.name;
    if (body.description !== undefined) payload.description = body.description;
    if (body.flow_data !== undefined) payload.flowData = body.flow_data;
    if (body.active !== undefined) payload.active = body.active;

    const result = await db.update(workflow).set(payload).where(eq(workflow.id, id)).returning();
    if (!result[0]) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.delete(workflow).where(eq(workflow.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
