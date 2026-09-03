import { NextRequest } from "next/server";
import { prisma } from "@buildez/db";
import { ApiError } from "@/lib/api/errors";
import { getUser } from "@/lib/auth/getUser";
import { getTenantPlan } from "@/lib/plan/getPlan";
import { assertPromptAllowed } from "@/lib/ai/moderation";
import { enforceAiRateLimit } from "@/lib/ai/aiRateLimit";
import { estimateV12Credits } from "@/modules/ai-v12/creditPolicy";
import {
  captureV12Credits,
  releaseV12Credits,
  reserveV12Credits,
  type V12CreditReservation,
} from "@/modules/ai-v12/creditAccounting";
import {
  getAgentAttachmentError,
  getAgentAttachmentKind,
  parseCreativeDirection,
  runV12AgentGenerate,
  runV12AgentPlan,
  type V12AgentResult,
  type V12PipelineState,
} from "@/modules/ai-v12";
import type { V12PlanFeatureInput } from "@/modules/ai-v12/executionPolicy";

export const dynamic = "force-dynamic";
export const maxDuration = 600;
export const runtime = "nodejs";
const encoder = new TextEncoder();
const line = (value: unknown) => encoder.encode(`${JSON.stringify(value)}\n`);

/*
 * A single V12 generation used to run start-to-finish inside one HTTP
 * request: reference analysis + web research + design planning + media
 * generation + code generation, all sequentially. Immersive/cinematic
 * requests routinely pushed that past the platform's request timeout,
 * especially when the acceptance gate rejected the first attempt and
 * the whole project was regenerated from scratch.
 *
 * Generation is now a resumable V12GenerationJob with two stages —
 * "plan" (research/design/media) and "generate" (code generation +
 * verify + commit) — each run in its own HTTP request. No single
 * request has to carry the whole pipeline, so no single request can
 * hit the platform ceiling. The client (Builder3Canvas.tsx) loops:
 * POST without a jobId starts stage "plan"; a `stage.complete` event
 * carries the jobId forward to POST again for stage "generate".
 */
const SAFE_GENERATION_BUDGET_MS = 540_000;
const STALE_JOB_MS = 15 * 60_000;

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

type JobRequest = {
  siteId: string;
  pageId?: string;
  prompt: string;
  context: "Website" | "Page" | "Selected element" | "Image";
  mode: "auto" | "discuss";
  creativeDirection: ReturnType<typeof parseCreativeDirection>;
};

type JobInput = {
  request: JobRequest;
  reservation: V12CreditReservation;
};

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

  const form = await req.formData();
  const jobId = String(form.get("jobId") || "").trim();

  if (jobId) {
    return resumeJob({ req, jobId, tenantId: auth.tenant.id, userId: auth.user.id, planCode, planFeatures: tenantPlan?.plan?.features ?? [] });
  }

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

  try {
    await enforceAiRateLimit("builder-agent", auth.user.id, tenantPlan?.plan?.builderAgentLimitPerHour ?? 30);
    await assertPromptAllowed(prompt);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const code = error instanceof ApiError ? error.code : undefined;
    const message = error instanceof Error ? error.message : "Request could not be processed.";
    return Response.json({ code, error: { message, code } }, { status });
  }

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

  /*
   * One active generation per tenant/site, enforced against the
   * V12GenerationJob table rather than an in-process Set — the
   * previous in-memory guard didn't survive a server restart or
   * hold across multiple serverless instances. A job whose last
   * update is older than STALE_JOB_MS is treated as abandoned so a
   * crashed job can never permanently block new generations.
   */
  const existingActiveJob = await prisma.v12GenerationJob.findFirst({
    where: {
      siteId,
      tenantId: auth.tenant.id,
      status: { in: ["running", "stage_complete"] },
      updatedAt: { gt: new Date(Date.now() - STALE_JOB_MS) },
    },
    select: { id: true },
  });
  if (existingActiveJob) {
    return Response.json(
      {
        code: "AI_GENERATION_ALREADY_RUNNING",
        error: {
          code: "AI_GENERATION_ALREADY_RUNNING",
          message: "A generation is already running for this website.",
        },
      },
      { status: 409 },
    );
  }

  let creditReservation: V12CreditReservation;

  try {
    creditReservation =
      await reserveV12Credits({
      tenantId:
        auth.tenant.id,

      userId:
        auth.user.id,

      siteId,

      planCode,

      creditLimit:
        typeof tenantPlan?.plan?.aiCredits === "number"
          ? tenantPlan.plan.aiCredits
          : null,

        amount:
          creditEstimate.estimatedCredits,
      });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error
      ? error.message
      : "AI credits could not be reserved.";
    const code = error instanceof ApiError
      ? error.code
      : "AI_CREDIT_RESERVATION_FAILED";

    return Response.json(
      {
        code,
        error: { message, code },
      },
      { status },
    );
  }

  const job = await prisma.v12GenerationJob.create({
    data: {
      siteId,
      tenantId: auth.tenant.id,
      stage: "plan",
      status: "running",
      input: {
        request: { siteId, pageId: pageId || undefined, prompt, context, mode, creativeDirection },
        reservation: creditReservation,
      } as object,
    },
  });

  return runStage({
    req,
    job: { id: job.id, stage: "plan" as const, state: null, reservation: creditReservation },
    attachments,
    selectedElement: scopedSelectedElement,
    prompt,
    request: { siteId, pageId: pageId || undefined, prompt, context, mode, creativeDirection },
    tenantId: auth.tenant.id,
    userId: auth.user.id,
    planCode,
    planFeatures: tenantPlan?.plan?.features ?? [],
  });
}

async function resumeJob(options: {
  req: NextRequest;
  jobId: string;
  tenantId: string;
  userId: string;
  planCode: string;
  planFeatures: readonly V12PlanFeatureInput[];
}) {
  const { req, jobId, tenantId, userId, planCode, planFeatures } = options;

  /*
   * Atomically claim the job: only a job currently sitting at
   * "stage_complete" can be resumed. This is the DB-backed
   * concurrency guard — it works across server instances and
   * survives a redeploy, unlike an in-memory Set.
   */
  const claim = await prisma.v12GenerationJob.updateMany({
    where: { id: jobId, tenantId, status: "stage_complete" },
    data: { status: "running" },
  });
  if (claim.count !== 1) {
    return Response.json(
      {
        code: "AI_GENERATION_ALREADY_RUNNING",
        error: {
          code: "AI_GENERATION_ALREADY_RUNNING",
          message: "This generation is not resumable right now.",
        },
      },
      { status: 409 },
    );
  }

  const job = await prisma.v12GenerationJob.findUnique({ where: { id: jobId } });
  if (!job) {
    return Response.json({ error: "Generation job not found." }, { status: 404 });
  }

  const jobInput = job.input as unknown as JobInput;

  return runStage({
    req,
    job: {
      id: job.id,
      stage: job.stage as "plan" | "generate",
      state: job.state as unknown as V12PipelineState | null,
      reservation: jobInput.reservation,
    },
    attachments: [],
    selectedElement: undefined,
    prompt: jobInput.request.prompt,
    request: jobInput.request,
    tenantId,
    userId,
    planCode,
    planFeatures,
  });
}

function runStage(options: {
  req: NextRequest;
  job: { id: string; stage: "plan" | "generate"; state: V12PipelineState | null; reservation: V12CreditReservation };
  attachments: File[];
  selectedElement: SelectedElementTarget | undefined;
  prompt: string;
  request: JobRequest;
  tenantId: string;
  userId: string;
  planCode: string;
  planFeatures: readonly V12PlanFeatureInput[];
}) {
  const { req, job, attachments, selectedElement, prompt, request, tenantId, userId, planCode, planFeatures } = options;

  let stopped = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const executionController = new AbortController();
  const executionTimeout = setTimeout(() => {
    executionController.abort(
      new DOMException(
        "This step exceeded the safe request budget. Please retry; reserved credits were returned.",
        "TimeoutError",
      ),
    );
  }, SAFE_GENERATION_BUDGET_MS);

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

      const finishJob = async (result: V12AgentResult) => {
        await prisma.v12GenerationJob.update({
          where: { id: job.id },
          data: { status: result.status === "needs_input" ? "needs_input" : "done", result: result as unknown as object },
        });
        if (result.status === "needs_input") {
          await releaseV12Credits(job.reservation, "needs_input");
        } else {
          await captureV12Credits(job.reservation);
        }
        send({
          type: "tool.completed",
          title: result.status === "needs_input"
            ? "Input needed"
            : result.fileCount
            ? `Built ${result.fileCount} project files`
            : "Reviewed your request",
          detail: result.status === "needs_input"
            ? "Choose an option or reply to continue"
            : `Revision ${result.revision} · ${result.model}`,
        });
        send({
          type: "message",
          role: "assistant",
          title: result.message,
          status: result.status ?? "completed",
          actions: result.actions ?? [],
          revision: result.revision,
        });
        send({
          type: "done",
          revision: result.revision,
          status: result.status ?? "completed",
        });
      };

      const failJob = async (error: unknown) => {
        console.error("V12 AGENT GENERATION FAILED:", error);
        try {
          await prisma.v12GenerationJob.update({
            where: { id: job.id },
            data: { status: "failed", error: error instanceof Error ? error.message : "Agent execution failed." },
          });
        } catch (updateError) {
          console.error("V12 JOB UPDATE FAILED:", updateError);
        }
        try {
          await releaseV12Credits(job.reservation, "generation_failed");
        } catch (creditReleaseError) {
          console.error("V12 CREDIT RELEASE FAILED:", creditReleaseError);
        }
        send({
          type: "tool.failed",
          title: "Build stopped",
          detail: error instanceof Error
            ? error.message
            : "Agent execution failed.",
        });
        send({
          type: "done",
          status: "failed",
        });
      };

      void (async () => {
        try {
          send({
            type: "tool.started",
            title: job.stage === "generate"
              ? "Generating your website"
              : attachments.length
              ? "Analyzing your design reference"
              : "Understanding your request",
          });

          const signal = AbortSignal.any([req.signal, executionController.signal]);
          const onProgress = (title: string, detail?: string, metadata?: { revision?: number; previewReady?: boolean }) => {
            send({
              type: metadata?.previewReady ? "preview.updated" : "tool.completed",
              title,
              detail,
              revision: metadata?.revision,
            });
          };

          if (job.stage === "plan") {
            const outcome = await runV12AgentPlan({
              siteId: request.siteId,
              pageId: request.pageId,
              tenantId,
              userId,
              planCode,
              planFeatures,
              prompt,
              context: request.context,
              selectedElement,
              creativeDirection: request.creativeDirection,
              mode: request.mode,
              attachments,
              signal,
              onProgress,
            });

            if (outcome.kind === "done") {
              await finishJob(outcome.result);
              return;
            }

            await prisma.v12GenerationJob.update({
              where: { id: job.id },
              data: { stage: "generate", status: "stage_complete", state: outcome.state as unknown as object },
            });
            send({ type: "stage.complete", jobId: job.id, nextStage: "generate" });
            return;
          }

          if (!job.state) {
            throw new Error("Generation job is missing its plan-stage state.");
          }

          const result = await runV12AgentGenerate(job.state, {
            siteId: request.siteId,
            pageId: request.pageId,
            tenantId,
            userId,
            planCode,
            planFeatures,
            prompt,
            context: request.context,
            selectedElement,
            creativeDirection: request.creativeDirection,
            mode: request.mode,
            attachments,
            signal,
            onProgress,
          });
          await finishJob(result);
        } catch (error) {
          await failJob(error);
        } finally {
          if (heartbeat) clearInterval(heartbeat);
          clearTimeout(executionTimeout);
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
      executionController.abort(
        new DOMException("Generation stream was closed.", "AbortError"),
      );
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
