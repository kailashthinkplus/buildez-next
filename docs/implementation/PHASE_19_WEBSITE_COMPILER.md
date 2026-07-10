# Phase 19 Website Compiler

## Objective

Create an inert deterministic Website Compiler that converts a `DecisionPlan` into a mapper-ready `CompiledWebsitePlan`.

The compiler does not generate websites, create Builder nodes, render HTML, emit React components, generate CSS, call LLMs, access databases, call external services, or wire into production. It only creates a structured plan that a later Mapper can convert to native editable nodes.

## Scope

Implemented under `apps/web-app/modules/builder-v2/website-engine/compiler/`:

- `compiler.ts`
- `compilePlan.ts`
- `compiledPlan.ts`
- `sectionCompiler.ts`
- `componentCompiler.ts`
- `responsiveCompiler.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `compileWebsitePlan.ts`
- `index.ts`
- `README.md`

## Contracts Added

- `CompilerInput`
- `CompilerResult`
- `CompiledWebsitePlan`
- `CompiledSection`
- `CompiledComponent`
- `CompiledAssetRequirement`
- `CompiledResponsiveRule`
- `CompiledQualityGate`
- `CompilerExplanation`
- `CompilerMetrics`
- `CompilerWarning`

## Deterministic Helpers

- `runWebsiteCompiler()`
- `compileWebsitePlan()`
- `compileSections()`
- `compileComponents()`
- `compileAssets()`
- `compileResponsiveRules()`
- `compileQualityGates()`
- `validateCompiledWebsitePlan()`
- `collectCompilerMetrics()`
- `runCompilerVerification()`

## Compiler Output

The compiled plan includes selected archetype, selected design language, selected composition strategy, section plan, component plan, asset requirements, CTA plan, SEO plan, accessibility plan, responsive plan, quality gates, explanations, warnings, engine/version metadata, and trace metadata.

## Validation

Validation checks:

- Compiled plan has id and version.
- Selected archetype exists.
- Selected design language exists.
- At least one section exists.
- Every section has purpose and editable mapper intent.
- Every component has category and editable mapping intent.
- Required assets are declared with reasons.
- Quality gates exist.
- Missing facts and constraint violations are carried forward.
- No fake business facts are introduced.
- No Builder nodes, HTML, React components, or CSS output appear in the plan.

## Typecheck

Required command:

```bash
pnpm --dir apps/web-app typecheck:builder
```

Expected status: pass.

Additional compile-safe compiler check:

```bash
pnpm --dir apps/web-app exec tsc --noEmit --skipLibCheck --moduleResolution node --module esnext --target es2017 --lib esnext,dom --strict false modules/builder-v2/website-engine/sdk/index.ts modules/builder-v2/website-engine/decision/index.ts modules/builder-v2/website-engine/compiler/index.ts --pretty false
```

Expected status: pass.

## Non-Goals

- No `ai-v9` changes.
- No Builder behavior changes.
- No production route changes.
- No feature flag enablement.
- No database, network, external service, or LLM calls.
- No Planner, Mapper, Renderer, Critic, Repair, AI generation, or Website Engine production wiring.
- No Builder nodes.
- No generated websites.

## Next Recommended Phase

Implement Mapper contracts over `CompiledWebsitePlan`, still local-only and not wired into Builder or production generation.
