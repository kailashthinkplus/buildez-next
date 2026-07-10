# ADR: Business Intelligence Before WebsiteSpec

## Status

Accepted

## Context

The planner can classify intent, but the engine needs deeper company understanding.

## Problem

Industry labels do not capture business model, revenue model, proof needs, objections, or conversion goals.

## Decision

Create Business Intelligence before WebsiteSpec.

## Alternatives Considered

- Use only `WebsiteIntentClassification`. Rejected as too shallow.
- Hardcode business flows by industry. Rejected as non-universal.

## Consequences

WebsiteSpec receives resolved business understanding and missing facts.

## Future Implications

Business intelligence becomes a fixture artifact and trace stage.
