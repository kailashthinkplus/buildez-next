import assert from "node:assert/strict";
import test from "node:test";

import type { ChatCompletionRequest } from "@/app/api/_lib/openai";
import {
  DEFAULT_V10_PREFLIGHT_MODEL,
  resolveV10PreflightConfig,
  runV10Preflight,
} from "../../ai-v10/preflight/runV10Preflight";
import { resolveWebsiteCreativeModel } from "../../ai-v10/skills/openAi56WebsiteBuilder";
import { prepareV10PreflightResponse } from "../../ai-v10/preflight/preflightResponse";

const brief = Array.from({ length: 16 }, () =>
  "Shape audience journey with proof imagery conversion responsiveness accessibility carefully."
).join(" ");

function output(overrides: Record<string, unknown> = {}) {
  const questions = ["conversion", "art-direction", "proof", "imagery"].map((id) => ({
    id,
    label: `Choose the ${id} outcome`,
    whyItMatters: "This decision materially changes the generated customer journey.",
    options: ["a", "b", "c"].map((suffix) => ({
      id: `${id}-${suffix}`,
      label: `${id} direction ${suffix}`,
      description: `A specific ${id} outcome designed for this business and audience.`,
      promptAddition: `Apply ${id} direction ${suffix} throughout the page.`,
    })),
  }));
  return {
    summary: "A focused industry-specific website strategy with four meaningful decisions.",
    interpretedUseCase: "Bengaluru residential developer landing page",
    engineeredPrompt: brief,
    questions,
    ...overrides,
  };
}

test("preflight uses its dedicated fast model, compact budget, timeout, and structured JSON", async () => {
  const previous = {
    model: process.env.OPENAI_V10_PREFLIGHT_MODEL,
    website: process.env.OPENAI_V10_WEBSITE_MODEL,
  };
  process.env.OPENAI_V10_PREFLIGHT_MODEL = "gpt-4.1-mini";
  process.env.OPENAI_V10_WEBSITE_MODEL = "gpt-5.6-sol";
  let request: ChatCompletionRequest | undefined;
  try {
    const result = await runV10Preflight({ prompt: "Build a residential developer landing page" }, {
      complete: async (input) => {
        request = input;
        return { choices: [{ message: { content: JSON.stringify(output()) } }] };
      },
    });
    assert.equal(request?.model, "gpt-4.1-mini");
    assert.equal(request?.debugLabel, "v10-preflight-strategy-1");
    assert.ok((request?.maxCompletionTokens ?? Infinity) < 2500);
    assert.equal(request?.timeoutMs, 12000);
    assert.equal(request?.responseFormat, "json_object");
    assert.equal(result.timing.model, "gpt-4.1-mini");
    assert.equal(result.timing.tokenBudget, 2000);
    assert.equal(result.questions.length, 4);
    assert.ok(result.questions.every((question) => question.options.length === 3));
    assert.equal(result.timing.fallbackUsed, false);
    assert.deepEqual(result.providerStatus, { ok: true, category: "success" });
  } finally {
    if (previous.model === undefined) delete process.env.OPENAI_V10_PREFLIGHT_MODEL; else process.env.OPENAI_V10_PREFLIGHT_MODEL = previous.model;
    if (previous.website === undefined) delete process.env.OPENAI_V10_WEBSITE_MODEL; else process.env.OPENAI_V10_WEBSITE_MODEL = previous.website;
  }
});

test("default preflight configuration uses a repository-supported fast model", () => {
  const config = resolveV10PreflightConfig({} as NodeJS.ProcessEnv);
  assert.equal(config.model, DEFAULT_V10_PREFLIGHT_MODEL);
  assert.equal(config.model, "gpt-5.6-terra");
  assert.equal(config.tokenBudget, 2000);
  assert.equal(config.timeoutMs, 12000);
});

test("preflight compacts model word-count overruns without another request", async () => {
  let requests = 0;
  const result = await runV10Preflight({ prompt: "Build a site" }, {
    complete: async () => {
      requests += 1;
      const oversized = output({ summary: "word ".repeat(40), engineeredPrompt: "brief ".repeat(300) });
      oversized.questions[0].options[0].label = "label ".repeat(12);
      oversized.questions[0].options[0].description = "description ".repeat(35);
      return { choices: [{ message: { content: JSON.stringify(oversized) } }] };
    },
  });
  const words = (value: string) => value.trim().split(/\s+/).length;
  assert.equal(requests, 1);
  assert.equal(words(result.summary), 25);
  assert.equal(words(result.engineeredPrompt), 250);
  assert.equal(words(result.questions[0].options[0].label), 8);
  assert.equal(words(result.questions[0].options[0].description), 25);
});

test("preflight replaces structurally invalid model output with four validated decisions", async () => {
  const invalid = output() as ReturnType<typeof output>;
  invalid.questions = invalid.questions.slice(0, 3);
  const result = await runV10Preflight({ prompt: "Build a site", context: { industry: "architecture", audience: "homeowners" } }, {
    complete: async () => ({ choices: [{ message: { content: JSON.stringify(invalid) } }] }),
  });
  assert.equal(result.questions.length, 4);
  assert.ok(result.questions.every((question) => question.options.length === 3));
  assert.equal(result.timing.fallbackUsed, true);
});

test("preflight retries one malformed structured response instead of failing the user action", async () => {
  let requests = 0;
  const result = await runV10Preflight({ prompt: "Build a site" }, {
    complete: async () => {
      requests += 1;
      return { choices: [{ message: { content: requests === 1 ? '{"summary":"truncated"' : JSON.stringify(output()) } }] };
    },
  });
  assert.equal(requests, 2);
  assert.equal(result.questions.length, 4);
});

test("provider timeout immediately returns a validated local fallback below the latency budget", async () => {
  let requests = 0;
  const result = await runV10Preflight({ prompt: "Build a site" }, {
    complete: async () => { requests += 1; throw new DOMException("The 30000ms operation timed out", "TimeoutError"); },
  });
  assert.equal(requests, 1);
  assert.equal(result.timing.fallbackUsed, true);
  assert.equal(result.providerStatus?.category, "timeout");
  assert.ok(result.timing.durationMs < 15000);
  assert.equal(result.questions.length, 4);
  assert.ok(result.questions.every((question) => question.options.length === 3));
});

test("quota and provider permission failures use fallback immediately without leaking provider payloads", async () => {
  for (const failure of [
    { message: 'OpenAI API error (429): {"code":"insufficient_quota","Authorization":"Bearer secret-key"}', category: "quota" },
    { message: 'OpenAI API error (401): insufficient permissions Authorization: Bearer secret-key', category: "permission" },
  ]) {
    let requests = 0;
    const result = await runV10Preflight({ prompt: "Build a site" }, {
      complete: async () => { requests += 1; throw new Error(failure.message); },
    });
    assert.equal(requests, 1);
    assert.equal(result.timing.fallbackUsed, true);
    assert.equal(result.providerStatus?.category, failure.category);
    assert.doesNotMatch(JSON.stringify(result.providerStatus), /secret-key|authorization|bearer/i);
  }
});

test("rate limits and network failures retry at most once then fall back", async () => {
  for (const failure of [
    { message: "OpenAI API error (429): rate_limit_exceeded", category: "rate_limit" },
    { message: "OpenAI network request failed", category: "network" },
  ]) {
    let requests = 0;
    const result = await runV10Preflight({ prompt: "Build a site" }, {
      complete: async () => { requests += 1; throw new Error(failure.message); },
    });
    assert.equal(requests, 2);
    assert.equal(result.timing.fallbackUsed, true);
    assert.equal(result.providerStatus?.category, failure.category);
  }
});

test("fallback output satisfies every compact word limit", async () => {
  const result = await runV10Preflight({ prompt: "Build a restaurant booking website", context: { industry: "restaurant", audience: "local diners" } }, {
    complete: async () => { throw new Error("OpenAI API error (403): insufficient permissions"); },
  });
  const count = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
  assert.ok(count(result.summary) <= 25);
  assert.ok(count(result.interpretedUseCase) <= 20);
  assert.ok(count(result.engineeredPrompt) <= 250);
  assert.ok(result.questions.every((question) => question.options.every((option) => count(option.label) <= 8 && count(option.description) <= 25 && count(option.promptAddition) <= 25)));
  assert.match(result.agentTrace[1].summary, /deterministic Engine-ready brief/);
});

test("route response seam returns HTTP 200 for a provider-timeout fallback", async () => {
  const response = await prepareV10PreflightResponse({ prompt: "Build a site" }, (input) => runV10Preflight(input, {
    complete: async () => { throw new DOMException("operation timed out", "TimeoutError"); },
  }));
  assert.equal(response.status, 200);
  assert.equal("timing" in response.payload && response.payload.timing.fallbackUsed, true);
});

test("dedicated preflight configuration does not change the website generation model", () => {
  const previous = process.env.OPENAI_V10_WEBSITE_MODEL;
  process.env.OPENAI_V10_WEBSITE_MODEL = "gpt-5.6-sol";
  try {
    assert.equal(resolveWebsiteCreativeModel({ aiGenerationVersion: "v10" }), "gpt-5.6-sol");
  } finally {
    if (previous === undefined) delete process.env.OPENAI_V10_WEBSITE_MODEL; else process.env.OPENAI_V10_WEBSITE_MODEL = previous;
  }
});
