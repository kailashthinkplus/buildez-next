# Learning Engine

Phase 37 implements metadata-only learning signal extraction.

The Learning Engine answers: what local signals should the Website Engine remember or use later to improve ranking?

It creates local in-memory learning records and ranking signal contracts only. It does not persist to DB, call network, call LLMs, use MCP/providers, mutate Builder, execute Mapper, generate code, or invent telemetry.

## Entry Points

- `runLearningEngine(input)`
- `buildLearningRecords(signals)`
- `buildGenerationHistory(input)`
- `extractRankingSignals(input)`
- `extractPatternLearningSignals(input)`
- `extractRecipeLearningSignals(input)`
- `extractFragmentLearningSignals(input)`
- `extractDesignDnaLearningSignals(input)`
- `extractCriticLearningSignals(input)`
- `extractRepairLearningSignals(input)`
- `extractSimilarityLearningSignals(input)`
- `extractSelfPlayLearningSignals(input)`
- `aggregateLearningSignals(signals, missingTelemetry)`
- `runLearningVerification()`

## Missing Telemetry

If user edit or publish signals are not provided, the result marks them as unavailable in `generationHistory` and `aggregationSummary.missingTelemetry`.

## Safety

Learning is metadata-only and local. It has no persistence side effects and cannot change runtime or Builder behavior.
