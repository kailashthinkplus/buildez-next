# Phase 14 Constraint Resolver Compiler

## Objective

Implement the first deterministic constraint, resolver, and compiler path.

## Scope

Pure engine code only, fixture-driven, no production routing.

## Files Expected To Create

Constraint evaluators, resolver scorer, compiler, and tests.

## Files Expected To Modify

SDK contracts and repository fixtures if needed.

## Acceptance Criteria

Five industry fixtures produce valid `ResolverResult` and `CompiledWebsitePlan`.

## Tests/Verification

Positive and negative constraint tests; resolver/compiler snapshots.

## Rollback Plan

Disable feature flag and keep ai-v9 path.

## Risks

Resolver may become too heuristic or too LLM-dependent.
