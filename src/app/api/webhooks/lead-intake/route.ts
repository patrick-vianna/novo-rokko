import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { project, stakeholder, member, onboardingLog } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Endpoint publico pra receber leads de ferramentas de automacao (ex: Kommo, Make, Zapier).
// Autenticacao via header x-webhook-secret (match com LEAD_INTAKE_SECRET).

export async function POST(request: NextRequest) {
  // 1) Auth via shared secret
  const secret = request.headers.get("x-webhook-secret");
  if (!process.env.LEAD_INTAKE_SECRET) {
    return NextResponse.json({ error: "LEAD_INTAKE_SECRET nao configurado no servidor" }, { status: 500 });
  }
  if (secret !== process.env.LEAD_INTAKE_SECRET) {
    return NextResponse.json({ error: "Secret invalido" }, { status: 401 });
  }

  // 2) Parse + validate
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const {
    client_name,          // obrigatorio — nome da empresa/cliente
    contact_name,         // opcional — nome do contato principal
    contact_email,        // opcional
    contact_phone,        // opcional
    client_cnpj,          // opcional
    kommo_lead_id,        // opcional — ID do lead no Kommo
    kommo_link,           // opcional — URL do lead no Kommo
    sold_by_email,        // opcional — email do vendedor (@v4company.com)
    contract_value,       // opcional — valor total
    valor_escopo,         // opcional — valor do escopo
    valor_recorrente,     // opcional — valor recorrente
    produtos_escopo,      // opcional — array ["ee", "byline"]
    produtos_recorrente,  // opcional — array
    project_start_date,   // opcional — yyyy-mm-dd
    first_payment_date,   // opcional — yyyy-mm-dd
    link_call_vendas,     // opcional
    link_transcricao,     // opcional
    observacoes,          // opcional
  } = body;

  if (!client_name || typeof client_name !== "string" || !client_name.trim()) {
    return NextResponse.json({ error: "client_name obrigatorio" }, { status: 400 });
  }

  try {
    // 3) Resolve sold_by (vendedor) — buscar membro por email
    let soldById: string | null = null;
    if (sold_by_email) {
      const [seller] = await db.select({ id: member.id }).from(member).where(eq(member.email, sold_by_email)).limit(1);
      if (seller) soldById = seller.id;
    }

    // 4) Build project name
    const allProducts = [...(produtos_escopo || []), ...(produtos_recorrente || [])].filter(Boolean);
    const productStr = allProducts.map((p: string) => p === "ee" ? "EE" : p === "byline" ? "Byline" : p).join(" + ");
    const projectName = allProducts.length > 0 ? `${client_name} — ${productStr}` : client_name;

    // 5) Insert project
    const [newProject] = await db.insert(project).values({
      name: projectName,
      clientName: client_name,
      clientCnpj: client_cnpj || null,
      clientPhone: contact_phone || null,
      clientEmail: contact_email || null,
      kommoLeadId: kommo_lead_id ? String(kommo_lead_id) : null,
      kommoLink: kommo_link || null,
      soldById,
      contractValue: contract_value ?? null,
      valorEscopo: valor_escopo ?? null,
      valorRecorrente: valor_recorrente ?? null,
      produtosEscopo: produtos_escopo || [],
      produtosRecorrente: produtos_recorrente || [],
      projectStartDate: project_start_date || null,
      firstPaymentDate: first_payment_date || null,
      linkCallVendas: link_call_vendas || null,
      linkTranscricao: link_transcricao || null,
      observacoes: observacoes || null,
      stage: "aguardando_comercial",
      pipeline: "onboarding",
      productType: "pending",
      lifecycleStatus: "active",
    }).returning();

    // 6) Auto-create primary stakeholder
    if (contact_name || client_name) {
      await db.insert(stakeholder).values({
        projectId: newProject.id,
        name: contact_name || client_name,
        email: contact_email || null,
        phone: contact_phone || null,
        role: "cliente_principal",
      }).catch(() => {});
    }

    // 7) Log creation
    await db.insert(onboardingLog).values({
      projectId: newProject.id,
      action: "project_created",
      details: { source: "webhook_intake", kommo_lead_id: kommo_lead_id || null },
      performedBy: soldById,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      project: {
        id: newProject.id,
        name: newProject.name,
        stage: newProject.stage,
        pipeline: newProject.pipeline,
      },
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro ao processar lead" }, { status: 500 });
  }
}
