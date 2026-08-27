import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import { buildInsightAgents } from "@/modules/insights/insightEngine";
import { createInsightReport } from "@/modules/insights/server";
import type { InsightAgentId } from "@/modules/insights/types";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };

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

const AGENT_CATEGORIES = {
  "business-agent": ["conversion", "best-practices"],
  "marketing-agent": ["seo", "geo", "conversion"],
  "whatsapp-agent": ["conversion"],
  "chatbot-agent": ["accessibility", "conversion", "best-practices"],
} as const;

async function context() {
  const auth = await getUser();
  return auth?.user && auth.tenant ? auth : null;
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
    return NextResponse.json({
      agents: buildInsightAgents(report),
      report,
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
    const sourceCategories =
      agentId in AGENT_CATEGORIES
        ? AGENT_CATEGORIES[agentId as keyof typeof AGENT_CATEGORIES]
        : [agent.category];
    const actions = report.findings
      .filter((finding) => sourceCategories.includes(finding.category as never))
      .slice(0, 3);
    const prompt =
      typeof body.prompt === "string" ? body.prompt.trim().slice(0, 2000) : "";
    return NextResponse.json({
      run: {
        id: crypto.randomUUID(),
        agent,
        completedAt: new Date().toISOString(),
        summary: actions.length
          ? `${agent.name} found ${actions.length} priority action${actions.length === 1 ? "" : "s"}${prompt ? ` related to “${prompt}”` : ""}. Review them before applying changes.`
          : `${agent.name} completed its audit and found no priority issues in this category.`,
        actions,
      },
    }, { headers: PRIVATE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent run failed";
    return NextResponse.json({ error: message }, { status: 400, headers: PRIVATE_HEADERS });
  }
}
