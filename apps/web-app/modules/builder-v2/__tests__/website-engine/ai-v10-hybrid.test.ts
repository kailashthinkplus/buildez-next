import assert from "node:assert/strict";
import test from "node:test";

import { runV10WebsiteGeneration } from "../../ai-v10/orchestrator/runV10WebsiteGeneration";
import { runV10Preflight } from "../../ai-v10/preflight/runV10Preflight";
import { resolveV10CompletionTokenBudget } from "../../ai-v10/creative/runV10CreativeEnrichment";
import { publishV10Progress, readV10Progress } from "../../ai-v10/progress/v10GenerationProgress";
import {
  resolveWebsiteCreativeModel,
  websiteCreativeTemperature,
  websiteCreativeReasoningEffort,
  withOpenAi56WebsiteBuilderProfile,
} from "../../ai-v10/skills/openAi56WebsiteBuilder";
import { resolveAiGenerationEndpoint } from "../../ai/services/AiConversation";
import { createPrimitiveBlueprint } from "../fixtures/testBlueprintFixtures";
import { collectCreativeNodeIds, findSemanticPlaceholders } from "../../ai-v10/creative/semanticHydrationValidation";
import type { RenderedScreenshot } from "../../website-engine/visual-quality";
import { assignNativeWidgetMedia, discoverNativeWidgetMediaSlots } from "../../ai-v10/media/nativeWidgetMediaSlots";

function renderedCaptures(): RenderedScreenshot[] {
  return (["desktop", "tablet", "mobile"] as const).map((viewport) => {
    const width = viewport === "desktop" ? 1200 : viewport === "tablet" ? 900 : 390; const height = 8; const pixels = new Uint8Array(width * height * 4);
    for (let index = 0; index < pixels.length; index += 4) { pixels[index] = (index / 4) % 251; pixels[index + 1] = (index / 7) % 241; pixels[index + 2] = (index / 11) % 239; pixels[index + 3] = 255; }
    return { viewport, width, height, pixels, pixelFormat: "rgba" as const };
  });
}

test("ai-v10 uses Website Engine nodes as the authoritative GPT enrichment input", async () => {
  let engineBlueprint = createPrimitiveBlueprint();
  let authoritativeSpec: unknown;
  const progressStages: string[] = [];

  const result = await runV10WebsiteGeneration(
    {
      pageId: "page-hybrid",
      siteId: "site-hybrid",
      pageTitle: "Home",
      pageSlug: "home",
      siteName: "Northstar Studio",
      prompt: "Create a premium architecture studio homepage",
      context: {
        companyName: "Northstar Studio",
        industry: "architecture_interiors",
        audience: "premium homeowners",
        offer: "residential architecture",
      },
      onProgress: (update) => progressStages.push(update.stage),
    },
    {
      runCreativeEnrichment: async (creativeInput) => {
        engineBlueprint = creativeInput.blueprint;
        authoritativeSpec = creativeInput.websiteSpec;
        return {
          ...creativeInput.blueprint,
          nodes: Object.fromEntries(Object.entries(creativeInput.blueprint.nodes).map(([id, node]) => {
            if (!collectCreativeNodeIds(creativeInput.blueprint).includes(id)) return [id, node];
            const replace = (value: unknown): unknown => typeof value === "string"
              ? value.replace(/\{\{[a-zA-Z0-9_.-]+\}\}/g, `${id} customer-ready content`)
              : Array.isArray(value) ? value.map(replace)
              : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replace(item)]))
              : value;
            const props = replace(node.props) as Record<string, unknown>;
            if (node.type === "button") Object.assign(props, { text: "Book a consultation", url: "#contact" });
            if (node.type === "image") Object.assign(props, { src: "", alt: "Architecture project", aiImagePrompt: "Editorial architecture photography" });
            return [id, { ...node, props }];
          })),
        };
      },
      runImageGeneration: async (candidate) => {
        const slots = discoverNativeWidgetMediaSlots(candidate);
        const assigned = assignNativeWidgetMedia(candidate, slots.map((slot, index) => ({ widgetId: slot.widgetId, slotPath: slot.slotPath, url: `https://example.com/generated-${index}.jpg` })));
        const nodes = Object.fromEntries(Object.entries(assigned.blueprint.nodes).map(([id, node]) => node.type === "image" ? [id, { ...node, props: { ...node.props, src: "https://example.com/generated-primitive.jpg" } }] : [id, node]));
        return { blueprint: { ...assigned.blueprint, nodes }, applied: slots.length, warnings: [] };
      },
      renderBlueprint: async () => renderedCaptures(),
    }
  );

  assert.equal(result.blueprint.root, engineBlueprint.root);
  assert.ok(authoritativeSpec);
  assert.equal(result.metadata.aiMode, "ai-v10-native-website-engine");
  assert.equal(result.metadata.aiV9Used, false);
  assert.equal(result.qualityCategories.populationQuality.passed, true);
  assert.ok(result.metadata.agents.some((agent) => agent.agent === "CompositionAgent"));
  assert.ok(result.metadata.agents.some((agent) => agent.agent === "ImageGenerationAgent"));
  assert.ok(result.trace.includes("ai-v10.website-engine.builder-blueprint"));
  assert.ok(result.trace.includes("ai-v10.gpt-5.6.engine-node-enrichment"));
  assert.ok(result.trace.includes("ai-v10.website-engine.critic"));
  assert.ok(result.trace.includes("ai-v10.website-engine.repair-plan-advisory"));
  assert.equal(findSemanticPlaceholders(result.blueprint).length, 0);
  assert.ok(result.evaluation);
  assert.ok(result.repairPlan);
  assert.ok(result.renderedVisualQuality);
  assert.equal(result.qualityCategories.nonCompensating, true);
  assert.equal(result.qualityCategories.visualQuality.available, true);
  assert.ok(progressStages.includes("creative-enrichment"));
  assert.ok(progressStages.includes("image-generation"));
  assert.equal(progressStages.at(-1), "complete");
});

test("v10 rejects an unchanged semantic blueprint before image generation", async () => {
  let imageGenerationStarted = false;
  await assert.rejects(() => runV10WebsiteGeneration(
    { pageId: "page-unhydrated", siteName: "Northstar Studio", prompt: "Create a premium architecture homepage" },
    {
      runCreativeEnrichment: async (creativeInput) => creativeInput.blueprint,
      runImageGeneration: async (candidate) => { imageGenerationStarted = true; return { blueprint: candidate, applied: 0, warnings: [] }; },
    }
  ), /SEMANTIC_HYDRATION_INCOMPLETE/);
  assert.equal(imageGenerationStarted, false);
});

test("v10 preflight engineers the prompt and returns four use-case-aware decisions", async () => {
  const questions = ["conversion", "art-direction", "proof", "imagery"].map((id) => ({
    id,
    label: `Specific ${id} decision for a Bengaluru residential developer`,
    whyItMatters: "It changes the generated website strategy.",
    options: ["a", "b", "c"].map((suffix) => ({
      id: `${id}-${suffix}`,
      label: `${id} outcome ${suffix}`,
      description: `A concrete ${id} result for homebuyers.`,
      promptAddition: `Apply ${id} direction ${suffix}.`,
    })),
  }));
  const result = await runV10Preflight(
    { prompt: "Build Sanjeevini Group Bengaluru residential landing page" },
    { complete: async () => ({ choices: [{ message: { content: JSON.stringify({
      summary: "A conversion-led residential portfolio for Bengaluru homebuyers.",
      interpretedUseCase: "Bengaluru residential property developer landing page",
      engineeredPrompt: Array.from({ length: 16 }, () => "Build editorial property journey with proof imagery conversion accessibility responsiveness.").join(" "),
      questions,
    }) } }] }) as never }
  );

  assert.equal(result.questions.length, 4);
  assert.ok(result.questions.every((question) => question.options.length === 3));
  assert.match(result.engineeredPrompt, /editorial property journey/);
  assert.deepEqual(result.agentTrace.map((agent) => agent.agent), ["IntentAgent", "BriefArchitectAgent", "DecisionInterviewAgent"]);
});

test("builder generation selector routes v10 to Website Engine and keeps v9 available", () => {
  assert.equal(
    resolveAiGenerationEndpoint({ aiGenerationVersion: "v10" }),
    "/api/builder-v2/ai/generate-v10"
  );
  assert.equal(
    resolveAiGenerationEndpoint({ aiGenerationVersion: "v9" }),
    "/api/builder-v2/ai/generate-v9"
  );
  assert.equal(resolveAiGenerationEndpoint(), "/api/builder-v2/ai/generate-v9");
});

test("native v10 uses the GPT-5.6 website builder profile without changing direct v9", () => {
  assert.equal(resolveWebsiteCreativeModel({ aiGenerationVersion: "v10" }), "gpt-5.6-sol");
  assert.equal(
    resolveWebsiteCreativeModel({ aiGenerationVersion: "v9" }),
    process.env.OPENAI_WEBSITE_MODEL || "gpt-4o"
  );
  assert.match(
    withOpenAi56WebsiteBuilderProfile("base", { aiGenerationVersion: "v10" }),
    /GPT-5\.6 WEBSITE BUILDER PROFILE/
  );
  assert.equal(
    withOpenAi56WebsiteBuilderProfile("base", { aiGenerationVersion: "v9" }),
    "base"
  );
  assert.equal(websiteCreativeTemperature("gpt-5.6", 0.42), undefined);
  assert.equal(websiteCreativeTemperature("gpt-5.6-sol", 0.42), undefined);
  assert.equal(websiteCreativeTemperature("gpt-4o", 0.42), 0.42);
  assert.equal(websiteCreativeReasoningEffort("gpt-5.6"), "none");
  assert.equal(websiteCreativeReasoningEffort("gpt-4o"), undefined);
  assert.equal(
    resolveWebsiteCreativeModel({
      aiGenerationVersion: "v10",
      websiteCreativeModelOverride: "gpt-4o",
    }),
    "gpt-4o"
  );
});

test("v10 creative completion budget stays within the project-key ceiling", () => {
  assert.equal(resolveV10CompletionTokenBudget(), 8000);
  assert.equal(resolveV10CompletionTokenBudget("18000"), 16384);
  assert.equal(resolveV10CompletionTokenBudget("16385"), 16384);
  assert.equal(resolveV10CompletionTokenBudget("12000"), 12000);
});

test("v10 progress retains ordered milestones instead of only the latest status", () => {
  const runId = `progress-${Date.now()}`;
  publishV10Progress({ runId, agent: "IntentAgent", stage: "intent", summary: "Interpreting brief", completed: 0, total: 3 });
  publishV10Progress({ runId, agent: "ContentStrategyAgent", stage: "content", summary: "Planning content", completed: 1, total: 3 });
  const snapshot = readV10Progress(runId);
  assert.equal(snapshot?.current.stage, "content");
  assert.deepEqual(snapshot?.events.map((event) => event.stage), ["intent", "content"]);
});
