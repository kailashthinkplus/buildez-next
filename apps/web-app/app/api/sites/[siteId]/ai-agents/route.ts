import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import OpenAI from "openai";

import { getUser } from "@/lib/auth/getUser";
import { getTenantPlan } from "@/lib/plan/getPlan";
import { ApiError } from "@/lib/api/errors";
import { assertPromptAllowed } from "@/lib/ai/moderation";
import { enforceAiRateLimit } from "@/lib/ai/aiRateLimit";
import {
  captureV12Credits,
  releaseV12Credits,
  reserveV12Credits,
  type V12CreditReservation,
} from "@/modules/ai-v12/creditAccounting";
import { agentHasOwnFindings, buildInsightAgents, getAgentFindings } from "@/modules/insights/insightEngine";
import { createInsightReport } from "@/modules/insights/server";
import type { InsightAgent, InsightAgentId, InsightFinding } from "@/modules/insights/types";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };
const AGENT_RUN_CREDITS = 8;

const AGENT_IDS: InsightAgentId[] = [
  "seo-agent",
  "geo-agent",
  "speed-agent",
  "accessibility-agent",
  "conversion-agent",
  "quality-agent",
  "business-agent",
  "marketing-agent",
  "whatsapp-agent",
  "chatbot-agent",
];

async function context() {
  const auth = await getUser();
  return auth?.user && auth.tenant ? auth : null;
}

function summarizeFinding(finding: InsightFinding) {
  return `[${finding.priority}] ${finding.title}${finding.pageTitle ? ` (${finding.pageTitle})` : ""}: ${finding.description}`;
}

async function generateSummary(input: {
  agent: InsightAgent;
  business: string;
  prompt: string;
  actions: InsightFinding[];
}): Promise<{ summary: string; generatedBy: "ai" | "analytics" }> {
  const { agent, business, prompt, actions } = input;
  const fallback = actions.length
    ? `${agent.name} found ${actions.length} priority action${actions.length === 1 ? "" : "s"}${prompt ? ` related to “${prompt}”` : ""}. Review them before applying changes.`
    : `${agent.name} completed its audit and found no priority issues in this category.`;

  if (!process.env.OPENAI_API_KEY) {
    return { summary: fallback, generatedBy: "analytics" };
  }
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.chat.completions.create({
      model: process.env.OPENAI_AGENTS_MODEL || "gpt-4.1-mini",
      temperature: 0.4,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content: `You are ${agent.name}, the ${agent.role} on a small business's AI website team for "${business}". Write a short (2-3 sentence), specific, encouraging summary of this audit run for a non-technical business owner. Ground every claim strictly in the findings provided — never invent facts, numbers, or issues not listed. If there are no findings, say the area looks healthy.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            ownerRequest: prompt || null,
            findings: actions.map(summarizeFinding),
          }),
        },
      ],
    });
    const summary = result.choices[0]?.message?.content?.trim();
    return summary ? { summary, generatedBy: "ai" } : { summary: fallback, generatedBy: "analytics" };
  } catch {
    return { summary: fallback, generatedBy: "analytics" };
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const auth = await context();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }
  try {
    const { siteId } = await params;
    const report = await createInsightReport({
      siteId,
      tenantId: auth.tenant.id,
    });
    const recentRuns = await prisma.agentRun.findMany({
      where: { siteId, tenantId: auth.tenant.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        agentId: true,
        prompt: true,
        summary: true,
        generatedBy: true,
        createdAt: true,
      },
    });
    return NextResponse.json({
      agents: buildInsightAgents(report),
      report,
      recentRuns,
    }, { headers: PRIVATE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agents unavailable";
    return NextResponse.json({ error: message }, { status: 404, headers: PRIVATE_HEADERS });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const auth = await context();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }
  try {
    const { siteId } = await params;
    const body = await req.json().catch(() => ({}));
    const agentId = AGENT_IDS.includes(body.agentId) ? body.agentId : undefined;
    if (!agentId) {
      return NextResponse.json({ error: "Choose a valid agent" }, { status: 400, headers: PRIVATE_HEADERS });
    }
    const prompt =
      typeof body.prompt === "string" ? body.prompt.trim().slice(0, 2000) : "";

    const tenantPlan = await getTenantPlan(auth.tenant.id);
    const planCode = tenantPlan?.plan?.code || tenantPlan?.subscription?.planCode || "FREE";

    try {
      await enforceAiRateLimit("agent-run", auth.user.id, tenantPlan?.plan?.aiAgentRunLimitPerHour ?? 20);
      assertPromptAllowed(prompt);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      const code = error instanceof ApiError ? error.code : undefined;
      const message = error instanceof Error ? error.message : "Request could not be processed.";
      return NextResponse.json({ error: message, code }, { status, headers: PRIVATE_HEADERS });
    }

    const report = await createInsightReport({
      siteId,
      tenantId: auth.tenant.id,
      pageId:
        typeof body.pageId === "string" && body.pageId.trim()
          ? body.pageId.trim()
          : undefined,
    });
    const agent = buildInsightAgents(report).find((item) => item.id === agentId);
    if (!agent) {
      return NextResponse.json({ error: "Agent unavailable" }, { status: 404, headers: PRIVATE_HEADERS });
    }
    const actions = agentHasOwnFindings(agentId)
      ? getAgentFindings(report, agentId).slice(0, 3)
      : [];

    let reservation: V12CreditReservation;
    try {
      reservation = await reserveV12Credits({
        tenantId: auth.tenant.id,
        userId: auth.user.id,
        siteId,
        planCode,
        creditLimit: typeof tenantPlan?.plan?.aiCredits === "number" ? tenantPlan.plan.aiCredits : null,
        amount: AGENT_RUN_CREDITS,
      });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      const code = error instanceof ApiError ? error.code : "AI_CREDIT_RESERVATION_FAILED";
      const message = error instanceof Error ? error.message : "AI credits could not be reserved.";
      return NextResponse.json({ error: message, code }, { status, headers: PRIVATE_HEADERS });
    }

    let summary: string;
    let generatedBy: "ai" | "analytics";
    try {
      ({ summary, generatedBy } = await generateSummary({
        agent,
        business: report.site.name,
        prompt,
        actions,
      }));
    } catch (error) {
      await releaseV12Credits(reservation, "generation_failed");
      throw error;
    }

    const saved = await prisma.agentRun.create({
      data: {
        siteId,
        tenantId: auth.tenant.id,
        agentId,
        pageId: report.page?.id,
        prompt: prompt || undefined,
        summary,
        generatedBy,
        findings: actions as unknown as object,
      },
    });
    await captureV12Credits(reservation);
    return NextResponse.json({
      run: {
        id: saved.id,
        agent,
        completedAt: saved.createdAt.toISOString(),
        summary,
        generatedBy,
        actions,
      },
    }, { headers: PRIVATE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent run failed";
    return NextResponse.json({ error: message }, { status: 400, headers: PRIVATE_HEADERS });
  }
}
