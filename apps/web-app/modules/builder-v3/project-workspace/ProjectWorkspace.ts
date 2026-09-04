import { createHash } from "node:crypto";
import {
  syncActivePreviewProjectFile,
  syncActivePreviewProjectSnapshot,
} from "../preview/PreviewSessionManager";

import { Prisma, prisma } from "@buildez/db";

import { normalizeProjectPath } from "./path";
import type { ProjectCheckpointSnapshot, ProjectFileOperation } from "./types";

function hashContent(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

async function requireTenantSite(siteId: string, tenantId: string) {
  const site = await prisma.site.findFirst({ where: { id: siteId, tenantId, deletedAt: null }, select: { id: true } });
  if (!site) throw new Error("Site not found");
  return site;
}

export async function getOrCreateProject(siteId: string, tenantId: string) {
  await requireTenantSite(siteId, tenantId);
  return prisma.v12Project.upsert({
    where: { siteId },
    create: { siteId, tenantId },
    update: {},
  });
}

export async function listProjectFiles(siteId: string, tenantId: string) {
  const project = await getOrCreateProject(siteId, tenantId);
  return prisma.v12ProjectFile.findMany({
    where: { projectId: project.id },
    orderBy: { path: "asc" },
    select: { path: true, contentHash: true, revision: true, updatedAt: true },
  });
}

export async function readProjectFile(siteId: string, tenantId: string, inputPath: string) {
  const project = await getOrCreateProject(siteId, tenantId);
  const path = normalizeProjectPath(inputPath);
  const file = await prisma.v12ProjectFile.findUnique({ where: { projectId_path: { projectId: project.id, path } } });
  if (!file) throw new Error("Project file not found");
  return file;
}

export async function writeProjectFile(input: {
  siteId: string;
  tenantId: string;
  userId?: string;
  path: string;
  content: string;
  expectedRevision?: number;
}) {
  const project = await getOrCreateProject(input.siteId, input.tenantId);
  const path = normalizeProjectPath(input.path);
  const contentHash = hashContent(input.content);

  const result = await prisma.$transaction(async (tx) => {
    const latestProject = await tx.v12Project.findUniqueOrThrow({ where: { id: project.id } });
    if (
      input.expectedRevision !== undefined &&
      input.expectedRevision !== latestProject.currentRevision
    ) {
      throw new Error("Project revision conflict");
    }

    const current = await tx.v12ProjectFile.findUnique({ where: { projectId_path: { projectId: project.id, path } } });
    if (current?.contentHash === contentHash) return { file: current, revision: latestProject.currentRevision, changed: false };

    const updatedProject = await tx.v12Project.update({
      where: { id: project.id },
      data: { currentRevision: { increment: 1 } },
      select: { currentRevision: true },
    });
    const operation: ProjectFileOperation = { type: current ? "update" : "create", path, contentHash };
    const revision = await tx.v12ProjectRevision.create({
      data: {
        projectId: project.id,
        sequence: updatedProject.currentRevision,
        operations: [operation] as Prisma.InputJsonValue,
        createdBy: input.userId,
      },
    });
    const file = await tx.v12ProjectFile.upsert({
      where: { projectId_path: { projectId: project.id, path } },
      create: { projectId: project.id, path, content: input.content, contentHash, revision: revision.sequence },
      update: { content: input.content, contentHash, revision: revision.sequence },
    });
    return {
      file,
      revision: revision.sequence,
      changed: true,
    };
  });

  /*
   * Canonical persistence has completed successfully.
   *
   * Now mirror only the changed file into the active materialized
   * preview. Vite observes this filesystem write and performs HMR,
   * so the iframe does not need to be recreated.
   */
  if (result.changed) {
    await syncActivePreviewProjectFile({
      siteId: input.siteId,
      tenantId: input.tenantId,
      path,
      content: input.content,
      projectRevision: result.revision,
    });
  }

  return result;
}

export async function createProjectCheckpoint(input: {
  siteId: string;
  tenantId: string;
  userId?: string;
  label?: string;
}) {
  const project = await getOrCreateProject(input.siteId, input.tenantId);
  let revision = await prisma.v12ProjectRevision.findUnique({
    where: { projectId_sequence: { projectId: project.id, sequence: project.currentRevision } },
  });
  if (!revision && project.currentRevision > 0) {
    // The project has content (currentRevision advanced past 0) but its
    // revision log has a gap at the current sequence — seen in the wild on
    // at least one pre-existing project, from before this write path was
    // made transactional. There's nothing to roll back to and no unsaved
    // work at risk, so back-fill the missing log entry rather than leaving
    // the project permanently unable to checkpoint or publish.
    revision = await prisma.v12ProjectRevision.create({
      data: {
        projectId: project.id,
        sequence: project.currentRevision,
        operations: [{ type: "repair", reason: "missing revision log entry back-filled before checkpoint" }] as Prisma.InputJsonValue,
        createdBy: input.userId,
      },
    });
  }
  if (!revision) throw new Error("A project revision is required before checkpointing");
  const files = await prisma.v12ProjectFile.findMany({ where: { projectId: project.id }, orderBy: { path: "asc" } });
  const snapshot: ProjectCheckpointSnapshot = {
    version: 1,
    revision: revision.sequence,
    files: files.map(({ path, content, contentHash, revision: fileRevision }) => ({ path, content, contentHash, revision: fileRevision })),
  };
  return prisma.v12ProjectCheckpoint.create({
    data: {
      projectId: project.id,
      revisionId: revision.id,
      label: input.label,
      snapshot: snapshot as Prisma.InputJsonValue,
      createdBy: input.userId,
    },
  });
}

export async function listProjectCheckpoints(input: {
  siteId: string;
  tenantId: string;
  limit?: number;
}) {
  const project = await getOrCreateProject(input.siteId, input.tenantId);
  return prisma.v12ProjectCheckpoint.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(input.limit ?? 100, 200)),
    select: {
      id: true,
      label: true,
      createdAt: true,
      revision: { select: { sequence: true } },
    },
  });
}

export async function patchProjectFile(input: {
  siteId: string;
  tenantId: string;
  userId?: string;
  path: string;
  search: string;
  replacement: string;
  expectedRevision: number;
}) {
  if (!input.search) throw new Error("Patch search text is required");
  const file = await readProjectFile(input.siteId, input.tenantId, input.path);
  const firstMatch = file.content.indexOf(input.search);
  if (firstMatch < 0) throw new Error("Patch target was not found");
  if (file.content.indexOf(input.search, firstMatch + input.search.length) >= 0) {
    throw new Error("Patch target is ambiguous");
  }
  const content = `${file.content.slice(0, firstMatch)}${input.replacement}${file.content.slice(firstMatch + input.search.length)}`;
  return writeProjectFile({ ...input, content });
}

export async function restoreProjectCheckpoint(input: {
  siteId: string;
  tenantId: string;
  userId?: string;
  checkpointId: string;
  expectedRevision: number;
}) {
  const project = await getOrCreateProject(input.siteId, input.tenantId);
  const checkpoint = await prisma.v12ProjectCheckpoint.findFirst({
    where: { id: input.checkpointId, projectId: project.id },
  });
  if (!checkpoint) throw new Error("Project checkpoint not found");

  const snapshot = checkpoint.snapshot as unknown as ProjectCheckpointSnapshot;
  if (snapshot.version !== 1 || !Array.isArray(snapshot.files)) {
    throw new Error("Unsupported checkpoint snapshot");
  }

  /*
   * Capture the currently materialized canonical paths before replacing
   * the project. Checkpoint restoration may need to remove files from
   * the live preview as well as restore files.
   */
  const previousFiles = await prisma.v12ProjectFile.findMany({
    where: { projectId: project.id },
    select: { path: true },
  });

  const result = await prisma.$transaction(async (tx) => {
    const latest = await tx.v12Project.findUniqueOrThrow({ where: { id: project.id } });
    if (latest.currentRevision !== input.expectedRevision) throw new Error("Project revision conflict");
    const nextRevision = latest.currentRevision + 1;
    await tx.v12ProjectFile.deleteMany({ where: { projectId: project.id } });
    if (snapshot.files.length) {
      await tx.v12ProjectFile.createMany({
        data: snapshot.files.map((file) => ({
          projectId: project.id,
          path: normalizeProjectPath(file.path),
          content: file.content,
          contentHash: hashContent(file.content),
          revision: nextRevision,
        })),
      });
    }
    const revision = await tx.v12ProjectRevision.create({
      data: {
        projectId: project.id,
        sequence: nextRevision,
        operations: [{ type: "restore", checkpointId: checkpoint.id }] as Prisma.InputJsonValue,
        createdBy: input.userId,
      },
    });
    await tx.v12Project.update({ where: { id: project.id }, data: { currentRevision: nextRevision } });
    return { revision: revision.sequence, restoredFiles: snapshot.files.length };
  });

  /*
   * Canonical restore succeeded. Mirror that complete snapshot into the
   * existing preview. Vite can now update the iframe through HMR instead
   * of forcing a preview-session restart.
   */
  await syncActivePreviewProjectSnapshot({
    siteId: input.siteId,
    tenantId: input.tenantId,
    files: snapshot.files.map((file) => ({
      path: normalizeProjectPath(file.path),
      content: file.content,
    })),
    previousPaths: previousFiles.map((file) => file.path),
    projectRevision: result.revision,
  });

  return result;
}

export async function searchProjectFiles(input: {
  siteId: string;
  tenantId: string;
  query: string;
  limit?: number;
}) {
  const query = input.query.trim();
  if (!query || query.length > 500) throw new Error("Invalid project search query");
  const project = await getOrCreateProject(input.siteId, input.tenantId);
  const files = await prisma.v12ProjectFile.findMany({
    where: { projectId: project.id, OR: [{ path: { contains: query, mode: "insensitive" } }, { content: { contains: query } }] },
    orderBy: { path: "asc" },
    take: Math.min(Math.max(input.limit ?? 50, 1), 100),
    select: { path: true, content: true, revision: true },
  });
  return files.map((file) => ({
    path: file.path,
    revision: file.revision,
    lineNumbers: file.content.split("\n").flatMap((line, index) => line.includes(query) ? [index + 1] : []).slice(0, 20),
  }));
}

export async function renameProjectFile(input: {
  siteId: string;
  tenantId: string;
  userId?: string;
  path: string;
  targetPath: string;
  expectedRevision: number;
}) {
  const project = await getOrCreateProject(input.siteId, input.tenantId);
  const path = normalizeProjectPath(input.path);
  const targetPath = normalizeProjectPath(input.targetPath);
  if (path === targetPath) throw new Error("Source and target paths are identical");
  return prisma.$transaction(async (tx) => {
    const latest = await tx.v12Project.findUniqueOrThrow({ where: { id: project.id } });
    if (latest.currentRevision !== input.expectedRevision) throw new Error("Project revision conflict");
    const file = await tx.v12ProjectFile.findUnique({ where: { projectId_path: { projectId: project.id, path } } });
    if (!file) throw new Error("Project file not found");
    if (await tx.v12ProjectFile.findUnique({ where: { projectId_path: { projectId: project.id, path: targetPath } } })) {
      throw new Error("Target project file already exists");
    }
    const sequence = latest.currentRevision + 1;
    const renamed = await tx.v12ProjectFile.update({ where: { id: file.id }, data: { path: targetPath, revision: sequence } });
    await tx.v12ProjectRevision.create({ data: { projectId: project.id, sequence, operations: [{ type: "rename", path, targetPath }] as Prisma.InputJsonValue, createdBy: input.userId } });
    await tx.v12Project.update({ where: { id: project.id }, data: { currentRevision: sequence } });
    return { file: renamed, revision: sequence };
  });
}

export async function deleteProjectFile(input: {
  siteId: string;
  tenantId: string;
  userId?: string;
  path: string;
  expectedRevision: number;
}) {
  const project = await getOrCreateProject(input.siteId, input.tenantId);
  const path = normalizeProjectPath(input.path);
  return prisma.$transaction(async (tx) => {
    const latest = await tx.v12Project.findUniqueOrThrow({ where: { id: project.id } });
    if (latest.currentRevision !== input.expectedRevision) throw new Error("Project revision conflict");
    const file = await tx.v12ProjectFile.findUnique({ where: { projectId_path: { projectId: project.id, path } } });
    if (!file) throw new Error("Project file not found");
    const sequence = latest.currentRevision + 1;
    await tx.v12ProjectFile.delete({ where: { id: file.id } });
    await tx.v12ProjectRevision.create({ data: { projectId: project.id, sequence, operations: [{ type: "delete", path, contentHash: file.contentHash }] as Prisma.InputJsonValue, createdBy: input.userId } });
    await tx.v12Project.update({ where: { id: project.id }, data: { currentRevision: sequence } });
    return { path, revision: sequence };
  });
}

export async function importProjectFiles(input: {
  siteId: string;
  tenantId: string;
  userId?: string;
  files: ReadonlyArray<{ path: string; content: string }>;
  expectedRevision: number;
  label?: string;
}) {
  if (!input.files.length || input.files.length > 2_000) throw new Error("Project import must contain 1 to 2,000 source files");
  const normalized = input.files.map((file) => ({ path: normalizeProjectPath(file.path), content: file.content }));
  if (new Set(normalized.map((file) => file.path)).size !== normalized.length) throw new Error("Project import contains duplicate paths");
  if (normalized.some((file) => typeof file.content !== "string" || file.content.length > 5_000_000)) throw new Error("Project import contains an invalid source file");
  if (normalized.reduce((total, file) => total + file.content.length, 0) > 100_000_000) {
    throw new Error("Project source exceeds the 100 MB workspace limit. Build output and media should not be included.");
  }
  const project = await getOrCreateProject(input.siteId, input.tenantId);

  return prisma.$transaction(async (tx) => {
    const latest = await tx.v12Project.findUniqueOrThrow({ where: { id: project.id } });
    if (latest.currentRevision !== input.expectedRevision) throw new Error("Project revision conflict");
    const sequence = latest.currentRevision + 1;
    await tx.v12ProjectFile.deleteMany({ where: { projectId: project.id } });
    await tx.v12ProjectFile.createMany({
      data: normalized.map((file) => ({ projectId: project.id, path: file.path, content: file.content, contentHash: hashContent(file.content), revision: sequence })),
    });
    const revision = await tx.v12ProjectRevision.create({
      data: { projectId: project.id, sequence, operations: [{ type: "import", fileCount: normalized.length }] as Prisma.InputJsonValue, createdBy: input.userId },
    });
    await tx.v12Project.update({ where: { id: project.id }, data: { currentRevision: sequence } });
    const snapshot: ProjectCheckpointSnapshot = {
      version: 1,
      revision: sequence,
      files: normalized.map((file) => ({ path: file.path, content: file.content, contentHash: hashContent(file.content), revision: sequence })),
    };
    const checkpoint = await tx.v12ProjectCheckpoint.create({
      data: { projectId: project.id, revisionId: revision.id, label: input.label ?? "Imported project", snapshot: snapshot as Prisma.InputJsonValue, createdBy: input.userId },
    });
    return { projectId: project.id, revision: sequence, checkpointId: checkpoint.id, fileCount: normalized.length };
  });
}
