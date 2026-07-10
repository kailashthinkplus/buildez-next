# Phase 28 Composition Engine

## Objective

Implement deterministic local Composition Engine.

Composition Engine answers how selected patterns and components should be arranged into a coherent page journey. It decides rhythm, order, density, CTA cadence, media/content alternation, trust placement, conversion journey, scroll narrative, mobile stacking, and density transitions. It produces composition metadata only.

## Scope

Created or updated `apps/web-app/modules/builder-v2/website-engine/composition/` with:

- `CompositionEngine.ts`
- `compositionPlan.ts`
- `sectionOrdering.ts`
- `pageRhythm.ts`
- `visualBreathing.ts`
- `sectionWeight.ts`
- `ctaCadence.ts`
- `mediaContentAlternation.ts`
- `trustPlacement.ts`
- `conversionJourney.ts`
- `scrollNarrative.ts`
- `mobileStacking.ts`
- `densityTransitions.ts`
- `compositionRules.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`
- `runComposition.ts`

Updated the legacy `runComposition()` wrapper to delegate to the new Composition Engine while remaining metadata-only.

## Contracts Added

- `CompositionInput`
- `CompositionResult`
- `CompositionPlan`
- `CompositionSection`
- `CompositionRule`
- `SectionOrdering`
- `PageRhythm`
- `VisualBreathing`
- `SectionWeight`
- `CTACadence`
- `MediaContentAlternation`
- `TrustPlacement`
- `ConversionJourney`
- `ScrollNarrativePlan`
- `MobileStackingPlan`
- `DensityTransition`
- `CompositionConflict`
- `CompositionQualityCheck`
- `CompositionFallback`
- `CompositionConfidence`
- `CompositionMetrics`
- `CompositionWarning`

## Rules Added

- Avoid three consecutive card-grid-like sections.
- Conversion-focused pages need early and final CTA opportunities.
- Healthcare must introduce trust before appointment CTA.
- Restaurant pages must surface menu/reservation/order path early.
- Real estate must introduce project/location promise early and repeat site-visit action.
- Automotive must clarify service/catalogue/test-drive path early.
- Education must clarify program/admissions path early.

## Helpers Added

- `runCompositionEngine()`
- `buildCompositionPlan()`
- `orderSections()`
- `inferPageRhythm()`
- `inferVisualBreathing()`
- `assignSectionWeights()`
- `inferCTACadence()`
- `inferMediaContentAlternation()`
- `inferTrustPlacement()`
- `buildConversionJourney()`
- `buildScrollNarrativePlan()`
- `buildMobileStackingPlan()`
- `buildDensityTransitions()`
- `detectCompositionConflicts()`
- `buildCompositionQualityChecks()`
- `buildCompositionFallbacks()`
- `scoreCompositionConfidence()`
- `validateCompositionResult()`
- `runCompositionVerification()`

## Verification

Ran:

```sh
pnpm --dir apps/web-app typecheck:builder
```

Status: passed.

## Safety

- `ai-v9` untouched by this phase.
- Builder behavior untouched by this phase.
- Production routes untouched by this phase.
- Rendering untouched by this phase.
- Feature flags remain false.
- No DB calls.
- No network calls.
- No LLM calls.
- No MCP calls.
- No provider execution.
- No website generation.
- No Builder nodes.
- No React components.
- No CSS generation.
- No HTML generation.
- No JS generation.
- No Mapper, Renderer, Critic, Repair, Planner, AI generation, or production wiring.

## Documentation Gaps

The phase brief referenced `docs/specifications/CompositionRule.md`, but that file is not present in the repository. Implementation proceeded from architecture docs, existing module patterns, and the Phase 28 brief.

## Technical Debt

- Composition rules are deterministic starter logic and should eventually be repository-backed.
- Verification is compile-safe and local-only; it is not rendered visual QA.
- Composition produces page-journey metadata only. Mapper still owns Builder-native conversion later.

## Next Phase

Phase 29 — Compiler Revisit / Enrichment.
