# Phase 14 Repository And Fixtures

## Objective

Create the first production-quality Website Repository foundation using the finalized Website Engine SDK contracts.

The repository is local, deterministic, and contract-only. It stores reusable knowledge records and fixture contracts that future modules can query, validate, and trace. It does not generate websites, resolve plans, compile output, map components, render UI, or call AI.

## Scope

Implemented under `apps/web-app/modules/builder-v2/website-engine/repository/`:

- Typed `RepositoryRecord` contracts and query options.
- Repository version metadata.
- Local record registry and deterministic query helpers.
- Record validation and compile-safe repository verification.
- Starter records across real estate, healthcare, restaurant / food and beverage, automotive, and education.
- Contract-only fixture metadata across real estate, healthcare, restaurant, automotive, education, D2C, hospitality, and interior design.

## Repository Categories

The repository now has starter coverage for:

- `business-family`
- `industry`
- `subindustry`
- `archetype`
- `pattern`
- `component`
- `design-language`
- `tokens`
- `composition-rule`
- `constraint`
- `asset-rule`
- `qa-rule`
- `repair-rule`
- `fixture`
- `example`
- `anti-pattern`

## Starter Records

Starter records intentionally define reusable rules, patterns, constraints, and requirements only. They do not contain fake business facts, invented prices, fake credentials, fake awards, fabricated inventory, unsupported outcomes, or generated website content.

Examples:

- Real estate has property showcase, project showcase, locality, asset truth, and no fake price or availability constraints.
- Healthcare has appointment, trust, service matrix, outcome-proof, and no fake credential or outcome constraints.
- Restaurant has restaurant menu, booking path, menu preview, locality, and no invented menu price or hours constraints.
- Automotive has catalogue, booking path, service matrix, asset truth, and no false authorization or inventory constraints.
- Education has brochure, catalogue, outcome-proof, admissions-oriented patterns, and no fake accreditation or outcome constraints.

Real estate remains one validation fixture and starter industry. It is not the root of the repository and is not the foundation of the Website Engine.

## Fixture Contracts

Each vertical fixture folder contains a README and fixture metadata file describing shapes for:

- Prompt fixture.
- `BusinessContext` fixture.
- `WebsiteSpec` fixture.
- `DesignTokens` fixture.
- Component selection fixture.
- `CompiledWebsitePlan` fixture.
- Simulation expected result fixture.
- QA expected result fixture.

These fixtures are contracts only. They do not include generated websites or final page output.

## Public Repository API

Phase 14 introduces:

- `queryRepository()`
- `getRepositoryRecord()`
- `listRepositoryRecords()`
- `validateRepositoryRecord()`
- `validateRepositoryRecords()`
- `verifyRepositoryRegistry()`
- `runRepositoryVerification()`

All functions are local-only and deterministic. They do not access a database, network, Builder runtime, production route, Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, or AI module.

## Verification

Verification checks:

- Every record has an id.
- Every record has a version.
- Every record has a category and kind.
- Record ids are category-namespaced.
- Records do not contain fake-claim language.
- Real estate is not treated as root or foundation.
- Each starter industry has at least one compatible archetype, pattern, constraint, and fixture contract.

## Typecheck

Required command:

```bash
pnpm --dir apps/web-app typecheck:builder
```

Expected status: pass.

Additional compile-safe repository check:

```bash
pnpm --dir apps/web-app exec tsc --noEmit --skipLibCheck --moduleResolution node --module esnext --target es2017 --lib esnext,dom --strict false modules/builder-v2/website-engine/sdk/index.ts modules/builder-v2/website-engine/repository/index.ts modules/builder-v2/website-engine/repository/fixtures/index.ts --pretty false
```

Expected status: pass.

## Non-Goals

- No `ai-v9` changes.
- No Builder behavior changes.
- No production route changes.
- No feature flag enablement.
- No Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, Design Engine, AI generation, or Repository persistence logic.
- No generated websites.

## Acceptance Criteria

- Repository exports compile cleanly.
- Starter record categories are present.
- Starter industries have safe reusable coverage.
- Fixture contracts exist for all requested fixture folders.
- Repository verification is importable and compile-safe.
- `typecheck:builder` passes.

## Rollback Plan

Because Phase 14 is inert and not wired into production behavior, rollback is limited to removing the new repository contract files and reverting documentation updates. No database migration, production route, runtime rendering, or builder behavior rollback is required.

## Next Recommended Phase

Implement repository-backed Knowledge Graph contracts and local indexing as the next inert foundation phase. Keep feature flags false and do not wire the graph into Builder or production generation yet.
