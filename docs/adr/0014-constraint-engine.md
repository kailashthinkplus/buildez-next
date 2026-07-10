# ADR: Constraint Engine

## Status

Accepted

## Context

Generated websites must avoid fake facts, unsupported claims, placeholder content, non-editable sections, bad mobile conversion, and preview/publish mismatch.

## Problem

Waiting until rendered QA catches preventable issues too late.

## Decision

Add a Constraint Engine that evaluates typed rules before rendering and returns violations with severity and repair hints.

## Alternatives Considered

- Rely on prompts to avoid errors. Rejected because models can still invent claims.
- Rely only on critic after render. Rejected because it is late and expensive.
- Hardcode checks in mapper. Rejected because constraints must be reusable across modules.

## Consequences

Resolver and compiler must be constraint-aware. Rules need scope, severity, and tests.

## Future Implications

Constraints can expand into regional compliance, tenant brand safety, and accessibility packs.
