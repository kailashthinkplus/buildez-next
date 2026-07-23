import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { materializePreviewProject } from "./materializePreview";

type PreviewSession = Readonly<{
  id: string;
  siteId: string;
  tenantId: string;
  port: number;
  url: string;
  process: ChildProcess;
}>;

const globalPreview = globalThis as typeof globalThis & { __buildezV12Previews?: Map<string, PreviewSession> };
const sessions = globalPreview.__buildezV12Previews ?? new Map<string, PreviewSession>();
globalPreview.__buildezV12Previews = sessions;

function portFor(sessionId: string) {
  return 41000 + Array.from(sessionId).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 1000;
}

export async function startPreviewSession(input: { siteId: string; tenantId: string; restart?: boolean }) {
  const existing = [...sessions.values()].find((session) => session.siteId === input.siteId && session.tenantId === input.tenantId);
  if (existing && !input.restart) return existing;
  if (existing) {
    existing.process.kill("SIGTERM");
    sessions.delete(existing.id);
  }

  const id = randomUUID();
  const port = portFor(id);
  const sandboxRoot = path.join(process.cwd(), "tmp", "v12-previews");
  const { projectRoot } = await materializePreviewProject({ ...input, sandboxRoot, sessionId: id });
  const worker = path.join(process.cwd(), "modules", "builder-v3", "preview", "previewWorker.mjs");
  const child = spawn(process.execPath, [worker, projectRoot, String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "development" },
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

  const session: PreviewSession = Object.freeze({ id, siteId: input.siteId, tenantId: input.tenantId, port, url: `http://127.0.0.1:${port}`, process: child });
  sessions.set(id, session);
  child.once("exit", () => sessions.delete(id));
  return session;
}

export function stopPreviewSession(sessionId: string, tenantId: string) {
  const session = sessions.get(sessionId);
  if (!session || session.tenantId !== tenantId) throw new Error("Preview session not found");
  session.process.kill("SIGTERM");
  sessions.delete(sessionId);
  return { stopped: true };
}
