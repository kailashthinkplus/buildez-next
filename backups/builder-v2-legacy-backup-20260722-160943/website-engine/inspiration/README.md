# Inspiration Engine

Phase 26B adds an inert, deterministic, local-only Inspiration Engine.

## Scope

The Inspiration Engine converts business, brand, pattern, and design context into reusable inspiration metadata. It does not copy websites, fetch websites, call providers, generate UI, create Builder nodes, select final components, call LLMs, call a database, call the network, or wire into production.

## Output

`runInspirationEngine()` returns `EngineResult<InspirationProfile>` with selected inspiration categories, traits, spacing, typography, composition, motion philosophy, imagery, navigation, CTA, card, background, interaction style, suitable/unsuitable industries, risks, confidence, explanations, warnings, and trace metadata.

## Starter Categories

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

These are metadata categories, not websites to copy.

## Verification

```ts
import { runInspirationVerification } from "./inspiration";

const result = runInspirationVerification();
```
