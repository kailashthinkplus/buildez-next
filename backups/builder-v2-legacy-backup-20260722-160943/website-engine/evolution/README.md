# Candidate Evolution Engine

Phase 35.75 introduces deterministic multi-candidate evolution before Repair.

The engine generates at least five metadata-only website candidates, applies deterministic mutations, compares candidates, scores them with quality and uniqueness signals, ranks them, selects a winner, preserves runner-ups, and emits repair priorities.

## Entry Points

- `runCandidateEvolution(input)`
- `generateWebsiteCandidates(input)`
- `mutateCandidate(profile, kind, index)`
- `buildCandidateVariants()`
- `compareCandidates(candidates)`
- `scoreCandidate(candidate, input, comparisons)`
- `rankCandidates(candidates, scores)`
- `selectWinningCandidate(ranking)`
- `buildRunnerUps(ranking)`
- `buildRepairPriority(winner)`
- `runEvolutionVerification()`

## Mutation Dimensions

- Different hero recipe
- Different recipe family
- Different fragment selection
- Different Design DNA weighting
- Different typography rhythm
- Different spacing rhythm
- Different layout rhythm
- Different motion rhythm
- Different CTA cadence
- Different composition ordering
- Different visual density
- Different media strategy
- Different grid philosophy
- Different asymmetry level

## Safety

Candidate Evolution is metadata-only. It does not render, capture screenshots, execute Mapper, create Builder nodes, insert into Builder store, generate HTML/CSS/React/JS, call LLMs, call providers, use DB, use MCP, use network, or wire production routes.
