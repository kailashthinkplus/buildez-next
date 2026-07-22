import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import { logBuilderDebug } from "../../debug/blueprintDebug";
import type { V9Workflow } from "./types";

type ImageTarget = {
  nodeId: string;
  kind: "image" | "background";
  prompt: string;
};

type ImageProvider = "auto" | "openai" | "flux" | "magnific";
type ImageFallbackSource =
  | "research"
  | "unsplash"
  | "generated"
  | "openai"
  | "none";

const MAGNIFIC_ENDPOINT = "https://api.freepik.com/v1/ai/text-to-image";
const OPENAI_IMAGES_ENDPOINT = "https://api.openai.com/v1/images/generations";
const UNSPLASH_SEARCH_ENDPOINT = "https://api.unsplash.com/search/photos";
const DEFAULT_IMAGE_PROVIDER: ImageProvider = "auto";
const DEFAULT_MAGNIFIC_TEXT_TO_IMAGE_ENABLED = true;
const DEFAULT_MAGNIFIC_ENHANCE_ENABLED = false;
const DEFAULT_IMAGE_GENERATION_TIMEOUT_MS = 75_000;
const DEFAULT_PAID_IMAGE_GENERATION_ENABLED = true;
const DEFAULT_MAX_GENERATED_IMAGES = 3;
const DEFAULT_IMAGE_AGENT_TIMEOUT_MS = 100_000;
const DEFAULT_GENERATED_IMAGE_FALLBACK_ENABLED = true;
const DEFAULT_UNSPLASH_SEARCH_TIMEOUT_MS = 5_000;

const ARCHITECTURE_POSITIVE_PROFILE = [
  "professional architectural photography",
  "natural daylight",
  "realistic Indian real-estate environment",
  "accurate white balance",
  "soft shadows",
  "true-to-life colors",
  "realistic material texture",
  "neutral editorial color grading",
  "no HDR look",
  "no CGI render",
];

const ARCHITECTURE_NEGATIVE_PROMPT = [
  "text",
  "watermark",
  "logo",
  "blurry",
  "low quality",
  "distorted faces",
  "fake UI text",
  "placeholder",
  "stock vector",
  "flat vector",
  "illustration",
  "cartoon",
  "clipart",
  "oversaturated greens",
  "blown highlights",
  "HDR",
  "high contrast",
  "neon colors",
  "yellow tint",
  "blue tint",
  "orange cast",
  "CGI",
  "3D render",
  "fake luxury villa",
  "unrealistic architecture",
  "artificial sharpening",
  "overprocessed real estate photo",
];

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function envFlag(value: string | undefined, fallback: boolean) {
  if (typeof value !== "string" || !value.trim()) return fallback;
  return /^(1|true|yes|on)$/i.test(value.trim());
}

function envNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function timeoutError(message: string) {
  const error = new Error(message);
  error.name = "TimeoutError";
  return error;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(timeoutError(message)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

function imageProvider(): ImageProvider {
  const raw = process.env.IMAGE_PROVIDER?.trim().toLowerCase();

  if (raw === "freepik") {
    return "magnific";
  }

  if (
    raw === "auto" ||
    raw === "flux" ||
    raw === "magnific" ||
    raw === "openai"
  ) {
    return raw;
  }

  return DEFAULT_IMAGE_PROVIDER;
}

function magnificApiKey() {
  return (
    process.env.MAGNIFIC_API_KEY?.trim() ||
    process.env.FREEPIK_API_KEY?.trim() ||
    ""
  );
}

function fallbackSources(): ImageFallbackSource[] {
  const raw = process.env.IMAGE_FALLBACK_ORDER?.trim();
  const values = raw
    ? raw.split(",").map((item) => item.trim().toLowerCase())
    : ["research", "unsplash", "generated"];

  const allowed = new Set(["research", "unsplash", "generated", "openai", "none"]);
  const sources = values.filter((item): item is ImageFallbackSource =>
    allowed.has(item)
  );

  return sources.length ? sources : ["research", "unsplash", "generated"];
}

function logImageOutput(input: {
  provider: ImageProvider;
  workflow: V9Workflow;
  originalPrompt: string;
  finalPrompt: string;
  negativePrompt: string;
  size: string;
  aspectRatio: string;
  responseType: string;
  outputUrl: string;
}) {
  logBuilderDebug("ai-v9:image-generation-output", {
    provider: input.provider,
    pageId: input.workflow.pageId,
    siteId: input.workflow.siteId,
    originalPrompt: input.originalPrompt,
    finalPrompt: input.finalPrompt,
    negativePrompt: input.negativePrompt,
    size: input.size,
    aspectRatio: input.aspectRatio,
    responseType: input.responseType,
    outputUrl: input.outputUrl,
  });
}

function hasInvalidImageUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return true;
  return /(?:example|placeholder|placehold|dummy|invalid|test)/i.test(value);
}

function hasForbiddenImageReference(value: unknown) {
  return (
    typeof value === "string" &&
    /(?:example|placeholder|placehold|dummy|invalid|test)/i.test(value)
  );
}

function collectResearchImageUrls(workflow: V9Workflow) {
  const urls = new Set<string>();
  const researchImages = isRecord(workflow.research)
    ? workflow.research.images
    : null;

  if (Array.isArray(researchImages)) {
    researchImages.forEach((url) => {
      if (typeof url === "string" && !hasInvalidImageUrl(url)) {
        urls.add(url);
      }
    });
  }

  const logoUrl = workflow.brandResolution?.logoUrl || workflow.brandContext?.logoUrl;
  if (typeof logoUrl === "string" && !hasInvalidImageUrl(logoUrl)) {
    urls.add(logoUrl);
  }

  const seenAssetKeys = new Set<string>();

  return Array.from(urls)
    .filter((url) => imageAssetScore(url) > -10)
    .sort((a, b) => imageAssetScore(b) - imageAssetScore(a))
    .filter((url) => {
      const key = imageAssetKey(url);
      if (seenAssetKeys.has(key)) return false;
      seenAssetKeys.add(key);
      return true;
    });
}

function imageAssetScore(url: string) {
  const lower = url.toLowerCase();
  let score = 0;

  if (/project|banner|hero|villa|apartment|residential|gallery|home|arcadia|meadows|celeste|azanya|heritage|aurum|adwaith/i.test(lower)) {
    score += 30;
  }
  if (/logo|icon|favicon|spinner|loader|placeholder|dummy|blank|svg/i.test(lower)) {
    score -= 80;
  }
  if (/bg\d|background|pattern|texture|thumbnail|thumb|cropped/i.test(lower)) {
    score -= 22;
  }
  if (/\.(?:jpe?g|webp)(?:[?#].*)?$/i.test(lower)) score += 8;
  if (/\.(?:png)(?:[?#].*)?$/i.test(lower)) score -= 3;
  if (/wp-content\/uploads|nitrocdn/i.test(lower)) score += 5;

  return score;
}

function imageAssetKey(url: string) {
  try {
    const parsed = new URL(url);
    const normalized = parsed.pathname
      .toLowerCase()
      .replace(/.*wp-content\/uploads\//, "")
      .replace(/-\d+x\d+(?=\.(?:jpe?g|png|webp)$)/i, "");

    return normalized || parsed.pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function getBrandName(workflow: V9Workflow) {
  const resolved = workflow.brandResolution?.companyName;
  const context = workflow.brandContext?.companyName;

  return typeof resolved === "string" && resolved.trim()
    ? resolved.trim()
    : typeof context === "string" && context.trim()
      ? context.trim()
      : "";
}

function getIndustry(workflow: V9Workflow) {
  const resolved = workflow.brandResolution?.industry;
  const intent = workflow.intent?.industry;
  const context = workflow.brandContext?.industry;

  return typeof resolved === "string" && resolved.trim()
    ? resolved.trim()
    : typeof intent === "string" && intent.trim()
      ? intent.trim()
      : typeof context === "string" && context.trim()
        ? context.trim()
        : "business";
}

function getLocation(workflow: V9Workflow) {
  const resolved = workflow.brandResolution?.location;
  const context = workflow.brandContext?.location;

  return typeof resolved === "string" && resolved.trim()
    ? resolved.trim()
    : typeof context === "string" && context.trim()
      ? context.trim()
      : "";
}

function promptForNode(
  node: BuilderNode,
  workflow: V9Workflow,
  kind: "image" | "background"
) {
  const props = node.props || {};
  const explicit =
    props.aiImagePrompt ||
    props.imagePrompt ||
    props.backgroundPrompt ||
    props.prompt;

  const brandName = getBrandName(workflow);
  const industry = getIndustry(workflow);
  const location = getLocation(workflow);
  const page = workflow.pageTitle || workflow.siteName || "business website";
  const alt = typeof props.alt === "string" ? props.alt : "";

  if (typeof explicit === "string" && explicit.trim().length > 16) {
    return [
      explicit.trim(),
      brandName && `business context: ${brandName}`,
      industry && `industry context: ${industry}`,
      location && `location context: ${location}`,
      "realistic editorial commercial photograph",
      "natural daylight, true-to-life colors, no artificial brand color overlay",
      "no text, no watermark, no logo, no illustration, no vector, no CGI",
    ]
      .filter(Boolean)
      .join(", ");
  }

  if (kind === "background") {
    return [
      page,
      brandName && `business context: ${brandName}`,
      industry && `industry context: ${industry}`,
      location && `location context: ${location}`,
      "realistic editorial website hero photograph",
      "real environment, natural daylight, believable materials",
      "wide angle composition, premium camera lens, realistic depth of field",
      "no fantasy luxury villa, no CGI, no 3D render, no illustration, no text",
    ]
      .filter(Boolean)
      .join(", ");
  }

  return [
    alt || page,
    brandName && `business context: ${brandName}`,
    industry && `industry context: ${industry}`,
    location && `location context: ${location}`,
    "realistic editorial commercial photograph",
    "real environment, natural daylight, true-to-life colors",
    "professional camera lens, sharp focus, realistic depth of field",
    "no vector, no illustration, no CGI, no 3D render, no text, no watermark",
  ]
    .filter(Boolean)
    .join(", ");
}

function wantsNonPhotoStyle(prompt: string) {
  const normalized = prompt
    .replace(/\bno\s+(?:vector|illustration|icon|icons|3d render|cgi|cartoon|anime|line art|flat design|isometric|watercolor|sketch)s?\b/gi, " ")
    .replace(/\bwithout\s+(?:vector|illustration|icon|icons|3d render|cgi|cartoon|anime|line art|flat design|isometric|watercolor|sketch)s?\b/gi, " ");

  return /\b(?:illustration|vector|icon|3d render|cartoon|anime|line art|flat design|isometric|watercolor|sketch)\b/i.test(
    normalized
  );
}

function shouldSkipPhotoHydration(prompt: string) {
  const normalized = prompt
    .replace(/\bno\s+(?:text,\s*)?logos?\b/gi, " ")
    .replace(/\bwithout\s+(?:text\s+or\s+)?logos?\b/gi, " ");

  return (
    wantsNonPhotoStyle(prompt) ||
    /\b(?:logo of|press logo|award badge|newspaper masthead|magazine masthead|vector mark)\b/i.test(
      normalized
    )
  );
}

function architecturePromptProfile(prompt: string, workflow: V9Workflow) {
  if (wantsNonPhotoStyle(prompt)) {
    return {
      finalPrompt: [
        prompt,
        "clean premium website asset",
        "balanced composition",
        "no text, no watermark",
        "avoid yellow color cast unless explicitly requested",
        "avoid fake gradients and artificial brand color filters",
      ].join(", "),
      negativePrompt: ARCHITECTURE_NEGATIVE_PROMPT.join(", "),
    };
  }

  const companyName = getBrandName(workflow);
  const industry = getIndustry(workflow);
  const location = getLocation(workflow);

  return {
    finalPrompt: [
      ...ARCHITECTURE_POSITIVE_PROFILE,
      "Photorealistic editorial commercial photography",
      "real location, real materials, realistic architecture or environment",
      "no artificial brand color overlay, no heavy color filter",
      "premium website visual, professional camera lens, realistic depth of field",
      companyName && `business context: ${companyName}`,
      industry && `industry context: ${industry}`,
      location && `location context: ${location}`,
      prompt,
      "no text, no watermark, no logos, no icons",
    ]
      .filter(Boolean)
      .join(", "),
    negativePrompt: ARCHITECTURE_NEGATIVE_PROMPT.join(", "),
  };
}

function collectImageTargets(
  blueprint: BuilderBlueprint,
  workflow: V9Workflow
): ImageTarget[] {
  const targets: ImageTarget[] = [];
  const targetedNodeIds = new Set<string>();

  function addTarget(target: ImageTarget) {
    if (targetedNodeIds.has(target.nodeId)) return;
    if (shouldSkipPhotoHydration(target.prompt)) {
      logBuilderDebug("ai-v9:image-target-skipped", {
        nodeId: target.nodeId,
        kind: target.kind,
        reason: "non_photo_or_logo_prompt",
        prompt: target.prompt,
      });
      return;
    }
    targetedNodeIds.add(target.nodeId);
    targets.push(target);
  }

  Object.values(blueprint.nodes).forEach((node) => {
    if (node.type === "image") {
      const src = node.props?.src;

      if (
        hasInvalidImageUrl(src) ||
        node.props?.aiImagePrompt ||
        node.props?.imagePrompt
      ) {
        addTarget({
          nodeId: node.id,
          kind: "image",
          prompt: promptForNode(node, workflow, "image"),
        });
      }
    }

    const backgroundImage = node.style?.backgroundImage;

    if (
      typeof backgroundImage === "string" &&
      (/url\(/i.test(backgroundImage) || /ai-image:/i.test(backgroundImage)) &&
      hasForbiddenImageReference(backgroundImage)
    ) {
      addTarget({
        nodeId: node.id,
        kind: "background",
        prompt: promptForNode(node, workflow, "background"),
      });
    }

    if (typeof node.props?.backgroundPrompt === "string") {
      addTarget({
        nodeId: node.id,
        kind: "background",
        prompt: promptForNode(node, workflow, "background"),
      });
    }
  });

  if (targets.length < 4) {
    const root = blueprint.nodes[blueprint.root];
    const sectionIds = root?.children || [];
    const sections = sectionIds
      .map((id) => blueprint.nodes[id])
      .filter((node): node is BuilderNode => Boolean(node) && node.type === "section");

    sections.forEach((section) => {
      if (targets.length >= 4) return;
      if (targetedNodeIds.has(section.id)) return;

      const backgroundImage = section.style?.backgroundImage;
      const hasRealImage =
        typeof backgroundImage === "string" &&
        /url\(/i.test(backgroundImage) &&
        !hasForbiddenImageReference(backgroundImage);

      if (hasRealImage) return;

      addTarget({
        nodeId: section.id,
        kind: "background",
        prompt: promptForNode(section, workflow, "background"),
      });
    });
  }

  return targets.slice(0, 8);
}

function extractBase64(json: any): string | null {
  const candidates = [
    json?.data?.[0]?.b64_json,
    json?.data?.[0]?.base64,
    json?.data?.image,
    json?.image,
    json?.images?.[0]?.base64,
  ];

  const found = candidates.find(
    (item) => typeof item === "string" && item.length > 100
  );

  return found ? found.replace(/^data:image\/\w+;base64,/, "") : null;
}

function extractUrl(json: any): string | null {
  const candidates = [
    json?.data?.[0]?.url,
    json?.data?.[0]?.image_url,
    json?.data?.image_url,
    json?.url,
    json?.images?.[0]?.url,
  ];

  const found = candidates.find(
    (item) => typeof item === "string" && /^https:\/\//i.test(item)
  );

  return found || null;
}

async function pollMagnificTask(
  taskId: string,
  apiKey: string
): Promise<string | null> {
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const res = await fetch(`${MAGNIFIC_ENDPOINT}/${taskId}`, {
      headers: {
        Accept: "application/json",
        "x-magnific-api-key": apiKey,
        "x-freepik-api-key": apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) continue;

    const json = await res.json();
    const base64 = extractBase64(json);
    const url = extractUrl(json);

    if (base64) return `data:image/jpeg;base64,${base64}`;
    if (url) return url;
  }

  return null;
}

async function uploadBase64ToR2(base64: string, workflow: V9Workflow) {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return `data:image/jpeg;base64,${base64}`;
  }

  const r2 = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const key = `ai-v9/${workflow.siteId}/${Date.now()}-${crypto.randomUUID()}.jpg`;

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(base64, "base64"),
      ContentType: "image/jpeg",
    })
  );

  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

async function generatePrimaryImage(prompt: string, workflow: V9Workflow) {
  const provider = imageProvider();

  if (provider === "auto") {
    if (magnificApiKey()) {
      return generateMagnificTextToImage(prompt, workflow);
    }

    return generateOpenAIImage(prompt, workflow);
  }

  if (provider === "flux") {
    return generateFluxImage(prompt, workflow);
  }

  if (provider === "magnific") {
    if (
      !envFlag(
        process.env.MAGNIFIC_TEXT_TO_IMAGE_ENABLED,
        DEFAULT_MAGNIFIC_TEXT_TO_IMAGE_ENABLED
      )
    ) {
      throw new Error(
        "Magnific text-to-image is disabled. Set MAGNIFIC_TEXT_TO_IMAGE_ENABLED=true to use IMAGE_PROVIDER=magnific."
      );
    }

    return generateMagnificTextToImage(prompt, workflow);
  }

  return generateOpenAIImage(prompt, workflow);
}

async function generateOpenAIImage(prompt: string, workflow: V9Workflow) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const { finalPrompt, negativePrompt } = architecturePromptProfile(prompt, workflow);
  const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
  const size = process.env.OPENAI_IMAGE_SIZE?.trim() || "1536x1024";

  logBuilderDebug("ai-v9:image-generation-request", {
    provider: "openai",
    siteId: workflow.siteId,
    pageId: workflow.pageId,
    originalPrompt: prompt,
    finalPrompt,
    negativePrompt,
    size,
    aspectRatio: size === "1536x1024" ? "3:2" : "provider-default",
  });

  const res = await fetch(OPENAI_IMAGES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: `${finalPrompt}\n\nAvoid: ${negativePrompt}`,
      size,
      n: 1,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`OpenAI image API error ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const url = extractUrl(json);
  const base64 = extractBase64(json);

  logBuilderDebug("ai-v9:image-generation-response", {
    provider: "openai",
    pageId: workflow.pageId,
    responseType: url ? "url" : base64 ? "base64" : "unknown",
    outputUrl: url || null,
    hasBase64: Boolean(base64),
    keys: isRecord(json) ? Object.keys(json) : [],
  });

  if (url && !hasInvalidImageUrl(url)) {
    const outputUrl = await enhanceWithMagnific(url, workflow);
    logImageOutput({
      provider: "openai",
      workflow,
      originalPrompt: prompt,
      finalPrompt,
      negativePrompt,
      size,
      aspectRatio: size === "1536x1024" ? "3:2" : "provider-default",
      responseType: "url",
      outputUrl,
    });
    return outputUrl;
  }
  if (base64) {
    const outputUrl = await enhanceWithMagnific(
      await uploadBase64ToR2(base64, workflow),
      workflow
    );
    logImageOutput({
      provider: "openai",
      workflow,
      originalPrompt: prompt,
      finalPrompt,
      negativePrompt,
      size,
      aspectRatio: size === "1536x1024" ? "3:2" : "provider-default",
      responseType: "base64",
      outputUrl,
    });
    return outputUrl;
  }

  throw new Error("OpenAI image API did not return image data");
}

async function generateFluxImage(prompt: string, workflow: V9Workflow) {
  const { finalPrompt, negativePrompt } = architecturePromptProfile(prompt, workflow);

  logBuilderDebug("ai-v9:image-generation-request", {
    provider: "flux",
    siteId: workflow.siteId,
    pageId: workflow.pageId,
    originalPrompt: prompt,
    finalPrompt,
    negativePrompt,
    size: "landscape",
    aspectRatio: "provider-placeholder",
  });

  throw new Error("Flux image provider is not configured yet.");
}

function unsplashQuery(prompt: string, workflow: V9Workflow) {
  const industry = getIndustry(workflow);
  const location = getLocation(workflow);
  const cleanedPrompt = prompt
    .replace(/\bno\s+[^,.]+/gi, " ")
    .replace(/\b(?:cgi|render|watermark|logo|text|vector|illustration|hdr)\b/gi, " ")
    .replace(/[^a-z0-9\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const domainTerms =
    /real estate|property|developer|construction|architecture/i.test(
      `${industry} ${prompt}`
    )
      ? "architecture real estate home exterior interior"
      : `${industry} editorial website photography`;

  return [cleanedPrompt, location, domainTerms]
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .slice(0, 16)
    .join(" ");
}

function unsplashFallbackQueries(
  prompt: string,
  workflow: V9Workflow,
  target: ImageTarget
) {
  const location = getLocation(workflow) || "Bangalore";
  const industry = getIndustry(workflow);
  const lower = `${prompt} ${target.nodeId}`.toLowerCase();
  const specific = unsplashQuery(prompt, workflow);
  const queries = [specific];

  if (/interior|apartment|living|furnish|finish/.test(lower)) {
    queries.push(
      `${location} apartment interior`,
      "modern apartment interior India",
      "luxury apartment living room"
    );
  } else if (/commercial|office|business/.test(lower)) {
    queries.push(
      `${location} commercial building`,
      "modern office building India",
      "commercial architecture exterior"
    );
  } else if (/aerial|skyline|location|city/.test(lower)) {
    queries.push(`${location} skyline`, "Bangalore city architecture", "urban skyline India");
  } else {
    queries.push(
      `${location} apartment building exterior`,
      "modern residential building India",
      `${industry} architecture exterior`,
      "contemporary home exterior"
    );
  }

  return Array.from(new Set(queries.map((query) => query.trim()).filter(Boolean))).slice(
    0,
    4
  );
}

function resizedUnsplashUrl(rawUrl: string, target: ImageTarget) {
  try {
    const url = new URL(rawUrl);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("q", "84");
    url.searchParams.set("w", target.kind === "background" ? "1800" : "1200");
    url.searchParams.set("h", target.kind === "background" ? "1100" : "900");
    return url.toString();
  } catch {
    return rawUrl;
  }
}

async function searchUnsplashImage(
  prompt: string,
  workflow: V9Workflow,
  target: ImageTarget,
  usedUrls: Set<string>
) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();

  if (!accessKey) {
    throw new Error("UNSPLASH_ACCESS_KEY is not configured.");
  }

  for (const query of unsplashFallbackQueries(prompt, workflow, target)) {
    const params = new URLSearchParams({
      query,
      per_page: "12",
      orientation: "landscape",
      content_filter: "high",
    });

    logBuilderDebug("ai-v9:unsplash-search-request", {
      pageId: workflow.pageId,
      nodeId: target.nodeId,
      query,
    });

    const res = await fetch(`${UNSPLASH_SEARCH_ENDPOINT}?${params.toString()}`, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Unsplash search API error ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    const results = Array.isArray(json?.results) ? json.results : [];
    const photo = results.find((item: any) => {
      const raw = item?.urls?.raw || item?.urls?.regular || item?.urls?.full;
      return typeof raw === "string" && !usedUrls.has(raw);
    });
    const rawUrl = photo?.urls?.raw || photo?.urls?.regular || photo?.urls?.full;

    logBuilderDebug("ai-v9:unsplash-search-response", {
      pageId: workflow.pageId,
      nodeId: target.nodeId,
      query,
      resultCount: results.length,
      selectedId: photo?.id || null,
      photographer: photo?.user?.name || null,
    });

    if (typeof rawUrl === "string" && /^https:\/\/images\.unsplash\.com\//i.test(rawUrl)) {
      usedUrls.add(rawUrl);
      return resizedUnsplashUrl(rawUrl, target);
    }
  }

  throw new Error("Unsplash search did not return a usable image URL.");
}

async function generateMagnificTextToImage(prompt: string, workflow: V9Workflow) {
  const apiKey = magnificApiKey();

  if (!apiKey) {
    throw new Error("MAGNIFIC_API_KEY or FREEPIK_API_KEY is not configured");
  }

  const { finalPrompt, negativePrompt } = architecturePromptProfile(prompt, workflow);
  const size = "landscape_16_9";

  logBuilderDebug("ai-v9:image-generation-request", {
    provider: "magnific",
    siteId: workflow.siteId,
    pageId: workflow.pageId,
    originalPrompt: prompt,
    finalPrompt,
    negativePrompt,
    size,
    aspectRatio: "16:9",
    style: wantsNonPhotoStyle(prompt) ? "auto" : "photo",
  });

  const res = await fetch(MAGNIFIC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-magnific-api-key": apiKey,
      "x-freepik-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt: finalPrompt,
      negative_prompt: negativePrompt,
      guidance_scale: 4.5,
      num_images: 1,
      image: { size },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Magnific API error ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();

  logBuilderDebug("ai-v9:image-generation-response", {
    provider: "magnific",
    pageId: workflow.pageId,
    responseType: extractUrl(json) ? "url" : extractBase64(json) ? "base64" : "task",
    outputUrl: extractUrl(json),
    hasBase64: Boolean(extractBase64(json)),
    taskId: json?.data?.task_id || json?.task_id || null,
    keys: isRecord(json) ? Object.keys(json) : [],
  });

  const url = extractUrl(json);

  if (url && !hasInvalidImageUrl(url)) {
    const outputUrl = await enhanceWithMagnific(url, workflow);
    logImageOutput({
      provider: "magnific",
      workflow,
      originalPrompt: prompt,
      finalPrompt,
      negativePrompt,
      size,
      aspectRatio: "16:9",
      responseType: "url",
      outputUrl,
    });
    return outputUrl;
  }

  const base64 = extractBase64(json);

  if (base64) {
    const outputUrl = await enhanceWithMagnific(
      await uploadBase64ToR2(base64, workflow),
      workflow
    );
    logImageOutput({
      provider: "magnific",
      workflow,
      originalPrompt: prompt,
      finalPrompt,
      negativePrompt,
      size,
      aspectRatio: "16:9",
      responseType: "base64",
      outputUrl,
    });
    return outputUrl;
  }

  const taskId = json?.data?.task_id || json?.task_id;

  if (typeof taskId === "string") {
    const polled = await pollMagnificTask(taskId, apiKey);

    if (polled) {
      if (polled.startsWith("data:image/")) {
        const outputUrl = await enhanceWithMagnific(
          await uploadBase64ToR2(
            polled.replace(/^data:image\/\w+;base64,/, ""),
            workflow
          ),
          workflow
        );
        logImageOutput({
          provider: "magnific",
          workflow,
          originalPrompt: prompt,
          finalPrompt,
          negativePrompt,
          size,
          aspectRatio: "16:9",
          responseType: "task-base64",
          outputUrl,
        });
        return outputUrl;
      }

      const outputUrl = await enhanceWithMagnific(polled, workflow);
      logImageOutput({
        provider: "magnific",
        workflow,
        originalPrompt: prompt,
        finalPrompt,
        negativePrompt,
        size,
        aspectRatio: "16:9",
        responseType: "task-url",
        outputUrl,
      });
      return outputUrl;
    }
  }

  throw new Error("Magnific did not return image data");
}

async function enhanceWithMagnific(urlOrBase64: string, workflow: V9Workflow) {
  if (
    !envFlag(
      process.env.MAGNIFIC_ENHANCE_ENABLED,
      DEFAULT_MAGNIFIC_ENHANCE_ENABLED
    )
  ) {
    return urlOrBase64;
  }

  logBuilderDebug("ai-v9:image-enhance-skipped", {
    provider: "magnific",
    pageId: workflow.pageId,
    reason:
      "Magnific enhancer hook is present but no enhancement API request is implemented yet.",
  });

  return urlOrBase64;
}

function applyImage(blueprint: BuilderBlueprint, target: ImageTarget, url: string) {
  const node = blueprint.nodes[target.nodeId];

  if (!node) return;

  if (target.kind === "background") {
    node.style = {
      ...node.style,
      backgroundImage: `url('${url}')`,
      backgroundSize: node.style.backgroundSize || "cover",
      backgroundPosition: node.style.backgroundPosition || "center",
      backgroundRepeat: "no-repeat",
    };

    return;
  }

  node.props = {
    ...node.props,
    src: url,
    alt:
      typeof node.props.alt === "string" && node.props.alt
        ? node.props.alt
        : "Website visual",
  };

  node.hidden = false;
}

function removeInvalidImages(blueprint: BuilderBlueprint) {
  Object.values(blueprint.nodes).forEach((node) => {
    if (node.type === "image" && hasInvalidImageUrl(node.props?.src)) {
      const hasPrompt =
        typeof node.props?.aiImagePrompt === "string" ||
        typeof node.props?.imagePrompt === "string";

      node.props = {
        ...node.props,
        src: "",
      };

      node.hidden = hasPrompt ? false : true;
    }

    if (
      typeof node.style?.backgroundImage === "string" &&
      hasForbiddenImageReference(node.style.backgroundImage)
    ) {
      const { backgroundImage, ...rest } = node.style;
      node.style = rest;
    }
  });
}

export async function runV9ImageAgent(workflow: V9Workflow) {
  if (!workflow.blueprint) {
    throw new Error("ImageAgent requires a blueprint");
  }

  const targets = collectImageTargets(workflow.blueprint, workflow);
  const warnings: string[] = [];
  const provider = imageProvider();
  const paidImageGenerationEnabled = envFlag(
    process.env.AI_ENABLE_PAID_IMAGE_GENERATION,
    DEFAULT_PAID_IMAGE_GENERATION_ENABLED
  );
  const maxGeneratedImages = Math.max(
    0,
    Math.min(8, envNumber("IMAGE_GENERATION_MAX_IMAGES", DEFAULT_MAX_GENERATED_IMAGES))
  );
  const sources = fallbackSources();
  const researchImageUrls = collectResearchImageUrls(workflow);
  const timeoutMs = envNumber(
    "IMAGE_GENERATION_TIMEOUT_MS",
    DEFAULT_IMAGE_GENERATION_TIMEOUT_MS
  );
  const agentTimeoutMs = envNumber("IMAGE_AGENT_TIMEOUT_MS", DEFAULT_IMAGE_AGENT_TIMEOUT_MS);
  const unsplashTimeoutMs = envNumber(
    "UNSPLASH_SEARCH_TIMEOUT_MS",
    DEFAULT_UNSPLASH_SEARCH_TIMEOUT_MS
  );
  const startedAt = Date.now();
  let applied = 0;
  let generated = 0;
  const usedResearchUrls = new Set<string>();
  const usedUnsplashUrls = new Set<string>();

  logBuilderDebug("ai-v9:image-agent-start", {
    pageId: workflow.pageId,
    provider,
    timeoutMs,
    agentTimeoutMs,
    unsplashTimeoutMs,
    targetCount: targets.length,
    researchImageCount: researchImageUrls.length,
    paidImageGenerationEnabled,
    maxGeneratedImages,
    fallbackSources: sources,
    unsplashConfigured: Boolean(process.env.UNSPLASH_ACCESS_KEY?.trim()),
  });

  logBuilderDebug("ai-v9:image-targets", {
    pageId: workflow.pageId,
    provider,
    count: targets.length,
    researchImages: researchImageUrls.slice(0, 8),
    targets: targets.map((target) => ({
      nodeId: target.nodeId,
      kind: target.kind,
      prompt: target.prompt,
    })),
  });

  for (const target of targets) {
    const remainingAgentMs = agentTimeoutMs - (Date.now() - startedAt);
    if (remainingAgentMs <= 2_000) {
      warnings.push(`${target.nodeId}: Image agent time budget reached.`);
      logBuilderDebug("ai-v9:image-generation-kept-prompt", {
        pageId: workflow.pageId,
        nodeId: target.nodeId,
        kind: target.kind,
        provider,
        message: "Image agent time budget reached.",
        reason:
          "Returning already-applied images instead of risking a late mutation after the blueprint is saved.",
      });
      break;
    }

    if (sources.includes("research")) {
      const researchUrl = researchImageUrls.find((url) => !usedResearchUrls.has(url));
      if (researchUrl) {
        applyImage(workflow.blueprint, target, researchUrl);
        usedResearchUrls.add(researchUrl);
        applied += 1;
        logBuilderDebug("ai-v9:image-applied", {
          pageId: workflow.pageId,
          nodeId: target.nodeId,
          kind: target.kind,
          provider: "research-assets",
          url: researchUrl,
        });
        continue;
      }
    }

    if (sources.includes("unsplash") && process.env.UNSPLASH_ACCESS_KEY?.trim()) {
      try {
        const unsplashUrl = await withTimeout(
          searchUnsplashImage(target.prompt, workflow, target, usedUnsplashUrls),
          Math.min(timeoutMs, unsplashTimeoutMs),
          "unsplash_search_timeout"
        );
        applyImage(workflow.blueprint, target, unsplashUrl);
        applied += 1;
        logBuilderDebug("ai-v9:image-applied", {
          pageId: workflow.pageId,
          nodeId: target.nodeId,
          kind: target.kind,
          provider: "unsplash",
          url: unsplashUrl,
        });
        continue;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unsplash image search failed.";
        warnings.push(`${target.nodeId}: ${message}`);
        logBuilderDebug("ai-v9:unsplash-search-kept-prompt", {
          pageId: workflow.pageId,
          nodeId: target.nodeId,
          kind: target.kind,
          message,
        });
      }
    }

    const generatedImageFallbackEnabled = envFlag(
      process.env.AI_ENABLE_GENERATED_IMAGE_FALLBACK ??
        process.env.AI_ENABLE_OPENAI_IMAGE_FALLBACK,
      DEFAULT_GENERATED_IMAGE_FALLBACK_ENABLED
    );

    const generatedSourceEnabled =
      sources.includes("generated") || sources.includes("openai");

    if (!generatedSourceEnabled || !generatedImageFallbackEnabled) {
      warnings.push(
        `${target.nodeId}: Generated image fallback disabled; prompt preserved.`
      );
      logBuilderDebug("ai-v9:image-generation-kept-prompt", {
        pageId: workflow.pageId,
        nodeId: target.nodeId,
        kind: target.kind,
        provider,
        message: "Generated image fallback disabled; prompt preserved.",
        reason:
          "Keeping blueprint generation responsive; use AI_ENABLE_GENERATED_IMAGE_FALLBACK=true to opt into generated images.",
      });
      continue;
    }

    if (!paidImageGenerationEnabled || generated >= maxGeneratedImages) {
      const message = !paidImageGenerationEnabled
        ? "Paid image generation disabled and no research/Unsplash image asset available."
        : `Image generation cap reached (${maxGeneratedImages}).`;
      warnings.push(`${target.nodeId}: ${message}`);
      logBuilderDebug("ai-v9:image-generation-kept-prompt", {
        pageId: workflow.pageId,
        nodeId: target.nodeId,
        kind: target.kind,
        provider,
        message,
        reason:
          "Preserving AI prompt/style instead of applying a low-quality fallback image.",
      });
      continue;
    }

    const remainingForGeneration = Math.min(
      timeoutMs,
      agentTimeoutMs - (Date.now() - startedAt) - 2_000
    );

    if (remainingForGeneration < 15_000) {
      warnings.push(`${target.nodeId}: Not enough image-agent time left for OpenAI generation.`);
      logBuilderDebug("ai-v9:image-generation-kept-prompt", {
        pageId: workflow.pageId,
        nodeId: target.nodeId,
        kind: target.kind,
        provider,
        message: "Not enough image-agent time left for OpenAI generation.",
        reason:
          "Returning already-applied images instead of starting generation that may finish after save.",
      });
      continue;
    }

    try {
      const url = await withTimeout(
        generatePrimaryImage(target.prompt, workflow),
        remainingForGeneration,
        "image_generation_timeout"
      );

      applyImage(workflow.blueprint, target, url);
      generated += 1;
      applied += 1;

      logBuilderDebug("ai-v9:image-applied", {
        pageId: workflow.pageId,
        nodeId: target.nodeId,
        kind: target.kind,
        provider,
        url,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image generation failed";

      warnings.push(`${target.nodeId}: ${message}`);

      logBuilderDebug("ai-v9:image-generation-kept-prompt", {
        pageId: workflow.pageId,
        nodeId: target.nodeId,
        kind: target.kind,
        provider,
        message,
        reason:
          "Image generation failed; preserving AI prompt/style instead of applying a low-quality fallback image.",
      });
    }
  }

  removeInvalidImages(workflow.blueprint);

  logBuilderDebug("ai-v9:image-agent-complete", {
    pageId: workflow.pageId,
    provider,
    targets: targets.length,
    applied,
    warnings,
    elapsedMs: Date.now() - startedAt,
  });

  return {
    targets: targets.length,
    applied,
    warnings,
  };
}
