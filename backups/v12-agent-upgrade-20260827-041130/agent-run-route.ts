import { NextRequest } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import {
  getAgentAttachmentError,
  getAgentAttachmentKind,
  parseCreativeDirection,
  runV12Agent,
} from "@/modules/ai-v12";

export const dynamic = "force-dynamic";
export const maxDuration = 600;
export const runtime = "nodejs";
const encoder = new TextEncoder();
const line = (value: unknown) => encoder.encode(`${JSON.stringify(value)}\n`);

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const siteId = String(form.get("siteId") || "");
  const pageId = String(form.get("pageId") || "");
  const prompt = String(form.get("prompt") || "").trim();
  const mode = form.get("mode") === "discuss" ? "discuss" : "auto";
  const contextValue = String(form.get("context") || "Website");
  const context = (["Website", "Page", "Selected element", "Image"] as const).includes(contextValue as "Website")
    ? contextValue as "Website" | "Page" | "Selected element" | "Image"
    : "Website";
  const creativeDirection = parseCreativeDirection(form.get("creativeDirection"));
  const attachments = form.getAll("attachments").filter((value): value is File => value instanceof File);
  if (!siteId || (!prompt && !attachments.length)) return Response.json({ error: "A request or reference is required." }, { status: 400 });
  const attachmentError = getAgentAttachmentError(attachments);
  if (attachmentError) {
    const hasUnsupportedFile = attachments.some((file) => !getAgentAttachmentKind(file));
    return Response.json(
      { error: attachmentError },
      { status: hasUnsupportedFile ? 415 : 413 },
    );
  }
  if (attachments.some((file) => file.name.toLowerCase().endsWith(".zip"))) {
    return Response.json(
      { error: "ZIP projects must be imported through the streamed project importer." },
      { status: 400 },
    );
  }
  let stopped = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const startedAt = Date.now();
      const send = (value: unknown) => {
        if (stopped) return;
        try {
          controller.enqueue(line(value));
        } catch {
          stopped = true;
          if (heartbeat) clearInterval(heartbeat);
        }
      };
      heartbeat = setInterval(() => {
        send({
          type: "heartbeat",
          elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000),
        });
      }, 15_000);

      void (async () => {
        try {
          send({
            type: "tool.started",
            title: attachments.length
              ? "Analyzing your design reference"
              : "Understanding your request",
          });
          const result = await runV12Agent({
            siteId,
            pageId: pageId || undefined,
            tenantId: auth.tenant.id,
            userId: auth.user.id,
            prompt,
            context,
            creativeDirection,
            mode,
            attachments,
            signal: req.signal,
            onProgress(title, detail, metadata) {
              send({
                type: metadata?.previewReady ? "preview.updated" : "tool.completed",
                title,
                detail,
                revision: metadata?.revision,
              });
            },
          });
          send({
            type: "tool.completed",
            title: result.status === "needs_input"
              ? "Product catalogue needed"
              : result.fileCount
              ? `Built ${result.fileCount} project files`
              : "Reviewed your request",
            detail: result.status === "needs_input"
              ? "Upload the requested product assets and reply in this chat"
              : `Revision ${result.revision} · ${result.model}`,
          });
          send({
            type: "message",
            role: "assistant",
            title: result.message,
            revision: result.revision,
          });
          send({
            type: "done",
            revision: result.revision,
            status: result.status,
          });
        } catch (error) {
          send({
            type: "tool.failed",
            title: "Build stopped",
            detail: error instanceof Error
              ? error.message
              : "Agent execution failed.",
          });
        } finally {
          if (heartbeat) clearInterval(heartbeat);
          if (!stopped) {
            stopped = true;
            controller.close();
          }
        }
      })();
    },
    cancel() {
      stopped = true;
      if (heartbeat) clearInterval(heartbeat);
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
