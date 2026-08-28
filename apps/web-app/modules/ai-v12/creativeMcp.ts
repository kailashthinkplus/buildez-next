export type CreativeMcpNeeds = Readonly<{
  images: boolean;
  video: boolean;
  threeD: boolean;
  design: boolean;
}>;

type CreativeMcpDefinition = Readonly<{
  label: string;
  description: string;
  url?: string;
  token?: string;
  capabilities: readonly (keyof CreativeMcpNeeds)[];
}>;

function configuredDefinitions(): CreativeMcpDefinition[] {
  const definitions: CreativeMcpDefinition[] = [
    {
      label: "higgsfield",
      description: "Generate art-directed image and cinematic motion assets for the current BuildEZ website.",
      url: process.env.HIGGSFIELD_MCP_URL,
      token: process.env.HIGGSFIELD_MCP_TOKEN,
      capabilities: ["images", "video"],
    },
    {
      label: "runway",
      description: "Generate and transform cinematic website video, loops, and motion plates.",
      url: process.env.RUNWAY_MCP_URL,
      token: process.env.RUNWAY_MCP_TOKEN,
      capabilities: ["video"],
    },
    {
      label: "meshy",
      description: "Generate production-ready 3D models and textured assets for interactive web scenes.",
      url: process.env.MESHY_MCP_URL,
      token: process.env.MESHY_MCP_TOKEN,
      capabilities: ["threeD"],
    },
    {
      label: "spline",
      description: "Create interactive 3D scenes and web-ready spatial compositions.",
      url: process.env.SPLINE_MCP_URL,
      token: process.env.SPLINE_MCP_TOKEN,
      capabilities: ["threeD", "design"],
    },
    {
      label: "figma",
      description: "Inspect supplied Figma references and support high-fidelity design-system translation.",
      url: process.env.FIGMA_MCP_URL,
      token: process.env.FIGMA_MCP_TOKEN,
      capabilities: ["design"],
    },
  ];

  const custom = process.env.BUILDEZ_CREATIVE_MCP_SERVERS?.trim();
  if (custom) {
    try {
      const parsed = JSON.parse(custom) as unknown;
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (!item || typeof item !== "object") continue;
          const value = item as Record<string, unknown>;
          if (typeof value.label !== "string" || typeof value.url !== "string") continue;
          const capabilities = Array.isArray(value.capabilities)
            ? value.capabilities.filter((capability): capability is keyof CreativeMcpNeeds => ["images", "video", "threeD", "design"].includes(String(capability)))
            : [];
          definitions.push({
            label: value.label,
            description: typeof value.description === "string" ? value.description : "External creative production tool for BuildEZ.",
            url: value.url,
            token: typeof value.token === "string" ? value.token : undefined,
            capabilities,
          });
        }
      }
    } catch {
      console.warn("[Creative MCP] BUILDEZ_CREATIVE_MCP_SERVERS is not valid JSON");
    }
  }

  return definitions;
}

export function creativeMcpTools(needs: CreativeMcpNeeds): Array<Record<string, unknown>> {
  const labels = new Set<string>();
  return configuredDefinitions().flatMap((definition) => {
    const url = definition.url?.trim();
    const label = definition.label.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
    if (!url || !/^https:\/\//i.test(url) || !label || labels.has(label)) return [];
    if (!definition.capabilities.some((capability) => needs[capability])) return [];
    labels.add(label);
    const token = definition.token?.trim();
    return [{
      type: "mcp",
      server_label: label,
      server_description: definition.description,
      server_url: url,
      require_approval: "never",
      ...(token ? { headers: { authorization: `Bearer ${token}` } } : {}),
    }];
  });
}

export function creativeMcpResultUrls(payload: unknown): string[] {
  const urls = new Set<string>();
  const visit = (value: unknown, key = "") => {
    if (typeof value === "string") {
      if (/^(rawUrl|result_url|asset_url|download_url|image_url|video_url|model_url|url)$/i.test(key) && /^https:\/\//i.test(value)) urls.add(value);
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
  return [...urls].slice(0, 24);
}
