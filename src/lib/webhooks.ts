async function callWebhook(path: string, payload: Record<string, unknown>) {
  const response = await fetch("/api/webhooks/n8n", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, payload }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Webhook ${path} falhou`);
  }

  return response.json();
}

// Notificar via WhatsApp (usado em várias etapas)
export async function notifyWhatsApp(phone: string, message: string) {
  return callWebhook("notify-whatsapp", { phone, message });
}

// Criar grupo interno no Google Chat
export async function createGChatSpace(projectId: string, projectName: string, memberEmails: string[]) {
  return callWebhook("create-gchat-space", { projectId, projectName, memberEmails });
}

// Criar grupo externo no WhatsApp
export async function createWppGroup(projectId: string, projectName: string, phones: string[], adminPhones: string[]) {
  return callWebhook("create-wpp-group", { projectId, projectName, phones, adminPhones });
}

// Criar pastas no Google Drive
export async function createDriveFolders(projectId: string, projectName: string, coordinatorEmail: string) {
  return callWebhook("create-drive-folders", { projectId, projectName, coordinatorEmail });
}

// Criar workspace no Ekyte
export async function createEkyteWorkspace(projectId: string, projectName: string, memberEmails: string[]) {
  return callWebhook("create-ekyte-workspace", { projectId, projectName, memberEmails });
}

// Enviar sequência de boas-vindas
export async function sendWelcomeSequence(projectId: string, wppGroupId: string, gDriveFolderLink: string) {
  return callWebhook("send-welcome-sequence", { projectId, wppGroupId, gDriveFolderLink });
}
