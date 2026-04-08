export async function sendNotification(config: {
  channel?: string;
  to?: string;
  message?: string;
}) {
  const { channel = "whatsapp", to, message } = config;

  if (!to || !message) {
    return { error: "Destinatário ou mensagem não configurados" };
  }

  try {
    // Proxy via API interna de webhooks (N8N)
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      return { error: "N8N_WEBHOOK_URL não configurado" };
    }

    const response = await fetch(`${n8nUrl}/notify-${channel}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message, channel }),
    });

    return {
      sent: true,
      channel,
      status: response.status,
    };
  } catch (err: any) {
    return { error: err.message };
  }
}
