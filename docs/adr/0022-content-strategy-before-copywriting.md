# ADR: Content Strategy Before Copywriting

## Status

Accepted

## Context

The system must avoid fake claims, generic sections, and copy that ignores proof or compliance.

## Problem

Writing text before deciding strategy encourages filler and unsupported claims.

## Decision

Create Content Intelligence to define hierarchy, section roles, CTA, proof, FAQ, SEO, objections, locality, compliance copy rules, missing facts, and truth policy before copywriting.

## Alternatives Considered

- Let LLM write all section copy directly. Rejected.
- Let components define copy needs locally. Rejected.

## Consequences

Copy generation becomes constrained by a strategy and facts.

## Future Implications

Future copy modules should consume `ContentStrategy`, not raw prompts.
