# Content Intelligence Engine

Phase 23 adds an inert, local-only Content Intelligence Engine.

## Scope

Content Intelligence answers: what should this website say, in what order, for what audience and conversion goal?

It defines strategy before copywriting. It does not write final copy, generate websites, create Builder nodes, create `WebsiteSpec`, call LLMs, call a database, call the network, or wire into production.

## Inputs

- `BusinessIntelligenceProfile`.
- `BrandIntelligenceProfile`.
- `BusinessContext`.
- `WebsiteIntentClassification`.
- Local repository and graph references.
- Constraint result context.
- Known facts.
- Explicit missing facts.

## Output

`runContentIntelligence()` returns `EngineResult<ContentStrategy>` with:

- Message hierarchy.
- Headline strategy.
- Section messaging roles.
- CTA strategy.
- Proof strategy.
- FAQ strategy.
- SEO content strategy.
- Trust copy rules.
- Objection handling.
- Locality content requirements.
- Truth policy.
- Missing content facts.
- Confidence, explanations, warnings, decisions, metrics, and trace metadata.

## Industry Coverage

- Healthcare: trust and credentials before appointment CTA; avoid cure guarantees, fake doctors, and fake certifications.
- Restaurant / food and beverage: menu, ambience, locality, reservation/order path early; avoid fake hours, prices, and availability.
- Education: programs, admissions path, outcomes proof with caution; avoid fake placement numbers, exam results, and accreditation.
- Automotive: services/inventory, proof, booking/test-drive CTA; avoid false authorization, warranty, financing, inventory, and discounts.
- Real estate: location, project promise, configurations, amenities, site visit CTA; avoid fake availability, registration numbers, prices, and awards.
- D2C/ecommerce: product value proposition, proof only if provided, purchase CTA, shipping/returns facts if known.
- Hospitality: stay experience, amenities, location, booking CTA; avoid fake ratings, awards, and availability.
- Interior/architecture: portfolio narrative, design process, consultation CTA, proof only if provided.

## Ordering

Content Intelligence follows Business and Brand Intelligence, and precedes Experience:

1. Business Intelligence.
2. Brand Intelligence.
3. Content Intelligence.
4. Experience Engine.
5. Pattern Intelligence.
6. Design Engine.

## Verification

Use `runContentIntelligenceVerification()` for compile-safe local verification.

```ts
import { runContentIntelligenceVerification } from "./content-intelligence";

const result = runContentIntelligenceVerification();
```

The required builder typecheck remains:

```sh
pnpm --dir apps/web-app typecheck:builder
```
