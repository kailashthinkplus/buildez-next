import { spawn, type ChildProcess } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { materializePreviewProject } from "./materializePreview";
import {
  normalizeGeneratedReactEffects,
} from "../project-workspace";
import {
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

export async function startPreviewSession(input: { siteId: string; tenantId: string; restart?: boolean }) {
  const existing = [...sessions.values()].find(
    (session) =>
      session.siteId === input.siteId &&
      session.tenantId === input.tenantId
  );

  if (existing && !input.restart) {
    if (await previewSessionIsHealthy(existing)) {
      return existing;
    }

    /*
     * Stale cached preview.
     *
     * Remove it and fall through to normal materialization instead
     * of returning a URL whose project directory no longer exists.
     */
    if (
      existing.process.exitCode === null &&
      !existing.process.killed
    ) {
      existing.process.kill("SIGTERM");
    }

    sessions.delete(existing.id);
  } else if (existing) {
    if (
      existing.process.exitCode === null &&
      !existing.process.killed
    ) {
      existing.process.kill("SIGTERM");
    }

    sessions.delete(existing.id);
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
    url: `http://127.0.0.1:${port}`,
    projectRoot,
    process: child,
  });
  sessions.set(id, session);
  child.once("exit", () => sessions.delete(id));
  return session;
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

    if (/\.[jt]sx$/.test(input.path)) {
      content =
        normalizeGeneratedReactEffects(
          content,
          input.path
        );

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
