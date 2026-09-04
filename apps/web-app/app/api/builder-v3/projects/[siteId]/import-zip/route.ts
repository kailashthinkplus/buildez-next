import { createHash, randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { Prisma, prisma } from "@buildez/db";
import { NextRequest } from "next/server";
import * as unzipper from "unzipper";

import { getUser } from "@/lib/auth/getUser";
import { uploadToR2 } from "@/lib/storage/uploadToR2";
import {
  AI_ZIP_MAX_BYTES,
} from "@/modules/ai-v12/attachments";
import {
  analyzeImportedProject,
  type ImportedSourceFile,
} from "@/modules/ai-v12/importedProject";
import {
  getOrCreateProject,
  importProjectFiles,
} from "@/modules/builder-v3/project-workspace";

export const dynamic = "force-dynamic";
export const maxDuration = 600;
export const runtime = "nodejs";

const MAX_FILES = 2_000;
const MAX_UNCOMPRESSED_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_SOURCE_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ASSET_FILE_BYTES = 50 * 1024 * 1024;
const SOURCE_EXTENSIONS = new Set([
  "css", "graphql", "gql", "htm", "html", "js", "jsx", "json", "less",
  "md", "mdx", "mjs", "cjs", "scss", "sass", "svg", "toml", "ts", "tsx",
  "txt", "vue", "yaml", "yml",
]);
const ASSET_MIME: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  mp4: "video/mp4",
  webm: "video/webm",
};

function ignoredPath(value: string) {
  return value.split("/").some((segment) =>
    segment === "node_modules"
    || segment === ".git"
    || segment === ".next"
    || segment === "dist"
    || segment === "build"
    || segment === "coverage"
    || segment === "__MACOSX"
  ) || /(?:^|\/)\.env(?:\.|$)/i.test(value)
    || /(?:^|\/)(?:id_rsa|id_ed25519|\.npmrc)$/i.test(value)
    || /(?:^|\/)(?:pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$/i.test(value);
}

function safeArchivePath(value: string) {
  const normalized = value.replaceAll("\\", "/").replace(/^\.\/+/, "");
  if (!normalized || normalized.startsWith("/") || /^[a-z]:\//i.test(normalized)) {
    throw new Error("ZIP contains an absolute path.");
  }
  if (normalized.split("/").some((segment) => segment === ".." || segment.includes("\0"))) {
    throw new Error("ZIP contains an unsafe path.");
  }
  return normalized.replace(/\/+/g, "/");
}

function commonRoot(paths: readonly string[]) {
  if (!paths.length) return "";
  const first = paths[0].split("/")[0];
  if (["src", "app", "pages", "public", "components", "assets"].includes(first.toLowerCase())) {
    return "";
  }
  return paths.every((value) => value.includes("/") && value.split("/")[0] === first)
    ? `${first}/`
    : "";
}

function extension(value: string) {
  return value.toLowerCase().split(".").pop() || "";
}

function rewriteAssetReferences(
  source: ImportedSourceFile,
  assets: ReadonlyMap<string, string>,
) {
  let content = source.content;
  const sourceDirectory = path.posix.dirname(source.path);
  for (const [assetPath, url] of assets) {
    const relative = path.posix.relative(sourceDirectory, assetPath);
    const candidates = new Set([
      assetPath,
      `/${assetPath}`,
      relative,
      relative.startsWith(".") ? relative : `./${relative}`,
    ]);
    for (const candidate of candidates) {
      content = content.split(candidate).join(url);
    }
  }
  return { ...source, content };
}

async function receiveZip(req: NextRequest, target: string) {
  if (!req.body) throw new Error("ZIP body is required.");
  const declared = Number(req.headers.get("content-length") || "0");
  if (declared > AI_ZIP_MAX_BYTES) throw new Error("ZIP exceeds the temporary 1 GB limit.");
  let received = 0;
  const limiter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      received += chunk.length;
      callback(
        received > AI_ZIP_MAX_BYTES
          ? new Error("ZIP exceeds the temporary 1 GB limit.")
          : null,
        chunk,
      );
    },
  });
  await pipeline(
    Readable.fromWeb(req.body as never),
    limiter,
    createWriteStream(target, { flags: "wx" }),
  );
  return received;
}

async function uploadAssets(
  siteId: string,
  archiveFiles: Array<{ path: string; buffer: Buffer; mimeType: string }>,
) {
  const result = new Map<string, string>();
  for (let index = 0; index < archiveFiles.length; index += 4) {
    const batch = archiveFiles.slice(index, index + 4);
    const uploaded = await Promise.all(batch.map(async (asset) => {
      const digest = createHash("sha256").update(asset.buffer).digest("hex").slice(0, 20);
      const url = await uploadToR2({
        buffer: asset.buffer,
        key: `sites/${siteId}/imports/${digest}-${path.posix.basename(asset.path)}`,
        contentType: asset.mimeType,
      });
      return [asset.path, url] as const;
    }));
    for (const [assetPath, url] of uploaded) result.set(assetPath, url);
  }
  return result;
}

export async function POST(req: NextRequest, context: { params: Promise<{ siteId: string }> }) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { siteId } = await context.params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId: auth.tenant.id, deletedAt: null },
    select: { id: true },
  });
  if (!site) return Response.json({ error: "Site not found" }, { status: 404 });
  const project = await getOrCreateProject(siteId, auth.tenant.id);
  const expectedRevision = Number(req.headers.get("x-buildez-revision") ?? project.currentRevision);
  if (!Number.isInteger(expectedRevision) || expectedRevision !== project.currentRevision) {
    return Response.json({ error: "Project revision conflict" }, { status: 409 });
  }

  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "buildez-import-"));
  const zipPath = path.join(temporaryDirectory, `${randomUUID()}.zip`);
  try {
    const receivedBytes = await receiveZip(req, zipPath);
    const archive = await unzipper.Open.file(zipPath);
    const candidates = archive.files
      .filter((entry) => entry.type === "File")
      .map((entry) => ({ entry, path: safeArchivePath(entry.path) }))
      .filter(({ path: entryPath }) => !ignoredPath(entryPath));
    if (!candidates.length) throw new Error("ZIP does not contain importable source files.");
    if (candidates.length > MAX_FILES) {
      throw new Error(`ZIP contains more than ${MAX_FILES.toLocaleString()} importable files.`);
    }
    const totalUncompressed = candidates.reduce((total, item) => total + item.entry.uncompressedSize, 0);
    if (totalUncompressed > MAX_UNCOMPRESSED_BYTES) {
      throw new Error("ZIP expands beyond the 2 GB safety limit.");
    }
    const root = commonRoot(candidates.map((item) => item.path));
    const sourceFiles: ImportedSourceFile[] = [];
    const assetFiles: Array<{ path: string; buffer: Buffer; mimeType: string }> = [];
    for (const item of candidates) {
      const projectPath = item.path.slice(root.length);
      if (!projectPath || ignoredPath(projectPath)) continue;
      const fileExtension = extension(projectPath);
      if (SOURCE_EXTENSIONS.has(fileExtension)) {
        if (item.entry.uncompressedSize > MAX_SOURCE_FILE_BYTES) {
          throw new Error(`${projectPath} exceeds the 5 MB source-file limit.`);
        }
        sourceFiles.push({
          path: projectPath,
          content: (await item.entry.buffer()).toString("utf8"),
        });
      } else if (ASSET_MIME[fileExtension]) {
        if (item.entry.uncompressedSize > MAX_ASSET_FILE_BYTES) {
          throw new Error(`${projectPath} exceeds the 50 MB asset limit.`);
        }
        assetFiles.push({
          path: projectPath,
          buffer: await item.entry.buffer(),
          mimeType: ASSET_MIME[fileExtension],
        });
      }
    }
    if (!sourceFiles.length) throw new Error("ZIP does not contain readable website source code.");

    const uploadedAssets = await uploadAssets(siteId, assetFiles);
    const rewrittenSources = sourceFiles.map((file) => rewriteAssetReferences(file, uploadedAssets));
    const analysis = analyzeImportedProject(rewrittenSources);
    const now = new Date().toISOString();
    const generatedFiles: ImportedSourceFile[] = [
      {
        path: "src/buildez.import-analysis.json",
        content: JSON.stringify(analysis, null, 2),
      },
      {
        path: "src/buildez.theme.json",
        content: JSON.stringify(analysis.theme, null, 2),
      },
    ];
    if (!rewrittenSources.some((file) => file.path === "src/buildez.pages.json")) {
      generatedFiles.push({
        path: "src/buildez.pages.json",
        content: JSON.stringify(analysis.pages, null, 2),
      });
    }
    const imported = await importProjectFiles({
      siteId,
      tenantId: auth.tenant.id,
      userId: auth.user.id,
      files: [...rewrittenSources, ...generatedFiles],
      expectedRevision,
      label: "Imported ZIP codebase",
    });
    await prisma.$transaction([
      prisma.site.update({
        where: { id: siteId },
        data: { designTokens: analysis.theme as unknown as Prisma.InputJsonValue },
      }),
      ...analysis.pages.map((page) => prisma.page.upsert({
        where: { siteId_slug: { siteId, slug: page.slug } },
        create: {
          siteId,
          title: page.title,
          slug: page.slug,
          renderMode: "REACT",
          metadata: {
            importedAt: now,
            route: page.route,
            sourceFile: page.sourceFile,
          },
        },
        update: {
          title: page.title,
          renderMode: "REACT",
          deleted: false,
          deletedAt: null,
          metadata: {
            importedAt: now,
            route: page.route,
            sourceFile: page.sourceFile,
          },
        },
      })),
    ]);
    return Response.json({
      data: {
        ...imported,
        receivedBytes,
        uploadedAssetCount: uploadedAssets.size,
        analysis,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ZIP import failed.";
    const status = /limit|exceeds|more than|unsafe|absolute/i.test(message) ? 413 : 400;
    return Response.json({ error: message }, { status });
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}
