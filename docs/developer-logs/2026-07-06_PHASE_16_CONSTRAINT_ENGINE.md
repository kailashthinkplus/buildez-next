# 2026-07-06 Phase 16 Constraint Engine

## Summary

Implemented inert local Constraint Engine contracts and deterministic evaluation for the Website Engine.

The module evaluates typed local rules against typed inputs and can collect rules from local repository records and graph-reachable constraints. It remains independently callable and is not wired into Resolver, Compiler, Builder, rendering, production routes, ai-v9, AI generation, DB, or external services.

## Files Created

- `apps/web-app/modules/builder-v2/website-engine/constraints/rules.ts`
- `apps/web-app/modules/builder-v2/website-engine/constraints/evaluator.ts`
- `apps/web-app/modules/builder-v2/website-engine/constraints/validation.ts`
- `apps/web-app/modules/builder-v2/website-engine/constraints/verification.ts`
- `apps/web-app/modules/builder-v2/website-engine/constraints/version.ts`
- `docs/implementation/PHASE_16_CONSTRAINT_ENGINE.md`
- `docs/developer-logs/2026-07-06_PHASE_16_CONSTRAINT_ENGINE.md`

## Files Modified

- `apps/web-app/modules/builder-v2/website-engine/constraints/runConstraints.ts`
- `apps/web-app/modules/builder-v2/website-engine/constraints/index.ts`
- `apps/web-app/modules/builder-v2/website-engine/constraints/README.md`
- `docs/PROJECT_STATE.md`
- `docs/changelog/CHANGELOG.md`

## Contracts Added

Added local Constraint Engine contracts for rules, categories, suggestions, violations, evaluation context, evaluation input, and evaluation result while reusing SDK types for scope, severity, repair hints, violations, and `EngineResult`.

## Evaluator Helpers

Added:

- `runConstraints()`
- `evaluateConstraintRule()`
- `evaluateConstraintRules()`
- `collectConstraintRulesFromRepository()`
- `collectConstraintRulesFromGraph()`

## Starter Constraints

Added generic starter constraints for truth, missing facts, placeholders, unsupported claims, editability, renderer parity, conversion CTA, mobile CTA, repeated card grids, asset readiness, accessibility, and SEO.

Added industry-family constraints for healthcare, real estate, restaurant / food and beverage, automotive, and education without creating fake business facts.

## Verification

Added validation for rule identity, versioning, category, severity, scope, condition type, repair hints, starter coverage, graph/repository constraint paths, fake business fact language, and real-estate root risk.

## Commands Run

```bash
pnpm --dir apps/web-app exec tsc --noEmit --skipLibCheck --moduleResolution node --module esnext --target es2017 --lib esnext,dom --strict false modules/builder-v2/website-engine/sdk/index.ts modules/builder-v2/website-engine/repository/index.ts modules/builder-v2/website-engine/graph/index.ts modules/builder-v2/website-engine/constraints/index.ts --pretty false
pnpm --dir apps/web-app typecheck:builder
```

Both compile checks passed.

## Safety Notes

- `ai-v9` was not modified.
- Feature flags remain false.
- No production routes were changed.
- No Builder behavior, rendering, generation, Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, AI, database, external service, or LLM logic was added.
- Real estate remains one starter industry, not the Constraint Engine foundation.

## Technical Debt

- Evaluator conditions are intentionally lightweight and local.
- Repository-derived rules currently map repository constraint records into generic unsupported-claim checks.
- Graph-derived rules are collected from reachable local graph constraint nodes but are not resolver-ranked.
- No runtime test runner is configured; verification is compile-safe.

## Next Recommended Phase

Implement Resolver contracts over SDK, repository, graph, and constraint outputs as the next inert foundation phase.
