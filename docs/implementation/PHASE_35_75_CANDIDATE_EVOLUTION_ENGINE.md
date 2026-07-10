# Phase 35.75 - Candidate Evolution Engine

Date: 2026-07-07

## Summary

Phase 35.75 implements deterministic metadata-only Candidate Evolution. The engine generates multiple website plan candidates, mutates metadata dimensions, compares candidates, scores them using quality and uniqueness signals, ranks them, selects a winner, preserves runner-ups, and emits repair priorities before Phase 36 Repair.

## Implemented

- `runCandidateEvolution()`
- `generateWebsiteCandidates()`
- `mutateCandidate()`
- `buildCandidateVariants()`
- `compareCandidates()`
- `scoreCandidate()`
- `rankCandidates()`
- `selectWinningCandidate()`
- `buildRunnerUps()`
- `buildRepairPriority()`
- `validateEvolutionInput()`
- `validateEvolutionResult()`
- `runEvolutionVerification()`

## Candidate Variants

The engine generates five deterministic variants:

- Trust Editorial
- Conversion Direct
- Visual Depth
- Motion Clarity
- Premium Structure

## Scoring

Winner score combines Critic, Similarity, Industry Fit, Accessibility, Performance, Editability, Content Truth, Motion Safety, Design DNA consistency, and Creative Diversity.

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
- No persistence.
- Feature flags remain false.

## Verification

`pnpm --dir apps/web-app typecheck:builder` passed.

## Next Phase

Phase 36 - Repair Engine.
