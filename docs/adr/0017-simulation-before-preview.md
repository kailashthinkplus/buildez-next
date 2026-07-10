# ADR: Simulation Before Preview

## Status

Accepted

## Context

Preview should not be the first place BuildEZ discovers obvious mobile, asset, accessibility, SEO, performance, parity, or editability risk.

## Problem

Rendered QA is necessary but late. Some failures can be predicted from compiled plans and mapped nodes.

## Decision

Add a Simulation Engine before preview. It predicts desktop/tablet/mobile structure, CTA reachability, overflow risk, asset readiness, accessibility, SEO, performance, renderer parity, and editability issues.

## Alternatives Considered

- Skip simulation and rely on visual critic. Rejected because it wastes cycles.
- Use only static schema validation. Rejected because layout and breakpoint risk need richer checks.
- Block all creative layouts with rigid rules. Rejected; simulation should score and hint, not flatten design.

## Consequences

Simulation adds a pre-preview quality gate. It must remain calibrated against rendered critic findings.

## Future Implications

Simulation can evolve into browser dry-runs, heatmaps, and layout risk scoring.
