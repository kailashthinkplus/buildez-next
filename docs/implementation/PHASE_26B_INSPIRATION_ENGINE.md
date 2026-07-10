# Phase 26B Inspiration Engine

## Objective

Implement the deterministic local Inspiration Engine.

The Inspiration Engine converts business, brand, pattern, and design context into reusable inspiration metadata. It does not copy websites, fetch websites, scrape websites, call providers, generate UI, create Builder nodes, select final components, or decide final structure.

## Scope

Created `apps/web-app/modules/builder-v2/website-engine/inspiration/` with:

- `InspirationEngine.ts`
- `inspirationProfile.ts`
- `inspirationSources.ts`
- `inspirationTraits.ts`
- `inspirationMatching.ts`
- `inspirationScoring.ts`
- `inspirationRisks.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`

Updated the Website Engine barrel export to expose the inert Inspiration Engine module.

## Contracts Added

- `InspirationInput`
- `InspirationProfile`
- `InspirationSource`
- `InspirationTrait`
- `InspirationMatch`
- `InspirationScore`
- `InspirationRisk`
- `InspirationConfidence`
- `InspirationMetrics`
- `InspirationWarning`

Inputs may include Business Intelligence, Brand Intelligence, Content Strategy, Experience Strategy, Pattern Intelligence, Design Result, repository records, graph context, known brand assets, and missing facts/assets.

## Starter Categories Added

- Apple-like minimal product storytelling
- Stripe-like technical clarity
- Linear-like SaaS precision
- Airbnb-like trust and warmth
- Awwwards-style cinematic editorial
- Luxury hospitality editorial
- Automotive performance storytelling
- Healthcare clarity and reassurance
- Restaurant sensory storytelling
- Architecture studio portfolio
- Premium D2C product storytelling
- Education trust and aspiration

These categories are reusable metadata references. They are not websites to copy, scrape, clone, fetch, or imitate exactly.

## Helpers Added

- `runInspirationEngine()`
- `buildInspirationSources()`
- `extractInspirationTraits()`
- `matchInspirationProfiles()`
- `scoreInspirationMatches()`
- `detectInspirationRisks()`
- `buildInspirationProfile()`
- `validateInspirationProfile()`
- `runInspirationVerification()`

## Output

`runInspirationEngine()` returns `EngineResult<InspirationProfile>` with:

- selected inspiration categories
- inspiration traits
- spacing traits
- typography traits
- composition traits
- motion philosophy
- imagery style
- navigation style
- CTA style
- card style
- background style
- interaction style
- suitable industries
- unsuitable industries
- risks
- confidence
- explanations
- warnings
- trace metadata

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
- No external provider calls.
- No Higgsfield MCP implementation.
- No LLM calls.
- No website fetching, scraping, copying, or cloning.
- No UI generation.
- No Builder nodes.
- No final component selection.
- No Planner, Mapper, Renderer, Critic, Repair, AI generation, or production wiring.

## Technical Debt

- Matching is deterministic and deliberately simple.
- Inspiration sources are starter metadata and should expand through repository-backed creative knowledge later.
- Verification is compile-safe and local-only; it is not a rendered visual QA system.
- Inspiration feeds future Visual Mood, Media, Motion, Component, Composition, Decision, and Compiler layers but does not yet integrate with them.

## Next Phase

Phase 26C — Visual Mood Engine.
