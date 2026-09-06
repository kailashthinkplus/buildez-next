/*
 * Internal, developer-run tool that generates one static photorealistic
 * marketing image via OpenAI's image generation endpoint and uploads it to
 * Cloudflare R2. Mirrors generate-cinematic-scene.ts's "bypass the tenant
 * pipeline" pattern: reuses the exact model resolution already used by
 * modules/ai-v12/mediaGeneration.ts (resolveV12Models().image) and the
 * same request shape, but skips persistGeneratedImage/MediaAsset entirely
 * (both hard-require a tenant Site/User) since there's no tenant here —
 * just an OpenAI call + a direct R2 upload.
 *
 * Usage (run from apps/web-app):
 *   pnpm run generate:marketing-image -- \
 *     --key hero/banner \
 *     --prompt "..." \
 *     --aspect landscape
 */

import { parseArgs } from "node:util";
import { uploadToR2 } from "@/lib/storage/uploadToR2";
import { resolveV12Models } from "@/modules/ai-v12/executionPolicy";

type Aspect = "landscape" | "portrait" | "square";

function imageSize(aspect: Aspect) {
  if (aspect === "portrait") return "1024x1536";
  if (aspect === "square") return "1024x1024";
  return "1536x1024";
}

function parseCliArgs() {
  const { values } = parseArgs({
    args: process.argv.slice(2).filter((arg) => arg !== "--"),
    options: {
      key: { type: "string" },
      prompt: { type: "string" },
      aspect: { type: "string", default: "landscape" },
      force: { type: "boolean", default: false },
    },
  });
  const key = values.key?.trim();
  const prompt = values.prompt?.trim();
  const aspect = (values.aspect as Aspect) || "landscape";
  if (!key) throw new Error("--key is required, e.g. hero/banner (becomes marketing/homepage/<key>.png)");
  if (!prompt) throw new Error("--prompt is required");
  if (!["landscape", "portrait", "square"].includes(aspect)) throw new Error("--aspect must be landscape, portrait, or square");
  return { key, prompt, aspect, force: Boolean(values.force) };
}

async function main() {
  const args = parseCliArgs();
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  const missingR2 = ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"].filter(
    (name) => !process.env[name]?.trim(),
  );
  if (missingR2.length) throw new Error(`Missing required environment variable(s): ${missingR2.join(", ")}`);

  const model = resolveV12Models().image;
  console.log(`[generate-marketing-image] key=${args.key} model=${model} aspect=${args.aspect}`);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      prompt: `${args.prompt} Photorealistic, natural light, physically plausible materials, sophisticated premium editorial photography art direction. Production-ready website marketing artwork with a clear focal composition and high detail. No words, typography, watermark, or logo.`,
      size: imageSize(args.aspect as Aspect),
      n: 1,
    }),
    signal: AbortSignal.timeout(180_000),
  });

  const raw = await response.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error(`Image generation returned an unreadable response: ${raw.slice(0, 500)}`);
  }
  if (!response.ok) {
    const error = payload.error && typeof payload.error === "object" ? (payload.error as Record<string, unknown>).message : undefined;
    throw new Error(String(error || `Image generation failed (${response.status}).`));
  }

  const item = Array.isArray(payload.data) ? (payload.data[0] as Record<string, unknown>) : {};
  let buffer: Buffer;
  if (typeof item.b64_json === "string") {
    buffer = Buffer.from(item.b64_json, "base64");
  } else if (typeof item.url === "string") {
    const imageResponse = await fetch(item.url, { cache: "no-store" });
    if (!imageResponse.ok) throw new Error("Generated image could not be downloaded.");
    buffer = Buffer.from(await imageResponse.arrayBuffer());
  } else {
    throw new Error("Image generation returned no media.");
  }

  const url = await uploadToR2({ buffer, key: `marketing/homepage/${args.key}.png`, contentType: "image/png" });
  console.log(`[generate-marketing-image] uploaded -> ${url}`);
}

main().catch((error) => {
  console.error(`[generate-marketing-image] ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
