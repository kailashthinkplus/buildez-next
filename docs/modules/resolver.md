# Resolver Module

## Purpose

Deprecated compatibility module. Future phases should use the Decision Engine, which commits ranked reasoning candidates into one coherent Website Strategy.

## Responsibilities

- Select archetypes, section patterns, component variants, design language, design tokens, composition rules, asset strategy, CTA strategy, SEO rules, QA rules, and repair rules.
- Detect conflicts and missing facts/assets.
- Provide confidence and explanations.

## Inputs

`WebsiteSpec`, `WebsiteDNA`, repository records, constraints, available assets, brand context, and fixture history.

## Outputs

Deprecated `ResolverResult` compatibility shape. Future output is `DecisionPlan`.

## Public Interfaces

Deprecated. Use `DecisionEngine.run()` and `runDecisionEngine()`.

## Dependencies

SDK, repository, graph, constraints, assets, and design metadata.

## Lifecycle

Compatibility only. Decision Engine runs before compiler.

## Example Flow

Deprecated example: the old resolver described selection for real estate, healthcare, restaurant, automotive, and education. Future examples should use Decision Engine.

Decision Engine receives ranked reasoning candidates derived from semantic pattern and experience intelligence.

## Known Limitations

Initial scoring should be deterministic. Learned ranking belongs later.
