import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { readV11Stream, resolveAiGenerationEndpoint } from "../../ai/services/AiConversation";
import { modelSupportsReasoningEffort } from "@/app/api/_lib/openai";
import { assertReferenceFidelity, buildV11DesignPrompt, buildV11FallbackTsx, buildV11LoweringPrompt, compileGeneratedSource, referenceFidelityWarnings, resolveV11AttemptProfile, sanitizeGeneratedTsx } from "../production/generateV11Website";
import { sha256, V11SourceArtifactTrace } from "../production/sourceArtifact";
import { createV11CreativeBrief } from "../production/createV11CreativeBrief";
import { assessUntrustedSource } from "../security/sourceGate";
import { parseTsx } from "../ast/parser";
import { normalizeTsx } from "../ast/normalize";
import { buildDesignGraph } from "../design-graph/builder";
import { compileDesignGraphToBlueprint } from "../compiler/blueprintCompiler";
import { validateBlueprint } from "../../core/validation";
import { validateFullPageCompleteness } from "../validator/fullPageCompleteness";

test("V11 is wired to its production generation endpoint", () => {
  assert.equal(resolveAiGenerationEndpoint({ aiGenerationVersion: "v11" }), "/api/builder-v2/ai/generate-v11");
});

test("OpenAI request builder does not send reasoning effort to legacy GPT-4.1", () => {
  assert.equal(modelSupportsReasoningEffort("gpt-4.1"), false);
  assert.equal(modelSupportsReasoningEffort("gpt-5.6-sol"), true);
  assert.equal(modelSupportsReasoningEffort("gpt-5.6-terra"), true);
});

test("V11 streaming progress keeps a long request open until its result arrives", async () => {
  const encoder = new TextEncoder();
  const response = new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('{"type":"progress","agent":"DesignAgent","summary":"Developing the design."}\n'));
      controller.enqueue(encoder.encode('{"type":"result","data":{"success":true,"metadata":{"aiGenerationVersion":"v11"}}}\n'));
      controller.close();
    },
  }));
  const result = await readV11Stream(response);
  assert.equal(result.success, true);
  assert.equal(result.metadata.aiGenerationVersion, "v11");
});

test("V11 stream errors retain replay generation ID and structured diagnostics", async () => {
  const response = new Response(`${JSON.stringify({
    type: "error",
    error: "V11_SOURCE_REJECTED",
    generationId: "generation-replay-1",
    diagnostics: [{ code: "UNSUPPORTED_MAP_SOURCE", line: 12, column: 8 }],
  })}\n`);

  await assert.rejects(
    readV11Stream(response),
    (error: Error & { generationId?: string; diagnostics?: unknown[] }) => {
      assert.equal(error.generationId, "generation-replay-1");
      assert.deepEqual(error.diagnostics, [
        { code: "UNSUPPORTED_MAP_SOURCE", line: 12, column: 8 },
      ]);
      return true;
    },
  );
});

test("V11 source artifacts persist raw, normalized, hashes, status, and replay diagnostics", () => {
  const root = mkdtempSync(join(tmpdir(), "buildez-v11-replay-"));
  try {
    const trace = new V11SourceArtifactTrace({
      generationId: "generation-fixed",
      prompt: "Build the exact page",
      model: "gpt-test",
      root,
      now: "2026-07-22T00:00:00.000Z",
    });
    const rawSource = `export default function Page(){return <main><header><nav aria-label="primary-navigation"><a href="#home">Home</a></nav></header><section id="home" aria-label="hero"><h1>Raw replay</h1></section><footer aria-label="footer">Footer</footer></main>}`;
    const normalizedSource = sanitizeGeneratedTsx(rawSource);
    trace.recordRaw(rawSource);
    trace.recordNormalized(normalizedSource);
    trace.recordFailure(
      "source_rejected",
      new Error("V11_SOURCE_REJECTED:\nUNSUPPORTED_MAP_SOURCE at ai-v11-generated.tsx:12:8"),
    );

    const directory = join(root, "generation-fixed");
    const artifact = JSON.parse(readFileSync(join(directory, "artifact.json"), "utf8"));
    assert.equal(readFileSync(join(directory, "raw.tsx"), "utf8"), rawSource);
    assert.equal(readFileSync(join(directory, "normalized.tsx"), "utf8"), normalizedSource);
    assert.equal(artifact.contentHash, sha256(rawSource));
    assert.equal(artifact.normalizedContentHash, sha256(normalizedSource));
    assert.equal(artifact.promptHash, sha256("Build the exact page"));
    assert.equal(artifact.model, "gpt-test");
    assert.equal(artifact.status, "source_rejected");
    assert.deepEqual(artifact.diagnostics, [{
      code: "UNSUPPORTED_MAP_SOURCE",
      file: "ai-v11-generated.tsx",
      line: 12,
      column: 8,
    }]);
    assert.ok(Object.keys(compileGeneratedSource(normalizedSource).blueprint.nodes).length > 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("V11 premium prompt preserves approved use-case decisions and static source contract", () => {
  const prompt = buildV11DesignPrompt({ prompt: "Build a premium clinic website", pageTitle: "Home", context: { audience: "Families", designIntent: "Calm editorial" } });
  assert.match(prompt, /Families/);
  assert.match(prompt, /Calm editorial/);
  assert.match(prompt, /FACT AND CONTENT PACK/);
  assert.match(prompt, /ART DIRECTION/);
  assert.match(prompt, /invented facts/);
  assert.match(prompt, /7-10 substantial sections/);
  assert.match(prompt, /production React\/TSX/);
  assert.match(prompt, /primary-navigation/);
  assert.match(prompt, /Do not design around a downstream page-builder compiler/);
  assert.doesNotMatch(prompt, /COMPILER CONTRACT/);
});

test("V11 lowers an approved creative artifact without asking the creative model to satisfy compiler constraints", () => {
  const creative = `export default function Page(){return <main><section><h1>Distinctive storefront</h1></section></main>}`;
  const prompt = buildV11LoweringPrompt(creative);
  assert.match(prompt, /APPROVED CREATIVE SOURCE/);
  assert.match(prompt, /lowering pass, not a redesign/);
  assert.match(prompt, /Distinctive storefront/);
  assert.match(prompt, /total expanded intrinsic elements below 300/);
});

test("V11 reference prompt includes the design specification once and omits stored media URLs", () => {
  const analysis = "REFERENCE_SPEC_UNIQUE_MARKER product grid and newsletter";
  const prompt = buildV11DesignPrompt({
    prompt: "Reconstruct the attached storefront",
    pageTitle: "Home",
    context: { referenceAnalysis: analysis, referenceFileUrl: "https://files.example/reference.pdf", referenceImageUrl: "https://files.example/reference.png" },
  });
  assert.equal(prompt.split("REFERENCE_SPEC_UNIQUE_MARKER").length - 1, 1);
  assert.doesNotMatch(prompt, /files\.example/);
});

test("V11 reserves completion budget for source and lowers reasoning after an empty response", () => {
  assert.deepEqual(resolveV11AttemptProfile(0), { reasoningEffort: "low", maxCompletionTokens: 9000, timeoutMs: 75000 });
  assert.deepEqual(resolveV11AttemptProfile(1, new Error("V11_EMPTY_MODEL_SOURCE")), { reasoningEffort: "low", maxCompletionTokens: 9000, timeoutMs: 70000 });
});

test("V11 timeout fallback is safe and compiles into native Builder nodes", () => {
  const input = { prompt: "Premium architecture studio", pageTitle: "Home", context: { companyName: "North Studio" } };
  const source = buildV11FallbackTsx(input, createV11CreativeBrief(input.context, input.prompt));
  assert.equal(assessUntrustedSource(source, "timeout-fallback.tsx").safe, true);
  const graph = buildDesignGraph(normalizeTsx(parseTsx(source, "timeout-fallback.tsx")));
  assert.equal(graph.diagnostics.filter((item) => item.severity === "error").length, 0);
  const compiled = compileDesignGraphToBlueprint(graph);
  assert.equal(validateBlueprint(compiled.blueprint).valid, true);
  assert.equal(validateFullPageCompleteness({
    source,
    ast: parseTsx(source, "timeout-fallback.tsx").ast,
    graph,
    blueprint: compiled.blueprint,
    diagnostics: compiled.diagnostics,
  }).valid, true);
  assert.ok(Object.keys(compiled.blueprint.nodes).length > 30);
});

test("V11 replaces external model assets before source validation", () => {
  const source = sanitizeGeneratedTsx(
    `export default function Page(){return <><img src="https://example.com/hero.jpg"/><a href="https://example.com">Go</a></>}`,
    [],
  );
  assert.doesNotMatch(source, /https?:\/\//);
  assert.match(source, /\/v11-premium\//);
  assert.match(source, /href="#contact"/);
  assert.equal(assessUntrustedSource(source, "normalized-assets.tsx").safe, true);
});

test("V11 removes external CSS imports before source validation", () => {
  const source = sanitizeGeneratedTsx(`export default function Page(){return <section><article className="glass">Card</article><style>{\`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');
    .glass { backdrop-filter: blur(12px); }
  \`}</style></section>}`);

  assert.doesNotMatch(source, /@import|https?:\/\//i);
  assert.match(source, /\.glass\s*\{\s*backdrop-filter:\s*blur\(12px\)/);
  assert.equal(assessUntrustedSource(source, "normalized-css-import.tsx").safe, true);
});

test("V11 uses reference-appropriate replacement assets instead of unrelated catalog images", () => {
  const source = sanitizeGeneratedTsx(
    `export default function Page(){return <><img src="https://example.com/one.jpg"/><img src="https://example.com/two.jpg"/></>}`,
    ["/v11-premium/product.png", "/v11-premium/fashion.png"]
  );
  assert.match(source, /product\.png/);
  assert.match(source, /fashion\.png/);
  assert.doesNotMatch(source, /automotive|agency/);
});

test("V11 commerce generation uses Shopez product media instead of generic premium assets", () => {
  const context = {
    shopezCatalog: { products: [{ title: "Real Serum", images: [{ src: "/api/public/shopez/media/image-1" }] }] },
  };
  const prompt = buildV11DesignPrompt({ prompt: "Build the store", pageTitle: "Shop", context });
  const lowered = sanitizeGeneratedTsx(`export default function Page(){return <><img src="/v11-premium/resort.png"/><img src="https://example.com/fake.jpg"/></>}`, ["/api/public/shopez/media/image-1"]);
  assert.match(prompt, /MUST come only from shopezCatalog/);
  assert.doesNotMatch(lowered, /resort|example\.com/);
  assert.equal(lowered.match(/\/api\/public\/shopez\/media\/image-1/g)?.length, 2);
});

test("V11 rejects generic output for an uploaded commerce reference", () => {
  assert.throws(
    () => assertReferenceFidelity(
      `export default function Page(){return <main><h1>A better way to move forward</h1><h2>Understand</h2><h2>Create</h2><h2>Deliver</h2></main>}`,
      { referenceAnalysis: "A skincare ecommerce storefront with product cards, categories, sale, testimonials, blog, newsletter and footer." }
    ),
    /V11_REFERENCE_FIDELITY_FAILED/
  );
});

test("V11 accepts a reference reconstruction that retains its commerce structure", () => {
  assert.doesNotThrow(() => assertReferenceFidelity(
    `export default function Page(){return <main><section>Shop products</section><section>Collections and categories</section><section>Sale bestsellers</section><section>Newsletter</section></main>}`,
    { referenceAnalysis: "A skincare ecommerce storefront with product cards, categories, sale, testimonials, blog, newsletter and footer." }
  ));
});

test("V11 does not reject a storefront merely because it uses different commerce vocabulary", () => {
  const source = `export default function Page(){return <main><header>Skinelle</header><section>New arrivals</section><section>Daily glow serum — $28</section><section>Customer favorites</section><footer>Join our mailing list</footer></main>}`;
  const context = { referenceAnalysis: "A skincare ecommerce storefront with product cards, categories, sale, testimonials, blog, newsletter and footer." };
  assert.doesNotThrow(() => assertReferenceFidelity(source, context));
  assert.deepEqual(referenceFidelityWarnings(source, context), []);
});
