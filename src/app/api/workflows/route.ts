import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("workflow")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, flow_data, active } = body;

    const { data, error } = await supabase
      .from("workflow")
      .insert({
        name: name || "Sem título",
        description: description || null,
        flow_data: flow_data || { nodes: [], edges: [] },
        active: active || false,
        created_by: "system",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
