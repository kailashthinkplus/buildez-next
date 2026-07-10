# Similarity & Diversity Engine

Phase 35.5 implements deterministic, metadata-only similarity evaluation for Website Engine outputs.

The engine answers: is this candidate different enough?

It compares a candidate website profile against optional previous website profiles, previous recipe selections, previous fragment selections, previous Design DNA profiles, or internal baseline diversity rules when no history is provided.

## Entry Points

- `runSimilarityEngine(input)`
- `buildWebsiteSimilarityProfile(input)`
- `runSimilarityVerification()`

## Dimensions

- Design DNA similarity
- Recipe overlap
- Fragment overlap
- Component overlap
- Composition / section order similarity
- Layout rhythm similarity
- Motion rhythm similarity
- Typography rhythm similarity
- CTA cadence similarity
- Visual density similarity
- Industry archetype repetition
- Creative Library family repetition

## Thresholds

- `0.00-0.55` similarity: diverse / acceptable
- `0.56-0.70` similarity: acceptable but watch
- `0.71-0.84` similarity: needs diversity improvement
- `0.85+` similarity: fail / too similar

Diversity score is inverse-weighted from similarity:

- `90+` excellent diversity
- `75-89` acceptable
- `60-74` weak
- Below `60` fail

## Safety

This module does not persist history, render, capture screenshots, create Builder nodes, execute Mapper, mutate Builder store, call DB/network/LLM/MCP/providers, or generate React/CSS/HTML/JS.
