/**
 * Resolves {{key}} placeholders in a string using a context map.
 * E.g. "Olá {{projeto.nome}}" + { "projeto.nome": "Acme" } → "Olá Acme"
 */
export function resolveTemplate(
  template: string,
  context: Record<string, string>,
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key: string) => {
    const trimmed = key.trim();
    return trimmed in context ? context[trimmed] : match;
  });
}

/**
 * Deep-resolves templates in all string values of a config object.
 */
export function resolveConfigTemplates(
  config: Record<string, any>,
  context: Record<string, string>,
): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "string") {
      resolved[key] = resolveTemplate(value, context);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}
