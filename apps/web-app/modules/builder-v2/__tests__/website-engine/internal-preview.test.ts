import assert from "node:assert/strict";
import test from "node:test";
import {
  buildInternalPreview,
  INTERNAL_PREVIEW_FIXTURE_PROMPT,
  isInternalPreviewAvailable,
  verifyInternalPreview,
} from "../../website-engine/internal-preview";

test("Phase 41 creates a disposable canonical preview without side effects", () => {
  const preview = buildInternalPreview({ prompt: INTERNAL_PREVIEW_FIXTURE_PROMPT });

  assert.equal(preview.validation.valid, true);
  assert.ok(preview.canonicalBlueprint?.nodes[preview.canonicalBlueprint.root]);
  assert.equal(preview.mapperResult.mappingPlan.executed, false);
  assert.deepEqual(preview.featureFlagSnapshot, {
    WEBSITE_ENGINE_ENABLED: false,
    AI_V10_ENABLED: false,
    MAPPER_EXECUTION_ENABLED: false,
  });
  assert.deepEqual(preview.externalProviderUsage, {
    llm: false,
    image: false,
    database: false,
    network: false,
    paidApi: false,
  });
  assert.equal(preview.disposable, true);
  assert.equal(verifyInternalPreview().passed, true);
});

test("Phase 41 route access is denied in production", () => {
  assert.equal(isInternalPreviewAvailable("development"), true);
  assert.equal(isInternalPreviewAvailable("test"), true);
  assert.equal(isInternalPreviewAvailable("production"), false);
});

test("Phase 41 uses a stable request id and only compares ai-v9 when supplied", () => {
  const first = buildInternalPreview({ prompt: INTERNAL_PREVIEW_FIXTURE_PROMPT });
  const second = buildInternalPreview({ prompt: INTERNAL_PREVIEW_FIXTURE_PROMPT });
  const compared = buildInternalPreview({ prompt: INTERNAL_PREVIEW_FIXTURE_PROMPT, aiV9Evidence: { id: "fixture-v9" } });

  assert.equal(first.requestId, second.requestId);
  assert.equal(first.aiV9ShadowComparisonResult, undefined);
  assert.ok(compared.aiV9ShadowComparisonResult);
});
