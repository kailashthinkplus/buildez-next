# ai-v9 Shadow Comparison

Phase 40 adds inert comparison tooling for ai-v9 and Website Engine v10 metadata.

It does not execute ai-v9, run v10 generation, call LLMs, call DB/network/MCP/providers, execute Mapper, mutate Builder, insert Builder nodes, render, capture screenshots, or wire production routes.

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
- `validateShadowComparisonInput(input)`
- `validateShadowComparisonResult(result)`
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

## Missing Artifacts

Missing artifacts or missing score signals produce incomplete comparisons. The module does not fabricate scores.

## Rollout Boundary

Shadow Comparison is evidence gathering only. It cannot replace ai-v9, route v10 into production, or write Builder state.
