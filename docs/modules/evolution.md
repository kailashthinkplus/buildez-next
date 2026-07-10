# Evolution Module

## Module

`apps/web-app/modules/builder-v2/website-engine/evolution`

## Responsibility

The Evolution module generates deterministic candidate variations, compares them, scores them, ranks them, selects a winner, preserves runner-ups, and emits repair priority metadata.

## Public Helpers

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

## Non-Responsibilities

- No rendering
- No screenshots
- No Builder nodes
- No Builder store writes
- No Mapper execution
- No production route wiring
- No HTML/CSS/React/JS generation
- No DB/network/LLM/MCP/provider calls
- No persistence
