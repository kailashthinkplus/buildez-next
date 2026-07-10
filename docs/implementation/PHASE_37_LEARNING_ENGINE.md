# Phase 37 - Learning Engine

Date: 2026-07-07

## Summary

Phase 37 implements metadata-only Learning Engine signal extraction. It produces local learning records and ranking signals from upstream Website Engine metadata without persistence.

## Implemented

- `runLearningEngine()`
- `buildLearningRecords()`
- `buildGenerationHistory()`
- `extractRankingSignals()`
- `extractPatternLearningSignals()`
- `extractRecipeLearningSignals()`
- `extractFragmentLearningSignals()`
- `extractDesignDnaLearningSignals()`
- `extractCriticLearningSignals()`
- `extractRepairLearningSignals()`
- `extractSimilarityLearningSignals()`
- `extractSelfPlayLearningSignals()`
- `aggregateLearningSignals()`
- `validateLearningInput()`
- `validateLearningResult()`
- `runLearningVerification()`

## Safety

- No `ai-v9` changes.
- No Builder behavior changes.
- No Builder store writes.
- No production routes.
- No rendering.
- No Mapper execution.
- No Builder nodes.
- No React/CSS/HTML/JS generation.
- No DB persistence, network, LLM, MCP, or provider calls.
- No invented telemetry.
- Feature flags remain false.

## Verification

`pnpm --dir apps/web-app typecheck:builder` passed.

## Next Phase

Phase 38 - AI Planner.
