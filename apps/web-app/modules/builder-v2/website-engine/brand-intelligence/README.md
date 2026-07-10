# Brand Intelligence Engine

Phase 22 adds an inert, local-only Brand Intelligence Engine.

## Scope

Brand Intelligence answers: how should this business be perceived?

It does not design websites, select layouts, emit CSS, create components, create `WebsiteSpec`, call LLMs, call a database, call the network, or wire into production.

## Inputs

- `BusinessIntelligenceProfile`.
- `BusinessContext`.
- Local repository and graph references.
- Constraint result context.
- Tenant-safe brand hints.
- Existing colors, logo, and fonts.
- Explicit missing facts.

## Output

`runBrandIntelligence()` returns `EngineResult<BrandIntelligenceProfile>` with:

- Brand identity, personality, voice, tone, emotional positioning, audience perception, and story angle.
- Premium level, energy level, locality positioning, modern/classic spectrum, and formal/casual spectrum.
- Trust posture, visual direction intent, differentiation, brand risks, constraints, existing brand assets, missing brand facts, confidence, warnings, explanations, and trace metadata.

## Ordering

The strongest downstream sequence is:

1. Business Intelligence.
2. Brand Intelligence.
3. Content Intelligence.
4. Experience Engine.
5. Pattern Intelligence.
6. Design Engine.

Content follows Brand because messaging should be decided before customer-journey rhythm and interaction patterns.

## Multi-Industry Coverage

- Real estate: calm, premium, editorial, trust-first, location-first.
- Healthcare: clinical, reassuring, credible, clear, low risk.
- Restaurant / food and beverage: sensory, warm, inviting, lifestyle, menu-forward.
- Automotive: precision, engineering, performance, reliability, authorization-safe.
- Education: aspirational, trustworthy, future-focused, without fabricated outcomes.
- Hospitality, interior design, D2C, professional services, manufacturing, technology, NGO, and government contexts are included in verification coverage.

## Verification

Use `runBrandIntelligenceVerification()` for compile-safe local verification.

```ts
import { runBrandIntelligenceVerification } from "./brand-intelligence";

const result = runBrandIntelligenceVerification();
```

The required builder typecheck remains:

```sh
pnpm --dir apps/web-app typecheck:builder
```
