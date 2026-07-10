# Knowledge Graph Expansion

## Scope

Add more industries and archetypes using real fixtures.

## Implementation Guidance

- Confirm current code before editing.
- Keep changes behind clear boundaries or feature flags when behavior changes.
- Update specs, module docs, changelog, and developer logs with each material change.
- Use real estate fixtures as the first proof point.

## Acceptance Criteria

- Each new vertical has graph nodes, anti-patterns, variants, fixtures, and QA criteria.
- Documentation reflects the final implemented behavior.
- Tests or verification notes show the phase is safe to continue from.

## Rollback Plan

Disable newly added verticals by feature flag.

## Risks

- Accidentally changing existing builder behavior before parity and QA are ready.
- Letting prompt text substitute for typed knowledge.
- Accepting visually weak output because schema validation passed.

