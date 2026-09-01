import { createHash } from "node:crypto";

/*
 * Extracts evenly-spaced still frames from a generated video, entirely
 * via Cloudinary URL transformations — no ffmpeg/video processing in
 * our own runtime. We upload the (remote) video by URL once, then
 * build one delivery URL per frame using Cloudinary's `so_<seconds>`
 * (start-offset) transformation; Cloudinary renders each frame lazily
 * on first fetch.
 *
 * Docs: https://cloudinary.com/documentation/video_manipulation_and_delivery
 */

const CLOUD_NAME = () => process.env.CLOUDINARY_CLOUD_NAME?.trim();
const API_KEY = () => process.env.CLOUDINARY_API_KEY?.trim();
const API_SECRET = () => process.env.CLOUDINARY_API_SECRET?.trim();

export function hasCloudinaryConfigured() {
  return Boolean(CLOUD_NAME() && API_KEY() && API_SECRET());
}

function signParams(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

/**
 * Uploads a remote video (by URL) to Cloudinary and returns evenly
 * spaced frame image URLs across its duration.
 *
 * Returns an empty array (never throws) when Cloudinary isn't
 * configured or the upload/extraction fails — callers should treat
 * this the same as "no frames available" and fall back accordingly.
 */
export async function extractVideoFrames(input: {
  videoUrl: string;
  frameCount: number;
  signal: AbortSignal;
}): Promise<string[]> {
  const cloudName = CLOUD_NAME();
  const apiKey = API_KEY();
  const apiSecret = API_SECRET();
  if (!cloudName || !apiKey || !apiSecret) return [];

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = signParams({ timestamp }, apiSecret);

    const body = new URLSearchParams({
      file: input.videoUrl,
      timestamp,
      api_key: apiKey,
      signature,
    });

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
      signal: AbortSignal.any([input.signal, AbortSignal.timeout(120_000)]),
    });

    if (!uploadResponse.ok) {
      console.warn("[Cloudinary] video upload failed", uploadResponse.status, await uploadResponse.text().catch(() => ""));
      return [];
    }

    const uploaded = await uploadResponse.json() as { public_id?: string; duration?: number };
    if (!uploaded.public_id || !uploaded.duration || uploaded.duration <= 0) return [];

    const frameCount = Math.max(2, Math.min(input.frameCount, 60));
    // Keep a small margin off both ends so frames never land on a
    // black/blank boundary frame.
    const margin = uploaded.duration * 0.04;
    const usableDuration = Math.max(uploaded.duration - margin * 2, 0.5);

    return Array.from({ length: frameCount }, (_, index) => {
      const offset = margin + (usableDuration * index) / Math.max(frameCount - 1, 1);
      return `https://res.cloudinary.com/${cloudName}/video/upload/so_${offset.toFixed(2)},f_jpg,q_auto/${uploaded.public_id}.jpg`;
    });
  } catch (error) {
    console.warn("[Cloudinary] frame extraction error", error instanceof Error ? error.message : error);
    return [];
  }
}
