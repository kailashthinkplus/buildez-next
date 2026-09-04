/*
 * Higgsfield image-to-video client.
 *
 * Used only by the 3D-experience frame-sequence pipeline
 * (see immersiveFrameSequence.ts): instead of asking the code-gen
 * model to hand-author a live Three.js/R3F scene (which reliably
 * produces primitive, unpolished geometry), we animate the already
 * -generated hero image into a short cinematic clip and later extract
 * frames from it for a scroll-scrubbed canvas sequence.
 *
 * API reference: https://docs.higgsfield.ai/docs (OpenAPI:
 * https://docs.higgsfield.ai/docs/openapi.json). Auth is a two-part
 * key: `Authorization: Key {api_key_id}:{api_key_secret}`.
 */

import { fetchWithRetry } from "@/lib/net/fetchWithRetry";

const HIGGSFIELD_BASE_URL = process.env.HIGGSFIELD_API_BASE_URL || "https://api.higgsfield.ai";
// Different model families take different request bodies. Kling v2.1
// standard is the default because it's confirmed reachable/enabled on
// the configured account; veo3.1 (etc.) require a subscription tier
// this account doesn't have ("model_disabled").
const HIGGSFIELD_VIDEO_ENDPOINT = process.env.HIGGSFIELD_VIDEO_ENDPOINT || "/kling-video/v2.1/standard/image-to-video";
const POLL_INTERVAL_MS = 4_000;
const POLL_TIMEOUT_MS = Number(process.env.HIGGSFIELD_VIDEO_TIMEOUT_MS || 240_000);

// Higgsfield rejects a prompt over 2500 characters (its API responds with
// "size must be between 0 and 2500"). Upstream prompt text can run well
// past that — the design brief it's derived from is written for the code
// generation model, not scoped to any external API's limit — so cap it
// here, next to the limit it must satisfy, rather than relying on every
// caller to know Higgsfield's constraint.
const HIGGSFIELD_PROMPT_MAX_LENGTH = 2400;

function clampHiggsfieldPrompt(prompt: string): string {
  return prompt.length > HIGGSFIELD_PROMPT_MAX_LENGTH
    ? `${prompt.slice(0, HIGGSFIELD_PROMPT_MAX_LENGTH - 1).trimEnd()}…`
    : prompt;
}

function videoRequestBody(imageUrl: string, prompt: string): Record<string, unknown> {
  if (HIGGSFIELD_VIDEO_ENDPOINT.includes("/kling-video/")) {
    return {
      prompt,
      image_url: imageUrl,
      duration: 5,
      cfg_scale: 0.5,
      negative_prompt: "",
    };
  }
  if (HIGGSFIELD_VIDEO_ENDPOINT.includes("/bytedance/seedance/")) {
    return {
      prompt,
      image_url: imageUrl,
      duration: 6,
      resolution: "1080",
      aspect_ratio: "16:9",
      camera_fixed: false,
    };
  }
  // veo3.1 family (and default fallback).
  return {
    prompt,
    image_url: imageUrl,
    duration: "6",
    resolution: "1080",
    aspect_ratio: "16:9",
    generate_audio: false,
  };
}

export function hasHiggsfieldVideo() {
  return Boolean(process.env.HIGGSFIELD_API_KEY_ID?.trim() && process.env.HIGGSFIELD_API_KEY_SECRET?.trim());
}

function authHeader() {
  return `Key ${process.env.HIGGSFIELD_API_KEY_ID}:${process.env.HIGGSFIELD_API_KEY_SECRET}`;
}

type HiggsfieldRequestStatus = {
  status: "queued" | "in_progress" | "nsfw" | "failed" | "completed" | "canceled";
  request_id: string;
  status_url?: string;
  error?: string | null;
  video?: { url: string };
};

/**
 * Animates a still image into a short cinematic clip (camera
 * orbit/push around the subject) and returns the resulting video URL.
 *
 * Returns null (never throws) when Higgsfield isn't configured or the
 * generation fails for any reason — callers are expected to fall back
 * to the existing live-3D code-gen path when this returns null, not
 * fail the whole website generation over an optional enhancement.
 */
export async function generateHeroVideo(input: {
  imageUrl: string;
  prompt: string;
  signal: AbortSignal;
}): Promise<string | null> {
  if (!hasHiggsfieldVideo()) return null;

  try {
    const submitResponse = await fetchWithRetry(
      `${HIGGSFIELD_BASE_URL}${HIGGSFIELD_VIDEO_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: authHeader(),
        },
        body: JSON.stringify(videoRequestBody(input.imageUrl, clampHiggsfieldPrompt(input.prompt))),
        cache: "no-store",
      },
      {
        timeoutMs: 30_000,
        signal: input.signal,
        maxAttempts: 3,
        retryOnTimeout: true,
        onRetry: (attempt, reason) => console.warn("[Higgsfield] retrying video submission", { attempt, reason }),
      },
    );

    if (!submitResponse.ok) {
      console.warn("[Higgsfield] video submission failed", submitResponse.status, await submitResponse.text().catch(() => ""));
      return null;
    }

    const submitted = await submitResponse.json() as HiggsfieldRequestStatus;
    const statusUrl = submitted.status_url || `${HIGGSFIELD_BASE_URL}/requests/${submitted.request_id}/status`;

    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      if (input.signal.aborted) return null;

      const statusResponse = await fetch(statusUrl, {
        headers: { authorization: authHeader() },
        cache: "no-store",
        signal: AbortSignal.any([input.signal, AbortSignal.timeout(15_000)]),
      });
      if (!statusResponse.ok) continue;

      const state = await statusResponse.json() as HiggsfieldRequestStatus;
      if (state.status === "completed") return state.video?.url || null;
      if (state.status === "failed" || state.status === "nsfw" || state.status === "canceled") {
        console.warn("[Higgsfield] video generation ended without a result", state.status, state.error);
        return null;
      }
      // queued / in_progress — keep polling.
    }

    console.warn("[Higgsfield] video generation timed out");
    return null;
  } catch (error) {
    console.warn("[Higgsfield] video generation error", error instanceof Error ? error.message : error);
    return null;
  }
}
