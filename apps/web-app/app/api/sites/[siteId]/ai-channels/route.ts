import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { normalizeAIChannels } from "@/modules/ai-channels/config";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

async function findSite(req: NextRequest, siteId: string) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return null;
  return prisma.site.findFirst({
    where: { id: siteId, tenantId: tenant.id, deletedAt: null },
    include: {
      pages: {
        where: { deletedAt: null },
        select: { title: true, slug: true, metadata: true, status: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await findSite(req, siteId);
  if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404 });
  const settings = asRecord(site.settings);
  return NextResponse.json({
    channels: normalizeAIChannels(settings.aiChannels, site.name),
    pageCount: site.pages.length,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await findSite(req, siteId);
  if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  if (body.action !== "generate") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }
  const settings = asRecord(site.settings);
  const generated = normalizeAIChannels(settings.aiChannels, site.name);
  const pageList = site.pages.map((page) => page.title).filter(Boolean).join(", ");
  generated.websiteChatbot = {
    ...generated.websiteChatbot,
    name: `${site.name} AI Concierge`,
    welcomeMessage: `Hi! I’m the ${site.name} AI concierge. I can help you explore ${pageList || "our website"}, answer questions, or connect you with the team.`,
    knowledge: [
      generated.websiteChatbot.knowledge,
      `Website: ${site.name}`,
      pageList ? `Available pages: ${pageList}` : "",
    ].filter(Boolean).join("\n"),
  };
  generated.whatsapp = {
    ...generated.whatsapp,
    welcomeMessage: `Chat with the ${site.name} team`,
    defaultMessage: `Hi ${site.name}, I visited your website and would like some help.`,
  };
  await prisma.site.update({
    where: { id: site.id },
    data: { settings: { ...settings, aiChannels: generated } },
  });
  return NextResponse.json({ channels: generated, generated: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await findSite(req, siteId);
  if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const channels = normalizeAIChannels(body.channels, site.name);
  if (channels.whatsapp.enabled && channels.whatsapp.phoneNumber.length < 8) {
    return NextResponse.json({ error: "Add a valid WhatsApp number before deployment" }, { status: 400 });
  }
  channels.websiteChatbot.status = channels.websiteChatbot.enabled ? "deployed" : "draft";
  channels.whatsapp.status = channels.whatsapp.enabled ? "deployed" : "draft";
  const settings = asRecord(site.settings);
  await prisma.site.update({
    where: { id: site.id },
    data: { settings: { ...settings, aiChannels: channels } },
  });
  return NextResponse.json({ channels });
}
