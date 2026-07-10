# Self-Play Optimization Engine

Phase 36.5 implements deterministic, metadata-only optimization loops before anything reaches Builder.

Self-play simulates repair-plan application over candidate metadata, tracks score progression, and stops when a quality target or safety stopping rule is reached.

## Entry Points

- `runSelfPlayOptimization(input)`
- `runOptimizationLoop(input)`
- `buildOptimizationCandidate(input)`
- `runOptimizationIteration(input, iteration)`
- `scoreOptimizationCandidate(input, repairPlan)`
- `applyRepairPlanMetadata(candidate, repairPlan, iteration)`
- `evaluateStoppingCondition(iterations, target)`
- `buildQualityTarget(input)`
- `buildOptimizationTrace(iterations)`
- `runSelfPlayVerification()`

## Stopping Rules

- Target score reached, default `95`
- Max iterations reached, default `3`
- No meaningful improvement
- Hard failure cannot be repaired metadata-only
- Repair would require missing facts or assets
- Diversity worsens above allowed threshold

## Safety

Self-play is metadata-only. It does not mutate Builder store, execute Mapper, create Builder nodes, render, capture screenshots, generate code, call LLMs, call providers, use DB, use MCP, use network, or wire production routes.
