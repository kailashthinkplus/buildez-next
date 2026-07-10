# Real Estate Vertical

## Scope

Implement typed knowledge, archetype, section patterns, anti-patterns, and fixture specs for real estate.

## Implementation Guidance

- Confirm current code before editing.
- Keep changes behind clear boundaries or feature flags when behavior changes.
- Update specs, module docs, changelog, and developer logs with each material change.
- Use real estate fixtures as the first proof point.

## Acceptance Criteria

- Real estate output requires project facts; SaaS pricing/generic cards are rejected; missing facts remain explicit.
- Documentation reflects the final implemented behavior.
- Tests or verification notes show the phase is safe to continue from.

## Rollback Plan

Fallback to old generator for real estate while retaining graph data.

## Risks

- Accidentally changing existing builder behavior before parity and QA are ready.
- Letting prompt text substitute for typed knowledge.
- Accepting visually weak output because schema validation passed.

