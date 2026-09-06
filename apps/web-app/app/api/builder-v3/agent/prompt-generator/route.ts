import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import { ApiError } from "@/lib/api/errors";
import { applyRateLimit } from "@/lib/api/rate-limit";
import { assertPromptAllowed } from "@/lib/ai/moderation";
import type { CreativeDirection } from "@/modules/ai-v12/creativeDirection";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };
const RATE_LIMIT_PER_HOUR = 30;

const VALID_CONTEXTS = ["Website", "Page", "Selected element", "Image"] as const;
type AgentContext = (typeof VALID_CONTEXTS)[number];

function describeCreativeDirection(direction: Partial<CreativeDirection> | undefined) {
  if (!direction) return "";
  const parts: string[] = [];
  if (direction.experienceType && direction.experienceType !== "AI decides") parts.push(`experience: ${direction.experienceType}`);
  if (direction.designStyle && direction.designStyle !== "AI decides") parts.push(`design style: ${direction.designStyle}`);
  if (direction.imageStyle && direction.imageStyle !== "No generated imagery") parts.push(`imagery: ${direction.imageStyle}`);
  if (direction.colorMood && direction.colorMood !== "AI decides") parts.push(`color mood: ${direction.colorMood}`);
  if (direction.density) parts.push(`density: ${direction.density}`);
  if (direction.primaryGoal && direction.primaryGoal !== "AI decides") parts.push(`primary goal: ${direction.primaryGoal}`);
  if (direction.motionStyle) parts.push(`motion: ${direction.motionStyle}`);
  if (direction.audience?.trim()) parts.push(`audience: ${direction.audience.trim()}`);
  return parts.join(", ");
}

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }

  const body = await req.json().catch(() => ({}));
  const siteId = typeof body.siteId === "string" ? body.siteId.trim() : "";
  const idea = typeof body.idea === "string" ? body.idea.trim().slice(0, 4000) : "";
  const contextValue = typeof body.context === "string" ? body.context : "Website";
  const context: AgentContext = (VALID_CONTEXTS as readonly string[]).includes(contextValue)
    ? (contextValue as AgentContext)
    : "Website";
  const selectedElementLabel =
    typeof body.selectedElementLabel === "string" ? body.selectedElementLabel.trim().slice(0, 200) : "";
  const hints = Array.isArray(body.hints)
    ? body.hints.filter((item: unknown): item is string => typeof item === "string").slice(0, 12)
    : [];
  const creativeDirection =
    body.creativeDirection && typeof body.creativeDirection === "object" ? body.creativeDirection : undefined;

  if (!siteId) {
    return NextResponse.json({ error: "A site is required." }, { status: 400, headers: PRIVATE_HEADERS });
  }
  if (!idea && !hints.length) {
    return NextResponse.json({ error: "Describe what you want first." }, { status: 400, headers: PRIVATE_HEADERS });
  }

  try {
    await applyRateLimit({
      key: `rl:ai:prompt-generator:user:${auth.user.id}`,
      limit: RATE_LIMIT_PER_HOUR,
      windowSeconds: 3600,
    });
    await assertPromptAllowed(idea);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const code = error instanceof ApiError ? error.code : undefined;
    const message = error instanceof Error ? error.message : "Request could not be processed.";
    return NextResponse.json({ error: message, code }, { status, headers: PRIVATE_HEADERS });
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId: auth.tenant.id, deletedAt: null },
    select: { name: true },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found." }, { status: 404, headers: PRIVATE_HEADERS });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Prompt generator is not configured." }, { status: 503, headers: PRIVATE_HEADERS });
  }

  const directionSummary = describeCreativeDirection(creativeDirection);

  const userMessage = [
    `SITE: ${site.name}`,
    `SCOPE: ${context}${selectedElementLabel ? ` (${selectedElementLabel})` : ""}`,
    directionSummary ? `CREATIVE DIRECTION: ${directionSummary}` : "",
    hints.length ? `USER-SELECTED HINTS: ${hints.join("; ")}` : "",
    idea ? `WHAT THE USER TYPED:\n${idea}` : "WHAT THE USER TYPED: (nothing yet — build entirely from the hints above)",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30_000, maxRetries: 2 });
    const completion = await openai.chat.completions.create(
      {
        model: process.env.OPENAI_V12_PROMPT_GENERATOR_MODEL || process.env.OPENAI_AGENTS_MODEL || "gpt-4.1-mini",
        temperature: 0.5,
        max_tokens: 3000,
        messages: [
          {
            role: "system",
            content: `You are an expert prompt writer helping a website owner brief an AI website builder. You do exactly what a skilled collaborator does when asked "write me a great prompt for this on Claude or ChatGPT": take a rough, half-formed idea (plus any quick-pick hints) and turn it into a thorough, elaborate creative brief the builder AI can execute immediately end-to-end, with no back-and-forth needed.

Write the kind of prompt a professional would send to a design/dev agency, not a one-line instruction. Go section by section through whatever is relevant to this request — e.g. overall design direction (style, palette, typography, tone), the hero, each major page section or feature, navigation, specific content/copy to include, imagery direction, motion/interaction expectations, mobile behavior, and anything else implied by the idea. Use short headings and bullet points freely — this is a structured brief, not a single paragraph.

Rules:
- Preserve the user's original intent completely — never invent a different goal.
- Be concrete and elaborate: name the specific element/section, the specific change, and the specific outcome for each part of the brief. Replace vague words ("better", "nicer", "improve") with concrete direction (what changes, from what to what).
- Expand on the user's idea with the specificity a strong creative brief needs (layout choices, section-by-section structure, content types, interaction/motion direction) — but never invent business facts, numbers, testimonials, real product details, or claims that weren't given to you or the source material.
- Only reference the scope, creative direction, and hints if they sharpen the brief — never pad it with restated metadata the builder already has via its own context.
- Write it as a direct instruction to the builder, not as a description of a task or a question.
- No preamble like "Here's a prompt:" or closing remarks — output ONLY the brief itself, ready to submit as-is.`,
          },
          { role: "user", content: userMessage },
        ],
      },
      { signal: AbortSignal.timeout(Number(process.env.OPENAI_V12_PROMPT_GENERATOR_TIMEOUT_MS || 20000)) },
    );

    const prompt = completion.choices[0]?.message?.content?.trim();
    if (!prompt) {
      return NextResponse.json({ error: "Could not generate a prompt. Try rephrasing your idea." }, { status: 502, headers: PRIVATE_HEADERS });
    }

    return NextResponse.json({ prompt }, { headers: PRIVATE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prompt generation failed.";
    return NextResponse.json({ error: message }, { status: 502, headers: PRIVATE_HEADERS });
  }
}
