# Website Compiler

## Purpose

The Website Compiler converts a `WebsiteSpec` and `DecisionPlan` into a fully resolved `CompiledWebsitePlan`. It is different from the mapper: the compiler decides what must be built; the mapper converts that plan into editable builder nodes.

Phase 20 review status: the current compiler is contract-ready but intentionally frozen. It should not be deepened into mapping or rendering behavior until upstream Business Intelligence, Brand Intelligence, Content Intelligence, Experience, Pattern Intelligence, Design, Component, and Composition engines exist.

## Problem Solved

Mapping directly from spec to nodes hides unresolved decisions inside mapper code. The compiler makes inheritance, compatibility, constraints, assets, responsive strategy, SEO, accessibility, CTA cadence, and quality gates explicit.

## Responsibilities

- Resolve inheritance and graph relationships.
- Apply constraints and compatibility rules.
- Normalize section specs, component props, assets, design tokens, and responsive behavior.
- Define SEO/accessibility requirements and CTA cadence.
- Emit quality gates for simulation and critic.

## Inputs

`WebsiteSpec`, `WebsiteDNA`, `ContentStrategy`, `ExperienceStrategy`, `PatternIntelligenceResult`, `DecisionPlan`, repository records, constraint results, asset readiness, brand context, and engine version metadata.

## Outputs

`CompiledWebsitePlan` with resolved sections, component assignments, required props, design/tokens, responsive plan, asset strategy, mapper targets, simulation gates, critic gates, and trace metadata.

## Data Flow

Compiler output is the final pre-mapping contract. Mapper should not query repository records or invent design decisions if the compiled plan is complete.

## Failure Modes

- Plan includes a component without required props.
- Responsive behavior is unspecified.
- Asset substitutions violate truth policy.
- SEO/accessibility requirements are not attached to sections.
- Compiler allows non-editable output.
- Compiler is treated as sufficient while upstream intelligence is still shallow.
- Mapper is implemented against default compiler sections and hardens generic output.

## Multi-Industry Examples

Real estate compiled plans require project facts and location sections; healthcare plans require credentials and privacy; restaurant plans require menu/hours; automotive plans require inventory fields; education plans require programs, outcomes, and admissions steps.

## Implementation Guidance

Treat the compiler like a build step. It should fail loudly with typed errors when the plan is incomplete, not leave gaps for mapper or renderer guesses.

Phase 20 gate guidance: keep Compiler frozen as a contract for now. Revisit Compiler after intelligence/design/component/composition engines exist and can feed richer inputs.

## Testing Guidance

Use golden compiled plans for fixtures. Validate required props, section order, CTA cadence, responsive rules, quality gates, and mapper readiness.

## Future Extensions

Multi-page compilation, localized plan variants, partial recompilation after user edits, and plan diffing for repair.
