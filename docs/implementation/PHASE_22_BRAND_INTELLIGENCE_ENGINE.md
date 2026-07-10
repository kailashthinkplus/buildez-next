# Phase 22 Brand Intelligence Engine

## Objective

Implement the deterministic local Brand Intelligence Engine.

Business Intelligence answers what the business is. Brand Intelligence answers how the business should be perceived before Content, Experience, Pattern, Design, Component, Composition, WebsiteSpec, Decision, Compiler, and Mapper work.

## Scope

Created `apps/web-app/modules/builder-v2/website-engine/brand-intelligence/` with:

- `BrandIntelligenceEngine.ts`
- `brandProfile.ts`
- `personality.ts`
- `voice.ts`
- `tone.ts`
- `emotion.ts`
- `positioning.ts`
- `identity.ts`
- `visualDirection.ts`
- `trust.ts`
- `differentiation.ts`
- `brandRisk.ts`
- `brandAssets.ts`
- `missingBrandFacts.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`

Additional internal helper:

- `familyContext.ts`

## Contracts Added

- `BrandIntelligenceInput`
- `BrandIdentity`
- `BrandPersonality`
- `BrandVoice`
- `BrandTone`
- `BrandEmotion`
- `BrandPositioning`
- `BrandVisualDirection`
- `BrandTrustModel`
- `BrandDifferentiation`
- `BrandRiskProfile`
- `BrandAssetProfile`
- `BrandConfidence`
- `BrandMetrics`
- `BrandWarnings`

`BrandIntelligenceProfile` is reused from the SDK as the canonical output. Confidence, modern/classic spectrum, formal/casual spectrum, visual-direction intent, warnings, explanations, decisions, metrics, and trace metadata are carried through `EngineResult`.

## Helpers Added

- `runBrandIntelligence()`
- `buildBrandIdentity()`
- `inferPersonality()`
- `inferVoice()`
- `inferTone()`
- `inferEmotion()`
- `inferBrandPositioning()`
- `inferVisualDirection()`
- `inferTrustModel()`
- `inferDifferentiation()`
- `inferBrandRisk()`
- `inferExistingAssets()`
- `collectMissingBrandFacts()`
- `scoreBrandConfidence()`
- `validateBrandIntelligenceProfile()`
- `runBrandIntelligenceVerification()`

## Multi-Industry Coverage

- Real estate: calm, premium, editorial, trust-first, location-first.
- Healthcare: clinical, reassuring, credible, clear, low risk.
- Restaurant / food and beverage: sensory, warm, inviting, lifestyle, menu-forward.
- Automotive: precision, engineering, performance, reliability, authorization-safe.
- Education: aspirational, trustworthy, future-focused, without fabricated outcomes.
- Hospitality: welcoming, destination-led, booking-safe.
- Interior design: refined, portfolio-led, consultative.
- D2C/ecommerce: product-led, purchase-confidence, fulfillment-aware.
- Professional services: credible, measured, expertise-led.
- Manufacturing: technical, capable, specification-led.
- Technology: modern, clear, product-led, security-claim-safe.
- NGO/community: human, transparent, cause-led.
- Government: accessible, official, public-service oriented.

## Roadmap Correction

The next phase is Content Intelligence, not Experience.

Recommended order:

1. Business Intelligence.
2. Brand Intelligence.
3. Content Intelligence.
4. Experience Engine.
5. Pattern Intelligence.
6. Design Engine.

This mirrors experienced agency sequencing: understand the business, define the brand, decide messaging, design the customer journey, choose reusable interaction patterns, then design the visual system.

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
- No Planner, Content Intelligence, Experience Engine, Pattern Intelligence, Design Engine, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, or production wiring.

## Technical Debt

- Brand posture defaults are deterministic and intentionally conservative.
- Government is supported as a brand context, but the SDK `BusinessFamily` taxonomy does not yet include a dedicated government value.
- Visual direction is intent-only; Design Engine must later translate it into tokens and systems.
- Confidence scoring should be calibrated as fixture coverage grows.

## Next Phase

Phase 23 — Content Intelligence Engine.
