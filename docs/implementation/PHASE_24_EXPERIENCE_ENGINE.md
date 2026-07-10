# Phase 24 Experience Engine

## Objective

Implement the deterministic local Experience Engine.

Experience Engine answers how the visitor journey should feel and unfold. It defines journey rhythm before Pattern Intelligence, Design Engine, Component Engine, and Composition Engine.

It does not generate websites, select final components, create layouts, create Builder nodes, or create `WebsiteSpec`.

## Scope

Created `apps/web-app/modules/builder-v2/website-engine/experience/` with:

- `ExperienceEngine.ts`
- `experienceStrategy.ts`
- `journeyStages.ts`
- `attentionCurve.ts`
- `trustCurve.ts`
- `ctaCadence.ts`
- `proofPlacement.ts`
- `contentDensity.ts`
- `mediaRhythm.ts`
- `interactionRhythm.ts`
- `scrollNarrative.ts`
- `mobileJourney.ts`
- `frictionPoints.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`

## Contracts Added

- `ExperienceInput`
- `JourneyStage`
- `AttentionCurve`
- `TrustCurve`
- `CTACadence`
- `ProofPlacement`
- `ContentDensityCurve`
- `MediaRhythm`
- `InteractionRhythm`
- `ScrollNarrative`
- `MobileJourney`
- `ConversionFrictionPoint`
- `ExperienceConfidence`
- `ExperienceMetrics`
- `ExperienceWarning`

`ExperienceStrategy` is reused from the SDK as the canonical output. Confidence, explanations, warnings, decisions, metrics, and trace metadata are carried through `EngineResult`.

## Helpers Added

- `runExperienceEngine()`
- `buildJourneyStages()`
- `inferAttentionCurve()`
- `inferTrustCurve()`
- `inferCTACadence()`
- `inferProofPlacement()`
- `inferContentDensityCurve()`
- `inferMediaRhythm()`
- `inferInteractionRhythm()`
- `inferScrollNarrative()`
- `inferMobileJourney()`
- `inferConversionFrictionPoints()`
- `scoreExperienceConfidence()`
- `validateExperienceStrategy()`
- `runExperienceVerification()`

## Multi-Industry Coverage

- Healthcare: build trust early, introduce credentials before appointment CTA, reduce anxiety, keep journey clear and low-friction.
- Restaurant / food and beverage: expose menu, ambience, and reservation/order path early; keep mobile booking short.
- Education: lead with program clarity and cautious proof; show admissions path and handle parent/student objections.
- Automotive: expose services/inventory early, prove reliability, clarify booking/test-drive path, avoid false authorization claims.
- Real estate: establish location/project promise early, build trust and lifestyle desire, repeat site-visit CTA, handle availability/compliance caution.
- D2C/ecommerce: show product value quickly, build proof before purchase CTA, clarify shipping/returns if known.
- Hospitality: sell experience, location, amenities, and booking path; avoid fake ratings and availability.
- Interior/architecture: show portfolio/process early, build expertise, support consultation CTA, avoid fake awards/testimonials.

## Ordering

The current intelligence sequence remains:

1. Business Intelligence.
2. Brand Intelligence.
3. Content Intelligence.
4. Experience Engine.
5. Pattern Intelligence.
6. Design Engine.

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
- No website generation.
- No component selection.
- No layout generation.
- No Planner, Pattern Intelligence, Design Engine, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, WebsiteSpec Builder, AI generation, or production wiring.

## Technical Debt

- Experience confidence scoring is deterministic and simple; fixture calibration should improve it later.
- `ExperienceStrategy` SDK output has no native confidence/explanations fields, so confidence and explanations live in `EngineResult` metadata.
- Government context is supported by keyword context, but not yet represented as an SDK `BusinessFamily`.

## Next Phase

Phase 25 — Pattern Intelligence Engine.
