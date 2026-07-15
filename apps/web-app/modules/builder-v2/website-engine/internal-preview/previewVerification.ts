import { buildInternalPreview } from "./buildInternalPreview";
import { INTERNAL_PREVIEW_FIXTURE_PROMPT } from "./previewFixtures";

export function verifyInternalPreview() {
  const result = buildInternalPreview({ prompt: INTERNAL_PREVIEW_FIXTURE_PROMPT });
  return Object.freeze({ passed: result.validation.valid && Boolean(result.canonicalBlueprint) && !result.mapperResult.mappingPlan.executed && Object.values(result.featureFlagSnapshot).every((value) => value === false), requestId: result.requestId, nodeCount: result.validation.nodeCount, errors: result.errors });
}

