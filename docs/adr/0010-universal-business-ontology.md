# ADR: Universal Business Ontology

## Status

Accepted

## Context

BuildEZ must become a Website Operating System that supports many industries and use cases. The earlier architecture used real estate heavily as the first proof point, but that framing risks overfitting the engine to one vertical.

## Problem

If business knowledge is embedded in prompts or hardcoded generators, the system will grow as a set of brittle vertical-specific paths. That would make healthcare, restaurants, education, automotive, real estate, and future industries inconsistent and hard to test.

## Decision

Adopt a universal business ontology with `BusinessFamily`, `Industry`, `SubIndustry`, `BusinessModel`, `RevenueModel`, `CustomerJourney`, `TrustModel`, `ConversionGoal`, `LocalityNeed`, `ComplianceNeed`, `ContentNeed`, and `AssetNeed`. Website generation must compose from these concepts into archetypes, section patterns, and component patterns.

## Alternatives Considered

- Build one generator per industry. Rejected because it duplicates logic and makes quality uneven.
- Keep industry knowledge in prompts. Rejected because it is hard to validate, version, and test.
- Start only with real estate. Rejected as the foundation, accepted only as one validation fixture.

## Consequences

The planner and knowledge graph need richer typed data. The payoff is that a clinic appointment site, restaurant reservation site, school admissions site, vehicle catalogue, and property showcase can share the same pipeline while retaining domain constraints.

## Future Implications

All future vertical work should add ontology records and fixtures before adding specialized behavior. Specialized behavior must be justified as a reusable pattern, not a one-off generator.
