# Phase 17 Reasoning Engine

## Objective

Implement the deterministic Website Engine Reasoning Layer.

The Reasoning Engine answers: "What are the best candidates?" It ranks candidate business families, industries, subindustries, archetypes, patterns, component families, design languages, composition strategies, asset strategies, CTA strategies, SEO strategies, and repair strategies.

It does not resolve final selections, compile plans, map nodes, render UI, generate websites, call LLMs, access databases, call external services, or wire into production routes.

## Scope

Implemented under `apps/web-app/modules/builder-v2/website-engine/reasoning/`:

- `reasoning.ts`
- `candidateSets.ts`
- `scoring.ts`
- `ranking.ts`
- `explanations.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `runReasoning.ts`
- `ReasoningEngine.ts`
- `index.ts`
- `README.md`

## Contracts Added

- `ReasoningInput`
- `ReasoningResult`
- `ReasoningCandidate`
- `CandidateScore`
- `CandidateExplanation`
- `CandidateSet`
- `ReasoningMetrics`
- `ReasoningConfidence`

## Deterministic Helpers

- `runReasoning()`
- `buildCandidateSet()`
- `scoreCandidates()`
- `rankCandidates()`
- `explainCandidate()`
- `collectReasoningMetrics()`
- `runReasoningVerification()`

## Scoring

Each candidate receives:

- `compatibilityScore`
- `constraintScore`
- `repositoryScore`
- `graphScore`
- `confidence`
- `overallScore`

Scores are normalized from 0 to 1 and explanations record why each score was assigned.

## Inputs

Reasoning can combine:

- `BusinessIntelligenceProfile`
- `BrandIntelligenceProfile`
- `ContentStrategy`
- `ExperienceStrategy`
- `PatternIntelligenceResult`
- `WebsiteSpec`
- `ConstraintResult`
- Local repository records
- Local Knowledge Graph nodes and edges

All inputs are optional so the module can produce safe partial candidate rankings during early pipeline phases.

## Validation

Validation checks:

- Candidate scores are normalized.
- Candidate ids are present.
- Candidate ids are unique.
- Repository references are valid.
- Graph references are valid.
- Repository candidates do not reference unsupported starter industries.
- Reasoning results remain candidate rankings only.

## Typecheck

Required command:

```bash
pnpm --dir apps/web-app typecheck:builder
```

Expected status: pass.

Additional compile-safe reasoning check:

```bash
pnpm --dir apps/web-app exec tsc --noEmit --skipLibCheck --moduleResolution node --module esnext --target es2017 --lib esnext,dom --strict false modules/builder-v2/website-engine/sdk/index.ts modules/builder-v2/website-engine/repository/index.ts modules/builder-v2/website-engine/graph/index.ts modules/builder-v2/website-engine/constraints/index.ts modules/builder-v2/website-engine/reasoning/index.ts --pretty false
```

Expected status: pass.

## Non-Goals

- No `ai-v9` changes.
- No Builder behavior changes.
- No production route changes.
- No feature flag enablement.
- No database or external service access.
- No network calls or LLM calls.
- No Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, Design Engine, AI generation, or Website Engine production wiring.
- No generated websites.

## Acceptance Criteria

- Reasoning contracts compile cleanly.
- Candidate sets cover all requested categories.
- Scoring is deterministic and normalized.
- Ranking is deterministic.
- Explanations record why candidates scored as they did.
- `runReasoningVerification()` exists.
- `typecheck:builder` passes.

## Rollback Plan

Because Phase 17 is inert and not wired into production behavior, rollback is limited to removing the reasoning contract/ranking files and reverting documentation updates. No database migration, route rollback, rendering rollback, or builder behavior rollback is required.

## Next Recommended Phase

Implement Resolver contracts over ranked reasoning candidates, repository records, graph relationships, and constraint results. Keep the resolver local-only and do not wire it into Builder or production generation yet.
