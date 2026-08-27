export type V12WebResearch = {
  status: "researched" | "not-needed" | "unavailable";
  subject: string;
  companyName: string;
  officialWebsite: string;
  logoUrl: string;
  industry: string;
  location: string;
  summary: string;
  verifiedFacts: string[];
  offerings: string[];
  sourceUrls: string[];
  prohibitedClaims: string[];
};

type RequestOpenAiResponse = (input: {
  apiKey: string;
  body: Record<string, unknown>;
  signal: AbortSignal;
  timeoutMs: number;
}) => Promise<unknown>;

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function outputText(payload: unknown) {
  const root = object(payload);

  if (typeof root.output_text === "string") {
    return root.output_text.trim();
  }

  return (Array.isArray(root.output) ? root.output : [])
    .flatMap((item) => {
      const content = object(item).content;
      return Array.isArray(content) ? content : [];
    })
    .map((item) => {
      const value = object(item);
      return typeof value.text === "string" ? value.text : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function stringList(value: unknown, max = 10) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string =>
          typeof item === "string" && Boolean(item.trim())
        )
        .map((item) => item.trim())
        .slice(0, max)
    : [];
}

function parseJson(text: string): Record<string, unknown> | null {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  if (!cleaned) return null;

  try {
    return object(JSON.parse(cleaned));
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");

    if (first < 0 || last <= first) return null;

    try {
      return object(JSON.parse(cleaned.slice(first, last + 1)));
    } catch {
      return null;
    }
  }
}

function emptyResearch(
  status: V12WebResearch["status"],
  subject = "",
): V12WebResearch {
  return {
    status,
    subject,
    companyName: "",
    officialWebsite: "",
    logoUrl: "",
    industry: "",
    location: "",
    summary: "",
    verifiedFacts: [],
    offerings: [],
    sourceUrls: [],
    prohibitedClaims: [],
  };
}

/**
 * Conservative detection only.
 *
 * Research is useful when the request appears to identify a real,
 * externally-existing brand/company/site. Generic concepts such as
 * "build a website for my bakery" must not trigger speculative research.
 */
export function detectV12ResearchSubject(prompt: string) {
  const text = prompt.trim();

  if (!text) return "";

  const url = text.match(
    /\bhttps?:\/\/(?:www\.)?([a-z0-9.-]+\.[a-z]{2,})(?:\/[^\s]*)?/i,
  );

  if (url?.[1]) return url[1];

  const domain = text.match(
    /\b(?:www\.)?([a-z0-9][a-z0-9.-]*\.[a-z]{2,})(?:\/[^\s]*)?/i,
  );

  if (domain?.[1]) return domain[1];

  const patterns = [
    /\b(?:website|site|landing page|homepage)\s+(?:for|of)\s+["']?([A-Z][A-Za-z0-9&.'’\- ]{2,70})["']?/,
    /\b(?:for|about)\s+["']?([A-Z][A-Za-z0-9&.'’\- ]{2,70})["']?\s+(?:website|site|company|brand)\b/,
    /\b(?:redesign|rebuild|recreate)\s+(?:the\s+)?(?:website|site)\s+(?:for|of)\s+["']?([A-Z][A-Za-z0-9&.'’\- ]{2,70})["']?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match?.[1]) continue;

    const candidate = match[1]
      .replace(
        /\b(?:using|with|in|and create|and make|that has|which has)\b[\s\S]*$/i,
        "",
      )
      .trim();

    if (candidate.length >= 2 && candidate.length <= 80) {
      return candidate;
    }
  }

  return "";
}

export async function researchV12Website(input: {
  apiKey: string;
  prompt: string;
  siteName: string;
  signal: AbortSignal;
  requestOpenAiResponse: RequestOpenAiResponse;
}): Promise<V12WebResearch> {
  const subject =
    detectV12ResearchSubject(input.prompt) ||
    (
      input.siteName &&
      !/^(?:untitled|new site|my site|website|build ez site|buildez site)$/i.test(
        input.siteName.trim(),
      )
        ? input.siteName.trim()
        : ""
    );

  if (!subject) {
    return emptyResearch("not-needed");
  }

  try {
    const payload = await input.requestOpenAiResponse({
      apiKey: input.apiKey,
      signal: input.signal,
      timeoutMs: Number(
        process.env.OPENAI_V12_RESEARCH_TIMEOUT_MS || 20000,
      ),
      body: {
        model:
          process.env.OPENAI_V12_RESEARCH_MODEL ||
          process.env.OPENAI_V12_MODEL ||
          "gpt-5.6-sol",

        reasoning: { effort: "low" },

        tools: [
          {
            type: "web_search",
            search_context_size: "medium",
          },
        ],

        tool_choice: "required",

        include: ["web_search_call.action.sources"],

        input: [
          {
            role: "system",
            content: `
You are BuildEZ Web Research Agent.

Research the real business or brand before its website is generated.

Your job is evidence gathering, not creative writing.

RESEARCH RULES

1. Identify the intended real company or brand.
2. Prefer the company's official domain and official primary sources.
3. Reject:
   - directories
   - review websites
   - social profiles when an official site exists
   - marketplaces
   - listing portals
   - company-information aggregators
   - unrelated businesses with similar names
   - preview/demo/generated websites
4. Never invent facts.
5. Never invent:
   - awards
   - clients
   - testimonials
   - dates
   - statistics
   - addresses
   - project names
   - certifications
   - partnerships
6. If identity is ambiguous, reduce confidence and leave unsupported
   fields empty.
7. Find the best official logo URL only when it can be confidently
   associated with the official company website or official brand asset.
8. Prefer a direct logo asset over an Open Graph marketing image.
9. Return only JSON.
            `.trim(),
          },
          {
            role: "user",
            content: `
Research this website request.

Potential brand/company:
${subject}

BuildEZ site name:
${input.siteName || "(unknown)"}

Original user request:
${input.prompt}

Return JSON only:

{
  "confidence": 0,
  "companyName": "",
  "officialWebsite": "",
  "logoUrl": "",
  "industry": "",
  "location": "",
  "summary": "",
  "verifiedFacts": [],
  "offerings": [],
  "sourceUrls": [],
  "prohibitedClaims": []
}

Requirements:

- confidence is 0-100.
- officialWebsite must be the company's own website.
- logoUrl must be an official logo asset when confidently identified.
- verifiedFacts contains only facts supported by research.
- offerings contains verified products/services/categories.
- sourceUrls should prioritize official URLs.
- prohibitedClaims contains plausible-looking claims that were not
  sufficiently verified and therefore MUST NOT be used in website copy.
- Keep arrays concise.
            `.trim(),
          },
        ],
      },
    });

    const parsed = parseJson(outputText(payload));

    if (!parsed) {
      throw new Error("Research response was not valid JSON.");
    }

    const confidence =
      typeof parsed.confidence === "number"
        ? parsed.confidence
        : Number(parsed.confidence || 0);

    /*
     * Do not allow weak entity resolution to become website truth.
     */
    if (!Number.isFinite(confidence) || confidence < 70) {
      return {
        ...emptyResearch("unavailable", subject),
        prohibitedClaims: [
          "Any factual claim about this company that was not supplied by the user",
        ],
      };
    }

    return {
      status: "researched",
      subject,
      companyName:
        typeof parsed.companyName === "string"
          ? parsed.companyName.trim()
          : "",
      officialWebsite:
        typeof parsed.officialWebsite === "string"
          ? parsed.officialWebsite.trim()
          : "",
      logoUrl:
        typeof parsed.logoUrl === "string"
          ? parsed.logoUrl.trim()
          : "",
      industry:
        typeof parsed.industry === "string"
          ? parsed.industry.trim()
          : "",
      location:
        typeof parsed.location === "string"
          ? parsed.location.trim()
          : "",
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary.trim()
          : "",
      verifiedFacts: stringList(parsed.verifiedFacts),
      offerings: stringList(parsed.offerings),
      sourceUrls: stringList(parsed.sourceUrls),
      prohibitedClaims: stringList(parsed.prohibitedClaims),
    };
  } catch (error) {
    if (input.signal.aborted) throw error;

    console.warn(
      "[V12 RESEARCH] continuing without verified web research",
      error,
    );

    return {
      ...emptyResearch("unavailable", subject),
      prohibitedClaims: [
        "Dates",
        "statistics",
        "awards",
        "testimonials",
        "named projects",
        "addresses",
        "certifications",
        "partnerships",
        "Any factual claim not supplied by the user",
      ],
    };
  }
}

export function formatV12ResearchForPrompt(
  research: V12WebResearch,
) {
  if (research.status !== "researched") {
    return `
WEB RESEARCH STATUS:
Verified external research is unavailable.

RULE:
Use only facts supplied by the user or already present in the project.
Do not invent company facts.
    `.trim();
  }

  return `
VERIFIED WEB RESEARCH

Company:
${research.companyName || "(not verified)"}

Official website:
${research.officialWebsite || "(not verified)"}

Official logo:
${research.logoUrl || "(not verified)"}

Industry:
${research.industry || "(not verified)"}

Location:
${research.location || "(not verified)"}

Summary:
${research.summary || "(none)"}

Verified facts:
${
  research.verifiedFacts.length
    ? research.verifiedFacts.map((fact) => `- ${fact}`).join("\n")
    : "- None"
}

Verified offerings:
${
  research.offerings.length
    ? research.offerings.map((item) => `- ${item}`).join("\n")
    : "- None"
}

Verified source URLs:
${
  research.sourceUrls.length
    ? research.sourceUrls.map((url) => `- ${url}`).join("\n")
    : "- None"
}

PROHIBITED / UNVERIFIED CLAIMS:
${
  research.prohibitedClaims.length
    ? research.prohibitedClaims.map((claim) => `- ${claim}`).join("\n")
    : "- Any unsupported factual claim"
}

GROUNDING RULES:

- Verified research may be used as factual website content.
- Prefer official company sources over secondary sources.
- Never invent company facts.
- Never turn uncertainty into marketing claims.
- Use the official logo when confidently identified.
- Do not recreate an official logo using text, CSS, AI generation,
  or a substitute mark when an official logo URL is available.
- Do not fabricate awards, testimonials, clients, statistics,
  partnerships, dates, addresses, projects, or certifications.
  `.trim();
}
