# Phase 26F Creative Provider Abstraction & Higgsfield MCP Strategy

## Objective

Create provider-agnostic Creative Provider contracts and metadata.

Providers are future execution adapters, not strategy engines. BuildEZ owns business strategy, brand strategy, content strategy, experience strategy, pattern strategy, inspiration, visual mood, media strategy, motion strategy, design decisions, component decisions, mapper output, renderer parity, and critique.

This phase is architecture plus inert contracts only. It does not connect providers, call MCP tools, generate assets, or wire into production.

## Scope

Created `apps/web-app/modules/builder-v2/website-engine/creative-providers/` with:

- `CreativeProviderRegistry.ts`
- `CreativeProviderEngine.ts`
- `creativeProvider.ts`
- `providerRequest.ts`
- `providerResult.ts`
- `providerCapabilities.ts`
- `providerSafety.ts`
- `providerFallback.ts`
- `providerAdapters.ts`
- `higgsfieldStrategy.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`

Updated the Website Engine barrel export to expose the inert Creative Provider module.

## Contracts Added

- `CreativeProviderId`
- `CreativeProviderType`
- `CreativeProviderCapability`
- `CreativeProviderRequest`
- `CreativeProviderResult`
- `CreativeProviderSafetyPolicy`
- `CreativeProviderFallbackPolicy`
- `CreativeProviderAdapter`
- `CreativeProviderRegistry`
- `CreativeProviderWarning`
- `CreativeProviderMetrics`
- `HiggsfieldMcpStrategy`

Requests may include Inspiration Profile, Visual Mood Profile, Media Strategy, Motion Strategy, Design Result, task type, required output type, constraints, known assets, missing assets, safety policy, editability requirements, and fallback policy.

## Provider Metadata Added

- `higgsfield-mcp`
- `gsap`
- `framer-motion`
- `three-js`
- `spline`
- `rive`
- `lottie`
- `native-motion`
- `future-provider`

Every provider is metadata-only with `executionEnabled: false`.

## Helpers Added

- `runCreativeProviderRequest()`
- `validateCreativeProviderRequest()`
- `validateCreativeProviderResult()`
- `validateCreativeProviderRecord()`
- `listCreativeProviders()`
- `getCreativeProvider()`
- `getCreativeProviderCapabilities()`
- `selectProviderCandidates()`
- `buildProviderFallbackPolicy()`
- `buildProviderSafetyPolicy()`
- `buildHiggsfieldMcpStrategy()`
- `buildInertProviderResult()`
- `listCreativeProviderAdapters()`
- `runCreativeProviderVerification()`

## Higgsfield Strategy

Higgsfield MCP is represented only as an optional future provider for:

- cinematic image concepts
- parallax concept references
- hero scene concepts
- gallery scene concepts
- motion inspiration previews
- visual direction previews

Higgsfield must not own final website generation, produce non-editable final sites, replace Website Engine decisions, bypass constraints, bypass truth policy, bypass media truth policy, bypass motion accessibility policy, or create Builder node output.

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
- No LLM calls.
- No MCP calls.
- No provider execution.
- No Higgsfield MCP connection.
- No image generation.
- No video generation.
- No motion code generation.
- No CSS generation.
- No HTML generation.
- No JS generation.
- No Builder nodes.
- No production wiring.

## Technical Debt

- Provider ranking is metadata-only and simple.
- Provider adapters are deliberately non-executable.
- Future provider execution must add explicit review gates for truth, rights/provenance, editability, mapper compatibility, renderer parity, and critique.
- Higgsfield remains optional strategy metadata until a later explicit integration phase.

## Next Phase

Phase 27 — Component Engine.
