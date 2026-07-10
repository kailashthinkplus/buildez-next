# Experience Engine

Phase 24 adds an inert, local-only Experience Engine.

## Scope

Experience Engine answers: how should the visitor journey feel and unfold?

It defines journey rhythm before Pattern Intelligence, Design Engine, Component Engine, and Composition Engine. It does not generate websites, select final components, create layouts, create Builder nodes, create `WebsiteSpec`, call LLMs, call a database, call the network, or wire into production.

## Inputs

- `BusinessIntelligenceProfile`.
- `BrandIntelligenceProfile`.
- `ContentStrategy`.
- `BusinessContext`.
- `WebsiteIntentClassification`.
- Local repository and graph references.
- Constraint result context.
- Known facts.
- Explicit missing facts.

## Output

`runExperienceEngine()` returns `EngineResult<ExperienceStrategy>` with:

- Journey stages.
- Attention curve.
- Trust curve.
- CTA cadence.
- Proof placement.
- Content density curve.
- Media rhythm.
- Interaction rhythm.
- Scroll narrative.
- Mobile journey.
- Conversion friction points.
- Confidence, explanations, warnings, decisions, metrics, and trace metadata.

## Industry Coverage

- Healthcare: build trust early, introduce credentials before appointment CTA, reduce anxiety, keep journey clear and low-friction.
- Restaurant / food and beverage: expose menu, ambience, and reservation/order path early; keep mobile booking short.
- Education: lead with program clarity, cautious proof, admissions path, and parent/student objections.
- Automotive: expose services/inventory early, prove reliability, clarify booking/test-drive path, avoid false authorization states.
- Real estate: establish location/project promise early, build trust and lifestyle desire, repeat site-visit CTA, handle availability/compliance caution.
- D2C/ecommerce: show product value quickly, build proof before purchase CTA, clarify shipping/returns if known.
- Hospitality: sell experience, location, amenities, and booking path while avoiding fake ratings/availability.
- Interior/architecture: show portfolio/process early, build expertise, support consultation CTA, avoid fake awards/testimonials.

## Ordering

Experience follows Business, Brand, and Content Intelligence, then feeds Pattern Intelligence:

1. Business Intelligence.
2. Brand Intelligence.
3. Content Intelligence.
4. Experience Engine.
5. Pattern Intelligence.
6. Design Engine.

## Verification

Use `runExperienceVerification()` for compile-safe local verification.

```ts
import { runExperienceVerification } from "./experience";

const result = runExperienceVerification();
```

The required builder typecheck remains:

```sh
pnpm --dir apps/web-app typecheck:builder
```
