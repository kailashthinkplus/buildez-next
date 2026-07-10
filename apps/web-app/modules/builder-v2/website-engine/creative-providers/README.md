# Creative Provider Abstraction

Phase 26F adds provider-agnostic creative provider contracts and metadata only.

## Scope

Creative providers are future execution adapters, not strategy engines. BuildEZ owns business strategy, brand strategy, content truth, experience strategy, pattern strategy, inspiration, visual mood, media strategy, motion strategy, design decisions, component decisions, mapper output, renderer parity, and critique.

This module does not connect Higgsfield MCP, call providers, call MCP tools, use the network, use a database, call LLMs, generate images, generate videos, generate motion code, generate CSS/HTML/JS, create Builder nodes, or wire into production.

## Metadata Providers

- `higgsfield-mcp`
- `gsap`
- `framer-motion`
- `three-js`
- `spline`
- `rive`
- `lottie`
- `native-motion`
- `future-provider`

Every provider is inert and has `executionEnabled: false`.

## Higgsfield Strategy

Higgsfield MCP is represented as an optional future provider for cinematic image concepts, parallax concept references, hero/gallery scene concepts, motion inspiration previews, and visual direction previews. It must not own final website generation, produce non-editable final sites, replace Website Engine decisions, bypass constraints, bypass media truth policy, or bypass motion accessibility policy.

## Verification

```ts
import { runCreativeProviderVerification } from "./creative-providers";

const result = runCreativeProviderVerification();
```
