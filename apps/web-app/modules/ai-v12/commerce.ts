import { createHash, randomUUID } from "node:crypto";

import { Prisma, prisma } from "@buildez/db";
import sharp from "sharp";

import { uploadToR2 } from "@/lib/storage/uploadToR2";
import { shopHandle } from "@/lib/shopez";

import type { PreparedImageCropSource } from "./prepareReferences";

export type CommerceIntent = {
  isEcommerce: boolean;
  confidence: number;
  signals: string[];
};

export function shouldUseCommercePipeline(input: {
  forcedMode: "STATIC" | "ECOMMERCE" | null;
  existingProductCount: number;
  persistedIntent: boolean;
  architectRequired: boolean;
  referenceDetected: boolean;
}) {
  if (input.forcedMode === "STATIC") return input.existingProductCount > 0;
  return input.forcedMode === "ECOMMERCE"
    || input.existingProductCount > 0
    || input.persistedIntent
    || input.architectRequired
    || input.referenceDetected;
}

/** Commerce application routes are generated runtime views backed by ShopEZ,
 * not editable content pages in the BuildEZ Pages module. */
export function isGeneratedCommerceRoute(route: string) {
  const normalized = route.trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
  return /^\/(?:shop|products?|collections?|categories?|cart|checkout|account)(?:\/|$)/.test(normalized);
}

export type ExtractedCommerceProduct = {
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  price: number;
  hasPrice: boolean;
  compareAtPrice: number;
  hasCompareAtPrice: boolean;
  currency: string;
  variantTitle: string;
  sku: string;
  inventory: number;
  hasInventory: boolean;
  sourceFileName: string;
  imageSegment: number;
  hasImageRegion: boolean;
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
  confidence: number;
};

export type ReferenceCommerceAnalysis = {
  isEcommerce: boolean;
  confidence: number;
  signals: string[];
  currency: string;
  products: ExtractedCommerceProduct[];
};

export type PersistedAgentAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  sha256: string;
  url: string;
};

export type CommerceConversationContext = {
  phase:
    | "NONE"
    | "WAITING_FOR_CATALOG"
    | "CATALOG_EXTRACTED"
    | "PRODUCTS_STAGED"
    | "DONE";
  intent: boolean;
  attachments: PersistedAgentAttachment[];
  stagedProductIds: string[];
  lastMissingInputs: string[];
  requestPrompt: string;
  pendingClarification: {
    question: string;
    options: string[];
    originalPrompt: string;
  } | null;
};

const EMPTY_COMMERCE_CONTEXT: CommerceConversationContext = {
  phase: "NONE",
  intent: false,
  attachments: [],
  stagedProductIds: [],
  lastMissingInputs: [],
  requestPrompt: "",
  pendingClarification: null,
};

const STRONG_COMMERCE_PATTERNS = [
  // Explicit transactional ecommerce intent.
  /\be-?commerce\b/i,
  /\bonline\s+(?:shop|store)\b/i,
  /\bweb\s*shop\b/i,
  /\bshopping\s+(?:site|website|store)\b/i,
  /\bstorefront\b/i,

  // Explicit buying / checkout functionality.
  /\badd\s+to\s+(?:cart|bag)\b/i,
  /\bshopping\s+cart\b/i,
  /\bcheckout\b/i,
  /\bbuy\s+(?:online|now)\b/i,
  /\bonline\s+ordering\b/i,
  /\bpayment\s+gateway\b/i,

  // Explicit catalogue/store architecture.
  /\bproduct\s+(?:catalog|catalogue|grid|listing|detail\s+pages?)\b/i,
  /\b(?:catalog|catalogue)\s+(?:website|store|shop)\b/i,
  /\bretail\s+(?:site|website|store)\b/i,

  // A clearly retail-oriented named store is commerce.
  // "boutique" is intentionally NOT included: a boutique brand,
  // hotel, agency, perfume house, studio, etc. is not necessarily ecommerce.
  /\b(?:fashion|clothing|skincare|cosmetics?|jewel(?:ry|lery)|furniture|grocery|electronics)\s+(?:shop|store)\b/i,

  // Explicit instruction that the website must sell something.
  /\bwebsite\b.{0,80}\bsell(?:ing)?\b/i,
  /\bsell(?:ing)?\b.{0,80}\b(?:online|website|products?|goods?|merchandise)\b/i,
];

const COMMERCE_SUPPORT_PATTERNS = [
  // These are supporting signals only. None of these alone should switch
  // the entire project into ShopEZ ecommerce mode.
  /\bshop\s+page\b/i,
  /\bproducts?\b/i,
  /\bproduct\s+line\b/i,
  /\bprices?\b/i,
  /\bcart\b/i,
  /\bcollections?\b/i,
  /\binventory\b/i,
  /\bvariants?\b/i,
  /\b(?:sku|skus)\b/i,
  /\bshipping\b/i,
];

const NON_RETAIL_PRODUCT_PATTERN =
  /\b(?:saas|software|platform|mobile app|b2b)\b.{0,50}\bproduct\b/i;
const NON_RETAIL_STORE_PATTERN =
  /\b(?:app store|store locator|data store|storage|warehouse)\b/i;

export function detectCommerceIntent(prompt: string): CommerceIntent {
  const normalized = prompt.trim();
  if (!normalized) return { isEcommerce: false, confidence: 0, signals: [] };
  const strongSignals = STRONG_COMMERCE_PATTERNS
    .filter((pattern) => pattern.test(normalized))
    .map((pattern) => pattern.source);
  const supportSignals = COMMERCE_SUPPORT_PATTERNS
    .filter((pattern) => pattern.test(normalized))
    .map((pattern) => pattern.source);
  const nonRetailProduct = NON_RETAIL_PRODUCT_PATTERN.test(normalized);
  const nonRetailStore = NON_RETAIL_STORE_PATTERN.test(normalized);
  const score = strongSignals.length * 0.55
    + supportSignals.length * 0.16
    - (nonRetailProduct && !strongSignals.length ? 0.45 : 0)
    - (nonRetailStore ? 0.65 : 0);
  const confidence = Math.max(0, Math.min(0.99, score));
  /*
   * IMPORTANT:
   *
   * A product-oriented brand website is not automatically ecommerce.
   * Words such as "product", "collection", "boutique" or a requested
   * "Shop" page can describe an editorial / launch / showcase website.
   *
   * Enable ShopEZ automatically only when there is a strong transactional
   * commerce signal, or when several independent commerce-support signals
   * together make ecommerce intent unambiguous.
   */
  const supportOnlyCommerce =
    !nonRetailProduct &&
    supportSignals.length >= 4 &&
    (
      /\b(?:cart|inventory|variants?|sku|shipping|prices?)\b/i.test(normalized)
    );

  return {
    isEcommerce:
      !nonRetailStore &&
      (strongSignals.length > 0 || supportOnlyCommerce),
    confidence,
    signals: [...strongSignals, ...supportSignals],
  };
}

export function readCommerceContext(value: unknown): CommerceConversationContext {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_COMMERCE_CONTEXT };
  }
  const root = value as Record<string, unknown>;
  const commerce = root.commerce;
  if (!commerce || typeof commerce !== "object" || Array.isArray(commerce)) {
    return { ...EMPTY_COMMERCE_CONTEXT };
  }
  const context = commerce as Record<string, unknown>;
  const attachments = Array.isArray(context.attachments)
    ? context.attachments.filter((item): item is PersistedAgentAttachment => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false;
      const attachment = item as Record<string, unknown>;
      return typeof attachment.url === "string"
        && typeof attachment.sha256 === "string"
        && typeof attachment.name === "string";
    })
    : [];
  const phase = String(context.phase || "NONE") as CommerceConversationContext["phase"];

  const rawPendingClarification =
    context.pendingClarification &&
    typeof context.pendingClarification === "object" &&
    !Array.isArray(context.pendingClarification)
      ? context.pendingClarification as Record<string, unknown>
      : null;

  const pendingClarification =
    rawPendingClarification &&
    typeof rawPendingClarification.question === "string" &&
    Array.isArray(rawPendingClarification.options) &&
    typeof rawPendingClarification.originalPrompt === "string"
      ? {
          question: rawPendingClarification.question,
          options: rawPendingClarification.options.map(String),
          originalPrompt: rawPendingClarification.originalPrompt,
        }
      : null;

  return {
    phase: ["NONE", "WAITING_FOR_CATALOG", "CATALOG_EXTRACTED", "PRODUCTS_STAGED", "DONE"].includes(phase)
      ? phase
      : "NONE",
    intent: Boolean(context.intent),
    attachments,
    stagedProductIds: Array.isArray(context.stagedProductIds)
      ? context.stagedProductIds.map(String)
      : [],
    lastMissingInputs: Array.isArray(context.lastMissingInputs)
      ? context.lastMissingInputs.map(String)
      : [],
    requestPrompt: typeof context.requestPrompt === "string"
      ? context.requestPrompt
      : "",
    pendingClarification,
  };
}

export function mergeConversationContext(
  existing: unknown,
  commerce: CommerceConversationContext,
) {
  const root = existing && typeof existing === "object" && !Array.isArray(existing)
    ? existing as Record<string, unknown>
    : {};
  return { ...root, commerce } as Prisma.InputJsonValue;
}

export function catalogMissingInputs(products: readonly ExtractedCommerceProduct[]) {
  if (!products.length) return ["product photos", "product names", "prices and currency"];
  const missing = new Set<string>();
  for (const product of products) {
    if (!product.title.trim()) missing.add("product names");
    if (!product.hasPrice) missing.add("prices and currency");
  }
  return [...missing];
}

export function commerceClarificationMessage(missingInputs: readonly string[]) {
  const missing = missingInputs.length
    ? missingInputs.join(", ")
    : "product photos, product names, prices and currency";
  return `I can build the ecommerce storefront, but I need the catalogue that will power ShopEZ. Please upload ${missing}. You can attach product photos plus a CSV, Excel sheet, PDF catalogue, or paste the details here. Include sizes, colours, variants, or inventory when they apply.`;
}

const SAMPLE_PRODUCT_TAG = "sample-data";
const SAMPLE_PRODUCT_NOTE = "Sample product — placeholder data generated so you can preview the storefront. Replace with your real catalogue before publishing.";

/**
 * Fabricated catalogue data for a site that wants ShopEZ but has no real
 * products yet. Clearly labeled (description + tag) rather than passed
 * off as real inventory — stageExtractedProducts() still runs them
 * through the normal product-creation path (real generated photography,
 * real Shop/ShopProduct/variant rows), so the storefront previews
 * genuinely, but nothing here should ever be mistaken for real stock.
 */
export function buildSamplePlaceholderProducts(input: {
  siteName: string;
  currency: string;
}): ExtractedCommerceProduct[] {
  const names = ["Signature Item", "Everyday Essential", "Studio Favorite", "Limited Edition"];
  return names.map((name, index) => ({
    title: `${input.siteName} ${name}`,
    description: `${SAMPLE_PRODUCT_NOTE} A placeholder listing standing in for a real ${name.toLowerCase()} from ${input.siteName}.`,
    vendor: input.siteName,
    productType: "General",
    tags: [SAMPLE_PRODUCT_TAG],
    price: 19.99 + index * 10,
    hasPrice: true,
    compareAtPrice: 0,
    hasCompareAtPrice: false,
    currency: input.currency,
    variantTitle: "Default",
    sku: "",
    inventory: 25,
    hasInventory: true,
    sourceFileName: "",
    imageSegment: 0,
    hasImageRegion: false,
    imageX: 0,
    imageY: 0,
    imageWidth: 0,
    imageHeight: 0,
    confidence: 1,
  }));
}

export function commerceProductIdentity(title: string) {
  return shopHandle(title) || `product-${createHash("sha256").update(title).digest("hex").slice(0, 12)}`;
}

export async function getOrCreateAgentConversation(input: {
  tenantId: string;
  siteId: string;
  pageId: string;
  userId: string;
}) {
  const where = {
    tenantId_siteId_pageId: {
      tenantId: input.tenantId,
      siteId: input.siteId,
      pageId: input.pageId,
    },
  } as const;

  const existing = await prisma.aIConversation.findUnique({
    where,
  });

  if (existing) return existing;

  try {
    return await prisma.aIConversation.create({
      data: {
        tenantId: input.tenantId,
        siteId: input.siteId,
        pageId: input.pageId,
        createdBy: input.userId,
        context: { commerce: EMPTY_COMMERCE_CONTEXT },
      },
    });
  } catch (error) {
    const prismaCode =
      error &&
      typeof error === "object" &&
      "code" in error
        ? String((error as { code?: unknown }).code || "")
        : "";

    if (prismaCode === "P2002") {
      return prisma.aIConversation.findUniqueOrThrow({
        where,
      });
    }

    throw error;
  }
}

export async function resetAgentConversation(input: {
  tenantId: string;
  siteId: string;
}) {
  const conversations = await prisma.aIConversation.findMany({
    where: { tenantId: input.tenantId, siteId: input.siteId },
    select: { id: true },
  });
  if (!conversations.length) return { reset: true, conversations: 0 };
  const conversationIds = conversations.map((conversation) => conversation.id);
  await prisma.$transaction([
    prisma.aIMessage.deleteMany({ where: { conversationId: { in: conversationIds } } }),
    prisma.aIConversation.updateMany({
      where: { id: { in: conversationIds } },
      data: {
        phase: "INTERVIEW",
        context: { commerce: EMPTY_COMMERCE_CONTEXT },
      },
    }),
  ]);
  return { reset: true, conversations: conversationIds.length };
}

export async function recordAgentMessage(input: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: Record<string, unknown>;
  userId?: string;
}) {
  await prisma.aIMessage.create({
    data: {
      conversationId: input.conversationId,
      role: input.role,
      content: input.content as Prisma.InputJsonValue,
      createdBy: input.userId,
    },
  });
}

export async function saveCommerceContext(input: {
  conversationId: string;
  existingContext: unknown;
  commerce: CommerceConversationContext;
  phase?: "INTERVIEW" | "READY" | "GENERATING" | "DONE";
}) {
  return prisma.aIConversation.update({
    where: { id: input.conversationId },
    data: {
      context: mergeConversationContext(input.existingContext, input.commerce),
      ...(input.phase ? { phase: input.phase } : {}),
    },
  });
}

function safeFileSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "attachment";
}

export async function persistCommerceAttachments(input: {
  siteId: string;
  conversationId: string;
  files: readonly File[];
  existing: readonly PersistedAgentAttachment[];
}) {
  const persisted = [...input.existing];
  for (const file of input.files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    if (persisted.some((attachment) => attachment.sha256 === sha256)) continue;
    const id = randomUUID();
    const url = await uploadToR2({
      buffer,
      key: `sites/${input.siteId}/ai-commerce/${input.conversationId}/${sha256.slice(0, 16)}-${safeFileSegment(file.name)}`,
      contentType: file.type || "application/octet-stream",
    });
    persisted.push({
      id,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      sha256,
      url,
    });
  }
  return persisted;
}

function normalizedCrop(product: ExtractedCommerceProduct, source: PreparedImageCropSource) {
  const left = Math.max(0, Math.min(source.width - 1, Math.round(product.imageX * source.width)));
  const top = Math.max(0, Math.min(source.height - 1, Math.round(product.imageY * source.height)));
  const width = Math.max(1, Math.min(source.width - left, Math.round(product.imageWidth * source.width)));
  const height = Math.max(1, Math.min(source.height - top, Math.round(product.imageHeight * source.height)));
  return { left, top, width, height };
}

async function persistProductCrop(input: {
  siteId: string;
  product: ExtractedCommerceProduct;
  cropSources: readonly PreparedImageCropSource[];
}) {
  if (!input.product.hasImageRegion) return undefined;
  const source = input.cropSources.find((candidate) =>
    candidate.sourceFileName === input.product.sourceFileName
    && candidate.segmentIndex === input.product.imageSegment
  );
  if (!source) return undefined;
  const crop = await sharp(source.buffer)
    .extract(normalizedCrop(input.product, source))
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, effort: 5 })
    .toBuffer();
  const fingerprint = createHash("sha256")
    .update(input.product.title)
    .update(source.buffer)
    .update(JSON.stringify(normalizedCrop(input.product, source)))
    .digest("hex");
  return uploadToR2({
    buffer: crop,
    key: `sites/${input.siteId}/shopez/ai-products/${fingerprint}.webp`,
    contentType: "image/webp",
  });
}

async function generatePhotorealisticProductImage(input: {
  siteId: string;
  siteName: string;
  product: ExtractedCommerceProduct;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI is not configured for product image generation.");
  const model = process.env.OPENAI_V12_IMAGE_MODEL
    || process.env.OPENAI_V10_IMAGE_MODEL
    || "gpt-image-2";
  const subject = [
    input.product.title,
    input.product.productType,
    input.product.vendor,
    input.product.description,
  ].map((value) => value.trim()).filter(Boolean).join(". ");
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: `Photorealistic premium ecommerce product photography of: ${subject}. Single product, accurate materials and proportions, softly directional natural studio light, clean brand-neutral surface, subtle realistic shadow, centered catalog composition, high detail. No people, no hands, no text, no labels that were not specified, no logo, no watermark, no collage.`,
      size: "1024x1024",
      n: 1,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(Number(process.env.OPENAI_V12_IMAGE_TIMEOUT_MS || 180_000)),
  });
  const raw = await response.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("Image generation returned an unreadable response.");
  }
  if (!response.ok) {
    const error = payload.error && typeof payload.error === "object"
      ? (payload.error as Record<string, unknown>).message
      : undefined;
    throw new Error(String(error || `Product image generation failed (${response.status}).`));
  }
  const first = Array.isArray(payload.data) ? payload.data[0] as Record<string, unknown> : {};
  let buffer: Buffer;
  if (typeof first.b64_json === "string") {
    buffer = Buffer.from(first.b64_json, "base64");
  } else if (typeof first.url === "string") {
    const generated = await fetch(first.url, { cache: "no-store" });
    if (!generated.ok) throw new Error("Generated product image could not be downloaded.");
    buffer = Buffer.from(await generated.arrayBuffer());
  } else {
    throw new Error("Image generation returned no product image.");
  }
  const fingerprint = createHash("sha256")
    .update(input.siteName)
    .update(subject)
    .update(buffer)
    .digest("hex");
  return uploadToR2({
    buffer,
    key: `sites/${input.siteId}/shopez/generated-products/${fingerprint}.png`,
    contentType: "image/png",
  });
}

export async function stageExtractedProducts(input: {
  siteId: string;
  tenantId: string;
  siteName: string;
  products: readonly ExtractedCommerceProduct[];
  cropSources: readonly PreparedImageCropSource[];
}) {
  const preferredCurrency = input.products.find((product) => product.currency.trim())?.currency.toUpperCase() || "USD";
  let shop = await prisma.shop.findUnique({
    where: { siteId: input.siteId },
    include: { _count: { select: { products: true } } },
  });
  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        siteId: input.siteId,
        tenantId: input.tenantId,
        name: input.siteName,
        currency: preferredCurrency,
        isPublished: false,
      },
      include: { _count: { select: { products: true } } },
    });
  } else if (!shop.isPublished && shop._count.products === 0 && shop.currency !== preferredCurrency) {
    shop = await prisma.shop.update({
      where: { id: shop.id },
      data: { currency: preferredCurrency },
      include: { _count: { select: { products: true } } },
    });
  }

  const staged: Array<{ id: string; created: boolean }> = [];
  for (const candidate of input.products) {
    const title = candidate.title.trim();
    if (!title || !candidate.hasPrice) continue;
    const handle = commerceProductIdentity(title);
    const existing = await prisma.shopProduct.findUnique({
      where: { shopId_handle: { shopId: shop.id, handle } },
      select: { id: true, images: { take: 1, select: { id: true } } },
    });
    if (existing) {
      if (!existing.images.length) {
        const croppedImageUrl = await persistProductCrop({
          siteId: input.siteId,
          product: candidate,
          cropSources: input.cropSources,
        });
        const imageUrl = croppedImageUrl || await generatePhotorealisticProductImage({
          siteId: input.siteId,
          siteName: input.siteName,
          product: candidate,
        });
        await prisma.shopProductImage.create({
          data: { productId: existing.id, url: imageUrl, alt: title, position: 0 },
        });
      }
      staged.push({ id: existing.id, created: false });
      continue;
    }
    const croppedImageUrl = await persistProductCrop({
      siteId: input.siteId,
      product: candidate,
      cropSources: input.cropSources,
    });
    const imageUrl = croppedImageUrl || await generatePhotorealisticProductImage({
      siteId: input.siteId,
      siteName: input.siteName,
      product: candidate,
    });
    const product = await prisma.shopProduct.create({
      data: {
        shopId: shop.id,
        title,
        handle,
        description: candidate.description.trim(),
        vendor: candidate.vendor.trim() || null,
        productType: candidate.productType.trim() || null,
        status: "ACTIVE",
        tags: candidate.tags.map((tag) => tag.trim()).filter(Boolean),
        trackQuantity: candidate.hasInventory,
        continueSelling: false,
        seoTitle: `${title} | ${input.siteName}`,
        seoDescription: candidate.description.trim().slice(0, 300) || null,
        images: imageUrl
          ? { create: [{ url: imageUrl, alt: title, position: 0 }] }
          : undefined,
        variants: {
          create: [{
            title: candidate.variantTitle.trim() || "Default",
            sku: candidate.sku.trim() || null,
            price: candidate.price,
            compareAtPrice: candidate.hasCompareAtPrice ? candidate.compareAtPrice : null,
            inventory: candidate.hasInventory ? Math.max(0, Math.floor(candidate.inventory)) : 0,
            position: 0,
          }],
        },
      },
      select: { id: true },
    });
    staged.push({ id: product.id, created: true });
  }

  // Products with real photos now exist — turn ShopEZ on so the storefront
  // API (which only serves published shops) can actually surface them.
  if (!shop.isPublished && staged.length > 0) {
    shop = await prisma.shop.update({
      where: { id: shop.id },
      data: { isPublished: true },
      include: { _count: { select: { products: true } } },
    });
  }

  return {
    shopId: shop.id,
    shopPublished: shop.isPublished,
    stagedProductIds: staged.map((product) => product.id),
    createdCount: staged.filter((product) => product.created).length,
    reusedCount: staged.filter((product) => !product.created).length,
  };
}

export async function ensureShopezProductImages(input: {
  siteId: string;
  siteName: string;
  limit?: number;
}) {
  const shop = await prisma.shop.findUnique({
    where: { siteId: input.siteId },
    select: {
      id: true,
      currency: true,
      products: {
        where: { status: "ACTIVE", images: { none: {} } },
        orderBy: { createdAt: "asc" },
        take: Math.min(Math.max(input.limit ?? 12, 1), 24),
        select: {
          id: true,
          title: true,
          description: true,
          vendor: true,
          productType: true,
          tags: true,
          variants: {
            orderBy: { position: "asc" },
            take: 1,
            select: {
              title: true,
              sku: true,
              price: true,
              compareAtPrice: true,
              inventory: true,
            },
          },
        },
      },
    },
  });
  if (!shop?.products.length) return { generatedCount: 0 };
  let generatedCount = 0;
  for (const product of shop.products) {
    const variant = product.variants[0];
    const candidate: ExtractedCommerceProduct = {
      title: product.title,
      description: product.description,
      vendor: product.vendor || "",
      productType: product.productType || "",
      tags: product.tags,
      price: Number(variant?.price || 0),
      hasPrice: Boolean(variant),
      compareAtPrice: Number(variant?.compareAtPrice || 0),
      hasCompareAtPrice: variant?.compareAtPrice != null,
      currency: shop.currency,
      variantTitle: variant?.title || "Default",
      sku: variant?.sku || "",
      inventory: variant?.inventory || 0,
      hasInventory: Boolean(variant),
      sourceFileName: "",
      imageSegment: 0,
      hasImageRegion: false,
      imageX: 0,
      imageY: 0,
      imageWidth: 0,
      imageHeight: 0,
      confidence: 1,
    };
    const url = await generatePhotorealisticProductImage({
      siteId: input.siteId,
      siteName: input.siteName,
      product: candidate,
    });
    await prisma.shopProductImage.create({
      data: { productId: product.id, url, alt: product.title, position: 0 },
    });
    generatedCount += 1;
  }
  return { generatedCount };
}
