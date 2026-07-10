# ADR: Website Engine SDK

## Status

Accepted

## Context

The Website Engine will contain many modules that exchange specs, repository records, constraints, resolver results, compiled plans, simulations, evaluations, repair plans, and generation history.

## Problem

Without a shared SDK, modules will drift into incompatible JSON shapes and hidden assumptions.

## Decision

Create a pure Website Engine SDK that owns shared types, enums, validators, schema versions, helpers, error types, and trace metadata. The SDK has no React UI, no LLM calls, and no database access.

## Alternatives Considered

- Let each module define local types. Rejected because it causes drift.
- Put SDK types in ai-v10. Rejected because ai-v10 is orchestration glue, not product architecture.
- Infer schemas from runtime output. Rejected because it is too late and not fixture-friendly.

## Consequences

All engine modules can validate inputs and outputs consistently. Early work must invest in type and fixture quality before production logic.

## Future Implications

The SDK can later support schema migrations, generated docs, trace viewers, and compatibility checks.
