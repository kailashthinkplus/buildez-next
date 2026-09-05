import { generateHeroVideo, hasHiggsfieldVideo } from "./videoGeneration";
import { extractVideoFrames } from "./frameExtraction";
import { persistCreativeAsset } from "./persistCreativeAsset";

const FRAME_COUNT = Math.max(8, Math.min(Number(process.env.BUILDEZ_3D_FRAME_COUNT || 36), 60));

/**
 * Frame extraction runs on a bundled local ffmpeg binary (no external
 * config needed — see frameExtraction.ts), so the only real dependency
 * left is Higgsfield actually producing the source video.
 */
export function immersiveFrameSequenceAvailable() {
  return hasHiggsfieldVideo();
}

/**
 * Replaces live Three.js/R3F generation for the "requires3D" capability:
 * animates the already-generated hero image into a short cinematic
 * clip, extracts an evenly-spaced frame sequence from it, and persists
 * each frame durably.
 *
 * Returns null (never throws) whenever the provider chain isn't
 * configured or any step fails — callers must fall back to the
 * existing live-3D code-gen path in that case, exactly as it behaves
 * today.
 */
export async function generateImmersiveFrameSequence(input: {
  siteId: string;
  tenantId: string;
  userId: string;
  heroImageUrl: string;
  subjectPrompt: string;
  signal: AbortSignal;
}): Promise<{ frameUrls: string[] } | null> {
  if (!immersiveFrameSequenceAvailable()) return null;

  const videoUrl = await generateHeroVideo({
    imageUrl: input.heroImageUrl,
    prompt: `Slow cinematic camera orbit and push-in around the subject: ${input.subjectPrompt}. Keep the subject centered and fully in frame throughout; smooth, physically plausible camera motion; no cuts.`,
    signal: input.signal,
  });
  if (!videoUrl) return null;

  const rawFrameUrls = await extractVideoFrames({
    videoUrl,
    frameCount: FRAME_COUNT,
    siteId: input.siteId,
    signal: input.signal,
  });
  if (rawFrameUrls.length < 8) return null;

  const durableFrameUrls: string[] = new Array(rawFrameUrls.length);
  for (let index = 0; index < rawFrameUrls.length; index += 6) {
    const batch = rawFrameUrls.slice(index, index + 6);
    const results = await Promise.all(batch.map(async (frameUrl, offset) => {
      try {
        return await persistCreativeAsset({
          sourceUrl: frameUrl,
          siteId: input.siteId,
          tenantId: input.tenantId,
          userId: input.userId,
          prompt: input.subjectPrompt,
          provider: "higgsfield-cloudinary-frame",
          signal: input.signal,
        });
      } catch (error) {
        console.warn("[ImmersiveFrameSequence] frame persist failed", index + offset, error instanceof Error ? error.message : error);
        return null;
      }
    }));
    results.forEach((url, offset) => {
      durableFrameUrls[index + offset] = url || rawFrameUrls[index + offset];
    });
  }

  return { frameUrls: durableFrameUrls };
}
