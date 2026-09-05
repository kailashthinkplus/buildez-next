import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
import { fetchWithRetry } from "@/lib/net/fetchWithRetry";
import { uploadToR2 } from "@/lib/storage/uploadToR2";

import { executableBinary } from "./executableBinary";

/*
 * Extracts evenly-spaced still frames from a generated video.
 *
 * Primary path: a local ffmpeg/ffprobe pair (bundled as prebuilt static
 * binaries via @ffmpeg-installer/ffmpeg + @ffprobe-installer/ffprobe —
 * no system package manager involved, so it works the same regardless
 * of host OS/package availability) run against a short-lived temp
 * directory that is always cleaned up. Free beyond the compute already
 * paid for, unlike Cloudinary's metered video add-on.
 *
 * Optional secondary path: Cloudinary's `so_<seconds>` delivery-URL
 * transformation, used only as a fallback if ffmpeg itself fails
 * (missing/broken binary, unsupported codec) and Cloudinary happens to
 * already be configured — never required.
 */

const CLOUD_NAME = () => process.env.CLOUDINARY_CLOUD_NAME?.trim();
const API_KEY = () => process.env.CLOUDINARY_API_KEY?.trim();
const API_SECRET = () => process.env.CLOUDINARY_API_SECRET?.trim();

export function hasCloudinaryConfigured() {
  return Boolean(CLOUD_NAME() && API_KEY() && API_SECRET());
}

function runFfmpegBinary(binaryPath: string, args: string[], timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stdout?.on("data", (chunk) => { stdout += String(chunk); });
    child.stderr?.on("data", (chunk) => { stderr += String(chunk); });
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(`Exited with code ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

/**
 * Downloads the video, extracts `frameCount` evenly-spaced JPEG frames
 * via a local ffmpeg binary, and persists each one to R2.
 *
 * Never throws — returns [] on any failure so the caller can fall back
 * (to Cloudinary, or to skipping the frame sequence entirely).
 */
async function extractFramesWithFfmpeg(input: {
  videoUrl: string;
  frameCount: number;
  siteId: string;
  signal: AbortSignal;
}): Promise<string[]> {
  const workDir = await mkdtemp(path.join(tmpdir(), "buildez-frames-"));
  try {
    const [ffmpegBinary, ffprobeBinary] = await Promise.all([
      executableBinary(ffmpegPath.path, workDir),
      executableBinary(ffprobePath.path, workDir),
    ]);
    const videoResponse = await fetchWithRetry(
      input.videoUrl,
      { cache: "no-store" },
      { timeoutMs: 60_000, signal: input.signal, maxAttempts: 2 },
    );
    if (!videoResponse.ok) return [];
    const videoPath = path.join(workDir, "source.mp4");
    await writeFile(videoPath, Buffer.from(await videoResponse.arrayBuffer()));

    const probeOutput = await runFfmpegBinary(
      ffprobeBinary,
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", videoPath],
      15_000,
    );
    const duration = Number.parseFloat(probeOutput.trim());
    if (!Number.isFinite(duration) || duration <= 0) return [];

    const frameCount = Math.max(2, Math.min(input.frameCount, 60));
    // Keep a small margin off both ends so frames never land on a
    // black/blank boundary frame.
    const margin = duration * 0.04;
    const usableDuration = Math.max(duration - margin * 2, 0.5);
    const fps = (frameCount - 1) / usableDuration;

    await runFfmpegBinary(
      ffmpegBinary,
      [
        "-ss", margin.toFixed(3),
        "-i", videoPath,
        "-frames:v", String(frameCount),
        "-vf", `fps=${fps.toFixed(6)}`,
        "-q:v", "3",
        path.join(workDir, "frame-%03d.jpg"),
      ],
      60_000,
    );

    const frameUrls: string[] = [];
    for (let index = 1; index <= frameCount; index += 1) {
      const framePath = path.join(workDir, `frame-${String(index).padStart(3, "0")}.jpg`);
      let buffer: Buffer;
      try {
        buffer = await readFile(framePath);
      } catch {
        continue;
      }
      const fingerprint = createHash("sha256").update(buffer).digest("hex").slice(0, 24);
      const url = await uploadToR2({
        buffer,
        key: `sites/${input.siteId}/frame-sequence/${fingerprint}.jpg`,
        contentType: "image/jpeg",
      });
      frameUrls.push(url);
    }
    return frameUrls.length >= 2 ? frameUrls : [];
  } catch (error) {
    console.warn("[ffmpeg] frame extraction error", error instanceof Error ? error.message : error);
    return [];
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

function signParams(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

/** Cloudinary fallback — only reached when the local ffmpeg path fails and Cloudinary happens to already be configured. */
async function extractFramesWithCloudinary(input: {
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

    const uploadResponse = await fetchWithRetry(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        cache: "no-store",
      },
      {
        timeoutMs: 120_000,
        signal: input.signal,
        maxAttempts: 2,
        onRetry: (attempt, reason) => console.warn("[Cloudinary] retrying video upload", { attempt, reason }),
      },
    );

    if (!uploadResponse.ok) {
      console.warn("[Cloudinary] video upload failed", uploadResponse.status, await uploadResponse.text().catch(() => ""));
      return [];
    }

    const uploaded = await uploadResponse.json() as { public_id?: string; duration?: number };
    if (!uploaded.public_id || !uploaded.duration || uploaded.duration <= 0) return [];

    const frameCount = Math.max(2, Math.min(input.frameCount, 60));
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

/**
 * Returns evenly spaced frame image URLs across a video's duration.
 *
 * Never throws — returns [] when every available path fails; callers
 * should treat that the same as "no frames available" and fall back
 * accordingly.
 */
export async function extractVideoFrames(input: {
  videoUrl: string;
  frameCount: number;
  siteId: string;
  signal: AbortSignal;
}): Promise<string[]> {
  const viaFfmpeg = await extractFramesWithFfmpeg(input);
  if (viaFfmpeg.length) return viaFfmpeg;
  return extractFramesWithCloudinary(input);
}
