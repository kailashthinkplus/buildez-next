# Phase 40 - ai-v9 Shadow Comparison

Date: 2026-07-08

## Summary

Phase 40 adds inert shadow comparison tooling under `website-engine/shadow-comparison`.

The module compares provided ai-v9 metadata with provided Website Engine v10 metadata and records incomplete categories when required signals are missing.

## Implemented

- `runShadowComparison()`
- `adaptV9Artifact()`
- `adaptV10Artifact()`
- `compareQuality()`
- `compareEditability()`
- `compareRendererParity()`
- `compareSimilarity()`
- `comparePerformanceRisk()`
- `compareSafetyRisk()`
- `compareNativeBuilderCompatibility()`
- `compareRepairability()`
- `selectShadowWinner()`
- `validateShadowComparisonInput()`
- `validateShadowComparisonResult()`
- `runShadowComparisonVerification()`

## Comparison Categories

- Quality
- Editability
- Native Builder compatibility
- Truth and safety risk
- Renderer parity risk
- Similarity and diversity
- Performance risk
- Repairability

## Safety

- No `ai-v9` changes.
- No ai-v9 execution.
- No v10 production generation.
- No Builder behavior changes.
- No Builder store writes.
- No Builder node insertion.
- No production routes.
- No rendering or screenshots.
- No Mapper execution.
- No live LLM/API calls.
- No DB, network, MCP, or provider calls.
- Feature flags remain false.

## Verification

`pnpm --dir apps/web-app typecheck:builder` should be run after implementation.

## Next Phase

Phase 41 - Internal Preview Harness.
