# AI v10 Root Cause Fix RC-2B: Semantic Anatomy Diversity

## Outcome

Section-scoped selection now treats narrative role as a hard compatibility contract and records a semantic anatomy fingerprint for every section. The fixed Sanjeevini seed has ten distinct anatomy fingerprints for ten sections, with no unrelated-role collisions.

## Role corrections

| Section | Before | After |
| --- | --- | --- |
| Editorial hero | `HeroEditorialSplit01` + `editorialSplitHero` | unchanged, opening-hero compatible |
| Sticky mobile CTA | `HeroEditorialSplit01` + `editorialSplitHero` | `StickyMobileCTA01` + `framedCTA` |
| Footer trust closure | `FooterTrustClosure01` + `floatingProofSection` | `FooterTrustClosure01` + `framedCTA` |
| Trust band | `TrustBandInline01` + `floatingProofSection` | `TrustBandInline01` + `quoteInterlude` |

The section count and Pattern Intelligence output remain unchanged.

## Anatomy fingerprint

Selection diagnostics include:

- normalized semantic purpose;
- requested narrative role;
- conversion role;
- component category;
- selected archetype or explicit legacy fallback;
- media role;
- interaction role;
- opening/body/sticky/closure placement;
- component silhouette.

The resulting diagnostic contract records section ID, selected component and archetype, fingerprint, rejected duplicate candidates, final reason, and any compiler-coverage warning.

## Hard compatibility

- Sticky actions accept sticky components and reject hero anatomy.
- Footer closures accept footer/closure components and reject hero anatomy.
- Trust bands accept inline trust-band components and reject footer or hero substitutes.
- Opening heroes accept hero components but reject sticky anatomy.
- Lead capture and closing actions retain their own form/conversion roles.

Role-directed archetypes are carried into `SemanticBlueprintCompiler`; they are no longer discarded and recomputed from broad keywords.

## Duplicate prevention

Page-level selection tracks materially defective anatomy keys. A collision includes semantic purpose, requested role, placement, archetype, and silhouette. This permits intentional motif reuse—such as several framed actions—when interaction or placement is materially different.

When a later role-compatible candidate collides, it is rejected and the next compatible candidate is considered. If all premium candidates collide, the section is retained through an explicit `legacy-recipe-fallback` with `COMPILER_COVERAGE_ROLE_FALLBACK`; it is never replaced by an unrelated hero or grid.

## Files changed

- `website-engine/components/sectionScopedSelection.ts`
- `website-engine/components/componentVariant.ts`
- `website-engine/components/ComponentEngine.ts`
- `website-engine/builder-blueprint/recipes/types.ts`
- `website-engine/builder-blueprint/SemanticBlueprintCompiler.ts`
- `ai-v10/orchestrator/runV10WebsiteGeneration.ts`
- `scripts/analyze-ai-v10-rc2.ts`
- `__tests__/website-engine/component-page-selection.test.ts`
- this report

## Fixed-seed evidence

`09-component-selection.json` contains ten anatomy diagnostics and ten unique fingerprints. `section-provenance.json` contains zero duplicate fingerprints and zero stable-provenance mismatches.

Selection remains deterministic for seed `104729`. RC-2B changes only role compatibility, anatomy selection, and explicit diagnostics. It does not change prompts, Pattern Intelligence section count, content copy, Blueprint schema, Canvas/runtime rendering, repair, responsive resolution, or geometry inside any archetype compiler.
