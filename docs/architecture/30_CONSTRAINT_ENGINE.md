# Constraint Engine

## Purpose

The Constraint Engine enforces rules before rendering. It blocks bad, unsupported, fake, inaccessible, non-editable, or mismatched output while repair is still cheap.

## Problem Solved

Critic-only QA finds problems late. Constraints stop known violations before the mapper and renderer produce a page.

## Responsibilities

- Evaluate `ConstraintRule` records against `WebsiteSpec`, `WebsiteDNA`, repository choices, assets, and compiled plans.
- Return `ConstraintResult` with violations and repair hints.
- Enforce truth, compliance, editability, mobile, composition, asset, and renderer-parity constraints.
- Distinguish hard blockers from warnings.

## Inputs

`WebsiteSpec`, facts used, missing facts, available assets, selected repository records, component metadata, design tokens, composition plan, and preview/publish parity requirements.

## Outputs

`ConstraintResult`, `ConstraintViolation`, `ConstraintRepairHint`, blocked/fallback decisions, and trace metadata.

## Data Flow

Constraints run before Decision Engine selection, compiler validation, mapper readiness, and pre-preview simulation.

## Failure Modes

- A hard rule is implemented as a warning.
- Rules are not scoped, so a restaurant rule blocks automotive output.
- Constraints rely on text matching instead of typed facts.
- Repair hints are too vague to act on.

## Multi-Industry Examples

- Real estate: do not fabricate RERA, prices, availability, awards, or project status.
- Healthcare: do not fabricate doctors, certifications, licenses, or cure outcomes.
- Restaurant: do not invent menu prices, hours, reservation availability, or dietary claims.
- Automotive: do not claim brand authorization, warranty terms, discounts, or inventory availability without facts.
- Education: do not fabricate exam results, accreditation, placements, faculty credentials, or admissions guarantees.

Universal constraints include no placeholder copy, no unsupported claims, no non-editable generated sections, early mobile CTA for conversion pages, avoiding three consecutive card-grid sections, and preview matching published output.

## Implementation Guidance

Model constraints as data records plus pure evaluators. Keep rule scope explicit: global, family, industry, archetype, section, component, asset, renderer, or tenant.

## Testing Guidance

Use negative fixtures for each industry. A good constraint test should fail for exactly the violation it targets and return a concrete repair hint.

## Future Extensions

Regional compliance packs, tenant custom constraints, brand safety rules, accessibility rule packs, and analytics-driven constraint tuning.
