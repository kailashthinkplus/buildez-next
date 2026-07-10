# ADR: Engine Trace For Replayability

## Status

Accepted

## Context

Generation quality, support, QA, and learning require knowing why the engine made each decision.

## Problem

Logs that only store final output cannot reproduce or debug generation.

## Decision

Make Engine Trace first-class with `EngineTrace`, `GenerationDecision`, and `GenerationReplay`.

## Alternatives Considered

- Use ad hoc logs. Rejected.
- Reconstruct decisions after generation. Rejected.

## Consequences

Every stage must emit decisions, warnings, confidence, versions, and record references.

## Future Implications

Trace enables replay CI, support bundles, and ML ranking.
