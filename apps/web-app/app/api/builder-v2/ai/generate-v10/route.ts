import { Prisma, prisma } from "@buildez/db";
import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import { ApiError } from "@/lib/api/errors";
import { assertPromptAllowed } from "@/lib/ai/moderation";
import { runV10WebsiteGeneration } from "@/modules/builder-v2/ai-v10";
import { publishV10Progress } from "@/modules/builder-v2/ai-v10/progress/v10GenerationProgress";
import { persistAfterSemanticHydration } from "@/modules/builder-v2/ai-v10/persistence/semanticHydrationPersistenceGate";

type GenerateV10Body = {
  pageId?: string;
  prompt?: string;
  context?: unknown;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getUser();
    if (!auth?.user || !auth.tenant) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await req.json()) as GenerateV10Body;
    const pageId = body.pageId?.trim();
    const prompt = body.prompt?.trim();

    if (!pageId || !prompt) {
      return NextResponse.json(
        { error: "Missing pageId or prompt" },
        { status: 400 }
      );
    }

    await assertPromptAllowed(prompt);

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          tenantId: auth.tenant.id,
        },
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            tenantId: true,
          },
        },
      },
    });

    if (!page?.site) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const context = record(body.context);
    const runId = typeof context.generationRunId === "string" ? context.generationRunId : "";
    const { generationRunId: _generationRunId, ...persistentContext } = context;
    const result = await runV10WebsiteGeneration({
      pageId,
      prompt,
      pageTitle: page.title || "Untitled",
      pageSlug: page.slug || "home",
      siteId: page.site.id,
      siteName: page.site.name,
      context,
      onProgress: runId ? (update) => publishV10Progress({ runId, ...update }) : undefined,
    });

    const metadata = {
      ...(record(page.metadata) || {}),
      ...result.metadata,
      aiContext: persistentContext,
      aiDesignStatus: "pending_review",
      aiDesignScope: "current_page_only",
    };

    await persistAfterSemanticHydration(result.blueprint, () => prisma.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: pageId },
        data: {
          reactCode: null,
          renderMode: "BLUEPRINT",
          metadata: metadata as Prisma.InputJsonValue,
        },
      });

      await tx.blueprint.upsert({
        where: { pageId },
        update: {
          data: result.blueprint as unknown as Prisma.InputJsonValue,
          schemaVersion: 2,
          updatedBy: auth.user.id,
        },
        create: {
          pageId,
          siteId: page.site.id,
          tenantId: page.site.tenantId,
          data: result.blueprint as unknown as Prisma.InputJsonValue,
          schemaVersion: 2,
          updatedBy: auth.user.id,
        },
      });
    }));

    return NextResponse.json({
      success: true,
      blueprint: result.blueprint,
      spec: result.spec,
      evaluation: result.evaluation,
      repairPlan: result.repairPlan,
      trace: result.trace,
      metadata,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI v10 generation failed";
    const status = error instanceof ApiError ? error.status : 500;
    const code = error instanceof ApiError ? error.code : undefined;
    return NextResponse.json({ error: message, code }, { status });
  }
}
