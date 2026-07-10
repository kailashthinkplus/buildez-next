# Phase 21 Business Intelligence Engine

## Objective

Implement the first deterministic Website Intelligence module: the local-only Business Intelligence Engine.

The engine answers what the business is, how it earns, who it serves, what proof it needs, what objections and compliance risks matter, and which conversion goals should shape later strategy. It does not generate websites.

## Scope

Created `apps/web-app/modules/builder-v2/website-engine/business-intelligence/` with:

- `BusinessIntelligenceEngine.ts`
- `businessProfile.ts`
- `classification.ts`
- `goals.ts`
- `audience.ts`
- `journey.ts`
- `trust.ts`
- `proof.ts`
- `objections.ts`
- `positioning.ts`
- `locality.ts`
- `compliance.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`

Additional internal helper files:

- `businessModels.ts`
- `missingFacts.ts`

## Contracts Added

- `BusinessIntelligenceInput`
- `BusinessIdentity`
- `BusinessModelProfile`
- `RevenueModelProfile`
- `OfferModelProfile`
- `CustomerProfile`
- `BuyerJourneyProfile`
- `TrustProfile`
- `ProofProfile`
- `ObjectionProfile`
- `PositioningProfile`
- `LocalityProfile`
- `ComplianceProfile`
- `BusinessConfidence`
- `BusinessIntelligenceWarning`
- `BusinessIntelligenceMetrics`

`BusinessIntelligenceProfile` is reused from the SDK as the canonical output. Explanations, warnings, decisions, metrics, and trace data are carried through `EngineResult`.

## Helpers Added

- `runBusinessIntelligence()`
- `buildBusinessIdentity()`
- `inferBusinessModel()`
- `inferRevenueModel()`
- `inferOfferModel()`
- `inferCustomerProfiles()`
- `inferBuyerJourney()`
- `inferTrustProfile()`
- `inferProofNeeds()`
- `inferObjections()`
- `inferPositioning()`
- `inferLocalityNeeds()`
- `inferComplianceNeeds()`
- `inferConversionGoals()`
- `collectBusinessMissingFacts()`
- `scoreBusinessConfidence()`
- `validateBusinessIntelligenceProfile()`
- `runBusinessIntelligenceVerification()`

## Multi-Industry Coverage

- Real estate: preserves approval, registration, pricing, availability, project, location, and site-visit facts as explicit requirements.
- Healthcare: preserves provider credentials, appointment availability, privacy, care scope, and cure-claim caution.
- Restaurant / food and beverage: preserves menu, hours, reservation, delivery, price, and locality requirements.
- Automotive: preserves inventory, service scope, authorization, warranty, financing, discount, quote, and test-drive caution.
- Education: preserves program, admissions, faculty, accreditation, outcomes, placement, and guarantee caution.
- D2C/ecommerce, hospitality, and interior/architecture are included in verification fixtures for breadth.

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
- No generation.
- No planner, mapper, compiler, resolver, renderer, critic, repair, or production wiring.

## Technical Debt

- Business Intelligence uses deterministic family defaults; future repository-backed intelligence can increase precision without changing the SDK profile.
- Industry/subindustry mapping remains heuristic until Planner and Repository provide stronger typed inputs.
- Confidence scoring is intentionally simple and should be calibrated after fixture suites grow.

## Next Phase

Phase 22 — Brand Intelligence Engine.
