export async function callWebhook(config: {
  method?: string;
  url?: string;
  headers?: string;
  body?: string;
}) {
  const { method = "POST", url, headers: headersStr, body: bodyStr } = config;

  if (!url) {
    return { error: "URL não configurada" };
  }

  try {
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (headersStr) {
      try {
        headers = { ...headers, ...JSON.parse(headersStr) };
      } catch {
        // Manter headers padrão se JSON inválido
      }
    }

    const fetchOptions: RequestInit = { method, headers };

    if (method !== "GET" && bodyStr) {
      fetchOptions.body = bodyStr;
    }

    const response = await fetch(url, fetchOptions);
    const responseData = await response.text();

    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
    };
  } catch (err: any) {
    return { error: err.message };
  }
}
