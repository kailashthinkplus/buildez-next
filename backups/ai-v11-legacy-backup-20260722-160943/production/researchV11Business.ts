type Context = Record<string, unknown>;

export type V11ResearchPack = {
  status: "researched" | "not-requested" | "unavailable";
  summary: string;
  verifiedFacts: string[];
  offerings: string[];
  locations: string[];
  sourceUrls: string[];
  prohibitedClaims: string[];
};

function value(context: Context, key: string) {
  return typeof context[key] === "string" ? String(context[key]).trim() : "";
}

function outputText(json: any) {
  if (typeof json?.output_text === "string") return json.output_text;
  return Array.isArray(json?.output) ? json.output.flatMap((item: any) => item?.content || []).map((item: any) => item?.text || "").filter(Boolean).join("\n") : "";
}

function jsonFrom(text: string): Partial<V11ResearchPack> | null {
  try { return JSON.parse(text); } catch {
    const match = text.match(/\{[\s\S]*\}/);
    try { return match ? JSON.parse(match[0]) : null; } catch { return null; }
  }
}

export async function researchV11Business(context: Context, prompt: string): Promise<V11ResearchPack> {
  if (context.researchEnabled === false) return { status: "not-requested", summary: "Use only facts supplied by the user.", verifiedFacts: [], offerings: [], locations: [], sourceUrls: [], prohibitedClaims: ["Any fact not supplied by the user"] };
  const key = process.env.OPENAI_API_KEY?.trim();
  const company = value(context, "companyName") || value(context, "websiteName");
  const website = value(context, "websiteUrl");
  if (!key || (!company && !website)) return { status: "unavailable", summary: "No verifiable business source was available. Keep copy qualitative and clearly avoid factual claims.", verifiedFacts: [], offerings: [], locations: [], sourceUrls: [], prohibitedClaims: ["Dates", "statistics", "awards", "testimonials", "named projects", "addresses"] };
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_V11_RESEARCH_MODEL || "gpt-5.6-terra",
        reasoning: { effort: "none" },
        tools: [{ type: "web_search", search_context_size: "medium" }],
        tool_choice: "required",
        include: ["web_search_call.action.sources"],
        input: `Research the business for a website brief. Company: ${company || "unknown"}. Supplied website: ${website || "none"}. Industry: ${value(context, "industry") || "unknown"}. User request: ${prompt}\n\nPrioritize the official company domain and reliable primary sources. Do not infer facts. Return JSON only with keys: summary (string), verifiedFacts (string[]), offerings (string[]), locations (string[]), sourceUrls (string[]), prohibitedClaims (string[]). Put uncertain or unsupported claims in prohibitedClaims. Never create testimonials, awards, dates, numbers, addresses, or project names. Keep each list to 8 items or fewer.`,
      }),
      signal: AbortSignal.timeout(Number(process.env.OPENAI_V11_RESEARCH_TIMEOUT_MS || 12000)),
    });
    if (!response.ok) throw new Error(`research ${response.status}`);
    const parsed = jsonFrom(outputText(await response.json()));
    if (!parsed) throw new Error("research response was not JSON");
    const list = (item: unknown) => Array.isArray(item) ? item.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim())).slice(0, 8) : [];
    return { status: "researched", summary: typeof parsed.summary === "string" ? parsed.summary : "", verifiedFacts: list(parsed.verifiedFacts), offerings: list(parsed.offerings), locations: list(parsed.locations), sourceUrls: list(parsed.sourceUrls), prohibitedClaims: list(parsed.prohibitedClaims) };
  } catch (error) {
    console.warn("[V11 RESEARCH] continuing without web evidence", error);
    return { status: "unavailable", summary: "Research could not be completed. Use only supplied facts and qualitative copy.", verifiedFacts: [], offerings: [], locations: [], sourceUrls: [], prohibitedClaims: ["Dates", "statistics", "awards", "testimonials", "named projects", "addresses"] };
  }
}
