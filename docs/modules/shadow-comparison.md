# Shadow Comparison Module

## Responsibility

The Shadow Comparison module compares ai-v9 and Website Engine v10 metadata artifacts without executing either side.

## Entry Points

- `runShadowComparison(input)`
- `adaptV9Artifact(input)`
- `adaptV10Artifact(input)`
- `compareQuality(v9, v10)`
- `compareEditability(v9, v10)`
- `compareRendererParity(v9, v10)`
- `compareSimilarity(v9, v10)`
- `comparePerformanceRisk(v9, v10)`
- `compareSafetyRisk(v9, v10)`
- `selectShadowWinner(comparisons)`
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

## Incomplete Results

If a required ai-v9 or v10 signal is missing, the category is marked incomplete. Missing metadata is a useful result because it identifies what must be collected before rollout decisions.

## Non-Responsibilities

The module does not execute ai-v9, run v10 generation, generate Builder nodes, execute Mapper, mutate Builder, call live LLM APIs, persist telemetry, render, capture screenshots, or wire routes.
