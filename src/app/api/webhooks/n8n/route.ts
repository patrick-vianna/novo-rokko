import { NextRequest, NextResponse } from "next/server";

const N8N_BASE = process.env.N8N_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  const { path, payload } = await request.json();

  if (!N8N_BASE) {
    console.warn(`[Webhook] N8N_WEBHOOK_URL ausente. Mock de chamada para ${path}`, payload);
    return NextResponse.json({ success: true, mocked: true });
  }

  try {
    const response = await fetch(`${N8N_BASE}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Webhook ${path} falhou: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: `Erro ao chamar webhook ${path}: ${error}` },
      { status: 500 }
    );
  }
}
