# Phase 12 Engine SDK And Types

## Objective

Implement pure SDK contracts and validators.

## Scope

Shared types, schema versions, validation helpers, errors, and trace metadata.

## Files Expected To Create

SDK TypeScript files and tests.

## Files Expected To Modify

Docs, fixtures, and imports in engine-only test code.

## Acceptance Criteria

SDK has no React, LLM, database, or runtime rendering dependency.

## Tests/Verification

Schema tests for five industry fixtures.

## Rollback Plan

Remove SDK imports and leave docs intact.

## Risks

Overbuilding SDK before fixture needs are clear.
