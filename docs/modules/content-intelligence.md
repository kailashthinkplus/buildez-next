# Content Intelligence Module

## Purpose

Define content strategy before copywriting.

## Responsibilities

Define message hierarchy, headline strategy, section messaging roles, CTA strategy, proof strategy, FAQ strategy, SEO content strategy, trust copy, objections, locality content, compliance copy rules, missing content facts, and truth policy.

## Inputs

Business intelligence, brand profile, ontology, repository content rules, SEO, compliance, known facts, missing facts.

## Outputs

`ContentStrategy` and trace decisions.

## Public Interface

`runContentIntelligence(input): EngineResult<ContentStrategy>`.

## Dependencies

SDK, business intelligence, brand intelligence, repository, trace.

## Lifecycle

Runs before `WebsiteSpec`; copywriting is later and must obey this strategy.

## Example Flow

Healthcare emphasizes credentials before appointment, restaurant surfaces menu and reservation early, education avoids fake placements, automotive avoids false authorization, real estate avoids fake RERA/prices.

## Known Limitations

Does not generate final copy by itself.
