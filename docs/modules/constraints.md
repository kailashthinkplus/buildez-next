# Constraints Module

## Purpose

The constraints module evaluates rules that prevent bad output before rendering.

## Responsibilities

- Evaluate truth, compliance, content, asset, editability, composition, mobile, accessibility, SEO, and renderer parity constraints.
- Return typed violations with severity and repair hints.
- Run before Decision Engine selection, compiler, mapper readiness, and simulation.

## Inputs

`WebsiteSpec`, facts, assets, repository selections, design tokens, component metadata, compiled plans, and mapped nodes.

## Outputs

`ConstraintResult`, violations, warnings, repair hints, fallback decisions, and trace metadata.

## Public Interfaces

`evaluateConstraints`, `evaluateConstraintRule`, `filterBlockingViolations`, and `toRepairHints`.

## Dependencies

SDK types, repository constraint records, and engine trace helpers.

## Lifecycle

Constraints run early and often. Hard failures block progression; warnings pass forward to simulation and critic.

## Example Flow

Real estate blocks fake prices, healthcare blocks fabricated doctors, restaurant blocks invented menu prices, automotive blocks unauthorized brand claims, and education blocks fake placement numbers.

## Known Limitations

Rules must be typed and scoped. Text-only heuristics are acceptable only as temporary warnings.
