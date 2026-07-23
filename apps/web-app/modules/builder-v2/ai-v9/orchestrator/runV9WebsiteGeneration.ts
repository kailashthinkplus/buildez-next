import { runV9BrandResolutionAgent } from "../agents/brandResolutionAgent";
import { runV9BlueprintAgent } from "../agents/blueprintAgent";
import { runV9DesignBriefAgent } from "../agents/designBriefAgent";
import { runV9ImageAgent } from "../agents/imageAgent";
import { runV9IntentAgent } from "../agents/intentAgent";
import { runV9QaAgent } from "../agents/qaAgent";
import { runV9ResearchAgent } from "../agents/researchAgent";
import type { AgentLog, V9Workflow } from "../agents/types";
import { runV9ValidatorAgent } from "../agents/validatorAgent";
import { runV9VisualRepairAgent } from "../agents/visualRepairAgent";
import { createFallbackBlueprint } from "../blueprintFactory";
import {
  logBlueprintDebug,
  logBuilderDebug,
  summarizeBlueprint,
} from "../../debug/blueprintDebug";

type RunV9Input = Omit<V9Workflow, "logs" | "blueprint" | "intent">;
const REJECT_BELOW_SCORE = 75;
const MIN_QUALITY_SCORE = 85;
const CANDIDATES_PER_BATCH = 5;
const MAX_CANDIDATE_BATCHES = 2;
const DEFAULT_ACTIVE_CANDIDATES = 2;
const DEFAULT_ACTIVE_BATCHES = 1;
const DEFAULT_CANDIDATE_TIMEOUT_MS = 75_000;
const DEFAULT_GENERATION_TIMEOUT_MS = 120_000;
const DEFAULT_CANDIDATE_GRACE_MS = 8_000;
const DEFAULT_RESPONSE_RESERVE_MS = 12_000;

function log(input: AgentLog) {
  return input;
}

function workflowText(workflow: V9Workflow) {
  return [
    workflow.prompt,
    workflow.brandContext?.industry,
    workflow.brandContext?.useCase,
    workflow.brandContext?.audience,
    workflow.brandContext?.offer,
    workflow.brandContext?.designIntent,
    workflow.intent?.industry,
    workflow.intent?.goal,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function contractForWorkflow(workflow: V9Workflow) {
  const text = workflowText(workflow);
  if (/\b(?:saas|software|platform|app)\b/.test(text)) {
    return {
      narrative: ["outcome", "workflow", "features", "proof", "integrations", "pricing path", "demo"],
      required: [
        "Hero: product-led outcome with h1, proof cue, and demo/trial CTA",
        "Workflow: visual step strip or process diagram for how the product works",
        "Features: dense benefit cards tied to user roles and use case",
        "Proof: metrics/credentials only if verified, otherwise trust explanation",
        "Integrations or use cases: compact grid if relevant",
        "Pricing/Demo path: comparison or decision section",
        "Lead form: demo, trial, or sales contact",
      ],
    };
  }
  if (/shop|store|ecommerce|retail|product/.test(text)) {
    return {
      narrative: ["desire", "collections", "offer grid", "materials", "social proof", "trust", "purchase"],
      required: [
        "Hero: image-led product or collection promise with purchase CTA",
        "Collections: browsable offer/category grid",
        "Offer Grid: product/package/listing cards with complete details",
        "Materials/quality: tactile proof section",
        "Gallery: lifestyle or product visuals",
        "Trust: shipping, returns, guarantees, or proof without fake claims",
        "Purchase CTA: order, enquiry, or shop action",
      ],
    };
  }
  if (/clinic|doctor|medical|health|hospital|dental|care/.test(text)) {
    return {
      narrative: ["reassurance", "services", "care path", "team", "confidence", "answers", "appointment"],
      required: [
        "Hero: calm trust-first h1 with appointment/call CTA",
        "Services: care pathway cards",
        "Care path: what happens next in 3-4 steps",
        "Team/Credentials: verified clinicians or neutral expertise cues",
        "Patient confidence: safety, accessibility, and support details",
        "FAQ: common objections and practical answers",
        "Lead form: appointment or consultation request",
      ],
    };
  }
  if (/restaurant|cafe|food|dining|hotel|hospitality/.test(text)) {
    return {
      narrative: ["arrival", "signature", "menu", "ambience", "story", "visit details", "reservation"],
      required: [
        "Hero: atmospheric venue/food promise with reservation/order CTA",
        "Signature: featured dishes, rooms, or experiences",
        "Menu/Offer: browsable offer grid",
        "Ambience Gallery: image-led section",
        "Story: craft, sourcing, or hospitality context",
        "Visit Details: hours/location if verified or neutral service area",
        "Reservation CTA: booking, order, or enquiry form",
      ],
    };
  }
  if (/real estate|property|villa|apartment|builder|construction/.test(text)) {
    return {
      narrative: ["arrival", "context", "showcase", "materials", "confidence", "visit path", "enquiry"],
      required: [
        "Hero: cinematic visual with buyer-specific h1 and enquiry/site-visit CTA",
        "Context: location or buyer fit using verified facts only",
        "Showcase: gallery or offer grid for projects/listings, no fake names",
        "Materials: architectural/detail story",
        "Confidence: proof ledger without fake stats",
        "Visit path: next steps for brochure/callback/site visit",
        "Enquiry: lead form with no invented contact data",
      ],
    };
  }
  return {
    narrative: ["promise", "offer", "fit", "proof", "process", "answers", "contact"],
    required: [
      "Hero: outcome-led h1 with clear CTA",
      "Offer clarity: service/product/program cards",
      "Audience fit: who this is for and why it matters",
      "Proof: verified facts or neutral trust explanation",
      "Process: steps to work together or buy",
      "FAQ: objections before conversion",
      "Contact: enquiry, quote, booking, or call form",
    ],
  };
}

function candidateDirectives(batch: number, workflow: V9Workflow) {
  const offset = batch * CANDIDATES_PER_BATCH;
  const contract = contractForWorkflow(workflow);
  return [
    {
      id: `candidate-${offset + 1}`,
      creativeDirection: "immersive editorial homepage tailored to the detected industry, audience, and offer",
      layoutArchetype:
        "full-screen image hero, split proof story, asymmetric offer showcase, bordered trust grid, editorial quote/evidence section, proof ribbon, two-column conversion close",
      typographySystem:
        "distinctive display headlines with refined sans body and compact uppercase labels",
      colorPalette:
        "brand-aware neutral base, one confident primary color, one industry-appropriate accent, soft 1px borders",
      sectionNarrative: contract.narrative,
    },
    {
      id: `candidate-${offset + 2}`,
      creativeDirection: "premium buyer journey for the requested market, product, or service",
      layoutArchetype:
        "asymmetric image-led hero, buyer journey, context strip, staggered showcase gallery, proof ledger, calm conversion concierge",
      typographySystem:
        "high-contrast editorial serif display, compact uppercase labels, calm readable sans body",
      colorPalette:
        "soft light base, graphite text, one industry-appropriate accent, muted supporting surfaces",
      sectionNarrative: contract.narrative,
    },
    {
      id: `candidate-${offset + 3}`,
      creativeDirection: "studio-grade portfolio or catalog presentation",
      layoutArchetype:
        "full-bleed visual hero, spotlight feature, asymmetric gallery, capability ledger, restrained CTA",
      typographySystem: "architectural grotesk with precise scale, narrow labels, generous line height",
      colorPalette: "gallery white, mineral grey, deep neutral, one vivid accent, pale concrete",
      sectionNarrative: ["statement", "showcase", "details", "process", "credibility", "action"],
    },
    {
      id: `candidate-${offset + 4}`,
      creativeDirection: "premium conversion without template blocks",
      layoutArchetype:
        "split hero, offer comparison, context story, proof strip, FAQ-style decision guide, CTA",
      typographySystem: "bold modern display sans with elegant body rhythm",
      colorPalette: "porcelain, ink, muted teal, warm taupe, copper",
      sectionNarrative: ["clarity", "fit", "location", "confidence", "answers", "action"],
      requiredSections: contract.required,
    },
    {
      id: `candidate-${offset + 5}`,
      creativeDirection: "image-led lifestyle or product experience story",
      layoutArchetype:
        "immersive hero, lifestyle proof, material or product story, editorial testimonial alternative, gallery, CTA",
      typographySystem: "soft luxury display headings paired with clean humanist sans text",
      colorPalette: "limestone, smoked oak, eucalyptus, off-white, muted wine accent",
      sectionNarrative: ["atmosphere", "experience", "craft", "proof", "gallery", "action"],
      requiredSections: contract.required,
    },
  ].map((directive) => ({
    ...directive,
    minimumQualityBar: {
      sections: "7-12 meaningful sections",
      h1: "first visible heading must be h1",
      layouts: "at least 3 distinct section layouts and 2 asymmetric/editorial sections",
      showcase: "at least one strong visual showcase section",
      forbidden:
        "Project Name 1, Why Choose Us, default BuildEZ palette, repeated card grids, fake testimonials, hard-coded real-estate language unless the prompt asks for real estate",
    },
  }));
}

function rotateItems<T>(items: T[], offset: number) {
  if (!items.length) return items;
  const safeOffset = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(safeOffset), ...items.slice(0, safeOffset)];
}

function directiveRotationSeed(input: {
  prompt: string;
  pageId: string;
  attempt: number;
}) {
  return [input.prompt, input.pageId, input.attempt, Date.now()]
    .join("|")
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 17);
}

function hardGateFailures(qa: ReturnType<typeof runV9QaAgent>) {
  const gates = qa.gates || {};
  return Object.entries(gates)
    .filter(([, passed]) => !passed)
    .map(([gate]) => gate);
}

function capRepairScore(qa: ReturnType<typeof runV9QaAgent>) {
  if (qa.score <= MIN_QUALITY_SCORE) return qa;

  return {
    ...qa,
    score: MIN_QUALITY_SCORE,
    warnings: [
      ...qa.warnings,
      "Repaired score capped at 85 until rendered visual verification is available.",
    ],
  };
}

function strictQualityGateEnabled() {
  return !/^(0|false|no|off)$/i.test(
    process.env.AI_STRICT_QUALITY_GATE?.trim() || "true"
  );
}

function deterministicFallbackEnabled() {
  return /^(1|true|yes|on)$/i.test(
    process.env.AI_ALLOW_DETERMINISTIC_FALLBACK?.trim() || "false"
  );
}

function envNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function envFlag(name: string, fallback: boolean) {
  const value = process.env[name]?.trim();
  if (!value) return fallback;
  return /^(1|true|yes|on)$/i.test(value);
}

function timeoutError(message: string) {
  const error = new Error(message);
  error.name = "TimeoutError";
  return error;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(timeoutError(message)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

function sleep<T>(timeoutMs: number, value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), timeoutMs);
  });
}

function timedOut(error: unknown) {
  return error instanceof Error && error.name === "TimeoutError";
}

function blueprintStructuralError(blueprint: V9Workflow["blueprint"]) {
  if (!blueprint) return "AI v9 orchestrator did not produce a blueprint.";
  if (!blueprint.root) return "AI v9 blueprint is missing root.";
  if (!blueprint.nodes || Object.keys(blueprint.nodes).length === 0) {
    return "AI v9 blueprint is missing nodes.";
  }
  if (!blueprint.nodes[blueprint.root]) {
    return "AI v9 blueprint root does not point to a node.";
  }
  return null;
}

export async function runV9WebsiteGeneration(input: RunV9Input) {
  const workflow: V9Workflow = {
    ...input,
    logs: [],
  };

  const brandResolutionResult = await runV9BrandResolutionAgent(workflow);
workflow.brandResolution = brandResolutionResult.brand;

logBuilderDebug("ai-v9:brand-resolution", {
  ok: brandResolutionResult.ok,
  confidence: brandResolutionResult.brand.confidence,
  companyName: brandResolutionResult.brand.companyName,
  officialWebsite: brandResolutionResult.brand.officialWebsite,
  logoUrl: brandResolutionResult.brand.logoUrl,
  warnings: brandResolutionResult.warnings,
});

workflow.logs.push(
  log({
    agent: "BrandResolutionAgent",
    stage: "brand-resolution",
    ok: brandResolutionResult.ok,
    summary: `Resolved brand ${brandResolutionResult.brand.companyName || "unknown"} at ${brandResolutionResult.brand.confidence}/100 confidence.`,
    warnings: brandResolutionResult.warnings,
  })
);

if (brandResolutionResult.brand.confidence < 55) {
  logBuilderDebug("ai-v9:brand-resolution-low-confidence", {
    confidence: brandResolutionResult.brand.confidence,
    reason:
      "Continuing generation with prompt, site name, and saved context instead of falling back.",
    warnings: brandResolutionResult.warnings,
  });
  workflow.logs.push(
    log({
      agent: "BrandResolutionAgent",
      stage: "brand-resolution",
      ok: false,
      summary: `Brand resolution confidence is low (${brandResolutionResult.brand.confidence}/100); continuing with prompt and saved context.`,
      warnings: [
        ...brandResolutionResult.warnings,
        "Low brand confidence is non-fatal. Provide an official website/logo later for more accurate brand-specific copy.",
      ],
    })
  );
}

workflow.brandContext = {
  ...(workflow.brandContext || {}),
  companyName:
    brandResolutionResult.brand.companyName ||
    workflow.brandContext?.companyName,
  websiteUrl:
    brandResolutionResult.brand.officialWebsite ||
    workflow.brandContext?.websiteUrl,
  logoUrl:
    brandResolutionResult.brand.logoUrl ||
    workflow.brandContext?.logoUrl,
  industry:
    brandResolutionResult.brand.industry ||
    workflow.brandContext?.industry,
};

  const researchResult = await runV9ResearchAgent(workflow);
  workflow.research = researchResult.research;
  logBuilderDebug("ai-v9:research", {
    ok: researchResult.ok,
    source: researchResult.research.source,
    url: researchResult.research.url,
    warnings: researchResult.warnings,
    signals: (researchResult.research as Record<string, unknown>).signals,
  });
  workflow.logs.push(
    log({
      agent: "ResearchAgent",
      stage: "research",
      ok: researchResult.ok,
      summary:
        ["website", "verified-website", "openai-search+website"].includes(
  String(researchResult.research.source)
)
          ? `Researched ${researchResult.research.url}.`
          : "Used saved context without website research.",
      warnings: researchResult.warnings,
    })
  );

  workflow.intent = runV9IntentAgent(workflow);
  logBuilderDebug("ai-v9:intent", {
    intent: workflow.intent,
    prompt: workflow.prompt,
    contextKeys: Object.keys(workflow.brandContext || {}),
  });
  workflow.logs.push(
    log({
      agent: "IntentAgent",
      stage: "intent",
      ok: true,
      summary: `Inferred ${workflow.intent.industry} for ${workflow.intent.audience}.`,
    })
  );

  const designBriefResult = await runV9DesignBriefAgent(workflow);
  workflow.designBrief = designBriefResult.brief;
  logBuilderDebug("ai-v9:design-brief", {
    ok: designBriefResult.ok,
    warnings: designBriefResult.warnings,
    brief: designBriefResult.brief,
  });
  workflow.logs.push(
    log({
      agent: "DesignBriefAgent",
      stage: "art-direction",
      ok: designBriefResult.ok,
      summary: "Created a prompt-specific creative direction for layout, palette, copy, and imagery.",
      warnings: designBriefResult.warnings,
    })
  );

  let selected:
    | {
        source: string;
        batch: number;
        blueprint: NonNullable<V9Workflow["blueprint"]>;
        qa: ReturnType<typeof runV9QaAgent>;
        repaired: boolean;
        qualityStatus: "passed" | "needs_improvement";
      }
    | null = null;
  let bestAvailable:
    | {
        source: string;
        batch: number;
        blueprint: NonNullable<V9Workflow["blueprint"]>;
        qa: ReturnType<typeof runV9QaAgent>;
        repaired: boolean;
        qualityStatus: "needs_improvement";
      }
    | null = null;
  const rejectionReasons: string[] = [];
  const strictQualityGate = strictQualityGateEnabled();
  const candidateTimeoutMs = envNumber(
    "AI_CANDIDATE_TIMEOUT_MS",
    DEFAULT_CANDIDATE_TIMEOUT_MS
  );
  const activeCandidateCount = Math.max(
    1,
    Math.min(
      CANDIDATES_PER_BATCH,
      envNumber("AI_V9_CANDIDATE_COUNT", DEFAULT_ACTIVE_CANDIDATES)
    )
  );
  const activeBatchCount = Math.max(
    1,
    Math.min(
      MAX_CANDIDATE_BATCHES,
      envNumber("AI_V9_CANDIDATE_BATCHES", DEFAULT_ACTIVE_BATCHES)
    )
  );
  const generationTimeoutMs = envNumber(
    "AI_GENERATION_TIMEOUT_MS",
    DEFAULT_GENERATION_TIMEOUT_MS
  );
  const candidateGraceMs = envNumber(
    "AI_CANDIDATE_GRACE_MS",
    DEFAULT_CANDIDATE_GRACE_MS
  );
  const responseReserveMs = envNumber(
    "AI_RESPONSE_RESERVE_MS",
    DEFAULT_RESPONSE_RESERVE_MS
  );
  const imageResponseReserveMs = envNumber("AI_IMAGE_RESPONSE_RESERVE_MS", 5_000);
  const paidImageGenerationEnabled = envFlag(
    "AI_ENABLE_PAID_IMAGE_GENERATION",
    false
  );
  const waitForImageHydration =
    envFlag("AI_WAIT_FOR_IMAGE_HYDRATION", false) ||
    paidImageGenerationEnabled ||
    Boolean(process.env.UNSPLASH_ACCESS_KEY?.trim());
  const skipImageAgent = envFlag("AI_SKIP_IMAGE_AGENT", false);
  const startedAt = Date.now();

  function rememberBestAvailable(candidate: NonNullable<typeof bestAvailable>) {
    if (!bestAvailable || candidate.qa.score > bestAvailable.qa.score) {
      bestAvailable = candidate;
    }
  }

  function generationTimedOut() {
    return Date.now() - startedAt >= generationTimeoutMs;
  }

  function remainingMs() {
    return generationTimeoutMs - (Date.now() - startedAt);
  }

  for (let batch = 0; batch < activeBatchCount && !selected; batch += 1) {
    if (generationTimedOut()) {
      rejectionReasons.push(
        `Global generation timeout reached before batch ${batch + 1}.`
      );
      break;
    }

    const directives = rotateItems(
      candidateDirectives(batch, workflow),
      directiveRotationSeed({
        prompt: workflow.prompt,
        pageId: workflow.pageId,
        attempt: batch,
      })
    ).slice(0, activeCandidateCount);
    const pending = directives.map((directive, index) => {
      const promise = (async () => {
        logBuilderDebug("ai-v9:candidate-start", {
          batch: batch + 1,
          candidate: directive.id,
          timeoutMs: candidateTimeoutMs,
          elapsedMs: Date.now() - startedAt,
        });
        const result = await withTimeout(
          runV9BlueprintAgent(workflow, directive),
          Math.max(1_000, Math.min(candidateTimeoutMs, remainingMs())),
          "candidate_timeout"
        );
        return {
          index,
          source: String(directive.id),
          directive,
          blueprint: result.blueprint,
        };
      })();

      return promise
        .then((value) => ({
          index,
          status: "fulfilled" as const,
          value,
        }))
        .catch((reason) => ({
          index,
          status: "rejected" as const,
          reason,
        }));
    });

    const scoredCandidates: Array<{
      source: string;
      blueprint: NonNullable<V9Workflow["blueprint"]>;
      qa: ReturnType<typeof runV9QaAgent>;
    }> = [];
    let firstDraftAt: number | null = null;
    let open = [...pending];

    while (open.length > 0 && !selected) {
      if (generationTimedOut()) {
        rejectionReasons.push(
          `Global generation timeout reached while waiting for batch ${batch + 1}.`
        );
        break;
      }

      const waiters: Array<(typeof open)[number] | Promise<{ status: "grace_elapsed"; index: -1 }>> = [
        ...open,
      ];
      if (bestAvailable && !strictQualityGate && firstDraftAt) {
        const graceRemaining = Math.max(
          0,
          candidateGraceMs - (Date.now() - firstDraftAt)
        );
        const reserveRemaining = Math.max(0, remainingMs() - responseReserveMs);
        waiters.push(
          sleep(Math.max(0, Math.min(graceRemaining, reserveRemaining)), {
            status: "grace_elapsed" as const,
            index: -1 as const,
          })
        );
      }

      const result = await Promise.race(waiters);
      if (result.status === "grace_elapsed") {
        logBuilderDebug("ai-v9:candidate-batch-early-return", {
          batch: batch + 1,
          reason:
            remainingMs() <= responseReserveMs
              ? "global_timeout_reserve"
              : "draft_grace_elapsed",
          candidateGraceMs,
          responseReserveMs,
          remainingMs: remainingMs(),
          bestAvailable: {
            source: bestAvailable?.source,
            score: bestAvailable?.qa.score,
          },
          pendingCandidates: open.length,
        });
        break;
      }
      open = open.filter((promise) => promise !== pending[result.index]);

      if (result.status === "rejected") {
          const message =
            result.reason instanceof Error
              ? result.reason.message
              : "Blueprint candidate generation failed.";
          if (timedOut(result.reason)) {
            logBuilderDebug("ai-v9:candidate-timeout", {
              batch: batch + 1,
              candidate: directives[result.index].id,
              timeoutMs: candidateTimeoutMs,
              elapsedMs: Date.now() - startedAt,
            });
          }
          rejectionReasons.push(`${directives[result.index].id}: ${message}`);
          logBuilderDebug("ai-v9:candidate-error", {
            batch: batch + 1,
            candidate: directives[result.index],
            message,
          });
          continue;
      }

        const candidateWorkflow = {
          ...workflow,
          blueprint: result.value.blueprint,
          candidateDirective: result.value.directive,
        };
        const qa = runV9QaAgent(candidateWorkflow);
        logBuilderDebug("ai-v9:candidate-score-complete", {
          batch: batch + 1,
          candidate: result.value.source,
          elapsedMs: Date.now() - startedAt,
          score: qa.score,
          gateFailures: hardGateFailures(qa),
        });
        logBlueprintDebug(
          `ai-v9:candidate-blueprint:${result.value.source}`,
          result.value.blueprint
        );
        logBuilderDebug("ai-v9:candidate-score", {
          batch: batch + 1,
          source: result.value.source,
          directive: result.value.directive,
          score: qa.score,
          categoryScores: qa.categoryScores,
          hardPenalties: qa.hardPenalties,
          gates: qa.gates,
          gateFailures: hardGateFailures(qa),
          warnings: qa.warnings,
          summary: summarizeBlueprint(result.value.blueprint),
        });

      scoredCandidates.push({
        source: result.value.source,
        blueprint: result.value.blueprint,
        qa,
      });

      if (qa.score >= MIN_QUALITY_SCORE && hardGateFailures(qa).length === 0) {
      selected = {
          source: result.value.source,
          batch: batch + 1,
          blueprint: result.value.blueprint,
          qa,
        repaired: false,
        qualityStatus: "passed",
      };
      break;
    }

    const repairWorkflow: V9Workflow = {
      ...workflow,
        blueprint: result.value.blueprint,
      candidateDirective: result.value.directive,
    };
    const visualRepair = runV9VisualRepairAgent(repairWorkflow);
    const repairedQa = capRepairScore(runV9QaAgent(repairWorkflow));
    const repairedGateFailures = hardGateFailures(repairedQa);
    logBuilderDebug("ai-v9:candidate-repair", {
      batch: batch + 1,
        source: result.value.source,
        originalScore: qa.score,
      repairChanged: visualRepair.changed,
      repairWarnings: visualRepair.warnings,
      repairedScore: repairedQa.score,
      repairedGateFailures,
      repairedWarnings: repairedQa.warnings,
      summary: summarizeBlueprint(repairWorkflow.blueprint),
    });
    logBlueprintDebug("ai-v9:repaired-candidate", repairWorkflow.blueprint);

    if (
      repairedQa.score >= MIN_QUALITY_SCORE &&
      repairedGateFailures.length === 0
    ) {
      selected = {
          source: result.value.source,
          batch: batch + 1,
        blueprint: repairWorkflow.blueprint,
        qa: repairedQa,
        repaired: true,
        qualityStatus: "passed",
      };
      break;
    }

    rememberBestAvailable({
        source: result.value.source,
        batch: batch + 1,
      blueprint: repairWorkflow.blueprint,
      qa: repairedQa,
      repaired: visualRepair.changed,
      qualityStatus: "needs_improvement",
    });

      if (!firstDraftAt) firstDraftAt = Date.now();

    rejectionReasons.push(
        `Batch ${batch + 1} candidate ${result.value.source} scored ${qa.score}/100 and repaired to ${repairedQa.score}/100 with gates ${repairedGateFailures.join(", ") || "none"}.`
    );

      if (
        bestAvailable &&
        !strictQualityGate &&
        firstDraftAt &&
        (Date.now() - firstDraftAt >= candidateGraceMs ||
          remainingMs() <= responseReserveMs)
      ) {
        logBuilderDebug("ai-v9:candidate-batch-early-return", {
          batch: batch + 1,
          reason:
            remainingMs() <= responseReserveMs
              ? "global_timeout_reserve"
              : "draft_grace_elapsed",
          candidateGraceMs,
          responseReserveMs,
          remainingMs: remainingMs(),
          bestAvailable: {
            source: bestAvailable.source,
            score: bestAvailable.qa.score,
          },
          pendingCandidates: open.length,
        });
        break;
      }
    }

    scoredCandidates.sort((a, b) => b.qa.score - a.qa.score);
    const best = scoredCandidates[0];
    logBuilderDebug("ai-v9:candidate-batch", {
      batch: batch + 1,
      minQualityScore: MIN_QUALITY_SCORE,
      rejectBelowScore: REJECT_BELOW_SCORE,
      scored: scoredCandidates.map((candidate) => ({
        source: candidate.source,
        score: candidate.qa.score,
        gateFailures: hardGateFailures(candidate.qa),
        warnings: candidate.qa.warnings,
        summary: summarizeBlueprint(candidate.blueprint),
      })),
      best: best
        ? {
            source: best.source,
            score: best.qa.score,
            gateFailures: hardGateFailures(best.qa),
          }
        : null,
    });

    if (bestAvailable && !strictQualityGate && !selected) {
      break;
    }
  }

  if (!selected) {
    if (bestAvailable && !strictQualityGate) {
      selected = bestAvailable;
      logBuilderDebug("ai-v9:candidate-selection-draft", {
        minQualityScore: MIN_QUALITY_SCORE,
        rejectBelowScore: REJECT_BELOW_SCORE,
        selected: selected.source,
        score: selected.qa.score,
        warnings: selected.qa.warnings,
        rejectionReasons,
        reason:
          "Strict quality gate is disabled; accepting best available candidate as needs_improvement draft.",
        summary: summarizeBlueprint(selected.blueprint),
      });
    }
  }

  if (!selected) {
    logBuilderDebug("ai-v9:candidate-selection-failed", {
      minQualityScore: MIN_QUALITY_SCORE,
      rejectBelowScore: REJECT_BELOW_SCORE,
      strictQualityGate,
      activeBatchCount,
      activeCandidateCount,
      rejectionReasons,
    });

    if (!deterministicFallbackEnabled()) {
      throw new Error(
        `QUALITY_GATE_FAILED: No valid model candidate completed. ${rejectionReasons.join(" ")}`
      );
    }

    const fallbackBlueprint = createFallbackBlueprint({
      ...workflow,
    });
    const fallbackWorkflow = {
      ...workflow,
      blueprint: fallbackBlueprint,
    };
    const fallbackQa = runV9QaAgent(fallbackWorkflow);
    selected = {
      source: "deterministic-fallback",
      batch: activeBatchCount,
      blueprint: fallbackBlueprint,
      qa: fallbackQa,
      repaired: false,
      qualityStatus: "needs_improvement",
    };
    rejectionReasons.push(
      `No model candidate completed within ${candidateTimeoutMs}ms; used deterministic fallback to stay within the response budget.`
    );
    workflow.logs.push(
      log({
        agent: "CandidateSelectorAgent",
        stage: "fallback",
        ok: false,
        summary:
          "Model candidates timed out, so BuildEZ used the deterministic editable blueprint fallback.",
        warnings: rejectionReasons,
      })
    );
  }

  workflow.blueprint = selected.blueprint;
  let qa = selected.qa;
  logBuilderDebug("ai-v9:selected-candidate", {
    source: selected.source,
    batch: selected.batch,
    repaired: selected.repaired,
    qualityStatus: selected.qualityStatus,
    score: selected.qa.score,
    categoryScores: selected.qa.categoryScores,
    hardPenalties: selected.qa.hardPenalties,
    gates: selected.qa.gates,
    warnings: selected.qa.warnings,
    rejectionReasons,
    summary: summarizeBlueprint(selected.blueprint),
  });
  logBuilderDebug("ai-v9:candidate-selected", {
    source: selected.source,
    batch: selected.batch,
    qualityStatus: selected.qualityStatus,
    score: selected.qa.score,
    elapsedMs: Date.now() - startedAt,
  });
  workflow.logs.push(
    log({
      agent: "CandidateSelectorAgent",
      stage: "candidate-selection",
      ok: true,
      summary:
        selected.qualityStatus === "passed"
          ? `Selected ${selected.source} from batch ${selected.batch} at ${selected.qa.score}/100${selected.repaired ? " after visual repair" : ""}.`
          : `Selected best available draft ${selected.source} from batch ${selected.batch} at ${selected.qa.score}/100; visual quality needs improvement.`,
      warnings: [...selected.qa.warnings, ...rejectionReasons],
    })
  );

  let imageResult: Awaited<ReturnType<typeof runV9ImageAgent>>;
  if (skipImageAgent || remainingMs() <= responseReserveMs) {
    imageResult = {
      targets: 0,
      applied: 0,
      warnings: [
        skipImageAgent
          ? "Skipped image agent by configuration; aiImagePrompt/backgroundPrompt values remain on the blueprint."
          : "Skipped image hydration to preserve response time; aiImagePrompt/backgroundPrompt values remain on the blueprint.",
      ],
    };
    logBuilderDebug("ai-v9:image-agent-start", {
      pageId: workflow.pageId,
      waitForImageHydration,
      remainingMs: remainingMs(),
      responseReserveMs,
      reason: "Image hydration is non-blocking for V9 generation.",
    });
    logBuilderDebug("ai-v9:image-agent-complete", {
      pageId: workflow.pageId,
      warnings: imageResult.warnings,
      elapsedMs: Date.now() - startedAt,
      reason: "Skipped image hydration; returning blueprint draft.",
    });
  } else {
    try {
      imageResult = await withTimeout(
        runV9ImageAgent(workflow),
        waitForImageHydration
          ? Math.max(1_000, remainingMs() - imageResponseReserveMs)
          : Math.min(5_000, Math.max(1_000, remainingMs() - responseReserveMs)),
        "image_agent_timeout"
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image hydration failed.";
      imageResult = {
        targets: 0,
        applied: 0,
        warnings: [
          `${message}; preserving aiImagePrompt/backgroundPrompt values and returning blueprint without blocking.`,
        ],
      };
      logBuilderDebug("ai-v9:image-agent-complete", {
        pageId: workflow.pageId,
        warnings: imageResult.warnings,
        elapsedMs: Date.now() - startedAt,
        reason: "Image hydration failed or timed out; returning blueprint draft.",
      });
    }
  }
  logBuilderDebug("ai-v9:image-agent-result", {
    targets: imageResult.targets,
    applied: "applied" in imageResult ? imageResult.applied : 0,
    warnings: imageResult.warnings,
    summary: summarizeBlueprint(workflow.blueprint),
  });
  workflow.logs.push(
    log({
      agent: "ImageAgent",
      stage: "image-hydration",
      ok: imageResult.warnings.length === 0,
      summary:
        "applied" in imageResult && imageResult.applied
          ? `Applied ${imageResult.applied} image asset(s) to ${imageResult.targets} image target(s).`
          : `Checked ${imageResult.targets} image target(s); paid image generation is optional and prompts were preserved where needed.`,
      warnings: imageResult.warnings,
    })
  );

  const validation = runV9ValidatorAgent(workflow);
  logBuilderDebug("ai-v9:validation", {
    valid: validation.valid,
    warnings: validation.warnings,
    summary: summarizeBlueprint(workflow.blueprint),
  });
  workflow.logs.push(
    log({
      agent: "ValidatorAgent",
      stage: "validate",
      ok: validation.valid,
      summary: validation.valid
        ? validation.warnings.length
          ? "Blueprint passed native renderer validation with non-fatal quality warnings."
          : "Blueprint passed native renderer validation."
        : "Blueprint has validation warnings.",
      warnings: validation.warnings,
    })
  );

  qa = runV9QaAgent(workflow);
  logBuilderDebug("ai-v9:final-qa", {
    score: qa.score,
    categoryScores: qa.categoryScores,
    hardPenalties: qa.hardPenalties,
    gates: qa.gates,
    gateFailures: hardGateFailures(qa),
    warnings: qa.warnings,
    summary: summarizeBlueprint(workflow.blueprint),
  });
  workflow.logs.push(
    log({
      agent: "QaAgent",
      stage: "quality",
      ok: qa.score >= MIN_QUALITY_SCORE && hardGateFailures(qa).length === 0,
      summary: `Quality score ${qa.score}/100.`,
      warnings: [...qa.warnings, ...hardGateFailures(qa).map((gate) => `Failed quality gate: ${gate}.`)],
    })
  );

  if (!workflow.blueprint) {
    throw new Error("AI v9 orchestrator did not produce a blueprint.");
  }

  const structuralError = blueprintStructuralError(workflow.blueprint);
  if (structuralError) {
    throw new Error(`QUALITY_GATE_FAILED: ${structuralError}`);
  }

  if (!validation.valid) {
    logBuilderDebug("ai-v9:validation-kept-model", {
      reason: "Validation has fatal schema/render warnings.",
      warnings: validation.warnings,
      fatalWarnings: validation.fatalWarnings,
      summary: summarizeBlueprint(workflow.blueprint),
    });
    throw new Error(
      `QUALITY_GATE_FAILED: Blueprint schema validation failed fatally: ${validation.fatalWarnings?.join(" ") || validation.warnings.join(" ")}`
    );
  }

  const finalGateFailures = hardGateFailures(qa);
  const finalQualityWarnings = [
    ...qa.warnings,
    ...finalGateFailures.map((gate) => `Failed quality gate: ${gate}.`),
    ...rejectionReasons,
  ];
  const qualityStatus =
    qa.score >= MIN_QUALITY_SCORE && finalGateFailures.length === 0
      ? "passed"
      : "needs_improvement";

  if (qualityStatus === "needs_improvement") {
    logBuilderDebug("ai-v9:final-quality-needs-improvement", {
      minQualityScore: MIN_QUALITY_SCORE,
      strictQualityGate,
      score: qa.score,
      finalGateFailures,
      warnings: qa.warnings,
      summary: summarizeBlueprint(workflow.blueprint),
    });
  }

  if (qualityStatus === "needs_improvement" && strictQualityGate) {
    throw new Error(
      `QUALITY_GATE_FAILED: Final blueprint scored ${qa.score}/100 and failed gates: ${finalGateFailures.join(", ") || "none"}.`
    );
  }

  logBuilderDebug("ai-v9:final-response-start", {
    pageId: workflow.pageId,
    qualityStatus,
    qualityScore: qa.score,
    elapsedMs: Date.now() - startedAt,
  });

  const response = {
    blueprint: workflow.blueprint,
    metadata: {
      aiMode: "ai-v9-native-orchestrated",
      generatedAt: new Date().toISOString(),
      nodeCount: Object.keys(workflow.blueprint.nodes).length,
      agents: workflow.logs,
      intent: workflow.intent,
      quality: qa,
      qualityStatus,
      qualityScore: qa.score,
      qualityWarnings: finalQualityWarnings,
      validation,
      brandResolution: workflow.brandResolution,
      brandContext: workflow.brandContext,
    },
  };

  logBuilderDebug("ai-v9:final-response-complete", {
    pageId: workflow.pageId,
    qualityStatus,
    qualityScore: qa.score,
    elapsedMs: Date.now() - startedAt,
    nodeCount: Object.keys(workflow.blueprint.nodes).length,
  });

  return response;
}
