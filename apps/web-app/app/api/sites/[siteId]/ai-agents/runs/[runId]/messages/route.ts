import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import OpenAI from "openai";

import { getUser } from "@/lib/auth/getUser";
import { getTenantPlan } from "@/lib/plan/getPlan";
import { ApiError } from "@/lib/api/errors";
import { assertPromptAllowed } from "@/lib/ai/moderation";
import { enforceAiRateLimit } from "@/lib/ai/aiRateLimit";
import { captureV12Credits, releaseV12Credits, reserveV12Credits } from "@/modules/ai-v12/creditAccounting";
import { getAgentMeta } from "@/modules/insights/insightEngine";
import type { InsightAgentId, InsightFinding } from "@/modules/insights/types";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };
const AGENT_FOLLOWUP_CREDITS = 5;

async function context() {
  const auth = await getUser();
  return auth?.user && auth.tenant ? auth : null;
}

async function loadRun(siteId: string, runId: string, tenantId: string) {
  return prisma.agentRun.findFirst({
    where: { id: runId, siteId, tenantId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; runId: string }> },
) {
  const auth = await context();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }
  const { siteId, runId } = await params;
  const run = await loadRun(siteId, runId, auth.tenant.id);
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404, headers: PRIVATE_HEADERS });
  }
  return NextResponse.json({ messages: run.messages }, { headers: PRIVATE_HEADERS });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; runId: string }> },
) {
  const auth = await context();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }
  const { siteId, runId } = await params;
  const body = await req.json().catch(() => ({}));
  const question = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  if (!question) {
    return NextResponse.json({ error: "Write a question first" }, { status: 400, headers: PRIVATE_HEADERS });
  }

  const tenantPlan = await getTenantPlan(auth.tenant.id);
  try {
    await enforceAiRateLimit("agent-followup", auth.user.id, tenantPlan?.plan?.aiAgentFollowupLimitPerHour ?? 40);
    await assertPromptAllowed(question);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const code = error instanceof ApiError ? error.code : undefined;
    const message = error instanceof Error ? error.message : "Request could not be processed.";
    return NextResponse.json({ error: message, code }, { status, headers: PRIVATE_HEADERS });
  }

  const run = await loadRun(siteId, runId, auth.tenant.id);
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404, headers: PRIVATE_HEADERS });
  }

  const userMessage = await prisma.agentMessage.create({
    data: { runId: run.id, role: "user", content: question },
  });

  const agentMeta = getAgentMeta(run.agentId as InsightAgentId);
  const agentName = agentMeta?.name || "The specialist agent";
  const findings = Array.isArray(run.findings) ? (run.findings as unknown as InsightFinding[]) : [];

  let answer =
    "Follow-up conversations need an OpenAI API key configured on this environment. Ask the team to add OPENAI_API_KEY, then try again.";
  let generatedBy: "ai" | "analytics" = "analytics";

  if (process.env.OPENAI_API_KEY) {
    const planCode = tenantPlan?.plan?.code || tenantPlan?.subscription?.planCode || "FREE";
    let reservation;
    try {
      reservation = await reserveV12Credits({
        tenantId: auth.tenant.id,
        userId: auth.user.id,
        siteId,
        planCode,
        creditLimit: typeof tenantPlan?.plan?.aiCredits === "number" ? tenantPlan.plan.aiCredits : null,
        amount: AGENT_FOLLOWUP_CREDITS,
      });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      const code = error instanceof ApiError ? error.code : "AI_CREDIT_RESERVATION_FAILED";
      const message = error instanceof Error ? error.message : "AI credits could not be reserved.";
      return NextResponse.json({ error: message, code }, { status, headers: PRIVATE_HEADERS });
    }
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30_000, maxRetries: 2 });
      const history = [...run.messages, userMessage].map((message) => ({
        role: message.role === "user" ? ("user" as const) : ("assistant" as const),
        content: message.content,
      }));
      const result = await openai.chat.completions.create({
        model: process.env.OPENAI_AGENTS_MODEL || "gpt-4.1-mini",
        temperature: 0.4,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You are ${agentName}, answering a follow-up question about an audit you already ran on this website. Stay grounded strictly in the run summary and findings below — never invent facts, scores, or issues that aren't listed. If asked about something outside these findings, say it's outside this run's scope and suggest running the relevant specialist agent instead. Keep answers short and actionable.`,
          },
          {
            role: "user",
            content: JSON.stringify({
              runSummary: run.summary,
              findings: findings.map((finding) => ({
                title: finding.title,
                description: finding.description,
                priority: finding.priority,
                page: finding.pageTitle,
              })),
            }),
          },
          ...history,
        ],
      });
      const content = result.choices[0]?.message?.content?.trim();
      if (content) {
        answer = content;
        generatedBy = "ai";
      }
      await captureV12Credits(reservation);
    } catch {
      answer = "The follow-up could not be generated right now. Please try again in a moment.";
      await releaseV12Credits(reservation, "generation_failed");
    }
  }

  const assistantMessage = await prisma.agentMessage.create({
    data: { runId: run.id, role: "assistant", content: answer },
  });

  return NextResponse.json(
    { messages: [userMessage, assistantMessage], generatedBy },
    { headers: PRIVATE_HEADERS },
  );
}
