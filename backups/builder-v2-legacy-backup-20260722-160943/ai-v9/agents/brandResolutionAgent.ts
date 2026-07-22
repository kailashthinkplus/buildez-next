import type { V9Workflow } from "./types";
import { logBuilderDebug } from "../../debug/blueprintDebug";

export type BrandResolution = {
  confidence: number;
  companyName: string;
  officialWebsite?: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
  summary?: string;
  facts: string[];
  rejected: Array<{
    url: string;
    reason: string;
  }>;
};

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizeUrl(value: unknown) {
  const raw = asString(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) return `https://${raw}`;
  return "";
}

function cleanBrandName(value: unknown) {
  const raw = asString(value)
    .replace(/\b(from|for|website|landing page|company website)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const weak = [
    "from",
    "for",
    "website",
    "company",
    "business",
    "brand",
    "real estate",
    "my first site",
    "build ez site",
    "buildez site",
  ];

  return weak.includes(raw.toLowerCase()) ? "" : raw;
}

function extractBrandFromPrompt(prompt: string) {
  const patterns = [
    /\b(?:for|about|website for|landing page for|site for)\s+([A-Z][A-Za-z0-9&.' -]{2,80})/i,
    /\b([A-Z][A-Za-z0-9&.' -]{2,80})\s+(?:website|landing page|site)\b/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    const brand = cleanBrandName(match?.[1]);
    if (brand) return brand;
  }

  return "";
}

function intendedBrand(workflow: V9Workflow) {
  const context = workflow.brandContext || {};

  return (
    cleanBrandName(context.companyName) ||
    cleanBrandName(context.websiteName) ||
    extractBrandFromPrompt(workflow.prompt) ||
    cleanBrandName(workflow.siteName)
  );
}

function extractOpenAiText(json: any) {
  if (typeof json?.output_text === "string" && json.output_text.trim()) {
    return json.output_text;
  }

  const chunks: string[] = [];

  if (Array.isArray(json?.output)) {
    for (const item of json.output) {
      if (typeof item?.content === "string") {
        chunks.push(item.content);
      }

      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === "string") {
            chunks.push(content.text);
          }

          if (typeof content?.content === "string") {
            chunks.push(content.content);
          }

          if (typeof content?.output_text === "string") {
            chunks.push(content.output_text);
          }
        }
      }

      if (typeof item?.text === "string") {
        chunks.push(item.text);
      }
    }
  }

  return chunks.filter(Boolean).join("\n").trim();
}

function parseJson(text: string): BrandResolution | null {
  const raw = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  if (!raw) return null;

  try {
    return JSON.parse(raw) as BrandResolution;
  } catch {
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");

    if (first < 0 || last <= first) {
      return null;
    }

    try {
      return JSON.parse(raw.slice(first, last + 1)) as BrandResolution;
    } catch {
      return null;
    }
  }
}

export async function runV9BrandResolutionAgent(
  workflow: V9Workflow
): Promise<{
  ok: boolean;
  brand: BrandResolution;
  warnings: string[];
}> {
  const context = workflow.brandContext || {};
  const key = process.env.OPENAI_API_KEY?.trim();

  if (!key) {
    return {
      ok: false,
      brand: {
        confidence: 0,
        companyName: "",
        facts: [],
        rejected: [],
      },
      warnings: ["OPENAI_API_KEY is not configured."],
    };
  }

  const companyName = intendedBrand(workflow);
  const websiteUrl = normalizeUrl(context.websiteUrl);
  const logoUrl = normalizeUrl(context.logoUrl);

  if (!companyName && !websiteUrl) {
    return {
      ok: false,
      brand: {
        confidence: 0,
        companyName: "",
        facts: [],
        rejected: [],
      },
      warnings: ["Could not identify brand name or website URL."],
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
  model: process.env.OPENAI_RESEARCH_MODEL || "gpt-4.1-mini",
  tools: [{ type: "web_search_preview" }],
  text: {
    format: {
      type: "json_schema",
      name: "brand_resolution",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          confidence: { type: "number" },
          companyName: { type: "string" },
          officialWebsite: { type: "string" },
          logoUrl: { type: "string" },
          industry: { type: "string" },
          location: { type: "string" },
          summary: { type: "string" },
          facts: {
            type: "array",
            items: { type: "string" },
          },
          rejected: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                url: { type: "string" },
                reason: { type: "string" },
              },
              required: ["url", "reason"],
            },
          },
        },
        required: [
          "confidence",
          "companyName",
          "officialWebsite",
          "logoUrl",
          "industry",
          "location",
          "summary",
          "facts",
          "rejected",
        ],
      },
    },
  },
  input: [
        {
          role: "system",
          content: `
You are BuildEZ BrandResolutionAgent.

Your job:
Resolve the real company/brand context before website generation.

You must:
- Search the web.
- Identify the official company website.
- Reject directories, social profiles, review sites, marketplaces, real-estate listing portals, articles, unrelated companies, demo pages, preview domains.
- Prefer official website/domain and official brand pages.
- Extract real facts only.
- Do not invent project names, numbers, awards, testimonials, years, clients, amenities, locations, or contact details.
- If confidence is low, say so.

Return data matching the provided JSON schema.
          `.trim(),
        },
        {
          role: "user",
          content: `
Brand/company name from user context:
${companyName || "(missing)"}

Known website URL:
${websiteUrl || "(missing)"}

Known logo URL:
${logoUrl || "(missing)"}

Industry:
${asString(context.industry) || "(unknown)"}

Audience:
${asString(context.audience) || "(unknown)"}

Offer:
${asString(context.offer) || "(unknown)"}

Original user prompt:
${workflow.prompt}

Return strict JSON:
{
  "confidence": 0,
  "companyName": "",
  "officialWebsite": "",
  "logoUrl": "",
  "industry": "",
  "location": "",
  "summary": "",
  "facts": [
    ""
  ],
  "rejected": [
    {
      "url": "",
      "reason": ""
    }
  ]
}

Confidence rules:
- 90-100: official website strongly verified.
- 75-89: strong match but some missing details.
- 55-74: weak match; okay only with user-provided website/logo.
- below 55: do not generate full website.

Logo rules:
- Use logoUrl only if it appears from official website metadata, header image, favicon, or user-provided logo.
- Do not use unrelated stock image as logo.

Fact rules:
- Facts must be short and verifiable from official context.
- Never use placeholder copy such as "satisfied clients", "dream home", "clear proof cues", "generated from brand context", or "best choice".
          `.trim(),
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");

    return {
      ok: false,
      brand: {
        confidence: 0,
        companyName,
        officialWebsite: websiteUrl || undefined,
        logoUrl: logoUrl || undefined,
        facts: [],
        rejected: [],
      },
      warnings: [`OpenAI brand resolution failed: ${response.status} ${text}`],
    };
  }

  const json = await response.json();
  const outputText = extractOpenAiText(json);
  logBuilderDebug("ai-v9:brand-resolution-raw", {
  outputText: outputText.slice(0, 4000),
});
  const parsed = parseJson(outputText);

  if (!parsed) {
    return {
      ok: false,
      brand: {
        confidence: 0,
        companyName,
        officialWebsite: websiteUrl || undefined,
        logoUrl: logoUrl || undefined,
        facts: [],
        rejected: [],
      },
      warnings: ["BrandResolutionAgent returned invalid JSON."],
    };
  }

  const normalized: BrandResolution = {
    confidence: Number(parsed.confidence || 0),
    companyName: cleanBrandName(parsed.companyName) || companyName,
    officialWebsite:
      normalizeUrl(parsed.officialWebsite) || websiteUrl || undefined,
    logoUrl: normalizeUrl(parsed.logoUrl) || logoUrl || undefined,
    industry: asString(parsed.industry) || asString(context.industry) || undefined,
    location: asString(parsed.location) || undefined,
    summary: asString(parsed.summary) || undefined,
    facts: Array.isArray(parsed.facts)
      ? parsed.facts.map(String).map((x) => x.trim()).filter(Boolean).slice(0, 12)
      : [],
    rejected: Array.isArray(parsed.rejected)
      ? parsed.rejected
          .map((item) => ({
            url: asString(item?.url),
            reason: asString(item?.reason),
          }))
          .filter((item) => item.url || item.reason)
          .slice(0, 10)
      : [],
  };

  return {
    ok: normalized.confidence >= 55,
    brand: normalized,
    warnings:
      normalized.confidence < 75
        ? [`Brand confidence is low: ${normalized.confidence}.`]
        : [],
  };
}