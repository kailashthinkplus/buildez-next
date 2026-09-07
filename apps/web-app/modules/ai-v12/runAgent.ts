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
import { parseProjectResponse as parseResult, TruncatedResponseError } from "./projectResponse";
import { fetchWithRetry } from "@/lib/net/fetchWithRetry";
import { IMAGE_CLARIFICATION_MESSAGE, imageRequestNeedsClarification } from "./imageIntent";
import { buildShopezPrompt } from "./shopezPrompt";
import type { CreativeDirection } from "./creativeDirection";
import { WEBSITE_DEVELOPMENT_SKILL } from "./websiteDevelopmentSkill";
import {
  capabilityPlanPrompt,
  requiresImmersiveToolchain,
  routeV12Capabilities,
  type V12CapabilityPlan,
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
import { generateImmersiveFrameSequence } from "./immersiveFrameSequence";
import { allowsUntextured3DGeometry, immersiveAcceptanceFailures, requiresMultipleCameraViews } from "./experienceAcceptance";
import { requestsFullPageGeneration } from "./generationIntent";
import { Prisma, prisma } from "@buildez/db";
import { prepareAgentReferences } from "./prepareReferences";
import { normalizeThemeTokens } from "@/modules/builder-v2/theme/defaultTheme";
import type { BuilderThemeTokens } from "@/modules/builder-v2/theme/theme.types";
import {
  generateSiteMedia,
  type GeneratedSiteMedia,
  type SiteMediaRequirement,
} from "./mediaGeneration";
import {
  buildSamplePlaceholderProducts,
  catalogMissingInputs,
  detectCommerceIntent,
  ensureShopezProductImages,
  getOrCreateAgentConversation,
  isGeneratedCommerceRoute,
  persistCommerceAttachments,
  readCommerceContext,
  recordAgentMessage,
  saveCommerceContext,
  shouldUseCommercePipeline,
  stageExtractedProducts,
  type ReferenceCommerceAnalysis,
} from "./commerce";

/*
 * BRAND / NAME CLARIFICATION
 *
 * The pill the "It's a different brand" action submits — never a real
 * user prompt, so it's safe to match on exactly rather than needing a
 * dedicated field on V12AgentAction.
 */
const BRAND_DIFFERENT_SENTINEL = "__BUILDEZ_BRAND_DIFFERENT__";

/** Pill values for the two-candidate brand clarification (see PendingBrandClarification below). */
const BRAND_USE_TENANT_SENTINEL = "__BUILDEZ_BRAND_USE_TENANT__";
const BRAND_USE_SITE_SENTINEL = "__BUILDEZ_BRAND_USE_SITE__";

/** Pill values for the upfront static-vs-ecommerce clarification. */
const SITE_TYPE_STATIC_SENTINEL = "__BUILDEZ_SITE_TYPE_STATIC__";
const SITE_TYPE_ECOMMERCE_SENTINEL = "__BUILDEZ_SITE_TYPE_ECOMMERCE__";

type PendingSiteTypeClarification = { originalPrompt: string };

function readSiteTypeClarification(value: unknown): PendingSiteTypeClarification | null {
  const root = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const raw = root.siteTypeClarification;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.originalPrompt !== "string") return null;
  return { originalPrompt: candidate.originalPrompt };
}

async function saveSiteTypeClarification(input: {
  conversationId: string;
  existingContext: unknown;
  siteTypeClarification: PendingSiteTypeClarification | null;
}) {
  const root = input.existingContext && typeof input.existingContext === "object" && !Array.isArray(input.existingContext)
    ? input.existingContext as Record<string, unknown>
    : {};
  return prisma.aIConversation.update({
    where: { id: input.conversationId },
    data: { context: { ...root, siteTypeClarification: input.siteTypeClarification } as Prisma.InputJsonValue },
  });
}

/** The "Generate sample products for me" pill's value — never a real user prompt. */
const COMMERCE_GENERATE_SAMPLES_SENTINEL = "__BUILDEZ_COMMERCE_GENERATE_SAMPLES__";

type PendingBrandClarification = {
  originalPrompt: string;
  /** The account's overall business name (from onboarding), when offered as a candidate. */
  tenantName?: string;
  /** This specific website's own name, when offered as a distinct candidate. */
  siteName?: string;
};

function readBrandClarification(value: unknown): PendingBrandClarification | null {
  const root = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const raw = root.brandClarification;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.originalPrompt !== "string") return null;
  return {
    originalPrompt: candidate.originalPrompt,
    tenantName: typeof candidate.tenantName === "string" ? candidate.tenantName : undefined,
    siteName: typeof candidate.siteName === "string" ? candidate.siteName : undefined,
  };
}

async function saveBrandClarification(input: {
  conversationId: string;
  existingContext: unknown;
  brandClarification: PendingBrandClarification | null;
}) {
  const root = input.existingContext && typeof input.existingContext === "object" && !Array.isArray(input.existingContext)
    ? input.existingContext as Record<string, unknown>
    : {};
  return prisma.aIConversation.update({
    where: { id: input.conversationId },
    data: { context: { ...root, brandClarification: input.brandClarification } as Prisma.InputJsonValue },
  });
}

type AgentFile = { path: string; content: string };
type ProjectFile = { path: string; content: string };

/**
 * A long list of Higgsfield frame URLs is data, not something an LLM should
 * be relied on to transcribe byte-for-byte into its own generated source —
 * that was the root cause of spurious "did not pass acceptance" failures
 * even when the model built a correct scroll-scrubbed canvas. Instead of
 * asking the model to inline the array, we hand it a fixed module to import
 * from and write that module ourselves after every generation/repair pass,
 * so the frame list is always exactly correct regardless of model fidelity.
 */
export const HIGGSFIELD_FRAMES_MODULE_PATH = "src/higgsfieldFrames.ts";

export function withHiggsfieldFrames(files: readonly AgentFile[], frameSequence: { frameUrls: string[] } | null): AgentFile[] {
  if (!frameSequence) return [...files];
  const module: AgentFile = {
    path: HIGGSFIELD_FRAMES_MODULE_PATH,
    content: `// Generated by BuildEZ — playback-ordered Higgsfield frame URLs. Do not hand-edit.\nexport const HIGGSFIELD_FRAME_URLS: string[] = ${JSON.stringify(frameSequence.frameUrls, null, 2)};\n`,
  };
  return [...files.filter((file) => file.path !== module.path), module];
}

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

export type V12AgentInput = {
  siteId: string;
  pageId?: string;
  tenantId: string;
  userId: string;
  planCode?: string | null;
  planFeatures?: readonly V12PlanFeatureInput[] | null;
  prompt: string;
  context: "Website" | "Page" | "Selected element" | "Image";
  selectedElement?: V12SelectedElementTarget;
  creativeDirection: CreativeDirection;
  mode: "auto" | "discuss";
  attachments: File[];
  signal: AbortSignal;
  onProgress?(title: string, detail?: string, metadata?: { revision?: number; previewReady?: boolean }): void;
};

export type V12AgentAction = {
  id: string;
  label: string;
  value: string;
};

export type V12AgentResult = {
  message: string;
  actions?: readonly V12AgentAction[];
  files: AgentFile[];
  revision: number;
  fileCount: number;
  model: string;
  status?: "needs_input" | "completed";
  preMutationCheckpointId?: string;
};

/*
 * Everything the "generate" stage needs, computed once by the "plan"
 * stage and persisted (as V12GenerationJob.state) across the HTTP
 * request boundary. Splitting the pipeline this way means no single
 * request has to run reference analysis + web research + design
 * planning + media generation + code generation end to end, which is
 * what pushed immersive/cinematic requests past the platform's
 * request timeout.
 */
export type V12PipelineState = {
  pageId: string;
  selectedPage: { id: string; title: string; slug: string; renderMode: string } | null;
  selectedPageRoute: string;
  selectedPageHasProjectRoute: boolean;
  isFreshFullPageGeneration: boolean;
  effectivePrompt: string;
  generationPrompt: string;
  capabilityPlan: V12CapabilityPlan;
  capabilityContext: string;
  designArchitectPlan: V12DesignArchitectResult | null;
  visualSpecification: string;
  directReferenceInputs: Array<Record<string, unknown>>;
  canonicalTheme: BuilderThemeTokens;
  generatedMedia: GeneratedSiteMedia[];
  creativeDirectorSpecification: string;
  assetToolPlan: V12AssetToolPlan | null;
  webResearchPrompt: string;
  isEcommerce: boolean;
  commercePrompt: string;
  shouldRebuildFromScratch: boolean;
  currentProject: string;
  currentFiles: ProjectFile[];
  hasReferenceInputs: boolean;
  frameSequence: { frameUrls: string[] } | null;
};

export type V12PlanOutcome =
  | { kind: "done"; result: V12AgentResult }
  | { kind: "continue"; state: V12PipelineState };

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

/**
 * Facts the user already gave BuildEZ — during onboarding, and on this
 * site's Settings page — that the model would otherwise have no way to
 * know about. Read-only reference: the user's actual prompt for this
 * generation always takes precedence over any of it.
 */
function buildBusinessContextBlock(input: {
  siteName?: string | null;
  onboarding: {
    businessName: string | null;
    profession: string | null;
    primaryUseCase: string | null;
    website: string | null;
    city: string | null;
    country: string | null;
  } | null;
  settings: unknown;
}): string {
  const settings = object(input.settings);
  const lines: string[] = [];

  // onboarding.businessName is one row per USER account, shared across every
  // site that account owns — it names the owner's overall business/tenant.
  // site.name is the specific website being generated right now, and a
  // tenant can own several sites with different names/purposes. Both are
  // real signal and neither substitutes for the other.
  const siteName = input.siteName?.trim();
  if (siteName) lines.push(`- This specific website's name: ${siteName}`);

  const businessName = input.onboarding?.businessName?.trim();
  if (businessName && businessName.toLowerCase() !== siteName?.toLowerCase()) {
    lines.push(`- Owner's overall business/brand name: ${businessName}`);
  }

  const profession = input.onboarding?.profession?.trim();
  const useCase = input.onboarding?.primaryUseCase?.trim();
  if (profession || useCase) {
    lines.push(`- What the owner does: ${[profession, useCase].filter(Boolean).join(" · ")}`);
  }

  const existingWebsite = input.onboarding?.website?.trim();
  if (existingWebsite) lines.push(`- Existing website on file: ${existingWebsite}`);

  const location = [input.onboarding?.city?.trim(), input.onboarding?.country?.trim()].filter(Boolean).join(", ");
  if (location) lines.push(`- Location: ${location}`);

  const contactEmail = typeof settings.contactEmail === "string" ? settings.contactEmail.trim() : "";
  if (contactEmail) lines.push(`- Contact email (use verbatim, do not invent another): ${contactEmail}`);

  const contactPhone = typeof settings.contactPhone === "string" ? settings.contactPhone.trim() : "";
  if (contactPhone) lines.push(`- Contact phone (use verbatim, do not invent another): ${contactPhone}`);

  const seoTitle = typeof settings.seoTitle === "string" ? settings.seoTitle.trim() : "";
  const seoDescription = typeof settings.seoDescription === "string" ? settings.seoDescription.trim() : "";
  if (seoTitle || seoDescription) {
    lines.push(`- Configured SEO title/description to reflect in <title>/meta tags: ${[seoTitle, seoDescription].filter(Boolean).join(" — ")}`);
  }

  const socials = (["twitterHandle", "facebookUrl", "instagramUrl", "linkedinUrl"] as const)
    .map((key) => (typeof settings[key] === "string" ? settings[key].trim() : ""))
    .filter(Boolean);
  if (socials.length) lines.push(`- Real social links to use if the design includes social icons (use verbatim, do not invent others): ${socials.join(", ")}`);

  if (!lines.length) return "";

  return `
REFERENCE CONTEXT (from the account's onboarding and this site's Settings page — factual reference only; the request below always wins on anything it specifies explicitly):
${lines.join("\n")}
  `.trim();
}

function outputText(payload: unknown) {
  const root = object(payload);
  if (typeof root.output_text === "string") return root.output_text.trim();
  return (Array.isArray(root.output) ? root.output : []).flatMap(item => Array.isArray(object(item).content) ? object(item).content as unknown[] : [])
    .map(item => typeof object(item).text === "string" ? String(object(item).text) : "").filter(Boolean).join("\n").trim();
}

/** OpenAI's Responses API sets this when generation stopped early — most commonly for hitting max_output_tokens. */
function isIncompleteResponse(payload: unknown): boolean {
  const root = object(payload);
  return root.status === "incomplete" || object(root.incomplete_details).reason === "max_output_tokens";
}

function ensureActiveWebsitePageRoute(input: {
  files: readonly AgentFile[];
  context: "Website" | "Page" | "Selected element" | "Image";
  selectedPage?: { id: string; title: string; slug: string };
}) {
  const selectedPage = input.selectedPage;
  if (input.context !== "Website" || !selectedPage || selectedPage.slug === "home") {
    return [...input.files];
  }

  const route = `/${selectedPage.slug.replace(/^\/+|\/+$/g, "")}`;
  const registryIndex = input.files.findIndex(
    (file) => file.path === "src/buildez.pages.json",
  );
  if (registryIndex < 0) return [...input.files];

  try {
    const registry = JSON.parse(input.files[registryIndex].content);
    if (!Array.isArray(registry)) return [...input.files];
    if (registry.some((entry) => object(entry).route === route)) {
      return [...input.files];
    }

    const homepage = registry.find((entry) => object(entry).route === "/");
    if (!homepage) return [...input.files];

    const homepageEntry = object(homepage);
    const maxOrder = registry.reduce(
      (highest, entry) => Math.max(highest, Number(object(entry).order) || 0),
      0,
    );
    const now = new Date().toISOString();
    const activeRouteEntry = {
      ...homepageEntry,
      id: `buildez-${selectedPage.id}`,
      name: selectedPage.title,
      title: selectedPage.title,
      slug: selectedPage.slug,
      route,
      order: maxOrder + 1,
      includeInNavigation: false,
      isHomepage: false,
      createdAt: homepageEntry.createdAt || now,
      updatedAt: now,
      aliasOf: "/",
    };
    const files = [...input.files];
    files[registryIndex] = {
      ...files[registryIndex],
      content: `${JSON.stringify([...registry, activeRouteEntry], null, 2)}\n`,
    };
    return files;
  } catch {
    // The ordinary registry validator will surface malformed generated JSON.
    return [...input.files];
  }
}

async function syncGeneratedSiteMetadata(input: {
  siteId: string;
  files: readonly AgentFile[];
  isEcommerce: boolean;
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
      if (input.isEcommerce && isGeneratedCommerceRoute(route)) continue;
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
          // A generated website is a single deliverable, not a set of
          // independent pages the user separately publishes one at a
          // time — leaving new pages at the PageStatus default (DRAFT)
          // meant only whichever page the builder UI happened to publish
          // explicitly ever went live, while every other AI-generated
          // page silently stayed unreachable. New pages default to
          // published; regenerating an EXISTING page never touches its
          // status below, so a page the user deliberately unpublished
          // stays that way.
          status: "PUBLISHED",
          publishedAt: new Date(now),
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
  const response = await fetchWithRetry(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
    { timeoutMs, signal },
  );
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
  let parsed: Record<string, unknown>;
  try {
    parsed = object(JSON.parse(responseText));
  } catch {
    throw new TruncatedResponseError("The visual specification response was cut off before it finished.");
  }
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
  let parsed: Record<string, unknown>;
  try {
    parsed = object(JSON.parse(responseText));
  } catch {
    throw new TruncatedResponseError("The design specification response was cut off before it finished.");
  }
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

/*
 * PLAN STAGE
 *
 * Reference analysis + web research + design architecture + media
 * generation. Returns either a terminal result (selected-element edit,
 * commerce clarification, image clarification — all fast, single-pass
 * flows that never risked the timeout) or a "continue" outcome carrying
 * the state the generate stage needs.
 */
export async function runV12AgentPlan(input: V12AgentInput): Promise<V12PlanOutcome> {
  if (imageRequestNeedsClarification(input.prompt)) {
    input.onProgress?.("Image details needed", "Waiting for subject and visual direction before generation");
    return { kind: "done", result: { message: IMAGE_CLARIFICATION_MESSAGE, files: [], revision: 0, fileCount: 0, model: "clarification" } };
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
      settings: true,
    },
  });
  if (!site) throw new Error("Site not found.");
  const onboarding = await prisma.userOnboarding.findUnique({
    where: { userId: input.userId },
    select: {
      businessName: true,
      profession: true,
      primaryUseCase: true,
      website: true,
      city: true,
      country: true,
    },
  });
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
      kind: "done",
      result: {
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
      },
    };
  }

  const conversation = await getOrCreateAgentConversation({
    tenantId: input.tenantId,
    siteId: input.siteId,
    pageId,
    userId: input.userId,
  });
  let commerceContext = readCommerceContext(conversation.context);
  let currentPrompt = input.prompt.trim();

  // ----------------------------------------------------------
  // BRAND / NAME CLARIFICATION (resolution)
  //
  // Only the resolution half lives here — it must run before
  // effectivePrompt is built below. The decision to ASK is made further
  // down, once isFreshFullPageGeneration is known (see that section):
  // whether this specific request is a fresh full build, not merely
  // whether the site has ever been generated before, is what actually
  // determines whether assuming a brand is safe. A confirmed "different
  // brand" answer also suppresses the account's own business context
  // (see businessContextBlock below) for this generation, so a client
  // site or unrelated brand never gets the account owner's name/contact
  // details/socials silently forced into it.
  // ----------------------------------------------------------

  const pendingBrandClarification = readBrandClarification(conversation.context);
  let suppressAccountBusinessContext = false;

  if (pendingBrandClarification) {
    const isDifferentBrand = currentPrompt === BRAND_DIFFERENT_SENTINEL;
    // Two named candidates means the pill values are the sentinels below;
    // a single-candidate clarification (the common case) still accepts any
    // non-sentinel reply — including a pill whose label doubles as its
    // value, or free-typed text — as confirming that one candidate.
    const chosenName = isDifferentBrand
      ? null
      : currentPrompt === BRAND_USE_TENANT_SENTINEL
        ? pendingBrandClarification.tenantName || null
        : currentPrompt === BRAND_USE_SITE_SENTINEL
          ? pendingBrandClarification.siteName || null
          : pendingBrandClarification.tenantName || pendingBrandClarification.siteName || null;
    suppressAccountBusinessContext = isDifferentBrand;
    currentPrompt = chosenName
      ? `${pendingBrandClarification.originalPrompt}\n\nBRAND/BUSINESS NAME TO USE THROUGHOUT THIS WEBSITE: ${chosenName}`
      : pendingBrandClarification.originalPrompt;

    await saveBrandClarification({
      conversationId: conversation.id,
      existingContext: conversation.context,
      brandClarification: null,
    });
  }

  // ----------------------------------------------------------
  // STATIC VS ECOMMERCE CLARIFICATION (resolution)
  //
  // Only the resolution half lives here, for the same reason as the brand
  // clarification above — the decision to ASK needs isFreshFullPageGeneration,
  // computed further down. forcedCommerceMode overrides every other signal
  // (Design Architect's own guess, reference-image analysis) once the user
  // has explicitly answered, so an ambiguous request never gets silently
  // routed to the wrong pipeline after the user already resolved it.
  // ----------------------------------------------------------

  const pendingSiteTypeClarification = readSiteTypeClarification(conversation.context);
  let forcedCommerceMode: "STATIC" | "ECOMMERCE" | null = null;

  if (pendingSiteTypeClarification) {
    forcedCommerceMode = currentPrompt === SITE_TYPE_ECOMMERCE_SENTINEL
      ? "ECOMMERCE"
      : currentPrompt === SITE_TYPE_STATIC_SENTINEL
        ? "STATIC"
        : null;
    currentPrompt = pendingSiteTypeClarification.originalPrompt;

    await saveSiteTypeClarification({
      conversationId: conversation.id,
      existingContext: conversation.context,
      siteTypeClarification: null,
    });
  }

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

When ACTIVE BUILDEZ PAGE below has a non-home route, also register that route
as a non-navigation alias of the homepage in src/buildez.pages.json and make
the application router render the homepage component at that route. This is
the canvas route the user is actively building, so it must never be left blank.

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

  const pendingCommerceClarification =
    commerceContext.pendingClarification;

  const resolvingCommerceClarification =
    Boolean(
      pendingCommerceClarification &&
      currentPrompt
    );

  const continuingCommerceIntake =
    commerceContext.phase === "WAITING_FOR_CATALOG" &&
    Boolean(commerceContext.requestPrompt);

  const effectivePrompt =
    resolvingCommerceClarification &&
    pendingCommerceClarification
      ? `${pendingCommerceClarification.originalPrompt}

CLARIFICATION REQUESTED:
${pendingCommerceClarification.question}

USER RESPONSE:
${currentPrompt}`
      : continuingCommerceIntake && currentPrompt
        ? `${commerceContext.requestPrompt}\n\nAdditional catalogue details:\n${currentPrompt}`
        : currentPrompt || commerceContext.requestPrompt;

  if (resolvingCommerceClarification) {
    commerceContext = {
      ...commerceContext,
      pendingClarification: null,
    };

    await saveCommerceContext({
      conversationId: conversation.id,
      existingContext: conversation.context,
      commerce: commerceContext,
      phase: "INTERVIEW",
    });
  }
  await recordAgentMessage({
    conversationId: conversation.id,
    role: "user",
    content: {
      text: currentPrompt,
      creativeDirection: input.creativeDirection,
      attachments: input.attachments.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    },
    userId: input.userId,
  });
  const existingProductCount = site.shop?._count.products || 0;

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
  const requestsCompletePageGeneration =
    requestsFullPageGeneration(effectivePrompt);

  const isFreshFullPageGeneration =
    Boolean(effectivePrompt) &&
    (
      isFreshWebsiteGeneration ||
      isFreshPageGeneration ||
      requestsCompletePageGeneration
    );

  // ----------------------------------------------------------
  // BRAND / NAME CLARIFICATION (ask)
  //
  // Every fresh full build has two candidate identities to build
  // around: the business name captured during onboarding, and the
  // site's own internal name (often left as a generic placeholder like
  // "New site"). Gating this on "has this site ever been generated
  // before" (rather than "is THIS request a fresh full build") meant a
  // later from-scratch rebuild for a completely different, unrelated
  // brand — a client site, a different venture — silently forced the
  // account owner's own name/contact details/socials into it, because
  // the one-time question had already been asked and answered for a
  // previous, different build. Ask every time a fresh full build is
  // about to run, not once ever per site — and never infer the prompt
  // "already answers it" from a name substring match; only an explicit
  // pill answer counts.
  // ----------------------------------------------------------

  if (
    input.context === "Website" &&
    isFreshFullPageGeneration &&
    !pendingBrandClarification
  ) {
    const onboardingName = onboarding?.businessName?.trim() || "";
    const siteNameIsPlaceholder = /^(untitled|new site|new website|website|my website|my site|home)$/i.test(site.name.trim());
    const siteNameCandidate = siteNameIsPlaceholder ? "" : site.name.trim();
    // The account's overall business name and this specific website's own
    // name are two independently meaningful signals — a tenant can build
    // several sites for different clients/ventures under one account. Only
    // offer both as distinct choices when they're both real and actually
    // different; otherwise this collapses to the original single-candidate
    // ask so the common case doesn't get a needlessly bigger question.
    const namesDiffer = Boolean(onboardingName) && Boolean(siteNameCandidate) &&
      onboardingName.toLowerCase() !== siteNameCandidate.toLowerCase();
    const candidateName = onboardingName || siteNameCandidate;

    if (namesDiffer) {
      const question = `Quick check before I start — should this website use your account's brand "${onboardingName}", this website's own name "${siteNameCandidate}", or a different brand entirely?`;
      const actions: V12AgentAction[] = [
        { id: "brand-use-tenant", label: `Use ${onboardingName}`, value: BRAND_USE_TENANT_SENTINEL },
        { id: "brand-use-site", label: `Use ${siteNameCandidate}`, value: BRAND_USE_SITE_SENTINEL },
        { id: "brand-different", label: "A different brand", value: BRAND_DIFFERENT_SENTINEL },
      ];

      await saveBrandClarification({
        conversationId: conversation.id,
        existingContext: conversation.context,
        brandClarification: { originalPrompt: currentPrompt, tenantName: onboardingName, siteName: siteNameCandidate },
      });

      await recordAgentMessage({
        conversationId: conversation.id,
        role: "user",
        content: {
          text: input.prompt,
          creativeDirection: input.creativeDirection,
          attachments: input.attachments.map((file) => ({ name: file.name, type: file.type, size: file.size })),
        },
        userId: input.userId,
      });

      await recordAgentMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: { text: question, status: "needs_input", actions },
      });

      input.onProgress?.("One quick check", "Confirm the brand before generation starts");

      return {
        kind: "done",
        result: {
          message: question,
          actions,
          files: [],
          revision: project.currentRevision,
          fileCount: 0,
          model: "clarification",
          status: "needs_input" as const,
        },
      };
    }

    if (candidateName) {
      const question = `Quick check before I start — is this website for "${candidateName}", or a different brand/name?`;
      const actions: V12AgentAction[] = [
        { id: "brand-confirm", label: `Yes, build it for ${candidateName}`, value: `Yes, build it for ${candidateName}.` },
        { id: "brand-different", label: "It's a different brand", value: BRAND_DIFFERENT_SENTINEL },
      ];

      await saveBrandClarification({
        conversationId: conversation.id,
        existingContext: conversation.context,
        brandClarification: onboardingName
          ? { originalPrompt: currentPrompt, tenantName: candidateName }
          : { originalPrompt: currentPrompt, siteName: candidateName },
      });

      await recordAgentMessage({
        conversationId: conversation.id,
        role: "user",
        content: {
          text: input.prompt,
          creativeDirection: input.creativeDirection,
          attachments: input.attachments.map((file) => ({ name: file.name, type: file.type, size: file.size })),
        },
        userId: input.userId,
      });

      await recordAgentMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: { text: question, status: "needs_input", actions },
      });

      input.onProgress?.("One quick check", "Confirm the brand before generation starts");

      return {
        kind: "done",
        result: {
          message: question,
          actions,
          files: [],
          revision: project.currentRevision,
          fileCount: 0,
          model: "clarification",
          status: "needs_input" as const,
        },
      };
    }
  }

  // ----------------------------------------------------------
  // STATIC VS ECOMMERCE CLARIFICATION (ask)
  //
  // Whether a request wants a content website or a transactional storefront
  // was previously decided only downstream, after a full Design Architect
  // plan already ran — real compute spent before the ambiguity was even
  // surfaced, and a wrong guess meant either an unwanted ShopEZ storefront
  // or a static site missing the checkout the user actually wanted. Ask
  // upfront, only when the prompt is genuinely ambiguous (detectCommerceIntent
  // isn't confidently one way or the other) — a clearly static request or a
  // clearly transactional one should never be interrupted by this.
  // ----------------------------------------------------------

  if (
    input.context === "Website" &&
    isFreshFullPageGeneration &&
    !pendingSiteTypeClarification &&
    existingProductCount === 0
  ) {
    const commerceIntent = detectCommerceIntent(effectivePrompt || currentPrompt);
    const isAmbiguous = commerceIntent.confidence > 0.12 && commerceIntent.confidence < 0.5;

    if (isAmbiguous) {
      const question = "Quick check before I start — should this be a static content website, or does it need an online store (product catalog, cart, checkout)?";
      const actions: V12AgentAction[] = [
        { id: "site-type-static", label: "Static website", value: SITE_TYPE_STATIC_SENTINEL },
        { id: "site-type-ecommerce", label: "Online store", value: SITE_TYPE_ECOMMERCE_SENTINEL },
      ];

      await saveSiteTypeClarification({
        conversationId: conversation.id,
        existingContext: conversation.context,
        siteTypeClarification: { originalPrompt: currentPrompt },
      });

      await recordAgentMessage({
        conversationId: conversation.id,
        role: "user",
        content: {
          text: input.prompt,
          creativeDirection: input.creativeDirection,
          attachments: input.attachments.map((file) => ({ name: file.name, type: file.type, size: file.size })),
        },
        userId: input.userId,
      });

      await recordAgentMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: { text: question, status: "needs_input", actions },
      });

      input.onProgress?.("One quick check", "Confirm the site type before generation starts");

      return {
        kind: "done",
        result: {
          message: question,
          actions,
          files: [],
          revision: project.currentRevision,
          fileCount: 0,
          model: "clarification",
          status: "needs_input" as const,
        },
      };
    }
  }

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

  const businessContextBlock = suppressAccountBusinessContext
    ? ""
    : buildBusinessContextBlock({ siteName: site.name, onboarding, settings: site.settings });

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

${businessContextBlock}
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

    if (
      !resolvingCommerceClarification &&
      designArchitectPlan.commerce.mode === "OPTIONAL" &&
      designArchitectPlan.commerce.needsClarification &&
      designArchitectPlan.commerce.clarificationQuestion.trim() &&
      designArchitectPlan.commerce.clarificationOptions.length
    ) {
      const question =
        designArchitectPlan.commerce.clarificationQuestion.trim();

      const options =
        designArchitectPlan.commerce.clarificationOptions
          .map((label) => label.trim())
          .filter(Boolean)
          .slice(0, 4);

      if (options.length) {
        const actions: V12AgentAction[] =
          options.map((label, index) => ({
            id: `commerce-clarification-${index + 1}`,
            label,
            value: label,
          }));

        commerceContext = {
          ...commerceContext,
          pendingClarification: {
            question,
            options,
            originalPrompt: effectivePrompt,
          },
          requestPrompt: effectivePrompt,
        };

        await saveCommerceContext({
          conversationId: conversation.id,
          existingContext: conversation.context,
          commerce: commerceContext,
          phase: "INTERVIEW",
        });

        await recordAgentMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: {
            text: question,
            status: "needs_input",
            actions,
          },
        });

        input.onProgress?.(
          "One choice needed",
          "Choose an option to continue generation",
        );

        return {
          kind: "done",
          result: {
            message: question,
            actions,
            files: [],
            revision: project.currentRevision,
            fileCount: 0,
            model,
            status: "needs_input" as const,
          },
        };
      }
    }

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

    if (businessContextBlock && !generationPrompt.includes(businessContextBlock)) {
      generationPrompt = `
${generationPrompt}

${businessContextBlock}
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

  const architectCommerceRequired =
    designArchitectPlan?.commerce.mode === "REQUIRED";

  /*
   * Commerce authority:
   * 0. An explicit answer to the upfront static-vs-ecommerce clarification
   *    (forcedCommerceMode) — the user resolved the ambiguity directly, so
   *    it overrules every guess below in either direction.
   * 1. Existing real ShopEZ catalogue
   * 2. Persisted commerce for an already-built website
   * 3. Semantic Design Architect (fresh generation)
   * 4. Semantic reference analysis
   *
   * Product imagery alone must never activate ShopEZ.
   */
  // A commerce choice often spans more than one request: select Online store,
  // then choose sample products or upload a catalogue. Keep the persisted
  // choice authoritative even while the project is still a fresh build.
  const isEcommerce = shouldUseCommercePipeline({
    forcedMode: forcedCommerceMode,
    existingProductCount,
    persistedIntent: commerceContext.intent,
    architectRequired: architectCommerceRequired,
    referenceDetected: referenceCommerce.isEcommerce,
  });
  const commercePrompt = isEcommerce ? buildShopezPrompt(site.slug) : "";
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
    const missingInputs =
      existingProductCount === 0
        ? catalogMissingInputs(referenceCommerce.products)
        : [];

    const catalogueReady =
      existingProductCount > 0 ||
      missingInputs.length === 0;

    if (!catalogueReady) {
      const choseSampleProducts = currentPrompt === COMMERCE_GENERATE_SAMPLES_SENTINEL;
      // Already asked in an earlier turn (phase persisted as WAITING_FOR_CATALOG)
      // and the user replied with something other than the samples pill — most
      // likely they typed/attached real catalogue details directly, or picked
      // "I'll upload my catalogue". Either way, don't ask again.
      const alreadyAsked = commerceContext.phase === "WAITING_FOR_CATALOG";

      if (choseSampleProducts) {
        input.onProgress?.(
          "Generating sample products",
          "Creating placeholder products so you can preview the storefront",
        );

        const staged = await stageExtractedProducts({
          siteId: input.siteId,
          tenantId: input.tenantId,
          siteName: site.name,
          products: buildSamplePlaceholderProducts({ siteName: site.name, currency: "USD" }),
          cropSources: [],
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
          "Sample catalogue ready",
          `${staged.createdCount} placeholder product${staged.createdCount === 1 ? "" : "s"} created — replace with your real catalogue before publishing`,
        );
      } else if (!alreadyAsked) {
        const question = "This looks like it needs a ShopEZ storefront, but there's no product catalogue yet. Want me to generate sample placeholder products so you can preview the store, or would you rather upload your real catalogue?";
        const actions: V12AgentAction[] = [
          { id: "commerce-generate-samples", label: "Generate sample products for me", value: COMMERCE_GENERATE_SAMPLES_SENTINEL },
          { id: "commerce-upload-catalog", label: "I'll upload my product catalog", value: "I'll upload my product catalog now." },
        ];

        commerceContext = {
          ...commerceContext,
          phase: "WAITING_FOR_CATALOG",
          intent: true,
          attachments: persistedAttachments,
          stagedProductIds: [],
          lastMissingInputs: missingInputs,
          requestPrompt: effectivePrompt,
        };

        await saveCommerceContext({
          conversationId: conversation.id,
          existingContext: conversation.context,
          commerce: commerceContext,
          phase: "INTERVIEW",
        });

        await recordAgentMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: { text: question, status: "needs_input", actions },
        });

        input.onProgress?.("Catalogue choice needed", "Choose sample products or upload your own catalogue");

        return {
          kind: "done",
          result: {
            message: question,
            actions,
            files: [],
            revision: project.currentRevision,
            fileCount: 0,
            model: "clarification",
            status: "needs_input" as const,
          },
        };
      } else {
        /*
         * Missing catalogue data must not block website generation.
         * Preserve commerce intent, but do not persist unverified
         * products, prices, inventory, or publish an empty catalogue.
         */
        commerceContext = {
          ...commerceContext,
          phase: "NONE",
          intent: true,
          attachments: persistedAttachments,
          stagedProductIds: [],
          lastMissingInputs: missingInputs,
          requestPrompt: effectivePrompt,
        };

        input.onProgress?.(
          "ShopEZ ready for catalogue",
          "Continuing generation without publishing unverified product data",
        );
      }
    }

    if (existingProductCount === 0 && catalogueReady) {
      input.onProgress?.(
        "Creating ShopEZ catalogue",
        "Cropping product media and staging verified catalogue fields",
      );

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

    } else if (existingProductCount > 0) {
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
    requestsCompletePageGeneration &&
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

  // Every 3D subject uses Higgsfield video -> extracted frames, including
  // prompts asking for live geometry or a model. WebGL remains an effects layer.
  let frameSequence: { frameUrls: string[] } | null = null;
  if (capabilityPlan.requires3D) {
    let heroImage = generatedMedia.find((media) => /hero|keyframe|primary|opening/i.test(media.role))
      || generatedMedia[0];
    // Edits and reference-driven requests may have no design/media plan.
    // They still need a keyframe to enter the same Higgsfield pipeline.
    if (!heroImage) {
      input.onProgress?.("Creating the 3D opening frame", "Preparing the subject for cinematic video generation");
      const keyframe = await generateSiteMedia({
        apiKey, siteId: input.siteId, tenantId: input.tenantId, userId: input.userId,
        requirements: [{
          id: "immersive-hero-keyframe", role: "cinematic hero keyframe",
          purpose: "Opening frame for the Higgsfield 3D video and scroll-driven frame sequence",
          prompt: `Create a detailed cinematic opening frame for: ${effectivePrompt}. ${designArchitectPlan?.designDirection.concept || ""}. Preserve subject identity and materials. No text or watermark.`,
          aspect: "landscape", medium: "cinematic physically based 3D render", useRequestedMedium: true,
        }],
        signal: input.signal,
      });
      generatedMedia.push(...keyframe.media);
      heroImage = keyframe.media[0];
    }
    if (!heroImage) throw new Error("The opening image for the 3D video could not be created. Please retry generation.");
    input.onProgress?.("Animating the 3D scene", "Generating a Higgsfield video and extracting frames for scroll-driven motion");
    frameSequence = await generateImmersiveFrameSequence({
      siteId: input.siteId, tenantId: input.tenantId, userId: input.userId,
      heroImageUrl: heroImage.url, subjectPrompt: heroImage.prompt || effectivePrompt, signal: input.signal,
    });
    if (input.signal.aborted) throw input.signal.reason || new Error("Generation cancelled.");
    if (!frameSequence) throw new Error("The cinematic video frames could not be prepared. Please retry generation.");
    input.onProgress?.("3D frame sequence ready", `${frameSequence.frameUrls.length} frames ready for scroll-driven playback`);
  }

  input.onProgress?.(
    "Design and research complete",
    "Continuing to code generation",
  );

  return {
    kind: "continue",
    state: {
      pageId,
      selectedPage: selectedPage
        ? {
            id: selectedPage.id,
            title: selectedPage.title,
            slug: selectedPage.slug,
            renderMode: selectedPage.renderMode,
          }
        : null,
      selectedPageRoute,
      selectedPageHasProjectRoute,
      isFreshFullPageGeneration,
      effectivePrompt,
      generationPrompt,
      capabilityPlan,
      capabilityContext,
      designArchitectPlan,
      visualSpecification,
      directReferenceInputs,
      canonicalTheme,
      generatedMedia,
      creativeDirectorSpecification,
      assetToolPlan,
      webResearchPrompt,
      isEcommerce,
      commercePrompt,
      shouldRebuildFromScratch,
      currentProject,
      currentFiles,
      hasReferenceInputs: prepared.inputs.length > 0,
      frameSequence,
    },
  };
}

/*
 * GENERATE STAGE
 *
 * Runs the single project code-generation call (plus, on an acceptance
 * failure, one bounded repair pass targeting only the failing files
 * instead of a full-project regeneration), then verifies, checkpoints
 * and commits the result. This is its own HTTP request/stage so a full
 * project generation never has to share a timeout budget with the
 * research/design/media work the plan stage already completed.
 */
export async function runV12AgentGenerate(
  state: V12PipelineState,
  input: V12AgentInput,
): Promise<V12AgentResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI is not configured.");

  const project = await getOrCreateProject(input.siteId, input.tenantId);

  const executionPolicy = resolveV12ExecutionPolicy(
    input.planCode,
    input.planFeatures,
  );
  const model = executionPolicy.models.implementation;

  const conversation = await getOrCreateAgentConversation({
    tenantId: input.tenantId,
    siteId: input.siteId,
    pageId: state.pageId,
    userId: input.userId,
  });
  let commerceContext = readCommerceContext(conversation.context);

  const {
    selectedPage,
    selectedPageRoute,
    selectedPageHasProjectRoute,
    isFreshFullPageGeneration,
    effectivePrompt,
    generationPrompt,
    capabilityPlan,
    capabilityContext,
    designArchitectPlan,
    visualSpecification,
    directReferenceInputs,
    canonicalTheme,
    generatedMedia,
    creativeDirectorSpecification,
    assetToolPlan,
    webResearchPrompt,
    isEcommerce,
    commercePrompt,
    shouldRebuildFromScratch,
    currentProject,
    currentFiles,
    hasReferenceInputs,
    frameSequence,
  } = state;

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
        video: false,
        threeD: false,
        design: hasReferenceInputs,
      })
    : [];
  if (capabilityPlan.requires3D && !frameSequence) {
    throw new Error("The cinematic video frames are missing from this build. Please restart generation to prepare them.");
  }

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
- custom-feeling iconography (see ICONOGRAPHY below)
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

ICONOGRAPHY:

Use the lucide-react library (already proven across the platform) for every interface icon: navigation, feature markers, buttons, social/contact links, list bullets, and status indicators. Import named icons (e.g. import { ArrowRight, Menu, ShoppingBag } from "lucide-react") and render them as SVG components. Do NOT use a bare Unicode/emoji character (💿, 👋, ↗, ✓, etc.) as a substitute for a real icon — emoji render inconsistently across operating systems (Windows in particular ships very limited emoji glyph coverage) and read as unfinished. Emoji are acceptable only as genuinely expressive inline content the brief explicitly calls for (e.g. a casual chat bubble), never as the icon system itself.

IMMERSIVE REQUESTS:

If the Capability Plan requires:
- 3D
- WebGL
- shaders
- parallax
- cinematic scrolling
- data visualization

implement those capabilities instead of downgrading the request to a standard landing page.

For every experience with a primary visual subject, subject fidelity is a release gate. Follow the Design Architect's subject-fidelity plan: establish the requested subject's recognizable silhouette, proportions, topology, landmark features, materials and spatial orientation before adding stylization, shaders, particles, camera motion or copy. Validate the specified desktop and mobile views. A technically polished but unrecognizable substitute is not an acceptable fallback and must be revised before completion.
${frameSequence ? `
IMMERSIVE 3D VIA PRE-RENDERED FRAME SEQUENCE:

A cinematic camera move around this experience's primary subject has already been rendered and split into ${frameSequence.frameUrls.length} sequential frames (listed below, in playback order). Use these frames as the 3D/immersive visual INSTEAD OF writing live Three.js/React Three Fiber geometry — the frame sequence already IS the 3D experience, and the live-3D bullets under IMMERSIVE ACCEPTANCE CONTRACT below do not apply to this subject.

The frame URLs are already provided for you in a generated module — DO NOT type, copy, or invent the URLs yourself anywhere in your code:

\`\`\`
import { HIGGSFIELD_FRAME_URLS } from "./higgsfieldFrames";
\`\`\`

That module exports \`HIGGSFIELD_FRAME_URLS: string[]\`, exactly ${frameSequence.frameUrls.length} URLs in playback order. Do not redeclare, hardcode, or partially retype this array anywhere — always import and use it by reference.

Implement a scroll-scrubbed frame-sequence component:
- Import HIGGSFIELD_FRAME_URLS from "./higgsfieldFrames" and preload every frame image it contains.
- Render them onto a single <canvas> element sized to fill its section.
- Map scroll progress within that section (0 to 1) to a frame index (0 to HIGGSFIELD_FRAME_URLS.length - 1) and draw the corresponding frame via drawImage(), replacing the previous draw — never stack, cross-fade, or animate multiple <img> elements instead.
- The mapping must feel like scrubbing through the camera move: smooth, monotonic, and updated every frame the user scrolls (requestAnimationFrame or a scroll listener), not a fixed-duration CSS/video autoplay.
- Respect prefers-reduced-motion by holding on one representative frame instead of scrubbing.
- Do NOT add @react-three/fiber, three, an R3F <Canvas>, or hand-authored WebGL geometry for this subject.
` : ""}
IMMERSIVE ACCEPTANCE CONTRACT:
${frameSequence ? "\nThe live-3D bullets below do not apply to the subject covered by the pre-rendered frame sequence above; they still apply to any OTHER 3D/WebGL capability the Capability Plan requires.\n" : ""}
- A full-screen shader plane, animated gradient, particle background, CSS perspective decoration, or ordinary reveal animation does not count as a 3D scene.
- When 3D is required, implement a perspective 3D scene with a recognizable subject/model and scroll-directed camera or object choreography.
- When multiple camera views are requested, define at least three distinct camera positions and look targets, then interpolate between them from real scroll progress.
- Parallax requires simultaneous spatial separation, not one image drifting vertically. Implement at least three concurrent foreground/subject/background depth planes with distinct scroll transforms, or a scroll-driven perspective camera with visibly changing depth.
- Mark DOM depth planes with data-buildez-depth-layer="foreground|subject|background|..." so the generated experience can be verified. Use at least three distinct values.
- Preserve the realistic primary subject while adding depth. Do not trade subject fidelity for primitive real-time geometry.
- For multi-camera journeys, derive an activeScene/activeShot from scroll progress and isolate bounded scene sets. Render or reveal only the active set and its immediate transition neighbor; never keep every set globally visible.
- Keep every scene inside its own spatial bounds. Do not use giant rings, slabs, floors, particle clouds, or other primitives that cross unrelated camera frustums.
- Inspect the opening frame, every camera-transition midpoint, and the final frame. Reject clipping, black occluders, unfinished backsides, empty darkness, and geometry larger than its intended set.
- Never use random solid-color primitives as the primary 3D visual. Unless the ORIGINAL USER REQUEST explicitly asks for low-poly, wireframe, clay, flat-shaded, solid-color, untextured, or geometric-abstraction art, visible 3D subject surfaces must use a textured GLTF/GLB or physically detailed color/albedo, normal, roughness, metalness and ambient-occlusion maps. A single color, gradient or glow is not a detailed material.
- Limit untextured materials to a few thin emissive light strips or clearly structural accents. Do not use plain boxes, spheres, rings, slabs or particles as filler.

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
- never nest a position: fixed element (site header, sticky nav, floating CTA, cookie banner, etc.) inside a container that GSAP/ScrollTrigger pins or applies a scroll-driven transform/translate to. WebKit (Safari and iOS Safari) makes a transformed ancestor the containing block for its fixed-position descendants — instead of the real viewport — so the "fixed" element collapses into that ancestor's small transformed box rather than staying full-screen. This bug is invisible on Chrome/Android, which is why it must be avoided by construction: render fixed-position chrome as a sibling OUTSIDE the pinned/transformed scroll wrapper (e.g. a direct child of the page root, positioned after or alongside the scroll container in the DOM), never inside it.

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
- When imageStyle is "Photorealistic", the generated cinematic hero keyframe MUST be visible in the primary page/hero composition at useful opacity. It may not exist only in a WebGL fallback.
- In a photorealistic immersive build, use the generated render as the realism layer and bounded 3D as spatial enhancement. Do not cover the approved render with dark primitive geometry, global sparkles, or random parallax decoration.
- A dark color mood still requires readable material separation, visible surfaces, controlled highlights, and a complete default frame. Darkness may not conceal unfinished geometry.


CURRENT PROJECT:
${currentProject}

Return JSON only: {"message":"specific completion summary","files":[{"path":"package.json","content":"..."},{"path":"index.html","content":"..."},{"path":"src/main.tsx","content":"..."}, ...]}. Return a complete runnable Vite React TypeScript project, never patches or markdown. Required: package.json, index.html, src/main.tsx, src/buildez.theme.json, and src/buildez.pages.json. ${
  shouldRebuildFromScratch
    ? "For this FULL REBUILD, create a new canonical site theme from the Design Architect specification and implement that new theme as CSS custom properties in one shared theme stylesheet. Do not reproduce the previous visual system."
    : "Treat the canonical site theme as the source of truth: implement it as CSS custom properties in one shared theme stylesheet and consume those variables everywhere."
} Every route must render the same reusable SiteShell, Header, and Footer rather than restyling them per page. Never use Unsplash, remote stock-photo URLs, or random image services. Use only supplied media, generated media URLs, ShopEZ product images, or deliberate CSS art. Keep dependencies purposeful rather than artificially minimal. The generated project's package.json MUST include every library actually used by its source code. When the Experience Architect calls for advanced capabilities, install the appropriate dependencies in the GENERATED PROJECT rather than pretending to implement them with generic CSS. Examples include a 2D canvas drawing supplied Higgsfield video frames for 3D subjects, optional three for supporting WebGL effects, gsap for sophisticated scroll choreography, and suitable visualization libraries for genuine data-driven experiences. Do not add these dependencies when the requested experience does not need them. Prefer reusable component/data architecture, but never simplify away required visual richness, imagery, backgrounds, motion, interaction, iconography, 3D, shaders, parallax or composition merely to reduce code size. Produce polished responsive UI and keep repeated markup concise.

BUILDEZ 3D DELIVERY POLICY (applies even when the user asks for a 3D model, GLB/GLTF, Three.js or real-time 3D):
All 3D subject experiences use a Higgsfield-generated video extracted into frames, rendered on a scroll-scrubbed 2D canvas. Never generate a live subject mesh or request Meshy/Spline/model assets. WebGL/shaders/particles remain allowed for basic supporting animations and effects; they must not replace the supplied frame sequence. The verified frame canvas satisfies the subject, camera-view and spatial-depth requirements above. Use the supplied sequence whenever present, preserve prefers-reduced-motion, and keep a representative supplied hero image as a loading/error poster.`;
  const generationContent = [
    ...directReferenceInputs,
    { type: "input_text", text: generationText },
  ];
  const generationBody = (
    reasoningEffort: "low" | "medium",
    maxOutputTokens: number,
    correction?: string,
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
    input: [{
      role: "user",
      content: correction
        ? [...generationContent, { type: "input_text", text: correction }]
        : generationContent,
    }],
    ...(externalCreativeTools.length
      ? {
          tools: externalCreativeTools,
          tool_choice: "auto",
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
  let parsedResult: ReturnType<typeof parseResult>;
  try {
    if (isIncompleteResponse(payload)) {
      throw new TruncatedResponseError(
        "The generated project response was cut off before it finished.",
      );
    }
    parsedResult = parseResult(outputText(payload), input.mode === "auto");
  } catch (error) {
    // A missing required file (package.json/index.html/src/main.tsx) is
    // usually a one-off compliance slip, not a fundamental misunderstanding
    // of the request — worth one corrective retry before failing the whole
    // turn and burning the user's credits on it. A truncated response
    // (the model hit its output budget before finishing, most common on
    // large multi-page/immersive builds) is retried with a larger budget
    // and a lighter reasoning effort so more of it goes to visible output.
    // Any other parse/validation error (invalid JSON for a reason other
    // than truncation, empty file set, forbidden path) is not something a
    // repeat of the same prompt is likely to fix, so it still fails fast.
    const isMissingFile = error instanceof Error && /^Preview project is missing /.test(error.message);
    const isTruncated = error instanceof TruncatedResponseError;
    if (input.signal.aborted || !(isMissingFile || isTruncated)) {
      throw error;
    }
    input.onProgress?.(
      isTruncated ? "Retrying — the response was cut off" : "Retrying — the response was missing a required file",
      error instanceof Error ? error.message : undefined,
    );
    payload = await requestOpenAiResponse({
      apiKey,
      body: generationBody(
        "low",
        isTruncated ? 32_000 : 18_000,
        isTruncated
          ? "Your previous response was cut off before it finished and could not be used. Return the COMPLETE project again, including every required file (package.json, index.html, src/main.tsx, src/buildez.theme.json, src/buildez.pages.json) and every other project file. Keep component implementations focused and avoid unnecessary verbosity so the full response fits within the output budget."
          : `Your previous response was rejected: ${error instanceof Error ? error.message : "invalid response"}. Return the COMPLETE project again, including every required file (package.json, index.html, src/main.tsx, src/buildez.theme.json, src/buildez.pages.json) and every other file from the project, not just the ones you changed.`,
      ),
      signal: input.signal,
      timeoutMs: 165_000,
    });
    if (isIncompleteResponse(payload)) {
      throw new Error(
        "This project is too large to generate in one pass right now. Try a simpler request, fewer pages, or a less complex design, then generate again.",
      );
    }
    parsedResult = parseResult(outputText(payload), input.mode === "auto");
  }
  parsedResult = { ...parsedResult, files: withHiggsfieldFrames(parsedResult.files, frameSequence) };
  const photorealisticPrimaryMediaUrls = input.creativeDirection.imageStyle === "Photorealistic"
    ? generatedMedia
        .filter((media) => /hero|keyframe|primary|opening/i.test(media.role))
        .map((media) => media.url)
    : [];
  const checkAcceptance = () => immersiveAcceptanceFailures(parsedResult.files, capabilityPlan, {
    requiresExternalModel: false,
    requiresMultipleCameraViews: requiresMultipleCameraViews(effectivePrompt),
    photorealisticPrimaryMediaUrls,
    allowUntexturedGeometry: allowsUntextured3DGeometry(effectivePrompt),
    hasFrameSequence3D: Boolean(frameSequence),
    frameSequenceUrls: frameSequence?.frameUrls,
    requiresCinematicNarrative:
      input.creativeDirection.experienceType === "Immersive 3D / cinematic" ||
      designArchitectPlan?.experience === "CINEMATIC" ||
      capabilityPlan.capabilities.includes("PARALLAX"),
  });
  let acceptanceFailures = checkAcceptance();
  // Targeted repair instead of a full-project regeneration: the model
  // already produced a complete, mostly-correct project, so send it back
  // only that project plus the specific failures and ask for the files
  // that must change. This is both faster (much smaller max_output_tokens
  // than a full rebuild) and safer (files unrelated to the failure are
  // never touched, so a repair pass can't reintroduce a different
  // regression elsewhere in the site).
  //
  // A generation must never dead-end in a user-visible failure over this —
  // the acceptance bar (cinematic depth, parallax, etc.) is a quality gate,
  // not a hard requirement the model is guaranteed to satisfy on the first
  // try, and the classifier upstream can call for it even on briefs that
  // barely touch motion. So this retries a bounded number of times with
  // progressively plainer, more explicit instructions, and if it still
  // hasn't converged, ships the best build produced rather than failing
  // the job — a working site that's a little short on cinematic flourish
  // beats no site at all.
  // Kept to 2: each repair call can run up to 165s, and this whole
  // generate stage shares a single 9-minute job budget (see
  // SAFE_GENERATION_BUDGET_MS in the agent/run route) with the initial
  // generation call that already ran before this loop starts.
  const MAX_ACCEPTANCE_REPAIR_ATTEMPTS = 2;
  for (let attempt = 1; parsedResult.files.length && acceptanceFailures.length && attempt <= MAX_ACCEPTANCE_REPAIR_ATTEMPTS; attempt += 1) {
    input.onProgress?.(
      "Working on your website",
      "This is taking a little longer than expected — refining the build now",
    );
    const repairText = `You are BuildEZ. REPAIR PASS ${attempt} of ${MAX_ACCEPTANCE_REPAIR_ATTEMPTS}.

The following project was just generated but failed acceptance checks. Treat it as the current state of the project.

${parsedResult.files.map((file) => `--- ${file.path} ---\n${file.content}`).join("\n\n")}

${frameSequence ? `The 3D subject MUST use a scroll-scrubbed 2D canvas drawing frames imported from "./higgsfieldFrames" (\`import { HIGGSFIELD_FRAME_URLS } from "./higgsfieldFrames"\` — that module already exists with the correct ${frameSequence.frameUrls.length} URLs; do not type, copy, or invent the URLs yourself). No live model integration is required or permitted for the subject. WebGL is allowed only for supporting effects.` : ""}

ACCEPTANCE FAILURES TO FIX:
${acceptanceFailures.map((failure) => `- ${failure}`).join("\n")}
${attempt > 1 ? "\nA previous repair attempt for these same failures was insufficient. Be concrete and literal: implement the exact mechanism described (e.g. a real scroll-driven transform on a real element with real depth values), not a stylistic approximation of it." : ""}

Return ONLY the files that must change to fix these specific failures. Do not resend files that are already correct, and do not rewrite unrelated pages, sections, or content. Preserve all working functionality, styling, and content exactly as implemented except where a change is required to fix a listed failure.

Return JSON only: {"message":"specific fix summary","files":[{"path":"...","content":"..."}]}.`;
    payload = await requestOpenAiResponse({
      apiKey,
      body: {
        model,
        reasoning: { effort: "low" },
        max_output_tokens: 16_000,
        text: {
          format: {
            type: "json_schema",
            name: "buildez_agent_result",
            strict: true,
            schema: projectSchema,
          },
        },
        input: [{ role: "user", content: [{ type: "input_text", text: repairText }] }],
      },
      signal: input.signal,
      timeoutMs: 165_000,
    });
    if (isIncompleteResponse(payload)) {
      // A cut-off repair response is not itself an acceptance failure —
      // keep the last good build and let the loop retry or exit cleanly.
      continue;
    }
    const repaired = parseResult(outputText(payload), true, parsedResult.files);
    parsedResult = { ...repaired, files: withHiggsfieldFrames(repaired.files, frameSequence) };
    acceptanceFailures = checkAcceptance();
  }
  if (acceptanceFailures.length) {
    console.error(`[V12 generation] shipping build despite unresolved acceptance failures after ${MAX_ACCEPTANCE_REPAIR_ATTEMPTS} repair attempts:`, acceptanceFailures);
  }
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
    files: normalizeGeneratedProjectFiles(ensureActiveWebsitePageRoute({
      files: resultWithDurableAssets.files,
      context: input.context,
      selectedPage: selectedPage ?? undefined,
    })),
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
      isEcommerce,
    });

    // Keep a named snapshot of every completed generation. The pre-mutation
    // checkpoint above protects the previous design; this one makes the new
    // result itself easy to identify and restore from Version history.
    const promptName = input.prompt.replace(/\s+/g, " ").trim();
    const shortenedPromptName = promptName.length > 96
      ? `${promptName.slice(0, 93).trimEnd()}...`
      : promptName;
    try {
      await createProjectCheckpoint({
        siteId: input.siteId,
        tenantId: input.tenantId,
        userId: input.userId,
        label: `AI generation - ${shortenedPromptName || "Generated website"}`,
      });
    } catch (checkpointError) {
      // The generated project is already committed; a history-write problem
      // must not turn a successful generation into a failed user request.
      console.error("[AI generation] named checkpoint could not be created", checkpointError);
    }
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
