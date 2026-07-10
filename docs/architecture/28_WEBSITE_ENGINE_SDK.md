# Website Engine SDK

## Purpose

The Website Engine SDK is the shared contract layer for `website-engine`. It owns stable types, validators, schema versions, helpers, error types, and trace metadata. It contains no React UI, no LLM calls, and no database access.

## Problem Solved

Without an SDK, each engine module can silently invent its own shape for specs, constraints, Decision Plans, simulation, and repair. The SDK keeps planner, repository, reasoning, Decision Engine, compiler, mapper, critic, repair, and learning aligned.

## Responsibilities

- Define shared types: `BusinessContext`, `WebsiteIntentClassification`, `WebsiteSpec`, `WebsiteDNA`, `SectionSpec`, `PatternDefinition`, `ComponentVariant`, `DesignTokens`, `AssetRequirement`, `ConstraintRule`, `DecisionPlan`, `CompiledWebsitePlan`, `BuilderNodeMapping`, `SimulationResult`, `WebsiteEvaluation`, `RepairPlan`, and `GenerationHistory`.
- Define intelligence types: `BusinessIntelligenceProfile`, `BrandIntelligenceProfile`, `ContentStrategy`, `ExperienceStrategy`, `PatternIntelligenceResult`, `EngineTrace`, `GenerationDecision`, and `GenerationReplay`.
- Provide enums, schema validators, error classes, version metadata, and trace helpers.
- Keep contracts serializable and fixture-friendly.
- Make module boundaries testable without live AI calls or UI rendering.

## Inputs

Versioned schemas, repository record definitions, generated plans, validation requests, and lifecycle trace metadata.

## Outputs

Validated typed objects, normalized errors, schema migration helpers, trace envelopes, and safe serialization contracts.

## Data Flow

SDK types are imported by every engine module. Repository records validate against SDK schemas. Decision Engine and compiler output SDK-aligned results. Mapper and critic consume SDK contracts rather than ad hoc JSON.

## Failure Modes

- Schema drift between modules.
- Optional fields used as required facts.
- Versionless generated output cannot be reproduced.
- UI or database dependencies leak into the SDK.

## Multi-Industry Examples

- Real estate and automotive both use `AssetRequirement`, but real estate needs project/floor-plan assets while automotive needs vehicle inventory images.
- Healthcare and education both use `ComplianceNeed`, but healthcare blocks medical claims while education blocks fabricated accreditation or outcomes.
- Restaurant and healthcare both use booking-like conversion goals, but restaurant maps to reservation while clinic maps to appointment.

## Implementation Guidance

Build SDK first in Phase 12. Keep it pure TypeScript with validators and fixtures. It should be safe to run in tests, API routes, workers, and local tooling.

## Testing Guidance

Add contract tests for every exported schema, migration tests for versioned objects, and fixture validation tests across real estate, healthcare, restaurant, automotive, and education.

## Future Extensions

Schema registry, typed migration runner, compatibility matrix, trace viewer, and generated docs from SDK schemas.
