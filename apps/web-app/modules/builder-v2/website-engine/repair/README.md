# Repair Engine

Phase 36 implements deterministic, metadata-only repair planning.

Repair answers: what should change to fix quality, safety, editability, responsiveness, truth, and uniqueness issues?

It does not apply repairs, create Builder nodes, execute Mapper, mutate Builder store, render, capture screenshots, generate code, call providers, call LLMs, use DB, use MCP, or use network.

## Entry Points

- `runRepairEngine(input)`
- `buildRepairPlan(input)`
- `runRepair(input)` compatibility wrapper
- `createRepairPlan(input)` compatibility wrapper
- `runRepairVerification()`

## Categories

- Structural
- Content truth
- Design
- Composition
- Component replacement
- Creative diversity
- Similarity reduction
- Accessibility
- SEO
- Performance
- Mobile
- Editability
- Motion safety
- Asset readiness
- Renderer parity

## Action Types

- `replace-recipe`
- `replace-fragment`
- `retune-design-dna`
- `adjust-composition-order`
- `adjust-cta-cadence`
- `replace-component-variant`
- `add-missing-trust-section`
- `remove-placeholder-copy`
- `mark-missing-fact`
- `reduce-motion`
- `add-mobile-cta`
- `add-accessibility-fallback`
- `declare-asset-required`
- `use-safe-asset-substitution`
- `add-seo-requirement`
- `add-editability-binding`
- `add-renderer-parity-warning`
