# ADR: Resolver Engine

## Status

Accepted

## Context

The planner produces intent and specs, but implementation choices must be compatible with repository records, constraints, assets, and brand context.

## Problem

If the mapper or LLM directly chooses components and layouts, quality becomes inconsistent and difficult to debug.

## Decision

Create a Resolver Engine that deterministically selects compatible archetypes, section patterns, component variants, design language, tokens, composition rules, assets, CTA strategy, SEO, QA, and repair rules.

## Alternatives Considered

- Let the LLM choose UI directly. Rejected because BuildEZ designs.
- Push selection into compiler. Rejected because scoring and compatibility deserve their own stage.
- Hardcode per-industry selection. Rejected because it violates universal foundation.

## Consequences

Resolver output becomes an explainable contract and a key fixture artifact.

## Future Implications

Learning can rank compatible candidates without changing the core contract.
