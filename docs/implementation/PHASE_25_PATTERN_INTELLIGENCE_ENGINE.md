# Phase 25 Pattern Intelligence Engine

## Objective

Implement the deterministic local Pattern Intelligence Engine.

Pattern Intelligence answers which proven UX, content, conversion, trust, and journey patterns fit the business and website goal. It is semantic pattern reasoning only.

It does not select templates, final visual components, layouts, Builder nodes, or `WebsiteSpec`.

## Scope

Created `apps/web-app/modules/builder-v2/website-engine/pattern-intelligence/` with:

- `PatternIntelligenceEngine.ts`
- `patternIntelligence.ts`
- `patternSet.ts`
- `patternCatalog.ts`
- `patternScoring.ts`
- `patternRanking.ts`
- `patternCompatibility.ts`
- `patternConflicts.ts`
- `patternSequence.ts`
- `patternExplanations.ts`
- `patternFallbacks.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`

## Contracts Added

- `PatternIntelligenceInput`
- `PatternCandidate`
- `PatternSet`
- `PatternCategory`
- `PatternRole`
- `PatternSequence`
- `PatternCompatibility`
- `PatternConflict`
- `PatternScore`
- `PatternExplanation`
- `PatternFallback`
- `PatternConfidence`
- `PatternMetrics`
- `PatternWarning`

`PatternIntelligenceResult` is reused from the SDK as the canonical output. Richer candidate/set/sequence/compatibility/fallback details are carried through local contracts and `EngineResult` metadata.

## Helpers Added

- `runPatternIntelligence()`
- `buildPatternCatalog()`
- `buildPatternCandidates()`
- `scorePatternCandidates()`
- `rankPatternCandidates()`
- `buildRecommendedPatternSets()`
- `buildPatternSequence()`
- `detectPatternCompatibility()`
- `detectPatternConflicts()`
- `explainPatternCandidate()`
- `buildPatternFallbacks()`
- `scorePatternConfidence()`
- `validatePatternIntelligenceResult()`
- `runPatternIntelligenceVerification()`

## Starter Semantic Patterns

- Editorial Hero
- Product Value Hero
- Booking Hero
- Appointment Hero
- Trust Band
- Proof Stack
- Locality Map Narrative
- Lifestyle Gallery
- Service Matrix
- Menu Preview
- Course Catalogue Preview
- Vehicle Service Matrix
- Project Showcase
- Product Feature Stack
- FAQ Objection Handling
- Final Conversion Block
- Sticky Mobile CTA
- Founder Story
- Process Timeline
- Portfolio Showcase
- Comparison Section
- Review Proof Block
- Contact Lead Capture
- Footer Trust Closure

## Multi-Industry Coverage

- Real estate: Editorial Hero, Project Showcase, Locality Map Narrative, Lifestyle Gallery, site-visit CTA, FAQ objection handling.
- Healthcare: Appointment Hero, Trust Band, Proof Stack, Service Matrix, FAQ objection handling, appointment CTA.
- Restaurant / food and beverage: Booking Hero, Menu Preview, Lifestyle Gallery, Locality Map Narrative, review proof only if provided.
- Automotive: Vehicle Service Matrix, Trust Band, booking/test-drive CTA, Comparison Section, FAQ objection handling.
- Education: Course Catalogue Preview, Proof Stack with caution, Process Timeline, Trust Band, enquiry CTA.
- D2C/ecommerce: Product Value Hero, Product Feature Stack, Review Proof Block only if facts exist, Comparison Section, purchase CTA.
- Hospitality: Booking Hero, Lifestyle Gallery, Locality Map Narrative, Review Proof Block only if facts exist.
- Interior/architecture: Portfolio Showcase, Process Timeline, Founder Story, consultation CTA.

## Verification

Ran:

```sh
pnpm --dir apps/web-app typecheck:builder
```

Status: passed.

## Safety

- `ai-v9` untouched.
- Builder behavior untouched.
- Production routes untouched.
- Rendering untouched.
- Feature flags remain false.
- No DB calls.
- No network calls.
- No LLM calls.
- No template rendering.
- No component selection.
- No visual design.
- No layout generation.
- No Builder nodes.
- No Planner, Design Engine, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, WebsiteSpec Builder, AI generation, or production wiring.

## Technical Debt

- `docs/specifications/PatternDefinition.md` is referenced by the phase brief but is absent in the repository.
- `PatternIntelligenceResult` SDK output is compact, so richer candidate/set/sequence details live in local contracts and `EngineResult` metadata.
- Pattern scoring is deterministic and simple; future repository-backed calibration should improve weights.

## Next Phase

Phase 26 — Design Engine.
