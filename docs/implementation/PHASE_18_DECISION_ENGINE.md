# Phase 18 Decision Engine

## Objective

Implement the deterministic Decision Engine.

The Decision Engine receives ranked reasoning candidates and commits to one coherent Website Strategy. It produces one deterministic `DecisionPlan`. It does not generate Builder nodes, compile websites, call LLMs, access external services, or wire into production.

## Scope

Implemented under `apps/web-app/modules/builder-v2/website-engine/decision/`:

- `decision.ts`
- `decisionPlan.ts`
- `selection.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `DecisionEngine.ts`
- `index.ts`
- `README.md`

The existing `resolver/` module was not deleted. It remains a deprecated compatibility skeleton.

## Contracts Added

- `DecisionInput`
- `DecisionResult`
- `DecisionPlan`
- `DecisionExplanation`
- `DecisionMetrics`
- `DecisionConfidence`

## Deterministic Helpers

- `runDecisionEngine()`
- `selectBestCandidate()`
- `selectPatternSet()`
- `selectComponentFamilies()`
- `selectDesignLanguage()`
- `selectCompositionStrategy()`
- `selectAssetStrategy()`
- `selectCTA()`
- `buildDecisionPlan()`
- `collectDecisionMetrics()`
- `runDecisionVerification()`

## Decision Plan Output

`DecisionPlan` includes selected business family, industry, archetype, website goal, design language, composition strategy, pattern set, component families, asset strategy, CTA strategy, SEO strategy, accessibility strategy, responsive strategy, quality gates, confidence, explanations, repository references, constraint references, graph references, and warnings.

## Validation

Validation checks:

- One archetype is selected.
- One design language is selected.
- One composition strategy is selected.
- Pattern and component selections are present.
- Selected repository references exist.
- Selected graph references exist.
- Constraint violations are surfaced as warnings.
- Confidence is normalized.

## Typecheck

Required command:

```bash
pnpm --dir apps/web-app typecheck:builder
```

Expected status: pass.

Additional compile-safe decision check:

```bash
pnpm --dir apps/web-app exec tsc --noEmit --skipLibCheck --moduleResolution node --module esnext --target es2017 --lib esnext,dom --strict false modules/builder-v2/website-engine/sdk/index.ts modules/builder-v2/website-engine/repository/index.ts modules/builder-v2/website-engine/graph/index.ts modules/builder-v2/website-engine/constraints/index.ts modules/builder-v2/website-engine/reasoning/index.ts modules/builder-v2/website-engine/decision/index.ts --pretty false
```

Expected status: pass.

## Non-Goals

- No `ai-v9` changes.
- No Builder behavior changes.
- No production route changes.
- No feature flag enablement.
- No database, network, external service, or LLM calls.
- No Planner, Compiler, Mapper, Renderer, Critic, Repair, AI generation, or Website Engine production wiring.
- No generated websites.

## Next Recommended Phase

Implement Website Compiler contracts over `DecisionPlan`, still local-only and not wired into Builder or production generation.
