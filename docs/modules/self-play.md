# Self-Play Module

## Module

`apps/web-app/modules/builder-v2/website-engine/self-play`

## Responsibility

The Self-Play module simulates deterministic optimization loops over candidate and repair metadata. It produces optimization results only.

## Public Helpers

- `runSelfPlayOptimization()`
- `runOptimizationLoop()`
- `buildOptimizationCandidate()`
- `runOptimizationIteration()`
- `scoreOptimizationCandidate()`
- `applyRepairPlanMetadata()`
- `evaluateStoppingCondition()`
- `buildQualityTarget()`
- `buildOptimizationTrace()`
- `validateSelfPlayInput()`
- `validateSelfPlayResult()`
- `runSelfPlayVerification()`

## Non-Responsibilities

- No Builder mutation
- No Mapper execution
- No rendering
- No screenshots
- No code generation
- No DB/network/LLM/MCP/provider calls
- No persistence
