# Decision

## Purpose

Commit ranked reasoning candidates to one coherent Website Strategy.

## Current Status

Phase 18 deterministic Decision Engine.

## Public API

- `DecisionEngine.run(input)`
- `runDecisionEngine(input)`
- `selectBestCandidate(candidates, category)`
- `selectPatternSet(candidates)`
- `selectComponentFamilies(candidates)`
- `selectDesignLanguage(candidates)`
- `selectCompositionStrategy(candidates)`
- `selectAssetStrategy(candidates)`
- `selectCTA(candidates, input)`
- `buildDecisionPlan(input, reasoningResult)`
- `collectDecisionMetrics(plan, reasoningResult)`
- `runDecisionVerification()`

## Dependencies

SDK, local Reasoning Engine result, local repository references, local graph references, and local constraint results only.

## Implementation Phase

Phase 18 Decision Engine.

## Safety Notes

Does not call external services, mutate state, call LLMs, implement Compiler, generate websites, change Builder behavior, or wire into production routes.
