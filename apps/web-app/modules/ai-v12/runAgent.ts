import {
  createProjectCheckpoint,
  getOrCreateProject,
  importProjectFiles,
  listProjectFiles,
  normalizeGeneratedProjectFiles,
  readProjectFile,
  writeProjectFile,
} from "../builder-v3/project-workspace";
import {
  patchElementSource,
  patchElementSources,
  type ElementPatch,
} from "../builder-v3/visual-editor";
import { validatePreviewProjectPaths } from "../builder-v3/preview";
import { IMAGE_CLARIFICATION_MESSAGE, imageRequestNeedsClarification } from "./imageIntent";
import { buildShopezPrompt } from "./shopezPrompt";
import type { CreativeDirection } from "./creativeDirection";
import { WEBSITE_DEVELOPMENT_SKILL } from "./websiteDevelopmentSkill";
import {
  capabilityPlanPrompt,
  requiresImmersiveToolchain,
  routeV12Capabilities,
} from "./capabilityRouter";
import {
  planV12Experience,
} from "./experiencePlanner";
import {
  type V12AssetToolPlan,
} from "./assetToolPlanner";
import {
  createV12DesignArchitectPlan,
  designArchitectPrompt,
  type V12DesignArchitectResult,
} from "./designArchitect";
import {
  formatV12ResearchForPrompt,
  researchV12Website,
  type V12WebResearch,
} from "./webResearch";
import {
  resolveV12ExecutionPolicy,
  type V12PlanFeatureInput,
} from "./executionPolicy";
import { creativeMcpResultUrls, creativeMcpTools } from "./creativeMcp";
import { persistCreativeAsset } from "./persistCreativeAsset";
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

export type V12SelectedElementTarget = {
  elementId: string;
  kind: string;
  tagName: string;
  sourceFile: string;
  sourceAnchor: string;
  parentElementId: string | null;
  textContent: string;
  innerHTML: string;
  className: string;
  attributes: Record<string, string>;
  computedStyleSummary: Record<string, string>;
  editableCapabilities: string[];
  projectRevision: number;
};

const selectedElementPatchSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    patches: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          operation: {
            type: "string",
            enum: ["text", "html", "attribute", "style"],
          },
          value: {
            type: "string",
          },
          name: {
            type: ["string", "null"],
          },
        },
        required: ["operation", "value", "name"],
      },
    },
  },
  required: ["patches"],
} as const;

const SELECTED_ELEMENT_ATTRIBUTES = new Set([
  "className",
  "src",
  "alt",
  "href",
  "id",
]);

const SELECTED_ELEMENT_STYLES = new Set([
  "display",
  "position",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "gap",
  "flexDirection",
  "alignItems",
  "justifyContent",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "color",
  "backgroundColor",
  "borderColor",
  "borderWidth",
  "borderStyle",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",
  "objectFit",
  "borderRadius",
  "boxShadow",
  "opacity",
  "overflow",
  "zIndex",
]);

function parseSelectedElementPatch(
  value: unknown,
): ElementPatch {
  const patch = object(value);

  const operation =
    typeof patch.operation === "string"
      ? patch.operation
      : "";

  const name =
    typeof patch.name === "string"
      ? patch.name
      : "";

  const valueText =
    typeof patch.value === "string"
      ? patch.value
      : "";

  if (operation === "text") {
    return {
      operation: "text",
      value: valueText,
    };
  }

  if (operation === "html") {
    return {
      operation: "html",
      value: valueText,
    };
  }

  if (
    operation === "attribute" &&
    SELECTED_ELEMENT_ATTRIBUTES.has(name)
  ) {
    return {
      operation: "attribute",
      name: name as Extract<
        ElementPatch,
        { operation: "attribute" }
      >["name"],
      value: valueText,
    };
  }

  if (
    operation === "style" &&
    SELECTED_ELEMENT_STYLES.has(name)
  ) {
    return {
      operation: "style",
      name: name as Extract<
        ElementPatch,
        { operation: "style" }
      >["name"],
      value: valueText,
    };
  }

  throw new Error(
    "AI returned an unsupported selected-element mutation."
  );
}

function parseSelectedElementPatches(
  value: unknown,
): ElementPatch[] {
  const root = object(value);

  if (!Array.isArray(root.patches)) {
    throw new Error(
      "AI returned an invalid selected-element patch set."
    );
  }

  if (
    root.patches.length < 1 ||
    root.patches.length > 20
  ) {
    throw new Error(
      "AI returned an invalid number of selected-element mutations."
    );
  }

  const patches =
    root.patches.map(parseSelectedElementPatch);

  /*
   * The atomic source patcher permits many independent style and
   * attribute mutations, but child content must remain unambiguous.
   */
  const textCount =
    patches.filter(
      patch => patch.operation === "text"
    ).length;

  const htmlCount =
    patches.filter(
      patch => patch.operation === "html"
    ).length;

  if (textCount > 1 || htmlCount > 1) {
    throw new Error(
      "AI returned conflicting selected-element content mutations."
    );
  }

  if (textCount && htmlCount) {
    throw new Error(
      "AI cannot apply text and HTML replacement together."
    );
  }

  /*
   * Last mutation wins for duplicate style/attribute properties.
   * This also prevents unnecessary duplicate AST mutations.
   */
  const deduplicated: ElementPatch[] = [];
  const keyedIndexes = new Map<string, number>();

  for (const patch of patches) {
    const key =
      patch.operation === "style" ||
      patch.operation === "attribute"
        ? `${patch.operation}:${patch.name}`
        : patch.operation;

    const existingIndex =
      keyedIndexes.get(key);

    if (existingIndex !== undefined) {
      deduplicated[existingIndex] = patch;
      continue;
    }

    keyedIndexes.set(
      key,
      deduplicated.length,
    );

    deduplicated.push(patch);
  }

  return deduplicated;
}

async function generateSelectedElementPatches(input: {
  apiKey: string;
  model: string;
  prompt: string;
  target: V12SelectedElementTarget;
  signal: AbortSignal;
}) {
  const payload = await requestOpenAiResponse({
    apiKey: input.apiKey,
    signal: input.signal,
    timeoutMs: 120_000,
    body: {
      model: input.model,
      reasoning: {
        effort: "medium",
      },
      max_output_tokens: 2_000,
      text: {
        format: {
          type: "json_schema",
          name: "buildez_selected_element_patch",
          strict: true,
          schema: selectedElementPatchSchema,
        },
      },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `You are editing exactly ONE already-existing website element.

You are NOT redesigning the page.
You are NOT regenerating the website.
You are NOT allowed to choose a file.
You are NOT allowed to choose another element.
You are only deciding the smallest valid mutation to apply to the selected element.

Return a structured patches array containing the smallest complete set of mutations required by the user's request.

If the request changes multiple properties of this SAME selected element, return multiple patches.

Examples:
- "Make this heading 64px" -> one fontSize style patch.
- "Make this heading 64px, bold and red" -> fontSize, fontWeight and color style patches.
- "Change the text and make it larger" -> one text patch plus one fontSize style patch.

Every patch MUST apply only to the selected element.
Do not add unrelated mutations.
Do not return duplicate properties.
Return at least one patch and at most 20 patches.

Allowed operations:

text
- Replace the selected element's plain text.

html
- Replace only the selected element's child markup.
- Use only when the user's request genuinely requires rich inline markup.

attribute
- Change one safe JSX attribute per attribute patch.
- Allowed names: className, src, alt, href, id.

style
- Change one supported inline style property per style patch.

Prefer "text" for copy changes.
Prefer "attribute" for href/src/alt changes.
Prefer "style" for visual properties. Return multiple style patches when the request explicitly changes multiple properties.

Do not use className as a workaround for arbitrary redesign.
Do not rewrite surrounding components.
Do not create page layouts.
Do not output JSX files.
Do not output explanations.

SELECTED ELEMENT:
${JSON.stringify({
  elementId: input.target.elementId,
  kind: input.target.kind,
  tagName: input.target.tagName,
  textContent: input.target.textContent,
  innerHTML: input.target.innerHTML,
  className: input.target.className,
  attributes: input.target.attributes,
  computedStyleSummary:
    input.target.computedStyleSummary,
  editableCapabilities:
    input.target.editableCapabilities,
}, null, 2)}

USER REQUEST:
${input.prompt}`,
            },
          ],
        },
      ],
    },
  });

  const responseText = outputText(payload);

  if (!responseText) {
    throw new Error(
      "AI returned an empty selected-element patch."
    );
  }

  return parseSelectedElementPatches(
    JSON.parse(responseText)
  );
}

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

export async function runV12Agent(input: { siteId: string; pageId?: string; tenantId: string; userId: string;
 planCode?: string | null; planFeatures?: readonly V12PlanFeatureInput[] | null; prompt: string; context: "Website" | "Page" | "Selected element" | "Image"; selectedElement?: V12SelectedElementTarget; creativeDirection: CreativeDirection; mode: "auto" | "discuss"; attachments: File[]; signal: AbortSignal; onProgress?(title: string, detail?: string, metadata?: { revision?: number; previewReady?: boolean }): void }) {
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
      pages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          renderMode: true,
        },
      },
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
  const selectedPage =
    (input.pageId
      ? site.pages.find((candidate) => candidate.id === input.pageId)
      : undefined) ??
    site.pages[0];

  if (input.pageId && !selectedPage) {
    throw new Error("Selected page does not belong to this site.");
  }

  const pageId = selectedPage?.id || input.siteId;

  // ==========================================================
  // SELECTED ELEMENT — HARD ISOLATION BOUNDARY
  // ==========================================================
  //
  // A selected-element request must NEVER enter the project
  // generation pipeline.
  //
  // The browser identifies the target.
  // The server verifies the target.
  // The model chooses only a structured mutation.
  // The server applies that mutation to exactly one source file.
  // ==========================================================

  console.error(
    "[V12 TRACE] runV12Agent scope",
    {
      context: input.context,
      hasSelectedElement: Boolean(input.selectedElement),
      selectedElement: input.selectedElement
        ? {
            elementId: input.selectedElement.elementId,
            tagName: input.selectedElement.tagName,
            sourceFile: input.selectedElement.sourceFile,
            projectRevision:
              input.selectedElement.projectRevision,
          }
        : null,
      currentRevision: project.currentRevision,
    },
  );

  if (input.context === "Selected element") {
    console.error(
      "[V12 TRACE] ENTERED SELECTED ELEMENT ISOLATION"
    );

    const target = input.selectedElement;

    if (!target) {
      throw new Error(
        "Selected element context requires an active canvas selection."
      );
    }

    if (
      target.sourceFile.startsWith("/") ||
      target.sourceFile.includes("..") ||
      target.sourceFile.includes("\\") ||
      !target.sourceFile.startsWith("src/")
    ) {
      throw new Error(
        "Selected element source file is outside the editable project."
      );
    }

    /*
     * Revision is authoritative.
     *
     * If the project changed after the browser selected the element,
     * reject the edit rather than applying an old source anchor to
     * potentially different code.
     */
    if (
      target.projectRevision !== project.currentRevision
    ) {
      throw new Error(
        "The selected element is stale because the project changed. Please select it again."
      );
    }

    input.onProgress?.(
      `Understanding ${target.tagName}`,
      "Preparing a scoped edit for the selected element"
    );

    const current =
      await readProjectFile(
        input.siteId,
        input.tenantId,
        target.sourceFile,
      );

    input.onProgress?.(
      `Updating ${target.tagName}`,
      "Generating the smallest safe element mutation"
    );

    /*
     * Resolve execution policy here as well so selected-element
     * editing follows Super Admin plan configuration rather than
     * hardcoded model IDs.
     */
    const selectedElementExecutionPolicy =
      resolveV12ExecutionPolicy(
        input.planCode,
        input.planFeatures,
      );

    console.error(
      "[V12 TRACE] requesting selected-element patch",
      {
        tagName: target.tagName,
        sourceFile: target.sourceFile,
        capabilities: target.editableCapabilities,
        prompt: input.prompt,
      },
    );

    const patches =
      await generateSelectedElementPatches({
        apiKey,
        model:
          selectedElementExecutionPolicy.models.implementation,
        prompt: input.prompt.trim(),
        target,
        signal: input.signal,
      });

    console.error(
      "[V12 TRACE] selected-element patches received",
      patches,
    );

    /*
     * editableCapabilities is supplied by the visual editor.
     * It is an additional restriction, never an expansion of
     * what the server-side ElementPatch contract permits.
     */
    const capabilities =
      new Set(target.editableCapabilities);

    const patchAllowedBySelection = (
      patch: ElementPatch,
    ) => {
      switch (patch.operation) {
        case "text":
          return capabilities.has("text");

        case "html":
          return capabilities.has("richText");

        case "style":
          /*
           * Style is a generic visual-editor operation.
           * The server-side style allowlist remains authoritative.
           */
          return true;

        case "attribute":
          if (
            patch.name === "src" ||
            patch.name === "alt"
          ) {
            return capabilities.has("image");
          }

          if (patch.name === "href") {
            return capabilities.has("link");
          }

          return (
            patch.name === "className" ||
            patch.name === "id"
          );

        default:
          return false;
      }
    };

    for (const patch of patches) {
      if (!patchAllowedBySelection(patch)) {
        throw new Error(
          `The selected ${target.tagName} does not support the requested ${patch.operation} edit.`
        );
      }
    }

    console.log(
      "V12 SELECTED ELEMENT PATCHES:",
      JSON.stringify(
        {
          elementId: target.elementId,
          tagName: target.tagName,
          sourceFile: target.sourceFile,
          sourceAnchor: target.sourceAnchor,
          editableCapabilities:
            target.editableCapabilities,
          request: input.prompt,
          patches,
        },
        null,
        2,
      ),
    );

    const patchedContent =
      patchElementSources(
        current.content,
        current.path,
        target.sourceAnchor,
        patches,
      );

    /*
     * HARD WRITE BOUNDARY:
     *
     * Exactly target.sourceFile is written.
     * No generated file set is accepted.
     * No importProjectFiles() call occurs.
     * No page/site regeneration occurs.
     */
    const writeResult =
      await writeProjectFile({
        siteId: input.siteId,
        tenantId: input.tenantId,
        userId: input.userId,
        path: current.path,
        content: patchedContent,
        expectedRevision:
          target.projectRevision,
      });

    input.onProgress?.(
      `Finalizing ${target.tagName}`,
      "Selected element updated",
      {
        revision: writeResult.revision,
        previewReady: true,
      },
    );

    return {
      message:
        `Updated the selected ${target.tagName} without changing the surrounding page.`,
      files: [
        {
          path: current.path,
          content: patchedContent,
        },
      ],
      revision: writeResult.revision,
      fileCount: writeResult.changed ? 1 : 0,
      model:
        selectedElementExecutionPolicy.models.implementation,
    };
  }

  const conversation = await getOrCreateAgentConversation({
    tenantId: input.tenantId,
    siteId: input.siteId,
    pageId,
    userId: input.userId,
  });
  let commerceContext = readCommerceContext(conversation.context);
  const currentPrompt = input.prompt.trim();

  // ----------------------------------------------------------
  // AUTHORITATIVE GENERATION SCOPE
  //
  // "Website" means a real multi-page site.
  // "Page" means one page only.
  //
  // This is deliberately deterministic so the final generator cannot
  // silently collapse a Website request into a single landing page.
  // ----------------------------------------------------------

  const generationScope =
    input.context === "Website"
      ? "WEBSITE"
      : input.context === "Page"
        ? "PAGE"
        : "FOCUSED_EDIT";

  const scopeContract =
    generationScope === "WEBSITE"
      ? `
WEBSITE GENERATION CONTRACT

The user selected WEBSITE.

Generate a genuine MULTI-PAGE website, not a single long landing page.

Determine an appropriate sitemap from:
- the user's brief
- the business type
- the visitor journey
- the primary goal
- the available factual content

Do NOT blindly use the same sitemap for every website.

For a normal business website, create enough meaningful routes to make
the result a real website. Typically this will be at least 4 distinct
routes unless the user's request clearly justifies fewer.

The home page MUST be route "/".

Create additional routes appropriate to the specific brief, for example
services, capabilities, about, work/case studies, solutions, contact,
industries, product/detail pages, or other relevant pages.

Only create pages that have a genuine purpose.

All generated pages MUST:
- share one canonical design system
- use the same typography, color, spacing and component language
- reuse the same shared navigation/header where appropriate
- reuse the same shared footer where appropriate
- feel like one intentionally designed website
- maintain consistent responsive behavior
- link correctly through the navigation

Do not create visually disconnected inner pages.

Do not make every inner page a duplicate of the home page.
Each route must have content hierarchy and composition appropriate to
its purpose while preserving the global visual identity.

src/buildez.pages.json MUST register EVERY generated route.

The navigation MUST link to the actual generated routes.

The project must contain all implementation files required for every
route in this website generation.
`.trim()
      : generationScope === "PAGE"
        ? `
PAGE GENERATION CONTRACT

The user selected PAGE.

Generate EXACTLY ONE page for the selected/current route.

Do not invent or generate unrelated website routes.

If an existing site design system is available:
- inherit its canonical theme
- reuse its typography and colors
- reuse shared header/footer/navigation components where appropriate
- preserve the site's established visual language

The generated page should have its own purposeful composition while
remaining visually consistent with the existing website.

src/buildez.pages.json must include the selected page route without
creating additional unrelated routes.
`.trim()
        : `
FOCUSED EDIT CONTRACT

Modify only the requested scope.
Do not expand this request into additional pages or routes.
`.trim();

  console.log(
    "GENERATION SCOPE:",
    generationScope,
  );

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

  // ----------------------------------------------------------
  // FULL-PAGE GENERATION DETECTION
  //
  // Website generation is fresh when the project has no files.
  // Page generation is page-scoped: an existing Vite project must not
  // prevent a newly-created page from receiving the complete design
  // pipeline.
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // PAGE-AWARE GENERATION STATE
  //
  // One V12Project contains the whole website. Therefore project files
  // existing does NOT mean the selected Page has already been generated.
  //
  // A Page is considered generated only when its route is present in
  // src/buildez.pages.json.
  // ----------------------------------------------------------

  const pageRegistryFile = currentFiles.find(
    (file) => file.path === "src/buildez.pages.json"
  );

  let registeredPageRoutes = new Set<string>();

  if (pageRegistryFile?.content) {
    try {
      const parsedRegistry = JSON.parse(pageRegistryFile.content);

      const registryEntries = Array.isArray(parsedRegistry)
        ? parsedRegistry
        : (
            parsedRegistry &&
            typeof parsedRegistry === "object" &&
            "pages" in parsedRegistry &&
            Array.isArray(
              (parsedRegistry as { pages?: unknown }).pages
            )
          )
          ? (parsedRegistry as { pages: unknown[] }).pages
          : [];

      registeredPageRoutes = new Set(
        registryEntries
          .map((entry) => {
            if (!entry || typeof entry !== "object") return "";

            const route =
              "route" in entry
                ? String(
                    (entry as { route?: unknown }).route || ""
                  ).trim()
                : "";

            return route;
          })
          .filter(Boolean)
      );
    } catch {
      // Invalid registry is handled by generation/metadata validation.
      // Do not treat an unreadable registry as proof that the page exists.
      registeredPageRoutes = new Set();
    }
  }

  const selectedPageRoute = selectedPage?.slug
    ? (
        selectedPage.slug === "home"
          ? "/"
          : `/${selectedPage.slug.replace(/^\/+|\/+$/g, "")}`
      )
    : "";

  const selectedPageHasProjectRoute =
    Boolean(selectedPageRoute) &&
    registeredPageRoutes.has(selectedPageRoute);

  const selectedPageNeedsGeneration =
    Boolean(selectedPage) &&
    !selectedPageHasProjectRoute;

  const isFreshWebsiteGeneration =
    input.context === "Website" &&
    (
      currentFiles.length === 0 ||
      selectedPageNeedsGeneration
    );

  const isFreshPageGeneration =
    input.context === "Page" &&
    selectedPageNeedsGeneration;

  // A user can explicitly request a complete page/site generation
  // even when the currently selected route already exists.
  const requestsFullPageGeneration =
    /\b(build|create|design|generate|make|redesign|rebuild|revamp)\b[\s\S]{0,80}\b(website|site|landing page|homepage|home page|page)\b/i
      .test(effectivePrompt);

  const isFreshFullPageGeneration =
    Boolean(effectivePrompt) &&
    (
      isFreshWebsiteGeneration ||
      isFreshPageGeneration ||
      requestsFullPageGeneration
    );

  /*
   * Execution policy is centralized so plans never directly select
   * concrete provider model IDs.
   *
   * Plan-specific policy will be injected from the authenticated
   * request layer next. Until then this safely resolves the default
   * policy while preserving current frontier output quality.
   */
  const executionPolicy =
    resolveV12ExecutionPolicy(
      input.planCode,
      input.planFeatures,
    );

  const model =
    executionPolicy.models.implementation;

  const visionModel =
    executionPolicy.models.vision;

  console.log(
    "V12 EXECUTION POLICY:",
    JSON.stringify(
      {
        planCode: executionPolicy.planCode,
        frontierGeneration:
          executionPolicy.frontierGeneration,
        model,
        visionModel,
        maxAutomaticRepairs:
          executionPolicy.maxAutomaticRepairs,
        qaTier:
          executionPolicy.qaTier,
        contextTier:
          executionPolicy.contextTier,
      },
      null,
      2,
    ),
  );

  // ----------------------------------------------------------
  // GENERATION PROMPT
  //
  // Start with the user's actual request. The unified Design Architect
  // expands short or underspecified prompts later in the same planning
  // call, avoiding a separate Prompt Architect API request.
  // ----------------------------------------------------------

  let generationPrompt = effectivePrompt;

  // ----------------------------------------------------------
  // CAPABILITY ROUTER
  //
  // Deterministic and free. This provides an initial implementation
  // guardrail from the raw request. The Design Architect performs the
  // deeper semantic interpretation in its single planning call.
  // ----------------------------------------------------------

  generationPrompt = `
${generationPrompt}

${scopeContract}
  `.trim();

  const capabilityPlan = routeV12Capabilities(
    generationPrompt,
    input.creativeDirection,
  );
  const capabilityContext = capabilityPlanPrompt(capabilityPlan);

  console.log("\n===== BUILDEZ V12 PIPELINE =====");
  console.log("ORIGINAL PROMPT:", effectivePrompt);
  console.log("INITIAL GENERATION PROMPT:", generationPrompt);
  console.log("CONTEXT:", input.context);
  console.log("ACTIVE PAGE:", selectedPage?.slug || "none");
  console.log("FRESH FULL PAGE:", isFreshFullPageGeneration);
  console.log("CAPABILITY PLAN:", JSON.stringify(capabilityPlan, null, 2));

  if (isFreshFullPageGeneration) {
    input.onProgress?.(
      "Choosing the experience stack",
      capabilityPlan.primary === "STANDARD"
        ? "Planning a polished traditional web experience"
        : `Planning a ${capabilityPlan.primary.toLowerCase().replaceAll("_", " ")} experience`,
    );
  }

  // ----------------------------------------------------------
  // BRAND / COMPANY RESEARCH
  //
  // Research runs before the unified Design Architect so verified
  // company facts, official sources and identity assets can inform the
  // same planning call. The raw prompt is sufficient for brand lookup;
  // fictional or unverified brands must not produce invented facts.
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // CREDIT-AWARE WEB RESEARCH GATING
  //
  // Research only when the request appears to reference a real,
  // externally-verifiable brand/company/domain/product.
  //
  // Fictional concepts and generic website requests should not spend
  // research credits unnecessarily.
  // ----------------------------------------------------------

  const researchText = `${effectivePrompt} ${site.name}`.toLowerCase();

  const hasExplicitUrl =
    /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|ai|io|co|org|net|dev|app|health|tech)\b/i
      .test(researchText);

  const asksForExistingBrand =
    /\b(existing|official|current|real|actual|their website|their logo|brand website|company website|use their branding|match their brand|research|look up|search web|find logo)\b/i
      .test(researchText);

  const referencesProvidedCompany =
    /\b(for|website for|site for|redesign|revamp)\b/i.test(
      effectivePrompt
    ) &&
    site.name.trim().length > 1 &&
    !/^untitled|new site|new website|website$/i.test(
      site.name.trim()
    );

  const shouldRunWebResearch =
    isFreshFullPageGeneration &&
    (
      hasExplicitUrl ||
      asksForExistingBrand ||
      referencesProvidedCompany
    );

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
      "Checking official web sources, brand context and available identity assets",
    );

    webResearch = await researchV12Website({
      apiKey,
      prompt: generationPrompt,
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

  if (isFreshFullPageGeneration) {
    console.log(
      "WEB RESEARCH:",
      JSON.stringify(webResearch, null, 2)
    );
  }

  // ----------------------------------------------------------
  // UNIFIED DESIGN ARCHITECT
  //
  // One planning call replaces the previous Experience Architect,
  // Creative Director, Asset Planner and Original Design Planner.
  //
  // Reference/screenshot/PDF replication deliberately bypasses this
  // path and continues through the visual-reference analyzer.
  // ----------------------------------------------------------

  let designArchitectPlan: V12DesignArchitectResult | null = null;
  let designArchitectContext = "";

  // Stable creative entropy for this website.
  //
  // Different tenant/site combinations receive different variation
  // identities while subsequent work on the same site keeps the same
  // identity. This reduces cross-site design convergence without
  // turning the seed into a fixed template selector.
  const designVariationSeed = [
    input.tenantId,
    input.siteId,
  ]
    .join(":")
    .split("")
    .reduce(
      (hash, character) =>
        ((hash << 5) - hash + character.charCodeAt(0)) | 0,
      0,
    );

  const designVariationId =
    Math.abs(designVariationSeed)
      .toString(36)
      .padStart(8, "0")
      .slice(0, 8);

  let experienceContext = "";
  let resolvedExperiencePlan = null as Awaited<
    ReturnType<typeof planV12Experience>
  > | null;

  if (isFreshFullPageGeneration) {
    input.onProgress?.(
      "Planning the design",
      "Creating the visual direction, experience, sections and media plan",
    );

    designArchitectPlan = await createV12DesignArchitectPlan({
      apiKey,
      model,
      prompt: `${generationPrompt}

${scopeContract}`,
      context: input.context,
      siteName: site.name,
      deterministicPlan: capabilityPlan,
      creativeDirection: input.creativeDirection,
      researchContext: webResearchPrompt,
      designVariationSeed: designVariationId,
      signal: input.signal,
    });

    // The unified architect may improve a short prompt.
    generationPrompt =
      designArchitectPlan.expandedBrief?.trim() ||
      generationPrompt;

    if (!generationPrompt.includes(scopeContract)) {
      generationPrompt = `
${generationPrompt}

${scopeContract}
      `.trim();
    }

    designArchitectContext =
      designArchitectPrompt(designArchitectPlan);

    // Preserve the existing downstream experience contract while
    // eliminating the separate Experience Architect API call.
    resolvedExperiencePlan = {
      experience: designArchitectPlan.experience,
      capabilities: designArchitectPlan.capabilities,
      libraries: designArchitectPlan.libraries,
      visualTechniques: [
        designArchitectPlan.designDirection.visualLanguage,
        designArchitectPlan.designDirection.composition,
      ].filter(Boolean),
      motionTechniques: designArchitectPlan.motionPlan,
      mediaNeeds: designArchitectPlan.mediaPlan.images.map(
        (item) => `${item.role}: ${item.purpose}`,
      ),
      componentNeeds: designArchitectPlan.sections.map(
        (section) =>
          `${section.role}: ${section.composition}`,
      ),
      performanceRequirements:
        designArchitectPlan.performanceRequirements,
      rationale: designArchitectPlan.rationale,
    };

    experienceContext = designArchitectContext;

    console.log(
      "DESIGN VARIATION ID:",
      designVariationId,
    );

    console.log(
      "DESIGN ARCHITECT:",
      JSON.stringify(designArchitectPlan, null, 2),
    );

    input.onProgress?.(
      "Design architecture ready",
      `Planning a ${designArchitectPlan.experience
        .toLowerCase()
        .replaceAll("_", " ")} experience`,
    );
  }


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

  // ----------------------------------------------------------
  // DESIGN ARCHITECT → EXISTING DOWNSTREAM CONTRACTS
  // ----------------------------------------------------------

  let creativeDirectorSpecification = "";
  let assetToolPlan: V12AssetToolPlan | null = null;
  let assetToolContext = "";

  if (
    isFreshFullPageGeneration &&
    prepared.inputs.length === 0 &&
    designArchitectPlan
  ) {
    creativeDirectorSpecification = JSON.stringify(
      {
        designDirection:
          designArchitectPlan.designDirection,
        sections:
          designArchitectPlan.sections,
        motion:
          designArchitectPlan.motionPlan,
        performance:
          designArchitectPlan.performanceRequirements,
      },
      null,
      2,
    );

    assetToolPlan = {
      needsGeneratedImages:
        designArchitectPlan.mediaPlan.needsGeneratedImages,

      needsVideo:
        designArchitectPlan.mediaPlan.needsVideo,

      needs3DAssets:
        designArchitectPlan.mediaPlan.needs3DAssets,

      needsShaderCode:
        designArchitectPlan.mediaPlan.needsShaderCode,

      needsCustomSvg:
        designArchitectPlan.mediaPlan.needsCustomSvg,

      needsDataViz:
        designArchitectPlan.mediaPlan.needsDataViz,

      needsIcons:
        designArchitectPlan.mediaPlan.needsIcons,

      imageRequirements:
        designArchitectPlan.mediaPlan.images,

      videoRequirements:
        designArchitectPlan.mediaPlan.videos,

      codeVisualRequirements:
        designArchitectPlan.mediaPlan.codeVisualRequirements,

      rationale:
        designArchitectPlan.rationale,
    };

    assetToolContext = designArchitectContext;
  }


  // ----------------------------------------------------------
  // ASSET PLAN → MEDIA GENERATION
  //
  // Turn the Asset Planner's image requirements into durable
  // BuildEZ media BEFORE React generation.
  // ----------------------------------------------------------

  const hasUsableReferenceMedia =
    prepared.inputs.length > 0 ||
    previousImageFiles.length > 0 ||
    input.attachments.some((file) =>
      file.type.startsWith("image/")
    );

  console.log(
    "MEDIA SOURCE PRIORITY:",
    JSON.stringify(
      {
        hasUsableReferenceMedia,
        preparedReferences: prepared.inputs.length,
        historicalImages: previousImageFiles.length,
        currentImageAttachments: input.attachments.filter(
          (file) => file.type.startsWith("image/")
        ).length,
      },
      null,
      2,
    ),
  );

  if (
    assetToolPlan?.needsGeneratedImages &&
    assetToolPlan.imageRequirements.length > 0 &&
    designArchitectPlan &&
    !hasUsableReferenceMedia
  ) {
    // --------------------------------------------------------
    // DETERMINISTIC MEDIA BUDGET
    //
    // Image generation is one of the most expensive stages in
    // the pipeline. The Design Architect decides WHAT imagery
    // would improve the experience; this deterministic layer
    // decides HOW MANY generated assets we are willing to buy.
    // --------------------------------------------------------

    const mediaBudgetByExperience: Record<
      V12DesignArchitectResult["experience"],
      number
    > = {
      TRADITIONAL: 1,
      EDITORIAL: 2,
      MOTION_RICH: 2,
      CINEMATIC: 3,
      IMMERSIVE_3D: 3,
      DATA_DRIVEN: 1,
    };

    const mediaBudget =
      mediaBudgetByExperience[designArchitectPlan.experience] ?? 1;

    // Deduplicate semantically equivalent requests using normalized
    // role + prompt text before consuming the generation budget.
    const seenMediaRequirements = new Set<string>();

    const uniqueMediaRequirements =
      assetToolPlan.imageRequirements.filter((item) => {
        const key = `${item.role}:${item.prompt}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, " ")
          .trim();

        if (seenMediaRequirements.has(key)) {
          return false;
        }

        seenMediaRequirements.add(key);
        return true;
      });

    const budgetedMediaRequirements =
      uniqueMediaRequirements.slice(0, mediaBudget);

    const plannedMediaRequirements =
      budgetedMediaRequirements.map(
        (item, index) => ({
          id: `planned-${index + 1}`,
          role: item.role,
          purpose: item.purpose,
          prompt: item.prompt,
          aspect: item.aspect,
          medium: item.medium,
          useRequestedMedium: item.useRequestedMedium,
        })
      );

    console.log(
      "MEDIA BUDGET:",
      JSON.stringify(
        {
          experience: designArchitectPlan.experience,
          requested:
            assetToolPlan.imageRequirements.length,
          unique:
            uniqueMediaRequirements.length,
          budget: mediaBudget,
          generating:
            plannedMediaRequirements.length,
        },
        null,
        2,
      ),
    );

    input.onProgress?.(
      "Generating planned visuals",
      `${plannedMediaRequirements.length} art-directed visual asset${plannedMediaRequirements.length === 1 ? "" : "s"} selected`,
    );

    const plannedMediaResult = await generateSiteMedia({
      apiKey,
      siteId: input.siteId,
      tenantId: input.tenantId,
      userId: input.userId,
      requirements: plannedMediaRequirements,
      signal: input.signal,
    });

    if (plannedMediaResult.media.length) {
      generatedMedia = [
        ...generatedMedia,
        ...plannedMediaResult.media,
      ];
    }

    console.log(
      "GENERATED MEDIA:",
      JSON.stringify(plannedMediaResult, null, 2)
    );

    input.onProgress?.(
      "Planned visuals ready",
      `${plannedMediaResult.media.length} generated asset${plannedMediaResult.media.length === 1 ? "" : "s"} available for composition`,
    );
  }

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
        generatedMedia = [
          ...generatedMedia,
          ...mediaResult.media,
        ];
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
  } else if (
    isFreshFullPageGeneration &&
    effectivePrompt &&
    designArchitectPlan
  ) {
    // The unified Design Architect already produced the original
    // visual direction. Do not spend another OpenAI call recreating it.
    visualSpecification = designArchitectContext;

    input.onProgress?.(
      "Visual direction ready",
      "Using the unified design architecture for implementation",
    );
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
  // ----------------------------------------------------------
  // FULL REBUILD VS INCREMENTAL EDIT
  //
  // Explicit full-site/page generation must not visually anchor the
  // model to the existing implementation. The old project remains in
  // storage and can still be used by normal incremental edits.
  // ----------------------------------------------------------

  const shouldRebuildFromScratch =
    requestsFullPageGeneration &&
    isFreshFullPageGeneration &&
    prepared.inputs.length === 0;

  const existingProject = currentProjectContext(currentFiles);

  const currentProject = shouldRebuildFromScratch
    ? `FULL VISUAL REBUILD REQUESTED.

Do not preserve or imitate the existing page composition, section layout,
visual hierarchy, typography treatment, decorative system, card patterns,
hero composition, backgrounds, spacing rhythm, or previous art direction.

Design the requested experience from the Design Architect specification.

You are still producing a complete replacement project using the required
BuildEZ project structure.`
    : existingProject;

  console.log(
    "GENERATION MODE:",
    shouldRebuildFromScratch
      ? "FULL_REBUILD"
      : "INCREMENTAL_EDIT",
  );

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
  const immersiveToolchainEnabled = requiresImmersiveToolchain(
    capabilityPlan,
    input.creativeDirection,
  );

  const externalCreativeTools = immersiveToolchainEnabled
    ? creativeMcpTools({
        images: Boolean(assetToolPlan?.needsGeneratedImages),
        video: Boolean(assetToolPlan?.needsVideo),
        threeD: Boolean(assetToolPlan?.needs3DAssets),
        design: prepared.inputs.length > 0,
      })
    : [];
  const generationText = `You are BuildEZ, an autonomous creative director, senior website designer, motion designer, and frontend engineer. ${action}

FULL-PAGE GENERATION PRIORITIES:

1. Visual quality and art direction.
2. Brand specificity.
3. Purposeful imagery and visual storytelling.
4. Interaction, animation and depth appropriate to the request.
5. Responsive visual composition.
6. Engineering correctness.
7. Dependency economy.

For original website generation, the result must feel professionally art-directed rather than like an AI starter template.

${
  shouldRebuildFromScratch
    ? `FULL REBUILD REQUIREMENT:

This is not a refinement of the previous website.

Start the visual composition from a blank canvas.

The Design Architect specification is the primary design authority.

Invent a new:
- page composition
- hero treatment
- section rhythm
- typography hierarchy
- spatial system
- visual motif
- background treatment
- interaction language
- responsive composition

Do not preserve previous section geometry merely because similar content
already existed.

Similarity in business content does not justify similarity in visual design.`
    : ""
}

A minimal design must still feel deliberate, detailed and complete.

DO NOT DEFAULT TO:
- hero + logo strip + four cards + testimonial + CTA
- repetitive 3/4-column card grids
- identical section containers
- consecutive visually flat sections
- generic icon-only feature layouts
- text-only hero sections when the art direction calls for strong media
- generic SaaS composition regardless of industry

VISUAL RICHNESS:

Use purposeful combinations of:
- editorial/product imagery
- custom-feeling iconography
- diagrams
- UI/product compositions
- SVG/CSS visual art
- layered backgrounds
- subtle gradients/light
- masks
- textures
- depth
- overlap
- meaningful hover states
- responsive transitions
- scroll reveals

Only use these where they serve the selected art direction.

IMMERSIVE REQUESTS:

If the Capability Plan requires:
- 3D
- WebGL
- shaders
- parallax
- cinematic scrolling
- data visualization

implement those capabilities instead of downgrading the request to a standard landing page.

EXTERNAL CREATIVE TOOLCHAIN:

${externalCreativeTools.length
  ? `The following configured MCP production capabilities are available in this generation: ${externalCreativeTools.map((tool) => tool.server_label).join(", ")}.
Use the relevant tools when the approved asset plan requires cinematic media, 3D assets, or design-reference translation. Integrate returned assets into the final project; do not call a tool merely for demonstration and do not leave generated outputs unused.`
  : "No external creative MCP is configured for this request. Implement approved code-native visuals with the listed libraries and use the durable generated media supplied below."}

Do NOT add Three.js/WebGL merely because it is available.

For advanced motion:
- preserve prefers-reduced-motion
- favor performant transforms/opacity
- avoid unnecessary layout-triggering animation
- keep expensive effects bounded to their intended sections

SCREENSHOT / PDF / UI REPLICATION:

When visual references are supplied, the reference-derived visual specification remains authoritative. Do not replace a supplied design with a new Creative Director concept.

${action} Treat the supplied visual specification as the governing art direction and implement it with high fidelity: hierarchy, geometry, typography, color, spacing, imagery placement, interaction, and responsive behavior. Do not replace its decisions with a generic starter composition. Honor explicit user-selected creative-direction values; "AI decides" means infer from the request, and an explicit free-text instruction takes precedence over a pill selection. Use only facts supplied by the user or existing project; never fabricate clients, partnerships, awards, testimonials, case-study outcomes, statistics, addresses, or certifications. Build repeated content such as product grids from typed data arrays and reusable components so complex pages remain concise and consistent. For complete-site requests, create all materially required pages, shared navigation, real routes, and src/buildez.pages.json as the canonical page registry with stable id, name, slug, route, sourceFile, componentName, title, description, status, order, includeInNavigation, isHomepage, createdAt, and updatedAt for every page. Never return phantom registry entries or dead navigation links. If src/buildez.import-analysis.json exists, treat it as an architectural inventory: preserve every recognized page, consolidate recognized header/footer files into the shared SiteShell, replace recognized product lists with ShopEZ feeds, and preserve recognized blog and Instagram data sources behind reusable feed adapters. Do not silently delete an imported feed because its external credentials are unavailable; render its configured content and a localized empty/error state. For commerce websites, ShopEZ products have already been provisioned by the platform: do not generate or import a starter catalogue manifest. A ShopEZ loading or request failure must remain localized to the product feed; always keep the header, hero, editorial content, calls to action, journal, and footer visible. ${commercePrompt}

ACTIVE WEBSITE DEVELOPMENT SKILL:
${WEBSITE_DEVELOPMENT_SKILL}

BUILDER SCOPE SELECTED BY THE USER:
${input.context}

ACTIVE BUILDEZ PAGE:
${
  selectedPage
    ? JSON.stringify(
        {
          id: selectedPage.id,
          title: selectedPage.title,
          slug: selectedPage.slug,
          route: selectedPageRoute,
          renderMode: selectedPage.renderMode,
          alreadyExistsInProject: selectedPageHasProjectRoute,
        },
        null,
        2
      )
    : "No specific page is selected."
}

PAGE-SCOPE RULES:

- If scope is "Page", modify the ACTIVE BUILDEZ PAGE.
- If that page does not yet exist in the React project, create its real route,
  component and src/buildez.pages.json entry.
- Do not overwrite another page to satisfy a Page-scoped request.
- Preserve other existing routes unless the request explicitly requires a
  website-wide change.
- If the selected page already exists, treat ordinary requests as edits rather
  than regenerating its complete design.


ORIGINAL USER REQUEST:
${effectivePrompt || "Recreate the attached design."}

INTERNAL EXPANDED BUILD BRIEF:
${generationPrompt || effectivePrompt || "Recreate the attached design."}

${capabilityContext}

CREATIVE DIRECTOR SPECIFICATION:
${
  creativeDirectorSpecification ||
  "No separate Creative Director specification applies. Follow the existing project or supplied visual reference."
}

USER-SELECTED CREATIVE DIRECTION:
${JSON.stringify(input.creativeDirection, null, 2)}

${webResearchPrompt}

MOTION IMPLEMENTATION REQUIREMENT:
Honor the selected motion style exactly. For Immersive parallax, build a scroll-directed sequence with layered generated media, sticky framed scenes, depth transforms, section-to-section continuity, and restrained pointer interactions. For Modern motion, include polished reveal, hover, and scroll transitions. For Subtle reveals, keep movement quiet. For Mostly static, avoid decorative scroll animation. Always implement prefers-reduced-motion and never scroll-jack.

VISUAL IMPLEMENTATION SPECIFICATION:
${visualSpecification || "No separate visual specification is available; inspect the attached optimized references directly."}

CANONICAL SITE THEME:
${
  shouldRebuildFromScratch
    ? `The values below belong to the previous implementation and are
provided only as legacy project metadata.

DO NOT treat them as the visual source of truth for this rebuild.

Create a NEW coherent theme from the Design Architect's design direction,
the user's creative direction, brand requirements, and requested experience.

The replacement project must write the new system into
src/buildez.theme.json and the shared theme stylesheet.

LEGACY THEME:
${JSON.stringify(canonicalTheme, null, 2)}`
    : `${JSON.stringify(canonicalTheme, null, 2)}

Preserve this canonical theme unless the user's requested edit explicitly
requires changing it.`
}

GENERATED SITE MEDIA:
${generatedMedia.length ? JSON.stringify(generatedMedia, null, 2) : "No generated editorial media is available. Use ShopEZ product imagery, supplied media, or deliberate CSS/SVG composition; never substitute random stock URLs."}

GENERATED MEDIA USAGE RULES:

- Generated media is part of the approved art direction, not optional inspiration.
- Compose the supplied generated assets into the intended sections.
- Do not generate rich media and then leave the final page visually empty.
- Preserve appropriate aspect ratio and responsive cropping.
- Do not stretch imagery.
- Use object-fit/object-position deliberately.
- Use overlays, masks, depth, gradients or framing only where the Creative Director calls for them.
- If an asset is meant to be a hero visual, make it visually substantial rather than a tiny decorative thumbnail.


CURRENT PROJECT:
${currentProject}

Return JSON only: {"message":"specific completion summary","files":[{"path":"package.json","content":"..."},{"path":"index.html","content":"..."},{"path":"src/main.tsx","content":"..."}, ...]}. Return a complete runnable Vite React TypeScript project, never patches or markdown. Required: package.json, index.html, src/main.tsx, src/buildez.theme.json, and src/buildez.pages.json. ${
  shouldRebuildFromScratch
    ? "For this FULL REBUILD, create a new canonical site theme from the Design Architect specification and implement that new theme as CSS custom properties in one shared theme stylesheet. Do not reproduce the previous visual system."
    : "Treat the canonical site theme as the source of truth: implement it as CSS custom properties in one shared theme stylesheet and consume those variables everywhere."
} Every route must render the same reusable SiteShell, Header, and Footer rather than restyling them per page. Never use Unsplash, remote stock-photo URLs, or random image services. Use only supplied media, generated media URLs, ShopEZ product images, or deliberate CSS art. Keep dependencies purposeful rather than artificially minimal. The generated project's package.json MUST include every library actually used by its source code. When the Experience Architect calls for advanced capabilities, install the appropriate dependencies in the GENERATED PROJECT rather than pretending to implement them with generic CSS. Examples include three + @react-three/fiber + @react-three/drei for true interactive 3D, gsap for sophisticated scroll choreography, and suitable visualization libraries for genuine data-driven experiences. Do not add these dependencies when the requested experience does not need them. Prefer reusable component/data architecture, but never simplify away required visual richness, imagery, backgrounds, motion, interaction, iconography, 3D, shaders, parallax or composition merely to reduce code size. Produce polished responsive UI and keep repeated markup concise.`;
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
    ...(externalCreativeTools.length
      ? {
          tools: externalCreativeTools,
          tool_choice: assetToolPlan?.needsVideo || assetToolPlan?.needs3DAssets
            ? "required"
            : "auto",
        }
      : {}),
  });

  input.onProgress?.(
    "Designing and generating",
    "Creating the design, interactions and experience",
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
  const durableCreativeUrls = new Map<string, string>();
  for (const sourceUrl of creativeMcpResultUrls(payload)) {
    try {
      const durableUrl = await persistCreativeAsset({
        sourceUrl,
        siteId: input.siteId,
        tenantId: input.tenantId,
        userId: input.userId,
        prompt: effectivePrompt || "AI-generated website asset",
        provider: "Creative MCP",
        signal: input.signal,
      });
      durableCreativeUrls.set(sourceUrl, durableUrl);
    } catch {
      // Keep generation usable if an external provider returns an ephemeral or unsupported resource.
    }
  }
  const resultWithDurableAssets = durableCreativeUrls.size
    ? {
        ...parsedResult,
        files: parsedResult.files.map((file) => ({
          ...file,
          content: [...durableCreativeUrls].reduce(
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

  console.log(
    "GENERATED PROJECT FILES:",
    result.files.map((file) => file.path)
  );
  // Preserve the existing project immediately before an AI mutation.
  //
  // Brand-new projects have no previous state worth restoring and may not
  // have a revision yet, so only checkpoint projects that already contain
  // source files.
  let preMutationCheckpointId: string | undefined;

  if (result.files.length && currentFiles.length > 0) {
    input.onProgress?.(
      "Creating safety checkpoint",
      "Saving the current project before applying the AI update",
    );

    const checkpoint = await createProjectCheckpoint({
      siteId: input.siteId,
      tenantId: input.tenantId,
      userId: input.userId,
      label: isFreshFullPageGeneration
        ? "Before AI full-page generation"
        : "Before AI project update",
    });

    preMutationCheckpointId = checkpoint.id;
  }

  const committed = result.files.length
    ? await importProjectFiles({
        siteId: input.siteId,
        tenantId: input.tenantId,
        userId: input.userId,
        files: result.files,
        expectedRevision: project.currentRevision,
        label: isFreshFullPageGeneration
          ? "AI V12 full-page generation"
          : "AI V12 project update",
      })
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
  return {
    ...result,
    ...committed,
    model,
    status: "completed" as const,
    preMutationCheckpointId,
  };
}
