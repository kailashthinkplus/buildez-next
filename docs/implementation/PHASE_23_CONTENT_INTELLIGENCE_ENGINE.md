# Phase 23 Content Intelligence Engine

## Objective

Implement the deterministic local Content Intelligence Engine.

Content Intelligence is strategy before copywriting. It answers what the website should say, in what order, for which audience and conversion goal. It does not write final page copy, create websites, create Builder nodes, or create `WebsiteSpec`.

## Scope

Created `apps/web-app/modules/builder-v2/website-engine/content-intelligence/` with:

- `ContentIntelligenceEngine.ts`
- `contentStrategy.ts`
- `messageHierarchy.ts`
- `headlineStrategy.ts`
- `sectionMessaging.ts`
- `ctaStrategy.ts`
- `proofStrategy.ts`
- `faqStrategy.ts`
- `seoContent.ts`
- `trustCopy.ts`
- `objectionHandling.ts`
- `localityContent.ts`
- `truthPolicy.ts`
- `missingContentFacts.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`

## Contracts Added

- `ContentIntelligenceInput`
- `MessageHierarchy`
- `HeadlineStrategy`
- `SectionMessagingRole`
- `CTAStrategy`
- `ProofStrategy`
- `FAQStrategy`
- `SEOContentStrategy`
- `TrustCopyStrategy`
- `ObjectionHandlingStrategy`
- `LocalityContentStrategy`
- `ContentTruthPolicy`
- `MissingContentFact`
- `ContentConfidence`
- `ContentMetrics`
- `ContentWarning`

`ContentStrategy` is reused from the SDK as the canonical output. Confidence, explanations, warnings, decisions, metrics, and trace metadata are carried through `EngineResult`.

## Helpers Added

- `runContentIntelligence()`
- `buildMessageHierarchy()`
- `inferHeadlineStrategy()`
- `inferSectionMessagingRoles()`
- `inferCTAStrategy()`
- `inferProofStrategy()`
- `inferFAQStrategy()`
- `inferSEOContentStrategy()`
- `inferTrustCopyStrategy()`
- `inferObjectionHandlingStrategy()`
- `inferLocalityContentStrategy()`
- `buildContentTruthPolicy()`
- `collectMissingContentFacts()`
- `scoreContentConfidence()`
- `validateContentStrategy()`
- `runContentIntelligenceVerification()`

## Multi-Industry Coverage

- Healthcare: trust and credentials before appointment CTA; no cure guarantees, fake doctors, or fake certifications.
- Restaurant / food and beverage: menu, ambience, locality, reservation/order path early; no fake hours, prices, or availability.
- Education: programs, admissions path, outcomes proof with caution; no fake placements, exam results, or accreditation.
- Automotive: services/inventory, proof, booking/test-drive CTA; no false authorization, warranty, financing, inventory, or discounts.
- Real estate: location, project promise, configurations, amenities, site visit CTA; no fake availability, registration numbers, prices, or awards.
- D2C/ecommerce: product value proposition, proof/reviews only if provided, purchase CTA, shipping/returns facts if known.
- Hospitality: stay experience, amenities, location, booking CTA; no fake ratings, awards, or availability.
- Interior/architecture: portfolio narrative, design process, consultation CTA, proof only if provided.

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
- No final copy generation.
- No Planner, Experience Engine, Pattern Intelligence, Design Engine, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, WebsiteSpec Builder, AI generation, or production wiring.

## Technical Debt

- Content confidence scoring is deterministic and simple; fixture calibration should improve it later.
- `ContentStrategy` SDK output has no native confidence field, so confidence and explanations live in `EngineResult` metadata.
- Government content context is supported by keyword context but not yet represented as an SDK `BusinessFamily`.

## Next Phase

Phase 24 — Experience Engine.
