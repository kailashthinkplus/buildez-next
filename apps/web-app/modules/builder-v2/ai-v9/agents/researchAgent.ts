import type { V9Workflow } from "./types";

type OpenAiSearchResult = {
  companyName?: string;
  officialWebsite?: string;
  confidence?: number;
  reason?: string;
  rejected?: Array<{ url?: string; reason?: string }>;
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

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }

  return "";
}

function normalizeBrandName(value: unknown) {
  const raw = asString(value)
    .replace(
      /\b(from|for|website|landing page|real estate|company website)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!raw) return "";

  const weak = [
    "from",
    "for",
    "website",
    "company",
    "business",
    "brand",
    "my first site",
    "build ez site",
    "buildez site",
    "real estate",
  ];

  return weak.includes(raw.toLowerCase()) ? "" : raw;
}

function extractBrandNameFromPrompt(prompt: string) {
  const patterns = [
    /\b(?:for|about|website for|landing page for|site for)\s+([A-Z][A-Za-z0-9&.' -]{2,80})/i,
    /\b([A-Z][A-Za-z0-9&.' -]{2,80})\s+(?:website|landing page|site)\b/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    const candidate = normalizeBrandName(match?.[1]);
    if (candidate) return candidate;
  }

  return "";
}

function intendedBrand(workflow: V9Workflow) {
  const context = workflow.brandContext || {};

  return (
    normalizeBrandName(context.companyName) ||
    normalizeBrandName(context.websiteName) ||
    extractBrandNameFromPrompt(workflow.prompt) ||
    normalizeBrandName(workflow.siteName)
  );
}

function searchQuery(workflow: V9Workflow) {
  const context = workflow.brandContext || {};
  const brand = intendedBrand(workflow);
  const location = asString(context.location);
  const industry = asString(context.industry);

  return [brand, location, industry, "official website"]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function parseJsonFromText(text: string): OpenAiSearchResult | null {
  const raw = text.trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as OpenAiSearchResult;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as OpenAiSearchResult;
  }
}

function extractOpenAiOutputText(json: any) {
  if (typeof json?.output_text === "string") {
    return json.output_text;
  }

  if (Array.isArray(json?.output)) {
    return json.output
      .flatMap((item: any) => item?.content || [])
      .map((content: any) => content?.text || "")
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

async function runOpenAiSearch(query: string) {
  const key = process.env.OPENAI_API_KEY?.trim();

  if (!query) return null;

  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured.");
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
      input: [
        {
          role: "system",
          content:
            "You are a strict brand resolution agent. Use web search to identify the official company website. Reject directories, listing sites, social profiles, marketplaces, unrelated companies, AI-generated pages, preview domains, and generic articles. Return JSON only.",
        },
        {
          role: "user",
          content: `
Find the official website for this brand/company.

Search query:
${query}

Return strict JSON only:
{
  "companyName": "",
  "officialWebsite": "",
  "confidence": 0,
  "reason": "",
  "rejected": [
    { "url": "", "reason": "" }
  ]
}

Rules:
- confidence must be 0-100.
- officialWebsite must be the company's own domain, not Facebook, Instagram, LinkedIn, Justdial, 99acres, MagicBricks, Housing, IndiaMART, ZaubaCorp, Tofler, review sites, or preview domains.
- If unsure, leave officialWebsite empty and set confidence below 70.
          `.trim(),
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI search returned ${response.status}: ${text}`);
  }

  const json = await response.json();
  const text = extractOpenAiOutputText(json);
  return parseJsonFromText(text);
}

function extractLogoUrl(html: string, baseUrl: string) {
  const candidates = [
    extractMeta(html, "og:image"),
    extractMeta(html, "twitter:image"),
    html.match(
      /<link[^>]+rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*["'][^>]+href=["']([^"']+)["']/i
    )?.[1] || "",
    html.match(
      /<img[^>]+(?:alt|class|id)=["'][^"']*(?:logo|brand)[^"']*["'][^>]+src=["']([^"']+)["']/i
    )?.[1] || "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return new URL(candidate, baseUrl).toString();
    } catch {
      // ignore invalid candidate
    }
  }

  return "";
}

function extractImageUrls(html: string, baseUrl: string) {
  const srcsetUrls = Array.from(
    html.matchAll(/(?:srcset|data-srcset)=["']([^"']+)["']/gi)
  ).flatMap((match) =>
    match[1]
      .split(",")
      .map((item) => item.trim().split(/\s+/)[0])
      .filter(Boolean)
  );

  const candidates = [
    extractMeta(html, "og:image"),
    extractMeta(html, "twitter:image"),
    ...Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)).map(
      (match) => match[1]
    ),
    ...Array.from(html.matchAll(/<img[^>]+data-src=["']([^"']+)["']/gi)).map(
      (match) => match[1]
    ),
    ...Array.from(html.matchAll(/<source[^>]+srcset=["']([^"']+)["']/gi)).map(
      (match) => match[1].split(",")[0]?.trim().split(/\s+/)[0] || ""
    ),
    ...srcsetUrls,
    ...Array.from(
      html.matchAll(
        /background-image\s*:\s*url\((?:["']?)([^"')]+)(?:["']?)\)/gi
      )
    ).map((match) => match[1]),
  ];

  const seen = new Set<string>();

  return candidates
    .map((candidate) => {
      try {
        return new URL(candidate, baseUrl).toString();
      } catch {
        return "";
      }
    })
    .filter((url) => {
      if (!url || seen.has(url)) return false;
      seen.add(url);
      const path = (() => {
        try {
          return new URL(url).pathname.toLowerCase();
        } catch {
          return url.toLowerCase();
        }
      })();
      const looksLikeRaster =
        /\.(?:jpe?g|png|webp)(?:[?#].*)?$/i.test(url) ||
        /wp-content\/uploads/i.test(path);
      const looksLikeAsset =
        /(?:logo|icon|favicon|spinner|loader|placeholder|dummy|blank)/i.test(path) ||
        /(?:svg|gif)$/i.test(path);

      return (
        /^https?:\/\//i.test(url) &&
        looksLikeRaster &&
        !looksLikeAsset
      );
    })
    .sort((a, b) => imageAssetScore(b) - imageAssetScore(a))
    .slice(0, 24);
}

function imageAssetScore(url: string) {
  const lower = url.toLowerCase();
  let score = 0;

  if (/project|banner|hero|villa|apartment|residential|gallery|home|arcadia|meadows|celeste|azanya|heritage|aurum|adwaith/i.test(lower)) {
    score += 30;
  }
  if (/bg\d|background|pattern|texture|thumbnail|thumb|cropped/i.test(lower)) {
    score -= 18;
  }
  if (/\.(?:jpe?g|webp)(?:[?#].*)?$/i.test(lower)) score += 8;
  if (/\.(?:png)(?:[?#].*)?$/i.test(lower)) score -= 3;
  if (/nitrocdn|wp-content\/uploads/i.test(lower)) score += 5;

  return score;
}

function extractContactFacts(html: string) {
  const text = cleanText(html);

  const email =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

  const phone =
    text.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/)?.[0] ||
    text.match(/\+?\d[\d\s().-]{8,}\d/)?.[0] ||
    "";

  return {
    email,
    phone,
  };
}

function extractResearchLinks(html: string, baseUrl: string) {
  let origin = "";

  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return [];
  }

  const seen = new Set<string>([baseUrl.replace(/\/$/, "")]);
  const links = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi))
    .map((match) => {
      try {
        return new URL(match[1], baseUrl).toString();
      } catch {
        return "";
      }
    })
    .filter((url) => {
      if (!url || seen.has(url.replace(/\/$/, ""))) return false;
      seen.add(url.replace(/\/$/, ""));

      try {
        const parsed = new URL(url);
        if (parsed.origin !== origin) return false;
        if (parsed.hash && parsed.pathname === new URL(baseUrl).pathname) return false;
        return /project|work|portfolio|gallery|media|about|who-we-are|expertise|case-study|property|residence|home/i.test(
          parsed.pathname
        );
      } catch {
        return false;
      }
    });

  return links.slice(0, 8);
}

async function fetchHtml(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BuildEZ-AI-Research/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Website returned ${response.status}`);
    }

    return (await response.text()).slice(0, 220000);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLinkedResearchHtml(html: string, websiteUrl: string) {
  const links = extractResearchLinks(html, websiteUrl);
  const settled = await Promise.allSettled(
    links.map((url) => fetchHtml(url, 5000))
  );

  return settled
    .filter(
      (result): result is PromiseFulfilledResult<string> =>
        result.status === "fulfilled" && Boolean(result.value)
    )
    .map((result) => result.value);
}

async function fetchWebsiteResearch(websiteUrl: string) {
  const html = await fetchHtml(websiteUrl, 7000);
  const linkedHtml = await fetchLinkedResearchHtml(html, websiteUrl);
  const researchHtml = [html, ...linkedHtml].join("\n");

  const title =
    cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "") || "";

  const description =
    extractMeta(html, "description") ||
    extractMeta(html, "og:description") ||
    extractMeta(html, "twitter:description");

  const ogTitle = extractMeta(html, "og:title");

  const h1 =
    cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "") || "";

  const logoUrl = extractLogoUrl(html, websiteUrl);
  const images = extractImageUrls(researchHtml, websiteUrl);
  const contact = extractContactFacts(researchHtml);

  return {
    title: ogTitle || title,
    description,
    h1,
    logoUrl,
    images,
    crawledPages: linkedHtml.length,
    contact,
  };
}

export async function runV9ResearchAgent(workflow: V9Workflow) {
  const context = workflow.brandContext || {};
  const researchEnabled = context.researchEnabled !== false;
  const websiteUrl =
    normalizeUrl(context.websiteUrl) ||
    normalizeUrl(workflow.brandResolution?.officialWebsite);
  const brand = intendedBrand(workflow);

  if (!researchEnabled) {
    return {
      ok: true,
      research: {
        source: "saved-context",
        skipped: "Research disabled by user.",
        brand,
      },
      warnings: [] as string[],
    };
  }

  if (!brand) {
    return {
      ok: false,
      research: {
        source: "openai-brand-resolution",
        confidence: 0,
      },
      warnings: ["Could not identify a valid brand name from context or prompt."],
    };
  }

  if (websiteUrl) {
    try {
      const websiteResearch = await fetchWebsiteResearch(websiteUrl);

      return {
        ok: true,
        research: {
          source: "verified-website",
          confidence: 90,
          brand,
          url: websiteUrl,
          ...websiteResearch,
        },
        warnings: [] as string[],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Website research failed";

      return {
        ok: false,
        research: {
          source: "verified-website",
          confidence: 35,
          brand,
          url: websiteUrl,
        },
        warnings: [message],
      };
    }
  }

  const query = searchQuery(workflow);

  try {
    const searchResult = await runOpenAiSearch(query);
    const confidence = Number(searchResult?.confidence ?? 0);
    const officialWebsite = normalizeUrl(searchResult?.officialWebsite);

    if (!officialWebsite || confidence < 70) {
      return {
        ok: false,
        research: {
          source: "openai-search",
          confidence,
          brand,
          query,
          result: searchResult,
        },
        warnings: [
          `OpenAI search could not confidently resolve official website for "${brand}".`,
        ],
      };
    }

    try {
      const websiteResearch = await fetchWebsiteResearch(officialWebsite);

      return {
        ok: true,
        research: {
          source: "openai-search+website",
          confidence,
          brand: normalizeBrandName(searchResult?.companyName) || brand,
          query,
          url: officialWebsite,
          searchResult,
          ...websiteResearch,
        },
        warnings: [] as string[],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Fetching official website failed";

      return {
        ok: true,
        research: {
          source: "openai-search",
          confidence,
          brand: normalizeBrandName(searchResult?.companyName) || brand,
          query,
          url: officialWebsite,
          searchResult,
        },
        warnings: [message],
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI search failed";

    return {
      ok: false,
      research: {
        source: "openai-search",
        confidence: 0,
        brand,
        query,
      },
      warnings: [message],
    };
  }
}
