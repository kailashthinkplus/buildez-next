# ADR: Website Compiler

## Status

Accepted

## Context

WebsiteSpec and resolver selections still need to become a complete mapper-ready plan.

## Problem

Mapping directly from spec to builder nodes hides missing decisions and makes repairs coarse.

## Decision

Add a Website Compiler that resolves inheritance, graph relationships, constraints, component compatibility, token compatibility, assets, responsive strategy, SEO/accessibility requirements, CTA cadence, and quality gates into `CompiledWebsitePlan`.

## Alternatives Considered

- Combine compiler and mapper. Rejected because mapper should only convert plans into nodes.
- Let components self-resolve props. Rejected because it fragments logic.
- Use one-step AI generation. Rejected because it is not deterministic.

## Consequences

Compiled plans become the central fixture for mapper and simulation.

## Future Implications

The compiler can later support multi-page plans, plan diffs, partial recompilation, and repair patches.
