# Phase 16 Constraint Engine

## Objective

Create an inert, local-only Constraint Engine that evaluates repository and graph-backed rules against typed inputs.

The Constraint Engine is independently callable and deterministic. It does not plan, resolve, compile, map, render, critique, repair, generate, call AI, access a database, call external services, or wire into production routes.

## Scope

Implemented under `apps/web-app/modules/builder-v2/website-engine/constraints/`:

- `rules.ts`
- `evaluator.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `runConstraints.ts`
- `index.ts`
- `README.md`

## Contracts Added

The module reuses SDK constraint/result types where possible and adds local evaluator-specific structure:

- `ConstraintRule`
- `ConstraintScope`
- `ConstraintSeverity`
- `ConstraintViolation`
- `ConstraintSuggestion`
- `ConstraintEvaluationInput`
- `ConstraintEvaluationResult`
- `ConstraintEvaluationContext`

## Constraint Categories

The local category taxonomy includes:

- `fact-truth`
- `missing-fact`
- `placeholder-content`
- `compliance`
- `unsupported-claim`
- `asset-readiness`
- `editability`
- `mobile-conversion`
- `composition`
- `renderer-parity`
- `accessibility`
- `seo`
- `industry-fit`

## Starter Constraints

Added generic constraints for:

- No fake facts.
- Missing facts remain missing.
- No placeholder content.
- No unsupported claims.
- Generated sections remain editable.
- Preview and published output preserve renderer parity.
- Primary CTA exists for conversion-focused archetypes.
- Mobile CTA appears early for conversion-focused sites.
- Avoid three consecutive card-grid sections.
- Required assets are declared before substitution.
- Accessibility readiness is explicit.
- SEO readiness is explicit.

Added industry-family constraints without fake facts:

- Healthcare: no fabricated doctors, credentials, cure guarantees, privacy claims, or certifications.
- Real estate: no fabricated registration numbers, prices, availability, launch status, or awards.
- Restaurant / food and beverage: no invented menu prices, hours, reservation availability, or delivery availability.
- Automotive: no unsupported brand authorization, warranty terms, financing terms, inventory, or discounts.
- Education: no fabricated accreditation, exam results, placement numbers, faculty credentials, or admission guarantees.

## Repository And Graph Integration

The Constraint Engine can collect rules from:

- Starter local rules.
- Local repository constraint records.
- Local graph-reachable constraint records.

This is not wired into Resolver, Compiler, Builder, production routes, or generation.

## Public API

- `runConstraints(input)`
- `evaluateConstraintRule(rule, context)`
- `evaluateConstraintRules(rules, context)`
- `collectConstraintRulesFromRepository()`
- `collectConstraintRulesFromGraph()`
- `validateLocalConstraintRule(rule)`
- `validateConstraintRules(rules)`
- `runConstraintVerification()`

## Validation

Validation checks:

- Rules have ids, versions, category, severity, scope, condition, and repair hints.
- Industry-scoped rules declare `appliesTo`.
- Blocker rules include actionable repair hints.
- Starter industries have local rules and graph/repository constraint paths.
- Constraint rules do not treat real estate as root.
- Constraint rules do not contain fake business fact language.
- Evaluator returns `EngineResult<ConstraintEvaluationResult>`.
- Warnings/errors use SDK structures.

## Typecheck

Required command:

```bash
pnpm --dir apps/web-app typecheck:builder
```

Expected status: pass.

Additional compile-safe constraint check:

```bash
pnpm --dir apps/web-app exec tsc --noEmit --skipLibCheck --moduleResolution node --module esnext --target es2017 --lib esnext,dom --strict false modules/builder-v2/website-engine/sdk/index.ts modules/builder-v2/website-engine/repository/index.ts modules/builder-v2/website-engine/graph/index.ts modules/builder-v2/website-engine/constraints/index.ts --pretty false
```

Expected status: pass.

## Non-Goals

- No `ai-v9` changes.
- No Builder behavior changes.
- No production route changes.
- No feature flag enablement.
- No database or external service access.
- No Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, Design Engine, AI generation, or Website Engine production wiring.
- No generated websites.

## Acceptance Criteria

- Constraint contracts compile cleanly.
- Starter constraints exist across all required categories and industries.
- Repository and graph-backed constraint collection is local-only.
- Evaluator returns SDK `EngineResult` with local `ConstraintEvaluationResult`.
- `typecheck:builder` passes.

## Rollback Plan

Because Phase 16 is inert and not wired into production behavior, rollback is limited to removing the constraint contract/evaluator files and reverting documentation updates. No database migration, route rollback, rendering rollback, or builder behavior rollback is required.

## Next Recommended Phase

Implement Resolver contracts over repository, graph, and constraint outputs. Keep the resolver local-only and do not wire it into Builder or production generation yet.
