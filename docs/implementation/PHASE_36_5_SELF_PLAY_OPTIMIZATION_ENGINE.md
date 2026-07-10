# Phase 36.5 - Self-Play Optimization Engine

Date: 2026-07-07

## Summary

Phase 36.5 implements deterministic metadata-only Self-Play Optimization. The engine simulates repair-plan application over candidate metadata until a quality target or stopping rule is reached.

## Implemented

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

## Stopping Rules

- Target score reached, default `95`
- Max iterations reached, default `3`
- No meaningful improvement
- Hard failure cannot be repaired metadata-only
- Repair would require missing facts/assets
- Diversity worsens above allowed threshold

## Safety

- No `ai-v9` changes.
- No Builder behavior changes.
- No Builder store writes.
- No production routes.
- No rendering.
- No screenshots.
- No Mapper execution.
- No Builder nodes.
- No React/CSS/HTML/JS generation.
- No DB, network, LLM, MCP, or provider calls.
- No persistence.
- Feature flags remain false.

## Verification

`pnpm --dir apps/web-app typecheck:builder` passed.

## Next Phase

Phase 37 - Learning Engine.
