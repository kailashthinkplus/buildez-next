# Phase 35.5 - Similarity & Diversity Engine

Date: 2026-07-07

## Summary

Phase 35.5 implements the deterministic, metadata-only Similarity & Diversity Engine. It compares candidate website metadata against optional history or internal baseline rules to determine whether the candidate is different enough.

## Implemented

- `runSimilarityEngine()`
- `buildWebsiteSimilarityProfile()`
- Dimension comparers for Design DNA, recipes, fragments, components, composition order, layout rhythm, motion rhythm, typography rhythm, CTA cadence, visual density, industry/archetype, and creative families
- Similarity and diversity scoring
- Diversity penalties
- Diversity recommendations
- Repair hints
- Input/result validation
- Compile-safe verification
- README and Website Engine barrel export

## Thresholds

- `0.00-0.55` similarity: diverse / acceptable
- `0.56-0.70` similarity: acceptable but watch
- `0.71-0.84` similarity: needs diversity improvement
- `0.85+` similarity: fail / too similar

## Safety

- No `ai-v9` changes.
- No Builder behavior changes.
- No Builder store writes.
- No production routes.
- No rendering.
- No screenshots.
- No Mapper execution.
- No Builder nodes.
- No React/CSS/HTML/JS generation.
- No DB, network, LLM, MCP, or provider calls.
- No history persistence.
- Feature flags remain false.

## Verification

`pnpm --dir apps/web-app typecheck:builder` passed.

## Next Phase

Phase 36 - Repair Engine.
