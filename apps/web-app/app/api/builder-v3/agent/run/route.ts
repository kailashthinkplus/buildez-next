import { NextRequest } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { getTenantPlan } from "@/lib/plan/getPlan";
import { estimateV12Credits } from "@/modules/ai-v12/creditPolicy";
import {
  captureV12Credits,
  releaseV12Credits,
  reserveV12Credits,
} from "@/modules/ai-v12/creditAccounting";
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

type SelectedElementTarget = {
  elementId: string;
  kind: string;
  tagName: string;
  sourceFile: string;
  sourceAnchor: string;
  parentElementId: string | null;
  textContent: string;
  innerHTML: string;
  className: string;
  attributes: Record<string, string>;
  computedStyleSummary: Record<string, string>;
  editableCapabilities: string[];
  projectRevision: number;
};

function parseSelectedElementTarget(
  value: FormDataEntryValue | null,
): SelectedElementTarget | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Selected element payload is invalid.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error("Selected element payload is invalid.");
  }

  const candidate = parsed as Record<string, unknown>;

  const requiredStrings = [
    "elementId",
    "kind",
    "tagName",
    "sourceFile",
    "sourceAnchor",
  ] as const;

  for (const field of requiredStrings) {
    if (
      typeof candidate[field] !== "string" ||
      !candidate[field].trim()
    ) {
      throw new Error(
        `Selected element is missing ${field}.`
      );
    }
  }

  if (
    typeof candidate.projectRevision !== "number" ||
    !Number.isInteger(candidate.projectRevision) ||
    candidate.projectRevision < 0
  ) {
    throw new Error(
      "Selected element has an invalid project revision."
    );
  }

  const sourceFile = String(candidate.sourceFile);

  /*
   * Browser-supplied paths are untrusted.
   * Only canonical project-relative src paths are accepted.
   */
  if (
    sourceFile.startsWith("/") ||
    sourceFile.includes("..") ||
    sourceFile.includes("\\") ||
    !sourceFile.startsWith("src/")
  ) {
    throw new Error(
      "Selected element source file is outside the editable project."
    );
  }

  return {
    elementId: String(candidate.elementId),
    kind: String(candidate.kind),
    tagName: String(candidate.tagName),
    sourceFile,
    sourceAnchor: String(candidate.sourceAnchor),

    parentElementId:
      typeof candidate.parentElementId === "string"
        ? candidate.parentElementId
        : null,

    textContent:
      typeof candidate.textContent === "string"
        ? candidate.textContent
        : "",

    innerHTML:
      typeof candidate.innerHTML === "string"
        ? candidate.innerHTML
        : "",

    className:
      typeof candidate.className === "string"
        ? candidate.className
        : "",

    attributes:
      candidate.attributes &&
      typeof candidate.attributes === "object" &&
      !Array.isArray(candidate.attributes)
        ? candidate.attributes as Record<string, string>
        : {},

    computedStyleSummary:
      candidate.computedStyleSummary &&
      typeof candidate.computedStyleSummary === "object" &&
      !Array.isArray(candidate.computedStyleSummary)
        ? candidate.computedStyleSummary as Record<string, string>
        : {},

    editableCapabilities:
      Array.isArray(candidate.editableCapabilities)
        ? candidate.editableCapabilities.filter(
            (item): item is string =>
              typeof item === "string"
          )
        : [],

    projectRevision: candidate.projectRevision,
  };
}

export async function POST(req: NextRequest) {
  const auth = await getUser();

  if (!auth?.user || !auth.tenant) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const tenantPlan =
    await getTenantPlan(auth.tenant.id);

  const planCode =
    tenantPlan?.plan?.code ||
    tenantPlan?.subscription?.planCode ||
    "FREE";

  console.log(
    "V12 TENANT PLAN:",
    {
      tenantId: auth.tenant.id,
      planCode,
    },
  );

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

  const selectedElement =
    parseSelectedElementTarget(
      form.get("selectedElement"),
    );

  /*
   * "Selected element" is now a real scope requirement.
   * Never silently fall back to page/site generation.
   */
  if (
    context === "Selected element" &&
    !selectedElement
  ) {
    return Response.json(
      {
        error:
          "Selected element context requires an active canvas selection.",
      },
      {
        status: 400,
      },
    );
  }

  const scopedSelectedElement =
    context === "Selected element"
      ? selectedElement
      : undefined;

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

  const creditEstimate =
    estimateV12Credits({
      context,
      mode,
      creativeDirection,
      attachmentCount:
        attachments.length,
    });

  console.log(
    "V12 CREDIT ESTIMATE:",
    {
      planCode,
      ...creditEstimate,
    },
  );

  const creditReservation =
    await reserveV12Credits({
      tenantId:
        auth.tenant.id,

      userId:
        auth.user.id,

      siteId,

      planCode,

      /*
       * Keep this tolerant while enforcement is in shadow mode.
       * We will normalize commercial plan allowances before enabling
       * BUILDEZ_AI_CREDIT_ENFORCEMENT.
       */
      creditLimit:
        typeof tenantPlan?.plan?.aiCredits === "number"
          ? tenantPlan.plan.aiCredits
          : null,

      amount:
        creditEstimate.estimatedCredits,
    });

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
          console.error(
            "[V12 TRACE] route -> runV12Agent",
            {
              context,
              hasSelectedElement: Boolean(selectedElement),
              selectedElement: selectedElement
                ? {
                    elementId: selectedElement.elementId,
                    tagName: selectedElement.tagName,
                    sourceFile: selectedElement.sourceFile,
                    projectRevision: selectedElement.projectRevision,
                  }
                : null,
            },
          );

          const result = await runV12Agent({
            siteId,
            pageId: pageId || undefined,
            tenantId: auth.tenant.id,
            userId: auth.user.id,
            planCode,
            planFeatures:
              tenantPlan?.plan?.features ?? [],
            prompt,
            context,
            selectedElement: scopedSelectedElement,
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
          if (
            result.status === "needs_input"
          ) {
            await releaseV12Credits(
              creditReservation,
              "needs_input",
            );
          } else {
            await captureV12Credits(
              creditReservation,
            );
          }

          send({
            type: "done",
            revision: result.revision,
            status: result.status,
          });
        } catch (error) {
          try {
            await releaseV12Credits(
              creditReservation,
              "generation_failed",
            );
          } catch (creditReleaseError) {
            console.error(
              "V12 CREDIT RELEASE FAILED:",
              creditReleaseError,
            );
          }

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
