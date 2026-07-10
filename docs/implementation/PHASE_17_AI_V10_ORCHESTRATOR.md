# Phase 17 ai-v10 Orchestrator

## Objective

Introduce ai-v10 as orchestration glue for Website Engine.

## Scope

No product logic in ai-v10. It calls engine contracts and preserves ai-v9 fallback.

## Files Expected To Create

Orchestrator contract, feature flag, shadow-run route/test harness.

## Files Expected To Modify

Docs, feature flag config, and test fixtures.

## Acceptance Criteria

ai-v10 can run shadow generation with fallback to ai-v9 and no production default switch.

## Tests/Verification

Fallback tests, shadow run tests, and fixture comparisons.

## Rollback Plan

Disable ai-v10 feature flag.

## Risks

ai-v10 may become a monolith if engine boundaries are ignored.
