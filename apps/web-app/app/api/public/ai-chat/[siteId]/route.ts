import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { normalizeAIChannels } from "@/modules/ai-channels/config";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const clean = (value: unknown, max = 1500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

async function publicSite(siteId: string) {
  return prisma.site.findFirst({
    where: { id: siteId, deletedAt: null },
    select: {
      id: true,
      name: true,
      settings: true,
      pages: {
        where: { deletedAt: null, status: "PUBLISHED" },
        select: { title: true, slug: true, metadata: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await publicSite(siteId);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const channels = normalizeAIChannels(asRecord(site.settings).aiChannels, site.name);
  return NextResponse.json({
    websiteChatbot: channels.websiteChatbot.enabled ? channels.websiteChatbot : null,
    whatsapp: channels.whatsapp.enabled ? channels.whatsapp : null,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await publicSite(siteId);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const channels = normalizeAIChannels(asRecord(site.settings).aiChannels, site.name);
  if (!channels.websiteChatbot.enabled) {
    return NextResponse.json({ error: "Chat is not available" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const message = clean(body.message);
  if (!message) return NextResponse.json({ error: "Enter a question" }, { status: 400 });
  const normalized = message.toLowerCase();
  const matchingPages = site.pages.filter((page) => {
    const metadata = asRecord(page.metadata);
    const haystack = [page.title, page.slug, metadata.seoDescription, metadata.description]
      .map(String).join(" ").toLowerCase();
    return normalized.split(/\W+/).filter((word: string) => word.length > 3).some((word: string) => haystack.includes(word));
  }).slice(0, 3);
  const contactEmail = clean(asRecord(site.settings).contactEmail, 320);
  const answer = matchingPages.length
    ? `I found ${matchingPages.map((page) => page.title).join(", ")} that may help. Would you like me to guide you to one of those pages?`
    : /contact|call|email|person|human|team/.test(normalized) && contactEmail
      ? `You can contact the ${site.name} team at ${contactEmail}. I can also help you find the right page first.`
      : `I can help with information published on the ${site.name} website. Try asking about ${site.pages.slice(0, 3).map((page) => page.title).join(", ") || "the business, services, or contact details"}.`;
  return NextResponse.json({
    answer,
    links: matchingPages.map((page) => ({ label: page.title, href: `/${page.slug}` })),
  });
}
