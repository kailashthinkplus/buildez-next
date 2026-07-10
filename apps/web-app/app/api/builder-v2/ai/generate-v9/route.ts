import { Prisma, prisma } from "@buildez/db";
import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import { createFallbackBlueprint } from "@/modules/builder-v2/ai-v9/blueprintFactory";
import {
  appendAiMessage,
  contextSummary,
  getOrCreateAiConversation,
  loadBuilderAiContext,
  mergeBuilderAiContext,
  normalizeContextForm,
} from "@/modules/builder-v2/ai-v9/context/brandContext";
import { runV9WebsiteGeneration } from "@/modules/builder-v2/ai-v9/orchestrator/runV9WebsiteGeneration";
import {
  logBlueprintDebug,
  logBuilderDebug,
  summarizeBlueprint,
} from "@/modules/builder-v2/debug/blueprintDebug";

type GenerateV9Body = {
  pageId?: string;
  prompt?: string;
  context?: unknown;
};

type AcceptedDesignContext = {
  sourcePageId: string;
  sourcePageTitle: string;
  acceptedAt?: string;
  context: Record<string, unknown>;
};

function getTokenRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function brandLabelFor(input: {
  context: Record<string, unknown>;
  prompt: string;
  siteName?: string | null;
}) {
  const contextName =
    typeof input.context.companyName === "string" && input.context.companyName.trim()
      ? input.context.companyName.trim()
      : "";
  if (contextName) return displayBrandName(contextName);

  const promptMatch =
    input.prompt.match(/\bfor\s+([A-Z][A-Za-z0-9 &.'-]{2,80}?)(?:\s+(?:in|at|from|home|website|real estate|construction|company)\b|$)/i) ||
    input.prompt.match(/\b([A-Z][A-Za-z0-9 &.'-]{2,80}?\s+(?:Group|Builders|Developers|Construction|Realty|Homes|Estates))\b/i);
  if (promptMatch?.[1]) return displayBrandName(promptMatch[1].trim());

  return displayBrandName(input.siteName?.trim() || "Website");
}

function displayBrandName(value: string) {
  const clean = value.trim();
  if (!clean) return "Website";

  if (clean === clean.toLowerCase()) {
    return clean.replace(/\b[a-z]/g, (char) => char.toUpperCase());
  }

  return clean;
}

function normalizedContextText(input: {
  context: Record<string, unknown>;
  prompt: string;
}) {
  return [
    input.prompt,
    input.context.industry,
    input.context.useCase,
    input.context.offer,
    input.context.audience,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function layoutCopyFor(input: {
  context: Record<string, unknown>;
  prompt: string;
}) {
  const text = normalizedContextText(input);

  if (/real estate|property|builder|apartment|villa|construction/.test(text)) {
    return {
      ctaLabel: "Book a site visit",
      primary: "Projects",
      secondary: "Locations",
      action: "Site visits",
      bodyNoun: "property opportunities",
    };
  }

  if (/clinic|doctor|medical|health|hospital|dental|care/.test(text)) {
    return {
      ctaLabel: "Book an appointment",
      primary: "Services",
      secondary: "Care team",
      action: "Appointments",
      bodyNoun: "care options",
    };
  }

  if (/restaurant|cafe|food|dining|hotel|hospitality/.test(text)) {
    return {
      ctaLabel: "Reserve a table",
      primary: "Menu",
      secondary: "Experience",
      action: "Reservations",
      bodyNoun: "dining experiences",
    };
  }

  if (/saas|software|platform|app|technology|demo|trial/.test(text)) {
    return {
      ctaLabel: "Book a demo",
      primary: "Platform",
      secondary: "Solutions",
      action: "Demo",
      bodyNoun: "software solutions",
    };
  }

  if (/shop|store|ecommerce|product|retail|buy/.test(text)) {
    return {
      ctaLabel: "Shop now",
      primary: "Products",
      secondary: "Collections",
      action: "Orders",
      bodyNoun: "products",
    };
  }

  return {
    ctaLabel:
      typeof input.context.offer === "string" && input.context.offer.trim()
        ? input.context.offer.trim()
        : "Get started",
    primary: "Services",
    secondary: "About",
    action: "Contact",
    bodyNoun: "services",
  };
}

function createAiSiteLayout(input: {
  context: Record<string, unknown>;
  prompt: string;
  siteName?: string | null;
  logoUrl?: string | null;
}) {
  const brandLabel = brandLabelFor(input);
  const copy = layoutCopyFor(input);
  const logoUrl =
    typeof input.context.logoUrl === "string" && input.context.logoUrl.trim()
      ? input.context.logoUrl.trim()
      : input.logoUrl || undefined;
  const industry =
    typeof input.context.industry === "string" && input.context.industry.trim()
      ? input.context.industry.trim()
      : "business";
  return {
    header: {
      enabled: true,
      variant: "minimal",
      brandLabel,
      logoUrl,
      ctaLabel: copy.ctaLabel,
      ctaHref: "#contact",
      navItems: [
        { label: copy.primary, href: "#showcase" },
        { label: copy.secondary, href: "#about" },
        { label: copy.action, href: "#contact" },
        { label: "Contact", href: "#contact" },
      ],
    },
    footer: {
      enabled: true,
      variant: "minimal",
      brandLabel,
      logoUrl,
      body: `${brandLabel} helps visitors understand ${industry.toLowerCase()} ${copy.bodyNoun} and take the next step with confidence.`,
      copyright: `© ${new Date().getFullYear()} ${brandLabel}.`,
      navItems: [
        { label: copy.primary, href: "#showcase" },
        { label: copy.secondary, href: "#about" },
        { label: "Contact", href: "#contact" },
      ],
    },
  };
}

async function loadAcceptedDesignContext(input: {
  siteId: string;
  tenantId: string;
  excludePageId: string;
}): Promise<AcceptedDesignContext | null> {
  const pages = await prisma.page.findMany({
    where: {
      siteId: input.siteId,
      deleted: false,
      site: {
        tenantId: input.tenantId,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 50,
    select: {
      id: true,
      title: true,
      metadata: true,
    },
  });

  for (const page of pages) {
    if (page.id === input.excludePageId) continue;

    const metadata = getTokenRecord(page.metadata);
    if (metadata?.aiDesignStatus !== "accepted") continue;

    const review = getTokenRecord(metadata.aiDesignReview);
    const aiContext = getTokenRecord(metadata.aiContext);
    const acceptedContext = getTokenRecord(review?.context);
    const context = {
      ...(aiContext || {}),
      ...(acceptedContext || {}),
    };

    const designIntent =
      cleanString(context.designIntent) ||
      cleanString(review?.designIntent) ||
      cleanString(metadata.aiDesignIntent);

    if (designIntent) {
      context.designIntent = designIntent;
    }

    return {
      sourcePageId: page.id,
      sourcePageTitle: page.title,
      acceptedAt: cleanString(metadata.aiDesignAcceptedAt),
      context,
    };
  }

  return null;
}

function createDesignReviewMetadata(input: {
  metadata: Record<string, unknown>;
  pageId: string;
  pageTitle: string;
  prompt: string;
  context: Record<string, unknown>;
  inheritedDesign?: AcceptedDesignContext | null;
}) {
  const generatedAt =
    cleanString(input.metadata.generatedAt) || new Date().toISOString();
  const inherited = input.inheritedDesign
    ? {
        sourcePageId: input.inheritedDesign.sourcePageId,
        sourcePageTitle: input.inheritedDesign.sourcePageTitle,
        acceptedAt: input.inheritedDesign.acceptedAt,
      }
    : undefined;

  return {
    ...input.metadata,
    aiContext: input.context,
    aiDesignIntent: cleanString(input.context.designIntent),
    aiDesignStatus: "pending_review",
    aiDesignScope: "current_page_only",
    aiDesignReview: {
      status: "pending_review",
      scope: "current_page_only",
      pageId: input.pageId,
      pageTitle: input.pageTitle,
      generatedAt,
      prompt: input.prompt,
      context: input.context,
      inheritedDesign: inherited,
      nextStep:
        "Accept this design before generating additional pages with the same visual direction.",
    },
  };
}

function generationTimeoutMs() {
  const value = Number(process.env.AI_GENERATION_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : 120_000;
}

function routeTimeoutMs() {
  const value = Number(process.env.AI_ROUTE_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0
    ? value
    : generationTimeoutMs() + 15_000;
}

function withGenerationTimeout<T>(promise: Promise<T>) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(
      () => reject(new Error("AI_GENERATION_TIMEOUT")),
      routeTimeoutMs()
    );
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

async function saveBlueprint(input: {
  pageId: string;
  tenantId: string;
  blueprint: unknown;
  metadata: Record<string, unknown>;
  siteLayout?: ReturnType<typeof createAiSiteLayout>;
}) {
  const page = await prisma.page.findFirst({
    where: {
      id: input.pageId,
      site: {
        tenantId: input.tenantId,
      },
    },
    include: {
      site: {
        select: {
          id: true,
          tenantId: true,
        },
      },
    },
  });

  if (!page?.site) {
    throw new Error("Page not found while saving AI v9 blueprint.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.page.update({
      where: { id: input.pageId },
      data: {
        reactCode: null,
        renderMode: "BLUEPRINT",
        metadata: {
          ...(getTokenRecord(page.metadata) || {}),
          ...input.metadata,
        } as Prisma.InputJsonValue,
      },
    });

    await tx.blueprint.upsert({
      where: { pageId: input.pageId },
      update: {
        data: input.blueprint as Prisma.InputJsonValue,
        schemaVersion: 2,
      },
      create: {
        pageId: input.pageId,
        siteId: page.site.id,
        tenantId: page.site.tenantId,
        data: input.blueprint as Prisma.InputJsonValue,
        schemaVersion: 2,
      },
    });

    if (input.siteLayout) {
      await tx.siteLayout.upsert({
        where: { siteId: page.site.id },
        create: {
          siteId: page.site.id,
          header: input.siteLayout.header as Prisma.InputJsonValue,
          footer: input.siteLayout.footer as Prisma.InputJsonValue,
        },
        update: {
          header: input.siteLayout.header as Prisma.InputJsonValue,
          footer: input.siteLayout.footer as Prisma.InputJsonValue,
        },
      });
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateV9Body;
    const auth = await getUser();
    if (!auth?.user || !auth.tenant) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const pageId = body.pageId?.trim();
    const prompt = body.prompt?.trim();

    if (!pageId || !prompt) {
      return NextResponse.json(
        { error: "Missing pageId or prompt" },
        { status: 400 }
      );
    }

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
            logoUrl: true,
            designTokens: true,
          },
        },
      },
    });

    if (!page?.site) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const loadedContext = await loadBuilderAiContext({
      tenantId: auth.tenant.id,
      userId: auth.user.id,
      pageId,
    });
    const incomingContext = normalizeContextForm(body.context);
    const acceptedDesign = await loadAcceptedDesignContext({
      siteId: page.site.id,
      tenantId: auth.tenant.id,
      excludePageId: pageId,
    });
    const mergedContext = mergeBuilderAiContext(
      getTokenRecord(loadedContext?.context) || {},
      acceptedDesign?.context || {},
      incomingContext
    );
    const conversation = await getOrCreateAiConversation({
      tenantId: auth.tenant.id,
      userId: auth.user.id,
      siteId: page.site.id,
      pageId,
      context: mergedContext,
    });

    await appendAiMessage({
      conversationId: conversation.id,
      role: "user",
      text: prompt,
      createdBy: auth.user.id,
      metadata: {
        context: mergedContext,
      },
    });

    const designTokens = getTokenRecord(page.site.designTokens);
    let result: Awaited<ReturnType<typeof runV9WebsiteGeneration>>;

    logBuilderDebug("ai-v9:request", {
      pageId,
      pageTitle: page.title,
      pageSlug: page.slug,
      siteId: page.site.id,
      siteName: page.site.name,
      prompt,
      promptLength: prompt.length,
      contextSummary: contextSummary(mergedContext),
      contextKeys: Object.keys(mergedContext),
      designTokenKeys: Object.keys(designTokens || {}),
      acceptedDesign: acceptedDesign
        ? {
            sourcePageId: acceptedDesign.sourcePageId,
            sourcePageTitle: acceptedDesign.sourcePageTitle,
            acceptedAt: acceptedDesign.acceptedAt,
          }
        : null,
    });

    try {
      result = await withGenerationTimeout(
        runV9WebsiteGeneration({
          prompt,
          pageId,
          pageTitle: page.title || "Untitled",
          pageSlug: page.slug || "home",
          siteId: page.site.id,
          siteName: page.site.name,
          designTokens,
          brandContext: mergedContext,
        })
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "AI v9 generation failed";
      if (message === "AI_GENERATION_TIMEOUT") {
        logBuilderDebug("ai-v9:generation-timeout", {
          pageId,
          timeoutMs: routeTimeoutMs(),
          generationTimeoutMs: generationTimeoutMs(),
        });
        return NextResponse.json(
          {
            error:
              "AI generation timed out before a blueprint could be returned. Please try again.",
          },
          { status: 504 }
        );
      }
      if (message.startsWith("QUALITY_GATE_FAILED")) {
        logBuilderDebug("ai-v9:quality-gate-error", {
          pageId,
          message,
        });
        return NextResponse.json({ error: message }, { status: 422 });
      }
      if (!/^(1|true|yes|on)$/i.test(process.env.AI_ALLOW_DETERMINISTIC_FALLBACK?.trim() || "false")) {
        return NextResponse.json({ error: message }, { status: 500 });
      }
      const blueprint = createFallbackBlueprint({
        pageId,
        pageTitle: page.title || "Untitled",
        siteName: page.site.name,
        designTokens,
        brandContext: mergedContext,
      });

      logBuilderDebug("ai-v9:fallback-after-error", {
        pageId,
        message,
        summary: summarizeBlueprint(blueprint),
      });

      result = {
        blueprint,
        metadata: {
          aiMode: "ai-v9-native-fallback",
          generatedAt: new Date().toISOString(),
          warning: message,
          contextSummary: contextSummary(mergedContext),
          nodeCount: Object.keys(blueprint.nodes).length,
          agents: [
            {
              agent: "NativeBlueprintFallback",
              stage: "fallback",
              ok: true,
              summary:
                "Used deterministic builder-native fallback because model generation failed.",
              warnings: [message],
            },
          ],
        },
      };
    }

    logBlueprintDebug("ai-v9:generated-before-save", result.blueprint);

    const savedMetadata = createDesignReviewMetadata({
      metadata: result.metadata,
      pageId,
      pageTitle: page.title || "Untitled",
      prompt,
      context: mergedContext,
      inheritedDesign: acceptedDesign,
    });

    await saveBlueprint({
      pageId,
      tenantId: auth.tenant.id,
      blueprint: result.blueprint,
      metadata: savedMetadata,
      siteLayout: createAiSiteLayout({
        context: {
          ...mergedContext,
          logoUrl:
            getTokenRecord(result.metadata?.brandResolution)?.logoUrl ||
            mergedContext.logoUrl,
        },
        prompt,
        siteName: page.site.name,
        logoUrl: page.site.logoUrl,
      }),
    });

    logBuilderDebug("ai-v9:saved", {
      pageId,
      metadata: savedMetadata,
      summary: summarizeBlueprint(result.blueprint),
    });

    await appendAiMessage({
      conversationId: conversation.id,
      role: "assistant",
      text:
        result.metadata?.aiMode === "ai-v9-native-orchestrated"
          ? result.metadata?.qualityStatus === "needs_improvement"
            ? `Generated a usable v9 draft with quality warnings (${String(result.metadata?.qualityScore || "unknown")}/100): ${contextSummary(mergedContext) || "site context"}.`
            : `Generated a v9 blueprint using saved context: ${contextSummary(mergedContext) || "site context"}.`
          : `Generated a fallback v9 blueprint. ${String(result.metadata?.warning || "")}`,
      createdBy: auth.user.id,
      metadata: {
        agents: result.metadata?.agents,
        quality: result.metadata?.quality,
        qualityStatus: result.metadata?.qualityStatus,
        qualityScore: result.metadata?.qualityScore,
        qualityWarnings: result.metadata?.qualityWarnings,
        designReview: savedMetadata.aiDesignReview,
      },
    });

    return NextResponse.json({
      success: true,
      blueprint: result.blueprint,
      metadata: savedMetadata,
      context: mergedContext,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI v9 generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
