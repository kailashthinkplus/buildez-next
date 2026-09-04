import { persistGeneratedImage } from "@/modules/builder-v2/media/server/persistGeneratedImage";
import { resolveV12Models } from "./executionPolicy";

export type SiteMediaRequirement = {
  id: string;
  role: string;
  purpose?: string;
  prompt: string;
  aspect: "landscape" | "portrait" | "square";
  medium: string;
  useRequestedMedium: boolean;
};

export type GeneratedSiteMedia = SiteMediaRequirement & {
  url: string;
};

function imageSize(aspect: SiteMediaRequirement["aspect"]) {
  if (aspect === "portrait") return "1024x1536";
  if (aspect === "square") return "1024x1024";
  return "1536x1024";
}

async function persistentImageBuffer(item: Record<string, unknown>, signal: AbortSignal) {
  if (typeof item.b64_json === "string") return Buffer.from(item.b64_json, "base64");
  if (typeof item.url === "string") {
    const response = await fetch(item.url, { cache: "no-store", signal });
    if (!response.ok) throw new Error("Generated media could not be downloaded.");
    return Buffer.from(await response.arrayBuffer());
  }
  throw new Error("Image generation returned no media.");
}

async function generateOne(
  apiKey: string,
  siteId: string,
  tenantId: string,
  userId: string,
  requirement: SiteMediaRequirement,
  signal: AbortSignal,
) {
  const model =
    resolveV12Models().image;
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: `${requirement.prompt}. ${requirement.purpose ? `Intended website purpose: ${requirement.purpose}. ` : ""}${requirement.useRequestedMedium
        ? `Use the explicitly requested medium: ${requirement.medium}.`
        : "Photorealistic premium editorial website photography, natural light, physically plausible materials, and sophisticated art direction."} Production-ready website artwork with a clear focal composition and high detail. No words, typography, watermark, or logo unless the requirement explicitly asks for them.`,
      size: imageSize(requirement.aspect),
      n: 1,
    }),
    cache: "no-store",
    signal: AbortSignal.any([
      signal,
      AbortSignal.timeout(Number(process.env.OPENAI_V12_IMAGE_TIMEOUT_MS || 180_000)),
    ]),
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
    throw new Error(String(error || `Image generation failed (${response.status}).`));
  }
  const item = Array.isArray(payload.data) ? payload.data[0] as Record<string, unknown> : {};
  const buffer = await persistentImageBuffer(item, signal);
  const asset = await persistGeneratedImage({
    sourceUrl: `data:image/png;base64,${buffer.toString("base64")}`,
    siteId,
    tenantId,
    userId,
    prompt: requirement.prompt,
    provider: model,
  });
  return { ...requirement, url: asset.url };
}

export async function generateSiteMedia(input: {
  apiKey: string;
  siteId: string;
  tenantId: string;
  userId: string;
  requirements: readonly SiteMediaRequirement[];
  signal: AbortSignal;
}) {
  const requirements = input.requirements
    .filter((item) => item.id.trim() && item.prompt.trim())
    .slice(0, Math.min(Math.max(Number(process.env.OPENAI_V12_SITE_IMAGE_COUNT || 6), 0), 8));
  const media: GeneratedSiteMedia[] = [];
  const warnings: string[] = [];
  for (let index = 0; index < requirements.length; index += 3) {
    const batch = requirements.slice(index, index + 3);
    const results = await Promise.all(batch.map(async (requirement) => {
      try {
        return { media: await generateOne(input.apiKey, input.siteId, input.tenantId, input.userId, requirement, input.signal) };
      } catch (error) {
        return {
          warning: `${requirement.id}: ${error instanceof Error ? error.message : "Image generation failed."}`,
        };
      }
    }));
    for (const result of results) {
      if ("media" in result && result.media) media.push(result.media);
      if ("warning" in result && result.warning) warnings.push(result.warning);
    }
  }
  return { media, warnings };
}
