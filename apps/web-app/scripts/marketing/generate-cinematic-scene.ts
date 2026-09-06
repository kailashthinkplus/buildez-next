/*
 * Internal, developer-run tool that generates one cinematic scene for the
 * public marketing homepage: Higgsfield image-to-video -> local ffmpeg
 * frame extraction -> sharp AVIF/WebP encode -> Cloudflare R2 upload ->
 * a checked-in frame manifest the homepage's CinematicSequence component
 * reads at build time.
 *
 * Deliberately bypasses the entire modules/ai-v12 tenant pipeline: it
 * imports only the Higgsfield REST client (generateHeroVideo) and the R2
 * upload helper directly, never the two agent API routes, never
 * reserveV12Credits/persistGeneratedImage/MediaAsset. No tenant Site,
 * User, or Tenant is involved, so no tenant ever sees or pays for this
 * generation, and it never appears in a customer's generation history.
 *
 * Usage (run from apps/web-app):
 *   pnpm run generate:marketing-scene -- \
 *     --scene hero-approach \
 *     --prompt "Slow cinematic camera push toward a premium dark website floating in space" \
 *     --image ./public/marketing/home-v3/design.webp \
 *     --fps 15
 *
 *   Add --dry-run to validate env/args and print the resolved plan
 *   without spending a real Higgsfield generation call.
 */

import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
import sharp from "sharp";

import { fetchWithRetry } from "@/lib/net/fetchWithRetry";
import { uploadToR2 } from "@/lib/storage/uploadToR2";
import { executableBinary } from "@/modules/ai-v12/executableBinary";
import { generateHeroVideo } from "@/modules/ai-v12/videoGeneration";

const MIN_FRAMES = 24;
const MAX_FRAMES = 180;
const AVIF_QUALITY = 58;
const WEBP_QUALITY = 72;
const MANIFESTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../components/cinematic/manifests");

type CliArgs = {
  scene: string;
  prompt: string;
  image: string;
  fps: number;
  width: number;
  height: number;
  mobileCrop?: { width: number; height: number };
  force: boolean;
  dryRun: boolean;
};

function parseCliArgs(): CliArgs {
  const { values } = parseArgs({
    // pnpm's `run <script> -- <args>` sometimes forwards the literal "--"
    // separator itself, which node:util's parseArgs would otherwise choke
    // on as a stray positional — strip it defensively.
    args: process.argv.slice(2).filter((arg) => arg !== "--"),
    options: {
      scene: { type: "string" },
      prompt: { type: "string" },
      image: { type: "string" },
      fps: { type: "string", default: "15" },
      width: { type: "string", default: "1920" },
      height: { type: "string", default: "1080" },
      "mobile-crop": { type: "string" },
      force: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
    },
  });

  const scene = values.scene?.trim();
  const prompt = values.prompt?.trim();
  const image = values.image?.trim();
  if (!scene || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(scene)) {
    throw new Error("--scene is required and must be kebab-case, e.g. hero-approach");
  }
  if (!prompt) throw new Error("--prompt is required");
  if (!image) throw new Error("--image is required (a local file path or an https URL)");

  const fps = Math.max(10, Math.min(24, Number(values.fps)));
  const width = Number(values.width);
  const height = Number(values.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("--width/--height must be positive numbers");
  }

  let mobileCrop: { width: number; height: number } | undefined;
  const mobileCropRaw = values["mobile-crop"];
  if (mobileCropRaw) {
    const match = /^(\d+)x(\d+)$/.exec(mobileCropRaw.trim());
    if (!match) throw new Error("--mobile-crop must look like WIDTHxHEIGHT, e.g. 1080x1350");
    mobileCrop = { width: Number(match[1]), height: Number(match[2]) };
  }

  return { scene, prompt, image, fps, width, height, mobileCrop, force: Boolean(values.force), dryRun: Boolean(values["dry-run"]) };
}

function preflightEnv() {
  const missing = [
    "HIGGSFIELD_API_KEY_ID",
    "HIGGSFIELD_API_KEY_SECRET",
    "R2_ENDPOINT",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
    "R2_PUBLIC_URL",
  ].filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
}

async function resolveImageUrl(image: string, scene: string): Promise<string> {
  if (/^https?:\/\//i.test(image)) return image;

  const absolutePath = path.resolve(image);
  if (!existsSync(absolutePath)) throw new Error(`--image path does not exist: ${absolutePath}`);
  const buffer = await readFile(absolutePath);
  const ext = path.extname(absolutePath).slice(1).toLowerCase() || "jpg";
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const key = `marketing/homepage/${scene}/source/reference-${Date.now()}.${ext}`;
  const url = await uploadToR2({ buffer, key, contentType });
  console.log(`[generate-cinematic-scene] uploaded local reference image -> ${url}`);
  return url;
}

function runBinary(binaryPath: string, args: string[], timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Timed out after ${timeoutMs}ms running ${path.basename(binaryPath)}`));
    }, timeoutMs);
    child.stdout?.on("data", (chunk) => { stdout += String(chunk); });
    child.stderr?.on("data", (chunk) => { stderr += String(chunk); });
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(`${path.basename(binaryPath)} exited with code ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

/** Extracts fixed-fps PNG frames at the source video's native resolution (no scale/crop — that's sharp's job per variant). */
async function extractPngFrames(videoPath: string, workDir: string, fps: number): Promise<string[]> {
  const [ffmpegBinary, ffprobeBinary] = await Promise.all([
    executableBinary(ffmpegPath.path, workDir),
    executableBinary(ffprobePath.path, workDir),
  ]);

  const probeOutput = await runBinary(
    ffprobeBinary,
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", videoPath],
    15_000,
  );
  const duration = Number.parseFloat(probeOutput.trim());
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("Could not determine source video duration (ffprobe)");

  const requestedFrameCount = Math.round(duration * fps);
  const frameCount = Math.max(MIN_FRAMES, Math.min(requestedFrameCount, MAX_FRAMES));
  // Keep a small margin off both ends so frames never land on a black/blank boundary frame.
  const margin = duration * 0.04;
  const usableDuration = Math.max(duration - margin * 2, 0.5);
  const effectiveFps = frameCount / usableDuration;

  console.log(
    `[generate-cinematic-scene] source duration=${duration.toFixed(2)}s target fps=${fps} -> frameCount=${frameCount} (effective fps=${effectiveFps.toFixed(2)})`,
  );

  await runBinary(
    ffmpegBinary,
    [
      "-ss", margin.toFixed(3),
      "-i", videoPath,
      "-frames:v", String(frameCount),
      "-vf", `fps=${effectiveFps.toFixed(6)}`,
      path.join(workDir, "frame-%04d.png"),
    ],
    60_000,
  );

  const files = (await readdir(workDir)).filter((name) => name.startsWith("frame-") && name.endsWith(".png")).sort();
  if (files.length < 2) throw new Error(`ffmpeg produced too few frames (${files.length})`);
  return files.map((name) => path.join(workDir, name));
}

async function encodeVariant(
  pngPath: string,
  targetWidth: number,
  targetHeight: number,
): Promise<{ avif: Buffer; webp: Buffer }> {
  const resized = sharp(pngPath).resize(targetWidth, targetHeight, { fit: "cover", position: "centre" });
  const [avif, webp] = await Promise.all([
    resized.clone().avif({ quality: AVIF_QUALITY }).toBuffer(),
    resized.clone().webp({ quality: WEBP_QUALITY }).toBuffer(),
  ]);
  return { avif, webp };
}

function framePattern(baseUrl: string, prefix: string, ext: string) {
  return `${baseUrl}/${prefix}/frame-{frame}.${ext}`;
}

async function main() {
  const args = parseCliArgs();
  preflightEnv();

  const manifestPath = path.join(MANIFESTS_DIR, `${args.scene}.json`);
  if (existsSync(manifestPath) && !args.force) {
    throw new Error(`Manifest already exists at ${manifestPath} — pass --force to overwrite`);
  }

  console.log(`[generate-cinematic-scene] scene=${args.scene} fps=${args.fps} size=${args.width}x${args.height}`);
  const imageUrl = args.dryRun && !/^https?:\/\//i.test(args.image) ? path.resolve(args.image) : await resolveImageUrl(args.image, args.scene);

  if (args.dryRun) {
    console.log("[generate-cinematic-scene] --dry-run: env and args look valid; skipping Higgsfield call and all uploads.");
    console.log(JSON.stringify({ ...args, resolvedImageUrl: imageUrl, manifestPath }, null, 2));
    return;
  }

  const controller = new AbortController();
  const onSigint = () => controller.abort();
  process.once("SIGINT", onSigint);

  console.log("[generate-cinematic-scene] calling Higgsfield (generateHeroVideo) — this can take up to a few minutes...");
  const startedAt = Date.now();
  const progressTimer = setInterval(() => {
    console.log(`[generate-cinematic-scene] still waiting on Higgsfield... ${Math.round((Date.now() - startedAt) / 1000)}s elapsed`);
  }, 15_000);

  let videoUrl: string | null;
  try {
    videoUrl = await generateHeroVideo({ imageUrl, prompt: args.prompt, signal: controller.signal });
  } finally {
    clearInterval(progressTimer);
    process.off("SIGINT", onSigint);
  }

  if (!videoUrl) {
    throw new Error("Higgsfield generation failed (see [Higgsfield] warnings above) — no partial assets were uploaded.");
  }
  console.log(`[generate-cinematic-scene] Higgsfield video ready: ${videoUrl}`);

  const workDir = await mkdtemp(path.join(tmpdir(), "buildez-marketing-scene-"));
  try {
    const videoResponse = await fetchWithRetry(videoUrl, { cache: "no-store" }, { timeoutMs: 60_000, maxAttempts: 2 });
    if (!videoResponse.ok) throw new Error(`Failed to download generated video: HTTP ${videoResponse.status}`);
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    const videoPath = path.join(workDir, "source.mp4");
    await writeFile(videoPath, videoBuffer);

    const pngFrames = await extractPngFrames(videoPath, workDir, args.fps);
    const frameCount = pngFrames.length;
    const baseUrl = `${process.env.R2_PUBLIC_URL}/marketing/homepage/${args.scene}`;

    console.log(`[generate-cinematic-scene] encoding + uploading ${frameCount} frame(s) (desktop${args.mobileCrop ? " + mobile" : ""})...`);
    for (let i = 0; i < frameCount; i += 1) {
      const frameNumber = String(i + 1).padStart(4, "0");
      const desktop = await encodeVariant(pngFrames[i], args.width, args.height);
      await Promise.all([
        uploadToR2({ buffer: desktop.avif, key: `marketing/homepage/${args.scene}/desktop/frame-${frameNumber}.avif`, contentType: "image/avif" }),
        uploadToR2({ buffer: desktop.webp, key: `marketing/homepage/${args.scene}/desktop/frame-${frameNumber}.webp`, contentType: "image/webp" }),
      ]);

      if (args.mobileCrop) {
        const mobile = await encodeVariant(pngFrames[i], args.mobileCrop.width, args.mobileCrop.height);
        await Promise.all([
          uploadToR2({ buffer: mobile.avif, key: `marketing/homepage/${args.scene}/mobile/frame-${frameNumber}.avif`, contentType: "image/avif" }),
          uploadToR2({ buffer: mobile.webp, key: `marketing/homepage/${args.scene}/mobile/frame-${frameNumber}.webp`, contentType: "image/webp" }),
        ]);
      }
    }

    const posterIndex = Math.min(frameCount - 1, Math.floor(frameCount * 0.4));
    const posterJpeg = await sharp(pngFrames[posterIndex])
      .resize(args.width, args.height, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82 })
      .toBuffer();
    const posterUrl = await uploadToR2({ buffer: posterJpeg, key: `marketing/homepage/${args.scene}/poster.jpg`, contentType: "image/jpeg" });

    const sourceVideoUrl = await uploadToR2({ buffer: videoBuffer, key: `marketing/homepage/${args.scene}/source/video.mp4`, contentType: "video/mp4" });
    console.log(`[generate-cinematic-scene] kept source clip for future re-encodes: ${sourceVideoUrl}`);

    const manifest = {
      id: args.scene,
      frameCount,
      width: args.width,
      height: args.height,
      desktop: framePattern(baseUrl, "desktop", "avif"),
      desktopFallback: framePattern(baseUrl, "desktop", "webp"),
      ...(args.mobileCrop
        ? { mobile: framePattern(baseUrl, "mobile", "avif"), mobileFallback: framePattern(baseUrl, "mobile", "webp") }
        : {}),
      poster: posterUrl,
    };

    await mkdir(MANIFESTS_DIR, { recursive: true });
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

    console.log("[generate-cinematic-scene] done.");
    console.log(JSON.stringify(manifest, null, 2));
    console.log(`[generate-cinematic-scene] manifest written to ${manifestPath}`);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(`[generate-cinematic-scene] ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
