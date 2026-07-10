# Phase 10 Website Engine Core Docs

## Objective

Document the Website Engine Core before implementation.

## Scope

Documentation only: SDK, repository, constraints, resolver, compiler, simulation, lifecycle, and ai-v9 to ai-v10 migration.

## Files Expected To Create

Architecture docs 27-35, module docs for SDK/repository/constraints/resolver/compiler/simulation, core specifications, ADRs 0012-0018, and phase plans 11-18.

## Files Expected To Modify

Project state, README, changelog, system architecture, website engine, AI orchestration, migration strategy, scalability, roadmap, glossary, and relevant module docs.

## Acceptance Criteria

- Core concepts are documented with inputs, outputs, flow, failures, examples, implementation, and testing guidance.
- ai-v9 remains explicitly isolated.
- Phase 11 is identified as next priority and not marked complete.

## Tests/Verification

Verify required docs exist and no application code changed.

## Rollback Plan

Revert documentation changes only.

## Risks

Docs may outrun implementation; Phase 11 must start with skeletons and feature flags only.
