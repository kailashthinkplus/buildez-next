# ADR: ai-v9 Isolated Migration

## Status

Accepted

## Context

`ai-v9` is the current production/stable generation path. The Website Engine and future `ai-v10` are not yet proven.

## Problem

Refactoring or replacing `ai-v9` too early risks production regressions.

## Decision

Build `website-engine` beside `ai-v9`. Keep `ai-v9` isolated and available as fallback. Introduce `ai-v10` only as orchestration glue after skeleton, SDK, repository, constraints, resolver, compiler, mapper, simulation, and critic reach fixture readiness.

## Alternatives Considered

- Rewrite `ai-v9` in place. Rejected because rollback would be unsafe.
- Delete `ai-v9` once docs exist. Rejected because docs are not parity.
- Build `ai-v10` as a new monolith. Rejected because product capability belongs in Website Engine.

## Consequences

Migration takes longer but is safer. Feature flags, shadow runs, fixtures, and fallback are mandatory.

## Future Implications

Retirement of `ai-v9` requires parity, quality metrics, fixture breadth, limited traffic success, and rollback confidence.
