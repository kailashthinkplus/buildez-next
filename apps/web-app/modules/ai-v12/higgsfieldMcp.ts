export function higgsfieldMcpTools(): Array<Record<string, unknown>> {
  const serverUrl = process.env.HIGGSFIELD_MCP_URL?.trim();
  if (!serverUrl) return [];
  const token = process.env.HIGGSFIELD_MCP_TOKEN?.trim();
  return [{
    type: "mcp",
    server_label: "higgsfield",
    server_description: "Generate art-directed image and motion assets for the current BuildEZ website.",
    server_url: serverUrl,
    require_approval: "never",
    ...(token ? { headers: { authorization: `Bearer ${token}` } } : {}),
  }];
}

export function higgsfieldResultUrls(payload: unknown): string[] {
  const urls = new Set<string>();
  const visit = (value: unknown, key = "") => {
    if (typeof value === "string") {
      if (/^(rawUrl|result_url|image_url|url)$/i.test(key) && /^https:\/\//i.test(value)) urls.add(value);
      try {
        if ((value.startsWith("{") || value.startsWith("[")) && value.length < 2_000_000) visit(JSON.parse(value));
      } catch {
        // MCP text output is not necessarily JSON.
      }
      return;
    }
    if (Array.isArray(value)) return value.forEach((item) => visit(item));
    if (!value || typeof value !== "object") return;
    Object.entries(value as Record<string, unknown>).forEach(([entryKey, entry]) => visit(entry, entryKey));
  };
  visit(payload);
  return [...urls].slice(0, 12);
}
