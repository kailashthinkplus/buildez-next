# Simulation Engine

## Purpose

The Simulation Engine performs pre-preview evaluation of the mapped or compiled website plan. It predicts common failures before expensive rendering or user-facing preview.

## Problem Solved

Rendered screenshot QA is necessary but late. Simulation catches structural risks earlier: desktop/tablet/mobile layout, text overflow, missing assets, accessibility, SEO, performance, renderer parity, and editability.

## Responsibilities

- Check desktop structure, tablet structure, mobile stacking, above-the-fold CTA, text overflow risk, image availability, asset readiness, accessibility risk, SEO basics, performance risk, renderer parity risk, and editability risk.
- Produce `SimulationResult` with warnings, blockers, confidence, and repair hints.
- Feed critic and repair with early evidence.

## Inputs

`CompiledWebsitePlan`, mapped builder node draft, design tokens, asset readiness, responsive rules, renderer contract, SEO/accessibility requirements, and constraints.

## Outputs

`SimulationResult` with pass/fail, issue list, breakpoint findings, asset findings, performance estimates, editability findings, and suggested repair operations.

## Data Flow

Simulation runs after mapper produces a draft and before preview. It does not replace rendered screenshot QA; it reduces avoidable failures before the critic inspects rendered output.

## Failure Modes

- Simulation becomes too optimistic and misses real render bugs.
- It duplicates critic logic without sharing rule definitions.
- It blocks valid creative layouts due to rigid heuristics.
- It does not model mobile-first conversion needs.

## Multi-Industry Examples

- Real estate: mobile site visit CTA must appear early and gallery assets must be available.
- Healthcare: appointment CTA must be reachable and credentials must not overflow on mobile.
- Restaurant: menu sections must stack cleanly and hours/location must be discoverable.
- Automotive: vehicle cards must not create unreadable dense grids on mobile.
- Education: program cards and admissions timeline must remain legible across breakpoints.

## Implementation Guidance

Start with deterministic structural checks and fixture expectations. Add visual rendering checks later through critic and screenshot QA.

## Testing Guidance

Create desktop/tablet/mobile simulation fixtures. Include failing cases for text overflow, missing assets, weak CTA placement, non-editable nodes, and renderer parity risk.

## Future Extensions

Browser-based dry-run rendering, layout risk ML scoring, automated plan simplification, and responsive heatmap reports.
