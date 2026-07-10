# Learning Engine Module

## Module

`apps/web-app/modules/builder-v2/website-engine/learning`

## Responsibility

Extract local metadata-only ranking and learning signals from upstream Website Engine results.

## Public Helpers

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

## Non-Responsibilities

- No persistence
- No telemetry invention
- No Builder mutation
- No Mapper execution
- No DB/network/LLM/MCP/provider calls
- No code generation
