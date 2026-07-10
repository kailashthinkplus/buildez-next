# ADR: Website Archetypes Over Industry Hardcoding

## Status

Accepted

## Context

Many industries need similar website strategies: lead generation, brochure, catalogue, booking, appointment, ecommerce, portfolio, directory, event, community, documentation, restaurant menu, property showcase, recruitment, and investor relations.

## Problem

Industry-specific generators make the engine think in vertical silos. That causes generic output, duplicated code, and poor extensibility when a business spans categories, such as a restaurant with events, a clinic with a knowledge base, or an automotive dealer with service booking.

## Decision

Use WebsiteArchetypes as the primary strategy layer. Industries and subindustries can prefer, forbid, or override archetype defaults, but generation should compose archetypes with section patterns and component patterns.

## Alternatives Considered

- Let the LLM choose arbitrary layouts. Rejected because it undermines deterministic design and editable mapping.
- Hardcode industry page flows. Rejected because it does not scale.
- Use only generic archetypes with no industry constraints. Rejected because it misses compliance, trust, locality, and content needs.

## Consequences

The engine can reuse lead generation for real estate, healthcare, education, automotive, and B2B services while changing trust, content, assets, and compliance. The critic can evaluate whether selected archetypes satisfy industry constraints.

## Future Implications

New industries should rarely need new archetypes. They should usually define inheritance, preferred archetypes, section pattern overrides, anti-patterns, and fixtures.
