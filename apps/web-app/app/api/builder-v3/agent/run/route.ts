import { NextRequest } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { runV12Agent } from "@/modules/ai-v12";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
const encoder = new TextEncoder();
const line = (value: unknown) => encoder.encode(`${JSON.stringify(value)}\n`);

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const siteId = String(form.get("siteId") || "");
  const prompt = String(form.get("prompt") || "").trim();
  const mode = form.get("mode") === "discuss" ? "discuss" : "auto";
  const attachments = form.getAll("attachments").filter((value): value is File => value instanceof File);
  if (!siteId || (!prompt && !attachments.length)) return Response.json({ error: "A request or reference is required." }, { status: 400 });
  if (attachments.length > 5 || attachments.some(file => file.size > 20 * 1024 * 1024)) return Response.json({ error: "Use up to five files, 20 MB each." }, { status: 413 });
  const stream = new ReadableStream<Uint8Array>({ start(controller) { void (async () => {
    try {
      controller.enqueue(line({ type: "tool.started", title: attachments.length ? "Analyzing your design reference" : "Understanding your request" }));
      const result = await runV12Agent({ siteId, tenantId: auth.tenant.id, userId: auth.user.id, prompt, mode, attachments, signal: req.signal, onProgress(title, detail) { controller.enqueue(line({ type: "tool.completed", title, detail })); } });
      controller.enqueue(line({ type: "tool.completed", title: result.fileCount ? `Built ${result.fileCount} project files` : "Reviewed your request", detail: `Revision ${result.revision} · ${result.model}` }));
      controller.enqueue(line({ type: "message", role: "assistant", title: result.message, revision: result.revision }));
      controller.enqueue(line({ type: "done", revision: result.revision }));
    } catch (error) { controller.enqueue(line({ type: "tool.failed", title: "Build stopped", detail: error instanceof Error ? error.message : "Agent execution failed." })); }
    finally { controller.close(); }
  })(); } });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
