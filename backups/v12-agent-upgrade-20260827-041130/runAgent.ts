import {
  getOrCreateProject,
  importProjectFiles,
  listProjectFiles,
  normalizeGeneratedProjectFiles,
  readProjectFile,
} from "../builder-v3/project-workspace";
import { validatePreviewProjectPaths } from "../builder-v3/preview";
import { IMAGE_CLARIFICATION_MESSAGE, imageRequestNeedsClarification } from "./imageIntent";
import { buildShopezPrompt } from "./shopezPrompt";
import type { CreativeDirection } from "./creativeDirection";
import { WEBSITE_DEVELOPMENT_SKILL } from "./websiteDevelopmentSkill";
import {
  formatV12ResearchForPrompt,
  researchV12Website,
  type V12WebResearch,
} from "./webResearch";
import { higgsfieldMcpTools, higgsfieldResultUrls } from "./higgsfieldMcp";
import { persistGeneratedImage } from "@/modules/builder-v2/media/server/persistGeneratedImage";
import { Prisma, prisma } from "@buildez/db";
import { prepareAgentReferences } from "./prepareReferences";
import { normalizeThemeTokens } from "@/modules/builder-v2/theme/defaultTheme";
import {
  generateSiteMedia,
  type GeneratedSiteMedia,
  type SiteMediaRequirement,
} from "./mediaGeneration";
import {
  catalogMissingInputs,
  commerceClarificationMessage,
  detectCommerceIntent,
  ensureShopezProductImages,
  getOrCreateAgentConversation,
  persistCommerceAttachments,
  readCommerceContext,
  recordAgentMessage,
  saveCommerceContext,
  stageExtractedProducts,
  type ReferenceCommerceAnalysis,
} from "./commerce";

type AgentFile = { path: string; content: string };
type ProjectFile = { path: string; content: string };

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function outputText(payload: unknown) {
  const root = object(payload);
  if (typeof root.output_text === "string") return root.output_text.trim();
  return (Array.isArray(root.output) ? root.output : []).flatMap(item => Array.isArray(object(item).content) ? object(item).content as unknown[] : [])
    .map(item => typeof object(item).text === "string" ? String(object(item).text) : "").filter(Boolean).join("\n").trim();
}

function parseResult(text: string, requireFiles: boolean) {
  const value = object(JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()));
  const files: AgentFile[] = Array.isArray(value.files) ? value.files.map(object).map(item => ({ path: String(item.path || ""), content: String(item.content || "") })) : [];
  if ((requireFiles && !files.length) || files.some(file => !file.path || !file.content)) throw new Error("The agent returned an invalid project file set.");
  if (files.length) validatePreviewProjectPaths(files.map(file => file.path));
  return { message: typeof value.message === "string" ? value.message : "Your page is ready to review.", files };
}

async function syncGeneratedSiteMetadata(input: {
  siteId: string;
  files: readonly AgentFile[];
}) {
  const themeFile = input.files.find((file) => file.path === "src/buildez.theme.json");
  const pagesFile = input.files.find((file) => file.path === "src/buildez.pages.json");
  const operations: Prisma.PrismaPromise<unknown>[] = [];
  if (themeFile) {
    try {
      const theme = normalizeThemeTokens(JSON.parse(themeFile.content));
      operations.push(prisma.site.update({
        where: { id: input.siteId },
        data: { designTokens: theme as unknown as Prisma.InputJsonValue },
      }));
    } catch {
      throw new Error("The generated canonical theme file is invalid.");
    }
  }
  if (pagesFile) {
    let pages: unknown;
    try {
      pages = JSON.parse(pagesFile.content);
    } catch {
      throw new Error("The generated page registry is invalid.");
    }
    if (!Array.isArray(pages)) throw new Error("The generated page registry must be an array.");
    const now = new Date().toISOString();
    for (const item of pages.slice(0, 100)) {
      const page = object(item);
      const route = String(page.route || "").trim();
      if (!route.startsWith("/") || route.includes("..")) continue;
      const rawSlug = String(page.slug || "").trim().replace(/^\/+|\/+$/g, "");
      const slug = rawSlug || (route === "/" ? "home" : route.replace(/^\/+|\/+$/g, ""));
      if (!slug || slug.length > 180) continue;
      const title = String(page.title || page.name || slug).trim().slice(0, 160);
      operations.push(prisma.page.upsert({
        where: { siteId_slug: { siteId: input.siteId, slug } },
        create: {
          siteId: input.siteId,
          title,
          slug,
          renderMode: "REACT",
          metadata: {
            generatedAt: now,
            route,
            sourceFile: String(page.sourceFile || ""),
          },
        },
        update: {
          title,
          renderMode: "REACT",
          deleted: false,
          deletedAt: null,
          metadata: {
            generatedAt: now,
            route,
            sourceFile: String(page.sourceFile || ""),
          },
        },
      }));
    }
  }
  if (operations.length) await prisma.$transaction(operations);
}

function isTimeoutError(error: unknown) {
  return error instanceof Error
    && (error.name === "TimeoutError" || /timed out/i.test(error.message));
}

function formatMegabytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function currentProjectContext(files: ProjectFile[]) {
  const MAX_PROJECT_CHARS = 140_000;
  const MAX_FILE_CHARS = 60_000;
  const prioritized = [...files].sort((left, right) => {
    const priority = (path: string) => {
      if (path === "package.json") return 0;
      if (path === "index.html") return 1;
      if (path === "src/buildez.pages.json") return 2;
      if (path === "src/buildez.theme.json") return 3;
      if (path === "src/buildez.import-analysis.json") return 4;
      if (path === "src/main.tsx") return 5;
      return 6;
    };
    return priority(left.path) - priority(right.path);
  });
  const included: string[] = [];
  const omitted: string[] = [];
  let used = 0;

  for (const file of prioritized) {
    const boundedContent = file.content.length > MAX_FILE_CHARS
      ? `${file.content.slice(0, 45_000)}\n\n[...middle of ${file.path} omitted for responsiveness...]\n\n${file.content.slice(-15_000)}`
      : file.content;
    const section = `--- ${file.path}\n${boundedContent}`;
    if (used + section.length <= MAX_PROJECT_CHARS) {
      included.push(section);
      used += section.length;
    } else {
      omitted.push(file.path);
    }
  }

  if (!included.length) return "No project files exist yet.";
  if (omitted.length) {
    included.push(
      `--- PROJECT CONTEXT NOTE\n${omitted.length} additional existing files were omitted from the prompt to keep generation responsive: ${omitted.join(", ")}`,
    );
  }
  return included.join("\n\n");
}

async function requestOpenAiResponse({
  apiKey,
  body,
  signal,
  timeoutMs,
}: {
  apiKey: string;
  body: Record<string, unknown>;
  signal: AbortSignal;
  timeoutMs: number;
}) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
  });
  const raw = await response.text();
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI returned an unreadable response.");
  }
  if (!response.ok) {
    throw new Error(
      String(
        object(object(payload).error).message
        || `OpenAI request failed (${response.status}).`,
      ),
    );
  }
  return payload;
}

const visualSpecificationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    overview: { type: "string" },
    designTokens: {
      type: "array",
      items: { type: "string" },
    },
    theme: {
      type: "object",
      additionalProperties: false,
      properties: {
        background: { type: "string" },
        surface: { type: "string" },
        surfaceAlt: { type: "string" },
        textPrimary: { type: "string" },
        textSecondary: { type: "string" },
        primary: { type: "string" },
        primaryContrast: { type: "string" },
        accent: { type: "string" },
        border: { type: "string" },
        headingFont: { type: "string" },
        bodyFont: { type: "string" },
        baseSize: { type: "number" },
        buttonRadius: { type: "number" },
        cardRadius: { type: "number" },
        mediaRadius: { type: "number" },
        cardShadow: { type: "string" },
        mediaShadow: { type: "string" },
      },
      required: [
        "background", "surface", "surfaceAlt", "textPrimary",
        "textSecondary", "primary", "primaryContrast", "accent", "border",
        "headingFont", "bodyFont", "baseSize", "buttonRadius", "cardRadius",
        "mediaRadius", "cardShadow", "mediaShadow",
      ],
    },
    mediaAssets: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          role: { type: "string" },
          prompt: { type: "string" },
          aspect: { type: "string", enum: ["landscape", "portrait", "square"] },
          medium: { type: "string" },
          useRequestedMedium: { type: "boolean" },
        },
        required: ["id", "role", "prompt", "aspect", "medium", "useRequestedMedium"],
      },
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          order: { type: "number" },
          name: { type: "string" },
          layout: { type: "string" },
          content: { type: "string" },
          media: { type: "string" },
          responsive: { type: "string" },
        },
        required: [
          "order",
          "name",
          "layout",
          "content",
          "media",
          "responsive",
        ],
      },
    },
    implementationNotes: {
      type: "array",
      items: { type: "string" },
    },
    commerce: {
      type: "object",
      additionalProperties: false,
      properties: {
        isEcommerce: { type: "boolean" },
        confidence: { type: "number" },
        signals: { type: "array", items: { type: "string" } },
        currency: { type: "string" },
        products: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              vendor: { type: "string" },
              productType: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              price: { type: "number" },
              hasPrice: { type: "boolean" },
              compareAtPrice: { type: "number" },
              hasCompareAtPrice: { type: "boolean" },
              currency: { type: "string" },
              variantTitle: { type: "string" },
              sku: { type: "string" },
              inventory: { type: "number" },
              hasInventory: { type: "boolean" },
              sourceFileName: { type: "string" },
              imageSegment: { type: "number" },
              hasImageRegion: { type: "boolean" },
              imageX: { type: "number" },
              imageY: { type: "number" },
              imageWidth: { type: "number" },
              imageHeight: { type: "number" },
              confidence: { type: "number" },
            },
            required: [
              "title", "description", "vendor", "productType", "tags",
              "price", "hasPrice", "compareAtPrice", "hasCompareAtPrice",
              "currency", "variantTitle", "sku", "inventory", "hasInventory",
              "sourceFileName", "imageSegment", "hasImageRegion", "imageX",
              "imageY", "imageWidth", "imageHeight", "confidence",
            ],
          },
        },
      },
      required: ["isEcommerce", "confidence", "signals", "currency", "products"],
    },
  },
  required: [
    "overview",
    "designTokens",
    "theme",
    "mediaAssets",
    "sections",
    "implementationNotes",
    "commerce",
  ],
} as const;

async function analyzeReferences({
  apiKey,
  model,
  inputs,
  requestText,
  signal,
}: {
  apiKey: string;
  model: string;
  inputs: Array<Record<string, unknown>>;
  requestText: string;
  signal: AbortSignal;
}) {
  const payload = await requestOpenAiResponse({
    apiKey,
    signal,
    timeoutMs: 150_000,
    body: {
      model,
      reasoning: { effort: "low" },
      max_output_tokens: 12_000,
      text: {
        format: {
          type: "json_schema",
          name: "buildez_visual_specification",
          strict: true,
          schema: visualSpecificationSchema,
        },
      },
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Analyze the attached references as a senior product designer and commerce catalogue specialist. Produce a compact but complete implementation specification for a high-fidelity responsive React reconstruction. The image may be divided into overlapping vertical segments labeled in top-to-bottom order. Reconstruct their sequence without duplicating overlap. Inventory every visible section, layout relationship, repeated card pattern, legible content, typography hierarchy, palette, spacing rhythm, border/radius treatment, imagery role, desktop behavior, and inferred mobile adaptation. Return concrete canonical theme values: valid CSS colors, font family names, pixel radii/base size, and complete CSS box shadows. Define up to six mediaAssets for visually important hero, editorial, lifestyle, or background media that must be generated to recreate the design. Each prompt must describe the scene itself; exclude product-card cutouts because those are handled by ShopEZ. Photorealistic photography is the default: set useRequestedMedium to false and medium to "photography" unless the user's request explicitly asks for another image medium or the visual reference clearly requires one for faithful reconstruction. When an override is evidenced, set useRequestedMedium to true and name that medium precisely. Also determine whether this is an ecommerce experience. Extract every visible product using only evidence in the reference and the user's request below. Never invent inventory, SKU, price, ingredients, materials, medical claims, or variants. For each product image, identify the exact source filename and 1-based vertical segment, then return a normalized 0-to-1 crop rectangle around only the product photograph—not the surrounding card text. Set the corresponding has* field false when evidence is missing. Prioritize implementation facts over prose.

USER REQUEST:
${requestText || "Recreate the attached reference."}`,
          },
          ...inputs,
        ],
      }],
    },
  });
  const responseText = outputText(payload);
  if (!responseText) {
    throw new Error("AI returned an empty visual specification.");
  }
  const parsed = object(JSON.parse(responseText));
  const commerce = object(parsed.commerce) as unknown as ReferenceCommerceAnalysis;
  const theme = object(parsed.theme);
  const visualSpecification = JSON.stringify({
    overview: parsed.overview,
    designTokens: parsed.designTokens,
    theme,
    mediaAssets: parsed.mediaAssets,
    sections: parsed.sections,
    implementationNotes: parsed.implementationNotes,
  });
  return {
    visualSpecification,
    commerce,
    theme,
    mediaAssets: Array.isArray(parsed.mediaAssets)
      ? parsed.mediaAssets as SiteMediaRequirement[]
      : [],
  };
}

function themeTokensFromSpecification(theme: Record<string, unknown>) {
  return normalizeThemeTokens({
    colors: {
      background: theme.background,
      surface: theme.surface,
      surfaceAlt: theme.surfaceAlt,
      textPrimary: theme.textPrimary,
      textSecondary: theme.textSecondary,
      primary: theme.primary,
      primaryContrast: theme.primaryContrast,
      accent: theme.accent,
      border: theme.border,
    },
    typography: {
      headingFont: theme.headingFont,
      bodyFont: theme.bodyFont,
      baseSize: theme.baseSize,
    },
    radius: {
      button: theme.buttonRadius,
      card: theme.cardRadius,
      media: theme.mediaRadius,
    },
    shadow: {
      card: theme.cardShadow,
      media: theme.mediaShadow,
    },
  });
}

async function planOriginalDesign({
  apiKey,
  model,
  siteName,
  requestText,
  creativeDirection,
  signal,
}: {
  apiKey: string;
  model: string;
  siteName: string;
  requestText: string;
  creativeDirection: CreativeDirection;
  signal: AbortSignal;
}) {
  const payload = await requestOpenAiResponse({
    apiKey,
    signal,
    timeoutMs: 120_000,
    body: {
      model,
      reasoning: { effort: "medium" },
      max_output_tokens: 10_000,
      text: {
        format: {
          type: "json_schema",
          name: "buildez_original_design_specification",
          strict: true,
          schema: visualSpecificationSchema,
        },
      },
      input: [{
        role: "user",
        content: [{
          type: "input_text",
          text: `Create an original, implementation-ready visual direction for a new responsive website. Derive every decision from the user's actual request and the site's identity; do not inherit a generic starter theme or imitate a business-category template. Establish one coherent creative concept, a distinctive typographic and spatial system, an intentional palette, page hierarchy, responsive compositions, and appropriate interaction ideas. Plan sections around the visitor's decisions rather than a fixed landing-page formula. Use cards, dashboard mockups, gradients, pills, centered hero copy, and repeated equal columns only when the concept genuinely calls for them. Specify concrete geometry and art direction that a frontend engineer can execute, including deliberate asymmetry, layering, editorial rhythm, or restraint when appropriate.

Do not invent client names, awards, testimonials, project outcomes, statistics, office locations, or other factual claims that the user did not provide. You may write clearly non-factual positioning copy and describe truthful capability presentation. Define up to six mediaAssets only where bespoke imagery would materially strengthen the concept; prompts must describe the image content and composition, not a visual style cliché. Photorealistic photography is the default. If imageStyle is "No generated imagery", return no mediaAssets. If imageStyle names another medium, set useRequestedMedium to true and preserve it precisely. Otherwise set useRequestedMedium to false and medium to "photography", unless the free-text user request explicitly asks for another image medium or treatment; an explicit request overrides the default selection. Do not infer a non-photographic override merely from the industry or visual concept. Treat "AI decides" values as permission to infer from the request, not as literal design language. Return valid CSS colors, font family names, pixel values, and complete CSS shadows. The commerce object must reflect only explicit evidence in the request and its products array must remain empty because there is no product reference to extract.

SITE NAME:
${siteName}

USER REQUEST:
${requestText}

USER-SELECTED CREATIVE DIRECTION:
${JSON.stringify(creativeDirection, null, 2)}`,
        }],
      }],
    },
  });
  const responseText = outputText(payload);
  if (!responseText) throw new Error("AI returned an empty original design specification.");
  const parsed = object(JSON.parse(responseText));
  const theme = object(parsed.theme);
  return {
    visualSpecification: JSON.stringify({
      overview: parsed.overview,
      designTokens: parsed.designTokens,
      theme,
      mediaAssets: parsed.mediaAssets,
      sections: parsed.sections,
      implementationNotes: parsed.implementationNotes,
    }),
    theme,
    mediaAssets: Array.isArray(parsed.mediaAssets)
      ? parsed.mediaAssets as SiteMediaRequirement[]
      : [],
  };
}

export async function runV12Agent(input: { siteId: string; pageId?: string; tenantId: string; userId: string; prompt: string; context: "Website" | "Page" | "Selected element" | "Image"; creativeDirection: CreativeDirection; mode: "auto" | "discuss"; attachments: File[]; signal: AbortSignal; onProgress?(title: string, detail?: string, metadata?: { revision?: number; previewReady?: boolean }): void }) {
  if (imageRequestNeedsClarification(input.prompt)) {
    input.onProgress?.("Image details needed", "Waiting for subject and visual direction before generation");
    return { message: IMAGE_CLARIFICATION_MESSAGE, files: [], revision: 0, fileCount: 0, model: "clarification" };
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI is not configured.");
  const project = await getOrCreateProject(input.siteId, input.tenantId);
  const site = await prisma.site.findFirst({
    where: { id: input.siteId, tenantId: input.tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      pages: { where: { deletedAt: null }, orderBy: { createdAt: "asc" }, take: 1, select: { id: true } },
      shop: {
        select: {
          id: true,
          isPublished: true,
          _count: { select: { products: true } },
        },
      },
      designTokens: true,
    },
  });
  if (!site) throw new Error("Site not found.");
  const pageId = input.pageId || site.pages[0]?.id || input.siteId;
  const conversation = await getOrCreateAgentConversation({
    tenantId: input.tenantId,
    siteId: input.siteId,
    pageId,
    userId: input.userId,
  });
  let commerceContext = readCommerceContext(conversation.context);
  const currentPrompt = input.prompt.trim();
  const effectivePrompt = commerceContext.requestPrompt && currentPrompt
    ? `${commerceContext.requestPrompt}\n\nAdditional catalogue details:\n${currentPrompt}`
    : currentPrompt || commerceContext.requestPrompt;
  await recordAgentMessage({
    conversationId: conversation.id,
    role: "user",
    content: {
      text: input.prompt,
      creativeDirection: input.creativeDirection,
      attachments: input.attachments.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    },
    userId: input.userId,
  });
  const promptCommerce = detectCommerceIntent(effectivePrompt);
  const existingProductCount = site.shop?._count.products || 0;
  const commerceAlreadyExpected = commerceContext.intent || existingProductCount > 0;
  if ((promptCommerce.isEcommerce || commerceAlreadyExpected) && existingProductCount === 0 && !input.attachments.length && !commerceContext.attachments.length) {
    const missingInputs = ["product photos", "product names", "prices and currency"];
    commerceContext = {
      ...commerceContext,
      phase: "WAITING_FOR_CATALOG",
      intent: true,
      lastMissingInputs: missingInputs,
      requestPrompt: effectivePrompt,
    };
    await saveCommerceContext({
      conversationId: conversation.id,
      existingContext: conversation.context,
      commerce: commerceContext,
      phase: "INTERVIEW",
    });
    const message = commerceClarificationMessage(missingInputs);
    await recordAgentMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: { text: message, status: "needs_input", missingInputs },
    });
    input.onProgress?.("Product catalogue needed", "Waiting for product photos and details before building the storefront");
    return {
      message,
      files: [],
      revision: project.currentRevision,
      fileCount: 0,
      model: "commerce-intake",
      status: "needs_input" as const,
    };
  }
  const metadata = await listProjectFiles(input.siteId, input.tenantId);
  const currentFiles = await Promise.all(metadata.map(async file => ({ path: file.path, content: (await readProjectFile(input.siteId, input.tenantId, file.path)).content })));
  input.onProgress?.("Workspace loaded", `${currentFiles.length} existing files · revision ${project.currentRevision}`);

  const shouldRunWebResearch =
    currentFiles.length === 0
    && Boolean(effectivePrompt)
    && (input.context === "Website" || input.context === "Page");

  let webResearch: V12WebResearch = {
    status: "not-needed",
    subject: "",
    companyName: "",
    officialWebsite: "",
    logoUrl: "",
    industry: "",
    location: "",
    summary: "",
    verifiedFacts: [],
    offerings: [],
    sourceUrls: [],
    prohibitedClaims: [],
  };

  if (shouldRunWebResearch) {
    input.onProgress?.(
      "Researching the brand",
      "Checking official web sources before designing the website",
    );

    webResearch = await researchV12Website({
      apiKey,
      prompt: effectivePrompt,
      siteName: site.name,
      signal: input.signal,
      requestOpenAiResponse,
    });

    if (webResearch.status === "researched") {
      input.onProgress?.(
        "Brand research complete",
        webResearch.officialWebsite
          ? `Verified ${webResearch.companyName || webResearch.subject} · ${webResearch.officialWebsite}`
          : `Verified public information for ${webResearch.companyName || webResearch.subject}`,
      );
    } else if (webResearch.status === "unavailable") {
      input.onProgress?.(
        "Brand research unavailable",
        "Continuing without unverified company claims",
      );
    }
  }

  const webResearchPrompt = formatV12ResearchForPrompt(webResearch);

  const model = process.env.OPENAI_V12_MODEL || "gpt-5.6-sol";
  const visionModel = process.env.OPENAI_V12_VISION_MODEL || model;
  const previousImageFiles: File[] = [];
  for (const attachment of commerceContext.attachments.slice(-20)) {
    if (!attachment.mimeType.startsWith("image/")) continue;
    if (input.attachments.some((file) => file.name === attachment.name && file.size === attachment.size)) continue;
    try {
      const response = await fetch(attachment.url, { signal: input.signal });
      if (!response.ok) continue;
      previousImageFiles.push(new File(
        [await response.arrayBuffer()],
        attachment.name,
        { type: attachment.mimeType },
      ));
    } catch {
      // A missing historical attachment should not block a new user upload.
    }
  }
  const prepared = await prepareAgentReferences([
    ...previousImageFiles,
    ...input.attachments,
  ]);
  let visualSpecification = "";
  let directReferenceInputs: Array<Record<string, unknown>> = [];
  let referenceCommerce: ReferenceCommerceAnalysis = {
    isEcommerce: false,
    confidence: 0,
    signals: [],
    currency: "",
    products: [],
  };
  let canonicalTheme = normalizeThemeTokens(site.designTokens);
  let generatedMedia: GeneratedSiteMedia[] = [];

  if (prepared.inputs.length) {
    input.onProgress?.(
      "References optimized",
      prepared.imageSegments
        ? `${prepared.imageSegments} readable image segment${prepared.imageSegments === 1 ? "" : "s"} · ${formatMegabytes(prepared.originalBytes)} → ${formatMegabytes(prepared.preparedBytes)}`
        : `${input.attachments.length} file${input.attachments.length === 1 ? "" : "s"} prepared`,
    );
    input.onProgress?.(
      "Analyzing visual system",
      "Mapping sections, design tokens, content, and responsive behavior",
    );

    try {
      const analysis = await analyzeReferences({
        apiKey,
        model: visionModel,
        inputs: prepared.inputs,
        requestText: `${effectivePrompt}\n\nUSER-SELECTED CREATIVE DIRECTION:\n${JSON.stringify(input.creativeDirection, null, 2)}`,
        signal: input.signal,
      });
      visualSpecification = analysis.visualSpecification;
      referenceCommerce = analysis.commerce;
      const analyzedTheme = analysis.theme;
      canonicalTheme = themeTokensFromSpecification(analyzedTheme);
      await prisma.site.update({
        where: { id: site.id },
        data: { designTokens: canonicalTheme as unknown as Prisma.InputJsonValue },
      });
      if (analysis.mediaAssets.length) {
        input.onProgress?.(
          "Generating site photography",
          `${analysis.mediaAssets.length} photorealistic editorial asset${analysis.mediaAssets.length === 1 ? "" : "s"} planned`,
        );
        const mediaResult = await generateSiteMedia({
          apiKey,
          siteId: input.siteId,
          tenantId: input.tenantId,
          userId: input.userId,
          requirements: analysis.mediaAssets,
          signal: input.signal,
        });
        generatedMedia = mediaResult.media;
        input.onProgress?.(
          "Site photography ready",
          `${generatedMedia.length} durable media asset${generatedMedia.length === 1 ? "" : "s"} generated${mediaResult.warnings.length ? ` · ${mediaResult.warnings.length} skipped` : ""}`,
        );
      }
      directReferenceInputs = prepared.inputs;
      input.onProgress?.(
        "Visual specification ready",
        referenceCommerce.isEcommerce
          ? `${referenceCommerce.products.length} visible product candidate${referenceCommerce.products.length === 1 ? "" : "s"} extracted`
          : "The reference layout and visual system are mapped",
      );
    } catch (error) {
      if (input.signal.aborted || !isTimeoutError(error)) throw error;
      directReferenceInputs = prepared.inputs;
      input.onProgress?.(
        "Visual analysis exceeded its fast window",
        "Continuing with optimized reference segments instead of stopping the build",
      );
    }
  } else if (!currentFiles.length && effectivePrompt) {
    input.onProgress?.(
      "Creating an original design direction",
      "Deriving the visual system, page rhythm, and media plan from your request",
    );
    try {
      const plan = await planOriginalDesign({
        apiKey,
        model: visionModel,
        siteName: site.name,
        requestText: `${effectivePrompt}

${webResearchPrompt}`,
        creativeDirection: input.creativeDirection,
        signal: input.signal,
      });
      visualSpecification = plan.visualSpecification;
      canonicalTheme = themeTokensFromSpecification(plan.theme);
      await prisma.site.update({
        where: { id: site.id },
        data: { designTokens: canonicalTheme as unknown as Prisma.InputJsonValue },
      });
      if (plan.mediaAssets.length) {
        input.onProgress?.(
          "Generating original site media",
          `${plan.mediaAssets.length} concept-specific asset${plan.mediaAssets.length === 1 ? "" : "s"} planned`,
        );
        const mediaResult = await generateSiteMedia({
          apiKey,
          siteId: input.siteId,
          tenantId: input.tenantId,
          userId: input.userId,
          requirements: plan.mediaAssets,
          signal: input.signal,
        });
        generatedMedia = mediaResult.media;
        input.onProgress?.(
          "Original site media ready",
          `${generatedMedia.length} durable media asset${generatedMedia.length === 1 ? "" : "s"} generated${mediaResult.warnings.length ? ` · ${mediaResult.warnings.length} skipped` : ""}`,
        );
      }
      input.onProgress?.(
        "Design direction ready",
        "The request now has a purpose-built visual system before implementation",
      );
    } catch (error) {
      if (input.signal.aborted) throw error;
      input.onProgress?.(
        "Design planning unavailable",
        "Continuing with direct generation from the request",
      );
    }
  }

  const isEcommerce = promptCommerce.isEcommerce
    || commerceAlreadyExpected
    || referenceCommerce.isEcommerce
    || referenceCommerce.products.length > 0;
  let commercePrompt = isEcommerce ? buildShopezPrompt(site.slug) : "";
  if (isEcommerce) {
    input.onProgress?.(
      "Commerce intent confirmed",
      referenceCommerce.products.length
        ? `Reviewing ${referenceCommerce.products.length} extracted product candidates`
        : "Connecting the website to ShopEZ",
    );
    const persistedAttachments = input.attachments.length
      ? await persistCommerceAttachments({
        siteId: input.siteId,
        conversationId: conversation.id,
        files: input.attachments,
        existing: commerceContext.attachments,
      })
      : commerceContext.attachments;
    commerceContext = {
      ...commerceContext,
      intent: true,
      attachments: persistedAttachments,
      requestPrompt: effectivePrompt,
    };
    const missingInputs = existingProductCount === 0
      ? catalogMissingInputs(referenceCommerce.products)
      : [];
    if (existingProductCount === 0 && missingInputs.length) {
      commerceContext = {
        ...commerceContext,
        phase: "WAITING_FOR_CATALOG",
        intent: true,
        attachments: persistedAttachments,
        lastMissingInputs: missingInputs,
        requestPrompt: effectivePrompt,
      };
      await saveCommerceContext({
        conversationId: conversation.id,
        existingContext: conversation.context,
        commerce: commerceContext,
        phase: "INTERVIEW",
      });
      const message = commerceClarificationMessage(missingInputs);
      await recordAgentMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: { text: message, status: "needs_input", missingInputs },
      });
      input.onProgress?.("More product information needed", missingInputs.join(", "));
      return {
        message,
        files: [],
        revision: project.currentRevision,
        fileCount: 0,
        model,
        status: "needs_input" as const,
      };
    }
    if (existingProductCount === 0) {
      input.onProgress?.("Creating ShopEZ catalogue", "Cropping product media and staging verified catalogue fields");
      const staged = await stageExtractedProducts({
        siteId: input.siteId,
        tenantId: input.tenantId,
        siteName: site.name,
        products: referenceCommerce.products,
        cropSources: prepared.cropSources,
      });
      commerceContext = {
        ...commerceContext,
        phase: "PRODUCTS_STAGED",
        intent: true,
        attachments: persistedAttachments,
        stagedProductIds: staged.stagedProductIds,
        lastMissingInputs: [],
        requestPrompt: effectivePrompt,
      };
      await saveCommerceContext({
        conversationId: conversation.id,
        existingContext: conversation.context,
        commerce: commerceContext,
        phase: "READY",
      });
      input.onProgress?.(
        "ShopEZ catalogue ready",
        `${staged.createdCount} product${staged.createdCount === 1 ? "" : "s"} created${staged.reusedCount ? ` · ${staged.reusedCount} existing reused` : ""}`,
      );
    } else {
      input.onProgress?.("Checking product media", "Filling missing ShopEZ product photography with generated catalog images");
      const media = await ensureShopezProductImages({
        siteId: input.siteId,
        siteName: site.name,
      });
      if (media.generatedCount) {
        input.onProgress?.(
          "Product media ready",
          `${media.generatedCount} photorealistic product image${media.generatedCount === 1 ? "" : "s"} generated`,
        );
      }
    }
  }

  if (isEcommerce) {
    await saveCommerceContext({
      conversationId: conversation.id,
      existingContext: conversation.context,
      commerce: {
        ...commerceContext,
        intent: true,
        requestPrompt: effectivePrompt,
      },
      phase: "GENERATING",
    });
  }
  const currentProject = currentProjectContext(currentFiles);
  const action = input.mode === "discuss" ? "Respond thoughtfully, but if the user requests a change, implement it." : "Build or modify the website now.";
  const projectSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      message: { type: "string" },
      files: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            path: { type: "string" },
            content: { type: "string" },
          },
          required: ["path", "content"],
        },
      },
    },
    required: ["message", "files"],
  } as const;
  const generationText = `You are BuildEZ, an autonomous senior website designer and frontend engineer. ${action} Treat the supplied visual specification as the governing art direction and implement it with high fidelity: hierarchy, geometry, typography, color, spacing, imagery placement, interaction, and responsive behavior. Do not replace its decisions with a generic starter composition. Honor explicit user-selected creative-direction values; "AI decides" means infer from the request, and an explicit free-text instruction takes precedence over a pill selection. Use only facts supplied by the user or existing project; never fabricate clients, partnerships, awards, testimonials, case-study outcomes, statistics, addresses, or certifications. Build repeated content such as product grids from typed data arrays and reusable components so complex pages remain concise and consistent. For complete-site requests, create all materially required pages, shared navigation, real routes, and src/buildez.pages.json as the canonical page registry with stable id, name, slug, route, sourceFile, componentName, title, description, status, order, includeInNavigation, isHomepage, createdAt, and updatedAt for every page. Never return phantom registry entries or dead navigation links. If src/buildez.import-analysis.json exists, treat it as an architectural inventory: preserve every recognized page, consolidate recognized header/footer files into the shared SiteShell, replace recognized product lists with ShopEZ feeds, and preserve recognized blog and Instagram data sources behind reusable feed adapters. Do not silently delete an imported feed because its external credentials are unavailable; render its configured content and a localized empty/error state. For commerce websites, ShopEZ products have already been provisioned by the platform: do not generate or import a starter catalogue manifest. A ShopEZ loading or request failure must remain localized to the product feed; always keep the header, hero, editorial content, calls to action, journal, and footer visible. ${commercePrompt}

ACTIVE WEBSITE DEVELOPMENT SKILL:
${WEBSITE_DEVELOPMENT_SKILL}

BUILDER SCOPE SELECTED BY THE USER:
${input.context}

USER REQUEST:
${effectivePrompt || "Recreate the attached design."}

USER-SELECTED CREATIVE DIRECTION:
${JSON.stringify(input.creativeDirection, null, 2)}

${webResearchPrompt}

MOTION IMPLEMENTATION REQUIREMENT:
Honor the selected motion style exactly. For Immersive parallax, build a scroll-directed sequence with layered generated media, sticky framed scenes, depth transforms, section-to-section continuity, and restrained pointer interactions. For Modern motion, include polished reveal, hover, and scroll transitions. For Subtle reveals, keep movement quiet. For Mostly static, avoid decorative scroll animation. Always implement prefers-reduced-motion and never scroll-jack.

VISUAL IMPLEMENTATION SPECIFICATION:
${visualSpecification || "No separate visual specification is available; inspect the attached optimized references directly."}

CANONICAL SITE THEME:
${JSON.stringify(canonicalTheme, null, 2)}

GENERATED SITE MEDIA:
${generatedMedia.length ? JSON.stringify(generatedMedia, null, 2) : "No generated editorial media is available. Use ShopEZ product imagery, supplied media, or CSS composition; never substitute stock URLs."}

CURRENT PROJECT:
${currentProject}

Return JSON only: {"message":"specific completion summary","files":[{"path":"package.json","content":"..."},{"path":"index.html","content":"..."},{"path":"src/main.tsx","content":"..."}, ...]}. Return a complete runnable Vite React TypeScript project, never patches or markdown. Required: package.json, index.html, src/main.tsx, src/buildez.theme.json, and src/buildez.pages.json. Treat the canonical site theme as the source of truth: implement it as CSS custom properties in one shared theme stylesheet and consume those variables everywhere. Every route must render the same reusable SiteShell, Header, and Footer rather than restyling them per page. Never use Unsplash, remote stock-photo URLs, or random image services. Use only supplied media, generated media URLs, ShopEZ product images, or deliberate CSS art. Keep dependencies minimal and produce polished responsive UI. Prefer a compact component/data architecture over repetitive markup so the complete implementation fits comfortably within the response budget.`;
  const generationContent = [
    ...directReferenceInputs,
    { type: "input_text", text: generationText },
  ];
  const generationBody = (
    reasoningEffort: "low" | "medium",
    maxOutputTokens: number,
  ) => ({
    model,
    reasoning: { effort: reasoningEffort },
    max_output_tokens: maxOutputTokens,
    text: {
      format: {
        type: "json_schema",
        name: "buildez_agent_result",
        strict: true,
        schema: projectSchema,
      },
    },
    input: [{ role: "user", content: generationContent }],
    ...(higgsfieldMcpTools().length
      ? { tools: higgsfieldMcpTools(), tool_choice: "auto" }
      : {}),
  });

  input.onProgress?.(
    "Designing and coding",
    `${model} is generating the project from the prepared specification`,
  );
  let payload: unknown;
  try {
    payload = await requestOpenAiResponse({
      apiKey,
      body: generationBody("medium", 24_000),
      signal: input.signal,
      timeoutMs: 300_000,
    });
  } catch (error) {
    if (input.signal.aborted || !isTimeoutError(error)) throw error;
    input.onProgress?.(
      "Retrying with the fast generation path",
      "Reusing the completed visual specification with a tighter response budget",
    );
    payload = await requestOpenAiResponse({
      apiKey,
      body: generationBody("low", 18_000),
      signal: input.signal,
      timeoutMs: 165_000,
    });
  }
  input.onProgress?.("Model response received", "Validating the generated project before applying it");
  const parsedResult = parseResult(outputText(payload), input.mode === "auto");
  const durableHiggsfieldUrls = new Map<string, string>();
  for (const sourceUrl of higgsfieldResultUrls(payload)) {
    try {
      const asset = await persistGeneratedImage({
        sourceUrl,
        siteId: input.siteId,
        tenantId: input.tenantId,
        userId: input.userId,
        prompt: effectivePrompt || "AI-generated website asset",
        provider: "Higgsfield MCP",
      });
      durableHiggsfieldUrls.set(sourceUrl, asset.url);
    } catch {
      // Video outputs and non-image MCP resources are ignored by the image library.
    }
  }
  const resultWithDurableAssets = durableHiggsfieldUrls.size
    ? {
        ...parsedResult,
        files: parsedResult.files.map((file) => ({
          ...file,
          content: [...durableHiggsfieldUrls].reduce(
            (content, [sourceUrl, durableUrl]) => content.split(sourceUrl).join(durableUrl),
            file.content,
          ),
        })),
      }
    : parsedResult;
  const result = {
    ...resultWithDurableAssets,
    files: normalizeGeneratedProjectFiles(resultWithDurableAssets.files),
  };
  const committed = result.files.length
    ? await importProjectFiles({ siteId: input.siteId, tenantId: input.tenantId, userId: input.userId, files: result.files, expectedRevision: project.currentRevision, label: "AI V12 generation" })
    : { revision: project.currentRevision, fileCount: 0 };
  if (result.files.length) {
    await syncGeneratedSiteMetadata({
      siteId: input.siteId,
      files: result.files,
    });
  }
  input.onProgress?.(
    result.files.length ? "Project committed" : "Discussion completed",
    result.files.length ? `${committed.fileCount} files saved atomically` : "No project files were changed",
    result.files.length
      ? { revision: committed.revision, previewReady: true }
      : undefined,
  );
  if (isEcommerce) {
    commerceContext = {
      ...commerceContext,
      phase: "DONE",
      intent: true,
      requestPrompt: effectivePrompt,
    };
    await saveCommerceContext({
      conversationId: conversation.id,
      existingContext: conversation.context,
      commerce: commerceContext,
      phase: "DONE",
    });
  }
  await recordAgentMessage({
    conversationId: conversation.id,
    role: "assistant",
    content: {
      text: result.message,
      status: "completed",
      revision: committed.revision,
    },
  });
  return { ...result, ...committed, model, status: "completed" as const };
}
