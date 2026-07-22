import { Prisma, prisma } from "@buildez/db";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import { generateV11Website } from "@/modules/builder-v2/ai-v11/production/generateV11Website";
import type { V11SourceArtifact } from "@/modules/builder-v2/ai-v11/production/sourceArtifact";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getUser();
    if (!auth?.user || !auth.tenant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const body = await req.json() as { pageId?: string; prompt?: string; context?: unknown };
    const pageId = body.pageId?.trim();
    const prompt = body.prompt?.trim();
    if (!pageId || !prompt) return NextResponse.json({ error: "Missing pageId or prompt" }, { status: 400 });
    const page = await prisma.page.findFirst({
      where: { id: pageId, site: { tenantId: auth.tenant.id } },
      include: { site: { select: { id: true, tenantId: true, name: true } } },
    });
    if (!page?.site) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    const context = record(body.context);
    const generationId =
      typeof context.generationRunId === "string" && context.generationRunId.trim()
        ? context.generationRunId
        : randomUUID();
    context.generationRunId = generationId;
    const shop = await prisma.shop.findUnique({
      where: { siteId: page.site.id },
      select: {
        id: true,
        name: true,
        currency: true,
        isPublished: true,
        products: {
          where: { status: "ACTIVE" },
          orderBy: { updatedAt: "desc" },
          take: 12,
          select: {
            id: true, title: true, handle: true, description: true, productType: true, tags: true,
            images: { orderBy: { position: "asc" }, take: 3, select: { id: true, alt: true } },
            variants: { orderBy: { position: "asc" }, take: 1, select: { id: true, price: true, compareAtPrice: true, inventory: true } },
          },
        },
      },
    });
    if (shop) {
      context.shopezCatalog = {
        shopId: shop.id,
        name: shop.name,
        currency: shop.currency,
        published: shop.isPublished,
        products: shop.products.map((product) => ({
          ...product,
          variants: product.variants.map((variant) => ({ ...variant, price: Number(variant.price), compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null })),
          images: product.images.map((image) => ({ id: image.id, alt: image.alt || product.title, src: `/api/public/shopez/media/${image.id}` })),
          productUrl: `/products/${product.handle}`,
        })),
      };
    }
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        let closed = false;
        let tick = 0;
        const send = (value: unknown) => {
          if (!closed) controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
        };
        const updates = [
          ["StrategyAgent", "Shaping the page around your audience and chosen direction."],
          ["DesignAgent", "Developing the visual character, layout, and imagery."],
          ["ContentAgent", "Writing specific copy and building a natural visitor journey."],
          ["QAAgent", "Reviewing the full page and adding the finishing touches."],
        ] as const;
        send({ type: "progress", agent: updates[0][0], summary: updates[0][1] });
        const heartbeat = setInterval(() => {
          tick += 1;
          const update = updates[Math.min(updates.length - 1, Math.floor(tick / 3) % updates.length)];
          send({ type: "progress", agent: update[0], summary: update[1], elapsedSeconds: tick * 10 });
        }, 10000);
        void (async () => {
          let latestSourceArtifact: V11SourceArtifact | undefined;
          try {
            const result = await generateV11Website({
              prompt,
              pageTitle: page.title || "Untitled",
              context,
              onProgress: (agent, summary) => send({ type: "progress", agent, summary }),
              onSourceArtifact: async (artifact) => {
                latestSourceArtifact = artifact;
                await prisma.page.update({
                  where: { id: pageId },
                  data: {
                    ...(artifact.rawSource ? { reactCode: artifact.rawSource } : {}),
                    metadata: {
                      ...record(page.metadata),
                      aiGenerationVersion: "v11",
                      aiDesignStatus: artifact.status,
                      v11SourceArtifact: artifact,
                    } as Prisma.InputJsonValue,
                  },
                });
              },
              onCreativeSource: async (creativeSource) => {
                await prisma.page.update({
                  where: { id: pageId },
                  data: {
                    reactCode: creativeSource,
                    metadata: {
                      ...record(page.metadata),
                      aiGenerationVersion: "v11",
                      aiDesignStatus: "creative_code_ready",
                      codeFirst: { preserved: true, nativeConversion: "pending" },
                    } as Prisma.InputJsonValue,
                  },
                });
              },
            });
            const { generationRunId: _runId, ...persistentContext } = context;
            const metadata = {
              ...record(page.metadata),
              ...result.metadata,
              aiContext: persistentContext,
              ...(latestSourceArtifact
                ? { v11SourceArtifact: latestSourceArtifact }
                : {}),
            };
            const rootChildren = result.blueprint.nodes[result.blueprint.root]?.children || [];
            const hasNativeHeader = rootChildren.some((id) => result.blueprint.nodes[id]?.name === "primary-navigation");
            const hasNativeFooter = rootChildren.some((id) => result.blueprint.nodes[id]?.name === "footer");
            await prisma.$transaction(async (tx) => {
              await tx.page.update({ where: { id: pageId }, data: { reactCode: result.creativeSource, renderMode: "BLUEPRINT", metadata: metadata as Prisma.InputJsonValue } });
              await tx.blueprint.upsert({
                where: { pageId },
                update: { data: result.blueprint as unknown as Prisma.InputJsonValue, schemaVersion: 2, updatedBy: auth.user.id },
                create: { pageId, siteId: page.site.id, tenantId: page.site.tenantId, data: result.blueprint as unknown as Prisma.InputJsonValue, schemaVersion: 2, updatedBy: auth.user.id },
              });
              await tx.siteLayout.upsert({
                where: { siteId: page.site.id },
                create: {
                  siteId: page.site.id,
                  header: { enabled: !hasNativeHeader, brandLabel: page.site.name || "Store", generatedBy: "ai-v11", rendering: hasNativeHeader ? "native-builder-nodes" : "site-theme-fallback" },
                  footer: { enabled: !hasNativeFooter, brandLabel: page.site.name || "Store", generatedBy: "ai-v11", rendering: hasNativeFooter ? "native-builder-nodes" : "site-theme-fallback" },
                },
                update: {
                  header: { enabled: !hasNativeHeader, brandLabel: page.site.name || "Store", generatedBy: "ai-v11", rendering: hasNativeHeader ? "native-builder-nodes" : "site-theme-fallback" },
                  footer: { enabled: !hasNativeFooter, brandLabel: page.site.name || "Store", generatedBy: "ai-v11", rendering: hasNativeFooter ? "native-builder-nodes" : "site-theme-fallback" },
                },
              });
            });
            send({ type: "result", data: { success: true, blueprint: result.blueprint, metadata } });
          } catch (error) {
            send({
              type: "error",
              error: error instanceof Error ? error.message : "AI v11 generation failed",
              generationId,
              diagnostics: latestSourceArtifact?.diagnostics ?? [],
            });
          } finally {
            clearInterval(heartbeat);
            closed = true;
            controller.close();
          }
        })();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI v11 generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
