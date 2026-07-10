import { Prisma, prisma } from "@buildez/db";

type JsonRecord = Record<string, unknown>;

export type BuilderAiContextForm = {
  companyName?: string;
  websiteName?: string;
  pageName?: string;
  industry?: string;
  useCase?: string;
  websiteUrl?: string;
  logoUrl?: string;
  referenceImageUrl?: string;
  referenceImageIntent?: string;
  designIntent?: string;
  audience?: string;
  offer?: string;
  researchEnabled?: boolean;
};

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isWeakPlaceholder(value: unknown) {
  const raw = cleanString(value)?.toLowerCase();
  if (!raw) return true;

  return [
    "name",
    "company name",
    "website name",
    "my first site",
    "untitled",
    "untitled page",
    "build ez site",
    "buildez site",
    "company",
    "business",
    "brand",
    "test",
    "demo",
    "from",
    "for",
    "website",
    "real estate",
  ].includes(raw);
}

function cleanContextName(value: unknown) {
  return isWeakPlaceholder(value) ? undefined : cleanString(value);
}

function humanizeContextValue(value: unknown) {
  const raw = cleanString(value);
  if (!raw) return undefined;

  const known: Record<string, string> = {
    company_website: "a credible company website",
    landing_pages: "conversion-focused landing pages",
    marketing: "marketing and lead generation",
    internal_tools: "internal tools and workflows",
    other: "a tailored website experience",
  };

  return known[raw] || raw.replace(/_/g, " ");
}

function normalizeUrl(value: unknown) {
  const raw = cleanString(value);
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) return `https://${raw}`;
  return undefined;
}

export function normalizeContextForm(value: unknown): BuilderAiContextForm {
  const source = isRecord(value) ? value : {};

  return {
    companyName: cleanContextName(source.companyName),
    websiteName: cleanContextName(source.websiteName),
    pageName: cleanString(source.pageName),
    industry: cleanString(source.industry),
    useCase: humanizeContextValue(source.useCase),
    websiteUrl: normalizeUrl(source.websiteUrl),
    logoUrl: normalizeUrl(source.logoUrl),
    referenceImageUrl: normalizeUrl(source.referenceImageUrl),
    referenceImageIntent: cleanString(source.referenceImageIntent),
    designIntent: cleanString(source.designIntent),
    audience: cleanString(source.audience),
    offer: cleanString(source.offer),
    researchEnabled: source.researchEnabled !== false,
  };
}

function mergeDefined(...items: Array<JsonRecord | null | undefined>) {
  const next: JsonRecord = {};

  items.forEach((item) => {
    if (!item) return;

    Object.entries(item).forEach(([key, value]) => {
      if (
        (key === "companyName" || key === "websiteName") &&
        isWeakPlaceholder(value)
      ) {
        return;
      }

      if (value !== undefined && value !== null && value !== "") {
        next[key] = value;
      }
    });
  });

  return next;
}

export function mergeBuilderAiContext(
  ...items: Array<JsonRecord | null | undefined>
): BuilderAiContextForm {
  return mergeDefined(
    ...items.map((item) => (isRecord(item) ? normalizeContextForm(item) : undefined))
  ) as BuilderAiContextForm;
}

export async function getOrCreateAiConversation(input: {
  tenantId: string;
  siteId: string;
  pageId: string;
  userId?: string | null;
  context?: BuilderAiContextForm | null;
}) {
  const existing = await prisma.aIConversation.findUnique({
    where: {
      tenantId_siteId_pageId: {
        tenantId: input.tenantId,
        siteId: input.siteId,
        pageId: input.pageId,
      },
    },
  });

  const previous = isRecord(existing?.context) ? normalizeContextForm(existing.context) : {};
  const incoming = normalizeContextForm(input.context);
  const context = mergeDefined(previous, incoming);

  if (existing) {
    return prisma.aIConversation.update({
      where: { id: existing.id },
      data: { context: context as Prisma.InputJsonValue },
    });
  }

  return prisma.aIConversation.create({
    data: {
      tenantId: input.tenantId,
      siteId: input.siteId,
      pageId: input.pageId,
      createdBy: input.userId || undefined,
      context: context as Prisma.InputJsonValue,
    },
  });
}

export async function loadBuilderAiContext(input: {
  tenantId: string;
  userId: string;
  pageId: string;
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
          name: true,
          slug: true,
          logoUrl: true,
          designTokens: true,
        },
      },
    },
  });

  if (!page?.site) return null;

  const onboarding = await prisma.userOnboarding.findUnique({
    where: { userId: input.userId },
  });

  const conversation = await prisma.aIConversation.findUnique({
    where: {
      tenantId_siteId_pageId: {
        tenantId: input.tenantId,
        siteId: page.site.id,
        pageId: page.id,
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 80,
      },
    },
  });

  const saved = isRecord(conversation?.context)
    ? normalizeContextForm(conversation.context)
    : {};

  const pageMetadata = isRecord(page.metadata) ? page.metadata : {};

  const metadataContext = isRecord(pageMetadata.aiContext)
    ? normalizeContextForm(pageMetadata.aiContext)
    : {};

  const baseContext = normalizeContextForm({
    companyName: onboarding?.businessName,
    websiteName: page.site.name,
    pageName: page.title,
    websiteUrl: onboarding?.website || onboarding?.domain,
    logoUrl: page.site.logoUrl,
    industry: onboarding?.profession,
    useCase: onboarding?.primaryUseCase,
  });

  const context = mergeDefined(baseContext, metadataContext, saved);

  return {
    page,
    onboarding,
    conversation,
    context,
    messages:
      conversation?.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      })) || [],
  };
}

export async function appendAiMessage(input: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdBy?: string | null;
  metadata?: JsonRecord;
}) {
  return prisma.aIMessage.create({
    data: {
      conversationId: input.conversationId,
      role: input.role,
      createdBy: input.createdBy || undefined,
      content: {
        text: input.text,
        ...(input.metadata ? { metadata: input.metadata } : {}),
      } as Prisma.InputJsonValue,
    },
  });
}

export function contextSummary(context: JsonRecord | null | undefined) {
  if (!context) return "";

  const normalized = normalizeContextForm(context);
  const companyName = cleanContextName(normalized.companyName);
  const websiteName = cleanContextName(normalized.websiteName);

  const parts = [
    companyName && `company ${companyName}`,
    !companyName && websiteName && `website ${websiteName}`,
    cleanString(normalized.industry) && `industry ${normalized.industry}`,
    cleanString(normalized.audience) && `audience ${normalized.audience}`,
    cleanString(normalized.offer) && `offer ${normalized.offer}`,
    cleanString(normalized.websiteUrl) && `website ${normalized.websiteUrl}`,
    cleanString(normalized.logoUrl) && `logo ${normalized.logoUrl}`,
    cleanString(normalized.referenceImageUrl) &&
      `reference image ${normalized.referenceImageUrl}`,
    cleanString(normalized.designIntent) && `design intent ${normalized.designIntent}`,
  ].filter(Boolean);

  return parts.join("; ");
}
