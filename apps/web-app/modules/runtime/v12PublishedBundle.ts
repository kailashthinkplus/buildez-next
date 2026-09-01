import { spawn } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@buildez/db";

import { listProjectFiles, normalizeGeneratedProjectFile, readProjectFile } from "../builder-v3/project-workspace";

const globalBuilds = globalThis as typeof globalThis & { __buildezV12PublishedBuilds?: Map<string, Promise<string>> };
const activeBuilds = globalBuilds.__buildezV12PublishedBuilds ?? new Map<string, Promise<string>>();
globalBuilds.__buildezV12PublishedBuilds = activeBuilds;

function publishedBase(siteId: string) {
  return `/api/runtime/v12/${encodeURIComponent(siteId)}/`;
}

function addRouterBasename(content: string, siteId: string) {
  if (!content.includes("<BrowserRouter") || /<BrowserRouter\s+[^>]*\bbasename=/.test(content)) return content;
  return content.replace(/<BrowserRouter(?=\s|>)/g, `<BrowserRouter basename=${JSON.stringify(publishedBase(siteId).replace(/\/$/, ""))}`);
}

async function buildPublishedProject(siteId: string, tenantId: string) {
  const project = await prisma.v12Project.findFirst({ where: { siteId, tenantId }, select: { currentRevision: true } });
  if (!project) throw new Error("Published project not found");
  const root = path.join(process.cwd(), "tmp", "v12-published", siteId);
  const sourceRoot = path.join(root, "source");
  const outputRoot = path.join(root, "dist");
  const markerPath = path.join(root, "revision.txt");
  try {
    const [marker] = await Promise.all([readFile(markerPath, "utf8"), stat(path.join(outputRoot, "index.html"))]);
    if (marker.trim() === String(project.currentRevision)) return outputRoot;
  } catch {
    // Missing or stale output is rebuilt below.
  }

  const files = await listProjectFiles(siteId, tenantId);
  if (!files.length) throw new Error("Published project has no files");
  await rm(sourceRoot, { recursive: true, force: true });
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(sourceRoot, { recursive: true });
  for (const file of files) {
    const target = path.resolve(sourceRoot, file.path);
    if (!target.startsWith(`${sourceRoot}${path.sep}`)) throw new Error("Published project path escaped its workspace");
    await mkdir(path.dirname(target), { recursive: true });
    let content = (await readProjectFile(siteId, tenantId, file.path)).content;
    content = normalizeGeneratedProjectFile(content, file.path);
    if (/\.[jt]sx$/i.test(file.path)) {
      content = addRouterBasename(content, siteId);
    }
    await writeFile(target, content, "utf8");
  }

  const worker = path.join(process.cwd(), "modules", "runtime", "v12BuildWorker.mjs");
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [worker, sourceRoot, outputRoot, publishedBase(siteId)], {
      cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout?.on("data", data => { output = `${output}${String(data)}`.slice(-12_000); });
    child.stderr?.on("data", data => { output = `${output}${String(data)}`.slice(-12_000); });
    child.once("error", reject);
    child.once("exit", code => code === 0 ? resolve() : reject(new Error(`Published website build failed (${code ?? "signal"}): ${output.trim()}`)));
  });
  await mkdir(root, { recursive: true });
  await writeFile(markerPath, String(project.currentRevision), "utf8");
  return outputRoot;
}

export async function ensureV12PublishedBundle(siteId: string, tenantId: string) {
  const key = `${tenantId}:${siteId}`;
  const existing = activeBuilds.get(key);
  if (existing) return existing;
  const build = buildPublishedProject(siteId, tenantId).finally(() => activeBuilds.delete(key));
  activeBuilds.set(key, build);
  return build;
}

export function publishedAssetPath(outputRoot: string, parts: readonly string[]) {
  const requested = parts.length ? parts.join("/") : "index.html";
  const candidate = path.resolve(outputRoot, requested);
  if (!candidate.startsWith(`${outputRoot}${path.sep}`)) throw new Error("Invalid published asset path");
  return candidate;
}
