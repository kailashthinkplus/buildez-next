# SelfPlayResult Specification

## Contract

`SelfPlayResult` is the metadata-only output of Self-Play Optimization.

## Required Fields

- `id`
- `version`
- `bestCandidate`
- `iterationHistory`
- `appliedRepairPlanMetadata`
- `criticScoreProgression`
- `similarityScoreProgression`
- `diversityScoreProgression`
- `overallOptimizationScoreProgression`
- `stoppingReason`
- `finalRecommendation`
- `remainingRisks`
- `warnings`
- `metrics`
- `confidence`
- `optimizationTrace`
- `trace`
- `metadata`

## Safety Flags

The result must always report:

- `appliedToBuilder: false`
- `mapperExecuted: false`
- `rendered: false`
- `codeGenerated: false`

## Validation Rules

- Result has id and version.
- Iteration history exists.
- Best candidate exists.
- Stopping reason exists.
- Scores are normalized from `0` to `100`.
- Repair applications are metadata-only.
- No Builder/output/code side effects are present.
