# Simulation Module

## Purpose

The simulation module predicts layout, asset, accessibility, SEO, performance, renderer parity, mobile, and editability risks before preview.

## Responsibilities

- Evaluate desktop, tablet, and mobile structure.
- Check above-the-fold CTA placement, text overflow risk, image availability, asset readiness, SEO basics, accessibility risk, performance risk, renderer parity risk, and editability risk.
- Produce repair hints before rendered QA.

## Inputs

`CompiledWebsitePlan`, mapped node draft, design tokens, assets, responsive rules, renderer contract, SEO/accessibility requirements, and constraints.

## Outputs

`SimulationResult`, breakpoint findings, risk scores, blockers, warnings, and repair hints.

## Public Interfaces

`simulateWebsitePlan`, `simulateBreakpoint`, `evaluateAssetReadiness`, and `summarizeSimulationRisk`.

## Dependencies

SDK, compiler output, mapper output, constraints, renderer contract, and critic rules.

## Lifecycle

Runs after mapper draft and before preview. It complements but does not replace rendered screenshot QA.

## Example Flow

Real estate checks early site-visit CTA, healthcare checks appointment reachability, restaurant checks menu stacking, automotive checks inventory density, and education checks timeline readability.

## Known Limitations

Simulation is predictive. Rendered critic results remain the final quality gate.
