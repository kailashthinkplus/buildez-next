import assert from "node:assert/strict";
import test from "node:test";

import type { ChatCompletionRequest } from "@/app/api/_lib/openai";
import { classifyCreativeError, isRetryableOpenAIError, normalizeEnrichmentResponse, parseAndNormalizeEnrichment, resolveV10CreativeConcurrency, runV10CreativeEnrichment, type CreativeResponseDiagnostics, type V10CreativeDependencies } from "../../ai-v10/creative/runV10CreativeEnrichment";
import { findSemanticPlaceholders } from "../../ai-v10/creative/semanticHydrationValidation";
import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";

function blueprint() {
  const base = createPrimitiveBlueprint();
  return { ...base, nodes: {
    ...base.nodes,
    [TEST_NODE_IDS.heading]: { ...base.nodes[TEST_NODE_IDS.heading], props: { text: "{{hero.headline}}", level: "h1" } },
    [TEST_NODE_IDS.text]: { ...base.nodes[TEST_NODE_IDS.text], props: { text: "{{hero.description}}" } },
    [TEST_NODE_IDS.button]: { ...base.nodes[TEST_NODE_IDS.button], props: { text: "{{primary_cta}}", url: "{{primary_cta.url}}" } },
    [TEST_NODE_IDS.image]: { ...base.nodes[TEST_NODE_IDS.image], props: { src: "{{hero.image}}", alt: "{{hero.image.alt}}", aiImagePrompt: "{{hero.image.prompt}}" } },
  } };
}

function blueprintWithExtraSemanticHeadings(count: number) {
  const base = blueprint();
  const extra = Object.fromEntries(Array.from({ length: count }, (_, index) => {
    const id = `extra-semantic-heading-${index + 1}`;
    return [id, { ...base.nodes[TEST_NODE_IDS.heading], id, props: { text: `{{section_${index + 1}.headline}}`, level: "h2" } }];
  }));
  return { ...base, nodes: { ...base.nodes, ...extra } };
}

function requestedIds(request: ChatCompletionRequest) {
  const payload = JSON.parse(request.messages.at(-1)!.content);
  return Object.keys(payload.engineOwnedNodes) as string[];
}

function patchFor(id: string) {
  if (id === TEST_NODE_IDS.button) return { props: { text: "Book a consultation", url: "#contact" } };
  if (id === TEST_NODE_IDS.image) return { props: { src: "", alt: "A considered architectural space", aiImagePrompt: "Editorial architectural photography in natural light" } };
  return { props: { text: id === TEST_NODE_IDS.heading ? "Designed around everyday life" : "A thoughtful customer-facing description." } };
}

function responseFor(ids: readonly string[]) {
  return { choices: [{ message: { content: JSON.stringify({ nodes: Object.fromEntries(ids.map((id) => [id, patchFor(id)])) }) } }] };
}

function dependencies(complete: V10CreativeDependencies["complete"], sleeps: number[] = []): V10CreativeDependencies {
  return { complete, sleep: async (milliseconds) => { sleeps.push(milliseconds); }, random: () => 0.5 };
}

const input = () => ({ prompt: "Build an architecture homepage", businessContext: {}, websiteSpec: {}, designResult: {}, componentResult: {}, compositionResult: {}, blueprint: blueprint() });

test("canonical, flat exact-ID, patches, and nodePatches shapes normalize", () => {
  const id = TEST_NODE_IDS.heading;
  const patch = patchFor(id);
  for (const candidate of [
    { nodes: { [id]: patch } },
    { [id]: patch },
    { patches: { [id]: patch } },
    { nodePatches: { [id]: patch } },
  ]) {
    const normalized = normalizeEnrichmentResponse(candidate, [id]);
    assert.deepEqual(normalized.nodes?.[id], patch);
  }
});

test("ambiguous, unrelated, semantic-name, array, and non-props response shapes are rejected", () => {
  const id = TEST_NODE_IDS.heading;
  for (const candidate of [
    { nodes: { [id]: patchFor(id) }, patches: { [id]: patchFor(id) } },
    { [id]: patchFor(id), commentary: "done" },
    { "hero.headline": patchFor(id) },
    [{ id, props: { text: "bad" } }],
    { nodes: { [id]: { props: { text: "ok" }, style: {} } } },
  ]) assert.throws(() => normalizeEnrichmentResponse(candidate, [id]), /CREATIVE_RESPONSE_SHAPE_INVALID/);
});

test("normalized enrichment survives a JSON round trip", () => {
  const id = TEST_NODE_IDS.heading;
  const normalized = parseAndNormalizeEnrichment(JSON.stringify({ [id]: patchFor(id) }), [id]);
  assert.deepEqual(JSON.parse(JSON.stringify(normalized)).nodes[id], patchFor(id));
});

test("creative provider errors classify into the five reliability categories", () => {
  assert.equal(classifyCreativeError(new Error('401 {"code":"invalid_api_key"}')), "invalid_api_key");
  assert.equal(classifyCreativeError(new Error('403 {"code":"permission_denied"}')), "model_permission");
  assert.equal(classifyCreativeError(new Error('429 {"code":"rate_limit_exceeded"}')), "rate_limit");
  assert.equal(classifyCreativeError(new Error("OpenAI API error (500): unavailable")), "transient_provider_error");
  assert.equal(classifyCreativeError(new Error("CREATIVE_RESPONSE_SHAPE_INVALID: bad wrapper")), "malformed_response");
});

test("observed flat exact-ID response is recognized without shape recovery or splitting", async () => {
  let calls = 0;
  const result = await runV10CreativeEnrichment(input(), dependencies(async (request) => {
    calls += 1;
    const ids = requestedIds(request);
    return { choices: [{ message: { content: JSON.stringify(Object.fromEntries(ids.map((id) => [id, patchFor(id)]))) } }] };
  }));
  assert.equal(calls, 1);
  assert.equal(result.metadata.creativeResponseDiagnostics?.flatShapeNormalizedCount, 1);
  assert.equal(result.metadata.creativeResponseDiagnostics?.batchSplits, 0);
  assert.equal(findSemanticPlaceholders(result).length, 0);
});

test("patches and nodePatches aliases hydrate without recovery", async () => {
  for (const alias of ["patches", "nodePatches"] as const) {
    const result = await runV10CreativeEnrichment(input(), dependencies(async (request) => {
      const ids = requestedIds(request);
      return { choices: [{ message: { content: JSON.stringify({ [alias]: Object.fromEntries(ids.map((id) => [id, patchFor(id)])) }) } }] };
    }));
    assert.equal(result.metadata.creativeResponseDiagnostics?.aliasShapeNormalizedCount, 1);
    assert.equal(findSemanticPlaceholders(result).length, 0);
  }
});

test("invalid wrapper gets exactly one same-batch shape recovery request", async () => {
  let calls = 0;
  const result = await runV10CreativeEnrichment(input(), dependencies(async (request) => {
    calls += 1;
    const ids = requestedIds(request);
    return calls === 1
      ? { choices: [{ message: { content: JSON.stringify({ content: { "hero.headline": { props: { text: "bad" } } } }) } }] }
      : responseFor(ids);
  }));
  assert.equal(calls, 2);
  assert.equal(result.metadata.creativeResponseDiagnostics?.shapeRecoveryAttempts, 1);
  assert.equal(result.metadata.creativeResponseDiagnostics?.batchSplits, 0);
});

test("creative requests carry batch-specific caller labels", async () => {
  const labels: string[] = [];
  await runV10CreativeEnrichment(input(), dependencies(async (request) => {
    labels.push(request.debugLabel || "");
    return responseFor(requestedIds(request));
  }));
  assert.equal(labels.length, 1);
  assert.match(labels[0], /creative-batch-1:initial:attempt-1:nodes-4:of-1/);
});

test("creative concurrency defaults to two and is capped at four", () => {
  assert.equal(resolveV10CreativeConcurrency(undefined), 2);
  assert.equal(resolveV10CreativeConcurrency("2"), 2);
  assert.equal(resolveV10CreativeConcurrency("4"), 4);
  assert.equal(resolveV10CreativeConcurrency("9"), 4);
  assert.equal(resolveV10CreativeConcurrency("not-a-number"), 2);
});

test("explicit model permission error fails immediately", async () => {
  let calls = 0;
  const sleeps: number[] = [];
  await assert.rejects(() => runV10CreativeEnrichment(input(), dependencies(async () => {
    calls += 1;
    throw new Error('OpenAI API error (403): {"code":"permission_denied","message":"You do not have access to model gpt-5.6-sol"}');
  }, sleeps)), /AI_V10_CREATIVE_MODEL_PERMISSION_FAILED/);
  assert.equal(calls, 1);
  assert.deepEqual(sleeps, []);
});

test("invalid API key fails immediately with accurate classification", async () => {
  let invalidCalls = 0;
  await assert.rejects(() => runV10CreativeEnrichment(input(), dependencies(async () => {
    invalidCalls += 1;
    throw new Error('OpenAI API error (401): {"code":"invalid_api_key"}');
  })), /AI_V10_CREATIVE_INVALID_API_KEY/);
  assert.equal(invalidCalls, 1);
  assert.equal(classifyCreativeError(new Error('401 {"code":"invalid_api_key"}')), "invalid_api_key");
});

test("fatal concurrent worker failure drains running work and prevents unstarted batches", async () => {
  const previous = process.env.OPENAI_V10_ENRICHMENT_CONCURRENCY;
  process.env.OPENAI_V10_ENRICHMENT_CONCURRENCY = "2";
  const labels: string[] = [];
  let releaseSecond: ((value: ReturnType<typeof responseFor>) => void) | undefined;
  let secondRequest: ChatCompletionRequest | undefined;
  let settled = false;
  let persisted = false;
  try {
    const run = runV10CreativeEnrichment({ ...input(), blueprint: blueprintWithExtraSemanticHeadings(17) }, dependencies(async (request) => {
      labels.push(request.debugLabel || "");
      if (request.debugLabel?.includes("creative-batch-1:")) throw new Error('OpenAI API error (401): {"code":"invalid_api_key"}');
      secondRequest = request;
      return new Promise((resolve) => { releaseSecond = resolve; });
    })).then((result) => { persisted = true; return result; }).finally(() => { settled = true; });

    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(labels.length, 2);
    assert.equal(settled, false);
    assert.ok(secondRequest);
    releaseSecond?.(responseFor(requestedIds(secondRequest!)));
    await assert.rejects(() => run, /invalid_api_key/);
    assert.equal(settled, true);
    assert.equal(persisted, false);
    assert.equal(labels.length, 2);
    assert.ok(labels.every((label) => !label.includes("creative-batch-3:")));
  } finally {
    if (previous === undefined) delete process.env.OPENAI_V10_ENRICHMENT_CONCURRENCY;
    else process.env.OPENAI_V10_ENRICHMENT_CONCURRENCY = previous;
  }
});

test("failed shape recovery throws without recursively splitting", async () => {
  let calls = 0;
  await assert.rejects(() => runV10CreativeEnrichment(input(), dependencies(async () => {
    calls += 1;
    return { choices: [{ message: { content: JSON.stringify({ content: {} }) } }] };
  })), /CREATIVE_RESPONSE_SHAPE_RECOVERY_FAILED/);
  assert.equal(calls, 2);
});

test("one missing node is recovered with one additional request and no recursive split", async () => {
  let calls = 0;
  const result = await runV10CreativeEnrichment(input(), dependencies(async (request) => {
    calls += 1;
    const ids = requestedIds(request);
    return responseFor(calls === 1 ? ids.slice(0, -1) : ids);
  }));
  assert.equal(calls, 2);
  assert.equal(findSemanticPlaceholders(result).length, 0);
  assert.deepEqual(result.metadata.creativeRecovery?.initialMissingNodes, [TEST_NODE_IDS.image]);
});

test("two missing nodes are recovered together in one targeted request", async () => {
  let calls = 0;
  const result = await runV10CreativeEnrichment(input(), dependencies(async (request) => {
    calls += 1;
    const ids = requestedIds(request);
    return responseFor(calls === 1 ? ids.slice(0, -2) : ids);
  }));
  assert.equal(calls, 2);
  assert.equal(result.metadata.creativeRecovery?.recoveredNodes.length, 2);
});

test("unknown node and duplicate node responses are rejected without splitting", async () => {
  let unknownCalls = 0;
  await assert.rejects(() => runV10CreativeEnrichment(input(), dependencies(async (request) => {
    unknownCalls += 1;
    const ids = requestedIds(request);
    return { choices: [{ message: { content: JSON.stringify({ nodes: { ...Object.fromEntries(ids.map((id) => [id, patchFor(id)])), unknown: { props: { text: "bad" } } } }) } }] };
  })), /Unknown node ID/);
  assert.equal(unknownCalls, 1);

  let duplicateCalls = 0;
  await assert.rejects(() => runV10CreativeEnrichment(input(), dependencies(async (request) => {
    duplicateCalls += 1;
    const ids = requestedIds(request);
    const entries = ids.map((id) => `"${id}":${JSON.stringify(patchFor(id))}`).join(",");
    return { choices: [{ message: { content: `{"nodes":{${entries},"${ids[0]}":${JSON.stringify(patchFor(ids[0]))}}}` } }] };
  })), /Duplicate node ID/);
  assert.equal(duplicateCalls, 1);
});

test("placeholder retained by GPT fails without weakening hydration", async () => {
  await assert.rejects(() => runV10CreativeEnrichment(input(), dependencies(async (request) => {
    const ids = requestedIds(request);
    const response = responseFor(ids);
    const body = JSON.parse(response.choices[0].message.content);
    body.nodes[TEST_NODE_IDS.text].props.text = "Still {{hero.description}}";
    response.choices[0].message.content = JSON.stringify(body);
    return response;
  })), /still contains semantic placeholders/);
});

test("recovery stops after two targeted attempts per missing node", async () => {
  let calls = 0;
  await assert.rejects(() => runV10CreativeEnrichment(input(), dependencies(async (request) => {
    calls += 1;
    const ids = requestedIds(request);
    return calls === 1 ? responseFor(ids.slice(0, -1)) : responseFor([]);
  })), /SEMANTIC_PATCH_RECOVERY_FAILED/);
  assert.equal(calls, 3);
});

test("insufficient quota aborts immediately and rate limits retry with backoff", async () => {
  let quotaCalls = 0;
  await assert.rejects(() => runV10CreativeEnrichment(input(), dependencies(async () => {
    quotaCalls += 1;
    throw new Error('OpenAI API error (429): {"code":"insufficient_quota"}');
  })), /insufficient_quota/);
  assert.equal(quotaCalls, 1);
  assert.equal(isRetryableOpenAIError(new Error("429 insufficient_quota")), false);

  let rateCalls = 0;
  const sleeps: number[] = [];
  await runV10CreativeEnrichment(input(), dependencies(async (request) => {
    rateCalls += 1;
    if (rateCalls < 3) throw new Error('OpenAI API error (429): {"code":"rate_limit_exceeded"}');
    return responseFor(requestedIds(request));
  }, sleeps));
  assert.equal(rateCalls, 3);
  assert.deepEqual(sleeps, [500, 1500]);
});

test("provider permission and invalid-request errors abort without splitting", async () => {
  for (const message of [
    'OpenAI API error (401): {"message":"insufficient permissions"}',
    'OpenAI API error (400): {"type":"invalid_request_error"}',
  ]) {
    let calls = 0;
    await assert.rejects(() => runV10CreativeEnrichment(input(), dependencies(async () => {
      calls += 1;
      throw new Error(message);
    })), /OpenAI API error/);
    assert.equal(calls, 1);
  }
});

test("transient 500 retries the same batch with deterministic exponential backoff", async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const result = await runV10CreativeEnrichment(input(), dependencies(async (request) => {
    calls += 1;
    if (calls < 4) throw new Error("OpenAI API error (500): provider temporarily unavailable");
    return responseFor(requestedIds(request));
  }, sleeps));
  const diagnostics = result.metadata.creativeResponseDiagnostics as CreativeResponseDiagnostics;
  assert.equal(calls, 4);
  assert.deepEqual(sleeps, [500, 1500, 3000]);
  assert.equal(diagnostics.retriedBatches, 1);
  assert.equal(diagnostics.transientFailures, 3);
  assert.equal(diagnostics.completedBatches, 1);
  assert.equal(diagnostics.finalFailures, 0);
});

test("timeout retries use bounded backoff", async () => {
  let calls = 0;
  const sleeps: number[] = [];
  await runV10CreativeEnrichment(input(), dependencies(async (request) => {
    calls += 1;
    if (calls === 1) throw new Error("network timeout");
    return responseFor(requestedIds(request));
  }, sleeps));
  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [500]);
});

test("creative response diagnostics are deterministic", async () => {
  async function run() {
    let calls = 0;
    return runV10CreativeEnrichment(input(), dependencies(async (request) => {
      calls += 1;
      if (calls === 1) throw new Error('OpenAI API error (429): {"code":"rate_limit_exceeded"}');
      return responseFor(requestedIds(request));
    }));
  }
  const first = await run();
  const second = await run();
  assert.deepEqual(first.metadata.creativeResponseDiagnostics, second.metadata.creativeResponseDiagnostics);
  assert.deepEqual(first.metadata.creativeResponseDiagnostics, {
    normalizedShapeCount: 1,
    flatShapeNormalizedCount: 0,
    aliasShapeNormalizedCount: 0,
    shapeRecoveryAttempts: 0,
    totalCoverageMisses: 0,
    batchSplits: 0,
    batchCount: 1,
    completedBatches: 1,
    retriedBatches: 1,
    transientFailures: 1,
    finalFailures: 0,
    concurrencyUsed: 2,
  });
});

test("multiple successful batches merge into one fully hydrated Blueprint", async () => {
  const base = blueprint();
  const extraNodes = Object.fromEntries(Array.from({ length: 5 }, (_, index) => {
    const id = `extra-semantic-heading-${index + 1}`;
    return [id, { ...base.nodes[TEST_NODE_IDS.heading], id, props: { text: `{{section_${index + 1}.headline}}`, level: "h2" } }];
  }));
  let calls = 0;
  const result = await runV10CreativeEnrichment({ ...input(), blueprint: { ...base, nodes: { ...base.nodes, ...extraNodes } } }, dependencies(async (request) => {
    calls += 1;
    return responseFor(requestedIds(request));
  }));
  assert.equal(calls, 2);
  assert.equal(findSemanticPlaceholders(result).length, 0);
});

test("creative batches send compact context instead of repeating full Engine artifacts", async () => {
  const oversized = { records: Array.from({ length: 100 }, (_, index) => ({ id: index, copy: "x".repeat(1000) })) };
  let payload: Record<string, unknown> | undefined;
  const result = await runV10CreativeEnrichment({
    ...input(),
    websiteSpec: { ...oversized, sections: oversized.records },
    designResult: { ...oversized, designTokens: oversized },
    componentResult: { ...oversized, recommendedSelections: oversized.records },
    compositionResult: { ...oversized, orderedSectionSequence: oversized.records },
  }, dependencies(async (request) => {
    payload = JSON.parse(request.messages.at(-1)!.content);
    return responseFor(requestedIds(request));
  }));
  assert.ok(payload?.creativeContext);
  assert.equal("authoritativeWebsiteSpec" in (payload || {}), false);
  assert.equal("authoritativeDesignResult" in (payload || {}), false);
  assert.equal("authoritativeComponentResult" in (payload || {}), false);
  assert.equal("authoritativeCompositionResult" in (payload || {}), false);
  assert.ok(JSON.stringify(payload).length < 50000);
  assert.equal(result.metadata.creativeRequestDiagnostics?.fullArtifactsRepeatedPerBatch, false);
});
