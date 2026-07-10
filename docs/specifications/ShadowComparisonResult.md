# ShadowComparisonResult Specification

## Contract

`ShadowComparisonResult` is returned by `EngineResult<ShadowComparisonResult>`.

Required fields:

- `id`
- `version`
- `v9Artifact`
- `v10Artifact`
- `qualityComparison`
- `editabilityComparison`
- `rendererParityComparison`
- `similarityComparison`
- `performanceComparison`
- `riskComparison`
- `nativeBuilderCompatibilityComparison`
- `repairabilityComparison`
- `winnerRecommendation`
- `rolloutReadiness`
- `incompleteReasons`
- `warnings`
- `metrics`
- `trace`
- `metadata`

## Artifact Summaries

`V9ShadowArtifact` and `V10ShadowArtifact` normalize provided metadata only. They may include scores for quality, editability, renderer parity, diversity, performance risk, safety risk, repairability, and native Builder compatibility only if the signal exists in provided artifacts.

## Comparison Result

Each category includes:

- Category name
- Metric label
- Completeness flag
- Higher-is-better flag
- ai-v9 value
- v10 value
- Missing signals
- Winner: `v9`, `v10`, `tie`, or `incomplete`
- Reasons

## Rollout Readiness

Rollout readiness can be:

- `not_ready`
- `shadow_only`
- `manual_review`
- `ready_for_internal_preview`

This recommendation is not production authorization.

## Forbidden Side Effects

The following result flags must remain false:

- `aiV9Executed`
- `aiV10Generated`
- `liveLlmCalls`
- `dbCalls`
- `networkCalls`
- `mcpCalls`
- `providerCalls`
- `mapperExecuted`
- `builderStoreWrites`
- `builderNodesInserted`
- `productionWiring`
