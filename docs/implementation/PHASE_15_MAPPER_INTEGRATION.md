# Phase 15 Mapper Integration

## Objective

Connect compiled plans to editable native builder node mapping.

## Scope

Mapper adapter for fixture plans only.

## Files Expected To Create

Mapper targets, mapping reports, fixture mapped nodes, editability tests.

## Files Expected To Modify

Mapper docs and SDK mapping contracts.

## Acceptance Criteria

Mapped output remains native and editable. No production route changes.

## Tests/Verification

Fixture mapping tests and editability assertions.

## Rollback Plan

Disable mapper adapter and keep compiled plans unmapped.

## Risks

Mapper may reintroduce hidden design decisions.
