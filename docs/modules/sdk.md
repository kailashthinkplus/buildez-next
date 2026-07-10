# SDK Module

## Purpose

The SDK module is the pure shared contract layer for `website-engine`. It owns stable types, validators, schema versions, helpers, error types, and trace metadata.

## Responsibilities

- Export shared contracts for specs, repository records, constraints, reasoning, Decision Engine, compiler, mapper, simulation, critic, repair, learning, and analytics.
- Keep all contracts serializable and fixture-friendly.
- Provide schema versioning and validation helpers.
- Avoid React UI, LLM calls, and database access.

## Inputs

Schema definitions, repository record definitions, lifecycle trace data, validation requests, and migration rules.

## Outputs

Typed objects, validation results, normalized errors, schema versions, and trace envelopes.

## Public Interfaces

`validateWebsiteSpec`, `validateRepositoryRecord`, `validateConstraintRule`, `createLifecycleTrace`, `normalizeEngineError`, and version constants.

## Dependencies

Pure validation libraries only. No UI, no database, no model gateway, no builder runtime.

## Lifecycle

SDK loads before engine modules, validates every boundary object, and emits version metadata into generation history.

## Example Flow

Real estate, healthcare, restaurant, automotive, and education fixtures all validate through the same SDK contracts before Decision Engine or compiler runs.

## Known Limitations

This is documentation-only until Phase 12. Early SDK should start narrow and fixture-backed.
