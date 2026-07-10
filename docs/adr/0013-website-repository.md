# ADR: Website Repository

## Status

Accepted

## Context

BuildEZ needs reusable industry, archetype, pattern, component, design, constraint, QA, repair, fixture, and anti-pattern knowledge.

## Problem

Prompt-only knowledge is hard to test, version, rank, and migrate. HTML dumps do not create reusable intelligence.

## Decision

Create a Website Repository of structured versioned records. Industry-specific behavior emerges from reusable records and inheritance, not hardcoded generators.

## Alternatives Considered

- Store generated HTML examples. Rejected because they are not composable.
- Keep knowledge in prompts. Rejected because it creates prompt bloat.
- Add one-off code paths for each industry. Rejected because it does not scale.

## Consequences

The repository becomes a core engineering asset. Records require governance, fixtures, versioning, and compatibility metadata.

## Future Implications

Learning can rank repository records over time using tenant-safe signals.
