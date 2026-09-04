import { spawn, type ChildProcess } from "node:child_process";
import { access, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { materializePreviewProject } from "./materializePreview";
import {
  normalizeGeneratedProjectFile,
} from "../project-workspace";
import {
  createBuilderRuntimeScript,
  instrumentTsxSource,
} from "../visual-editor";

type PreviewSession = Readonly<{
  id: string;
  siteId: string;
  tenantId: string;
  port: number;
  url: string;
  projectRoot: string;
  process: ChildProcess;
}>;

const globalPreview = globalThis as typeof globalThis & { __buildezV12Previews?: Map<string, PreviewSession> };
const sessions = globalPreview.__buildezV12Previews ?? new Map<string, PreviewSession>();
globalPreview.__buildezV12Previews = sessions;

/*
 * React Strict Mode and rapid preview refreshes can issue overlapping start
 * requests for the same project. Materializing both requests into the same
 * project root would allow the later write of __buildez_editor.js to replace
 * the session id used by the earlier iframe. The preview would still render,
 * but every editor message would then be rejected as stale.
 *
 * Keep startup single-flight per tenant/site so the iframe URL and injected
 * editor runtime always describe the same session.
 */
const pendingStarts = new Map<string, Promise<PreviewSession>>();

function portFor(sessionId: string) {
  return 41000 + Array.from(sessionId).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 1000;
}

async function previewSessionIsHealthy(
  session: PreviewSession
) {
  /*
   * A session entry can outlive its materialized filesystem state
   * during development/restarts/manual preview cleanup.
   *
   * Never return a cached session unless BOTH the worker and the
   * materialized project still exist.
   */
  if (
    session.process.exitCode !== null ||
    session.process.killed
  ) {
    return false;
  }

  try {
    await access(session.projectRoot);
    await access(
      path.join(
        session.projectRoot,
        "__buildez_editor.js"
      )
    );

    return true;
  } catch {
    return false;
  }
}

async function createPreviewSession(input: { siteId: string; tenantId: string; restart?: boolean }) {
  const existing = [...sessions.values()].filter(
    (session) =>
      session.siteId === input.siteId &&
      session.tenantId === input.tenantId
  );

  if (existing.length === 1 && !input.restart) {
    if (await previewSessionIsHealthy(existing[0])) {
      /*
       * The Next.js process can hot-reload the visual editor while the Vite
       * preview worker remains alive. Refresh the injected bridge before
       * reusing that worker so a newly mounted iframe never executes stale
       * selection/editing behavior.
       */
      await writeFile(
        path.join(existing[0].projectRoot, "__buildez_editor.js"),
        createBuilderRuntimeScript(existing[0].id),
        "utf8",
      );
      return existing[0];
    }
  }

  /*
   * Remove stale/restarted sessions and recover from duplicate sessions
   * left by an older overlapping startup. Reusing an arbitrary duplicate
   * is unsafe because only one session id can be embedded in the shared
   * materialized editor script.
   */
  for (const session of existing) {
    if (
      session.process.exitCode === null &&
      !session.process.killed
    ) {
      session.process.kill("SIGTERM");
    }

    sessions.delete(session.id);
  }

  const id = randomUUID();
  const port = portFor(id);
  const sandboxRoot = path.join(process.cwd(), "tmp", "v12-previews");
  const { projectRoot } = await materializePreviewProject({ ...input, sandboxRoot, sessionId: id });
  const worker = path.join(process.cwd(), "modules", "builder-v3", "preview", "previewWorker.mjs");
  const child = spawn(process.execPath, [worker, projectRoot, String(port), id, input.siteId], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "development",
      BUILDEZ_PREVIEW_API_ORIGIN:
        process.env.BUILDEZ_INTERNAL_ORIGIN
        || process.env.NEXT_PUBLIC_APP_URL
        || "http://127.0.0.1:3000",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let stdout = "";
    let stderr = "";
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.stdout?.off("data", onStdout);
      child.stderr?.off("data", onStderr);
      child.off("exit", onExit);
      if (error) reject(error); else resolve();
    };
    const onStdout = (data: Buffer | string) => {
      stdout = `${stdout}${String(data)}`.slice(-16_000);
      if (stdout.includes('"type":"ready"')) finish();
    };
    const onStderr = (data: Buffer | string) => {
      stderr = `${stderr}${String(data)}`.slice(-16_000);
    };
    const onExit = (code: number | null) => finish(new Error(`Preview exited during startup (${code ?? "signal"})${stderr ? `: ${stderr.trim()}` : ""}`));
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      finish(new Error(`Preview startup timed out${stderr ? `: ${stderr.trim()}` : ""}`));
    }, 20_000);
    child.stdout?.on("data", onStdout);
    child.stderr?.on("data", onStderr);
    child.once("exit", onExit);
  });

  const session: PreviewSession = Object.freeze({
    id,
    siteId: input.siteId,
    tenantId: input.tenantId,
    port,
    // A raw http://127.0.0.1:<port> URL only resolves for whoever is on the
    // same machine as this process — fine from a local dev browser, dead on
    // arrival from a real user's browser hitting the production server.
    // Route it back through the public domain via the nginx proxy added for
    // this (see infrastructure/nginx), which forwards /_v3preview/<port>/*
    // to this loopback port.
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://getbuildezy.com"}/_v3preview/${port}`,
    projectRoot,
    process: child,
  });
  sessions.set(id, session);
  child.once("exit", () => sessions.delete(id));
  return session;
}

export async function startPreviewSession(input: { siteId: string; tenantId: string; restart?: boolean }) {
  const key = `${input.tenantId}:${input.siteId}`;
  const pending = pendingStarts.get(key);

  if (pending) return pending;

  const start = createPreviewSession(input);
  pendingStarts.set(key, start);

  try {
    return await start;
  } finally {
    if (pendingStarts.get(key) === start) pendingStarts.delete(key);
  }
}

/**
 * Synchronize one canonical project file into every active preview
 * session for this tenant/site.
 *
 * Vite watches the materialized preview filesystem, not Prisma.
 * Writing here allows normal Vite HMR to update the iframe without
 * remounting it, preserving scroll position and editor state.
 *
 * TSX/JSX must pass through exactly the same transformations used
 * during initial preview materialization so editor instrumentation
 * remains present after HMR.
 */

/**
 * Mirror an entire canonical project snapshot into every active preview
 * for this tenant/site.
 *
 * Checkpoint restore can both restore files and remove files that did not
 * exist at the checkpoint. Therefore snapshot synchronization must handle
 * deletion as well as writes.
 *
 * Existing TSX/JSX instrumentation remains centralized in
 * syncActivePreviewProjectFile().
 */
export async function syncActivePreviewProjectSnapshot(input: {
  siteId: string;
  tenantId: string;
  files: ReadonlyArray<{ path: string; content: string }>;
  previousPaths: ReadonlyArray<string>;
  projectRevision: number;
}) {
  const restoredPaths = new Set(
    input.files.map((file) => file.path),
  );

  const removedPaths = input.previousPaths.filter(
    (projectPath) => !restoredPaths.has(projectPath),
  );

  const active = [...sessions.values()].filter(
    (session) =>
      session.siteId === input.siteId &&
      session.tenantId === input.tenantId,
  );

  /*
   * Remove files that exist in the current preview but are absent from
   * the restored checkpoint.
   */
  for (const session of active) {
    for (const projectPath of removedPaths) {
      const target = path.resolve(session.projectRoot, projectPath);

      if (
        target !== session.projectRoot &&
        target.startsWith(`${session.projectRoot}${path.sep}`)
      ) {
        await rm(target, { force: true });
      }
    }
  }

  /*
   * Write every restored file through the normal live-preview path.
   * This preserves React normalization/editor instrumentation and lets
   * Vite perform HMR without replacing the iframe.
   */
  for (const file of input.files) {
    await syncActivePreviewProjectFile({
      siteId: input.siteId,
      tenantId: input.tenantId,
      path: file.path,
      content: file.content,
      projectRevision: input.projectRevision,
    });
  }

  return {
    synced: active.length,
    writtenFiles: input.files.length,
    removedFiles: removedPaths.length,
  };
}

export async function syncActivePreviewProjectFile(input: {
  siteId: string;
  tenantId: string;
  path: string;
  content: string;
  projectRevision: number;
}) {
  const active = [...sessions.values()].filter(
    (session) =>
      session.siteId === input.siteId &&
      session.tenantId === input.tenantId
  );

  if (!active.length) {
    return {
      synced: 0,
    };
  }

  for (const session of active) {
    const projectRoot = path.resolve(
      session.projectRoot
    );

    const target = path.resolve(
      projectRoot,
      input.path
    );

    /*
     * Canonical project paths are still treated as untrusted here.
     * Never permit a synchronization write outside the preview root.
     */
    if (
      !target.startsWith(
        `${projectRoot}${path.sep}`
      )
    ) {
      throw new Error(
        "Preview synchronization path escaped project sandbox"
      );
    }

    await mkdir(
      path.dirname(target),
      { recursive: true }
    );

    let content = input.content;

    content = normalizeGeneratedProjectFile(
      content,
      input.path
    );

    if (/\.[jt]sx$/.test(input.path)) {
      content =
        instrumentTsxSource(
          content,
          input.path,
          input.projectRevision
        );
    }

    /*
     * Preserve the editor runtime injection if index.html itself
     * is ever updated through the canonical writer.
     */
    if (
      input.path === "index.html" &&
      !content.includes(
        "/__buildez_editor.js"
      )
    ) {
      content = content.replace(
        "</body>",
        '<script src="/__buildez_editor.js"></script></body>'
      );
    }

    await writeFile(
      target,
      content,
      {
        encoding: "utf8",
        flag: "w",
      }
    );
  }

  return {
    synced: active.length,
  };
}


export function stopPreviewSession(sessionId: string, tenantId: string) {
  const session = sessions.get(sessionId);
  if (!session) return { stopped: false };
  if (session.tenantId !== tenantId) throw new Error("Preview session not found");
  session.process.kill("SIGTERM");
  sessions.delete(sessionId);
  return { stopped: true };
}

export function isActivePreviewSession(sessionId: string, siteId: string) {
  const session = sessions.get(sessionId);
  return Boolean(session && session.siteId === siteId);
}
