# Compiler Module

## Purpose

The compiler converts `WebsiteSpec` plus `DecisionPlan` into a fully resolved `CompiledWebsitePlan`.

## Responsibilities

- Resolve inheritance, graph relationships, constraints, component compatibility, token compatibility, asset requirements, responsive strategy, SEO/accessibility rules, CTA cadence, and quality gates.
- Emit a mapper-ready plan.
- Fail with typed errors when the plan is incomplete.

## Inputs

`WebsiteSpec`, `WebsiteDNA`, `DecisionPlan`, repository records, constraint results, asset readiness, brand context, and engine versions.

## Outputs

`CompiledWebsitePlan`, compiler warnings/errors, quality gates, mapper targets, and trace metadata.

## Public Interfaces

`compileWebsitePlan`, `validateCompiledPlan`, `diffCompiledPlans`, and `extractMapperTargets`.

## Dependencies

SDK, repository, Decision Engine, constraints, assets, composition, design, and component metadata.

## Lifecycle

Runs after Decision Engine and before mapper. Mapper should not invent decisions the compiler omitted.

## Example Flow

For education, compiler attaches admissions timeline and program cards; for automotive, inventory fields and test-drive CTA; for restaurant, menu groups and reservation CTA.

Compiler preserves content, experience, and pattern intelligence in the compiled plan so mapper, simulation, and critic can verify intent.

## Known Limitations

First compiler should support one-page fixtures before multi-page plans.
