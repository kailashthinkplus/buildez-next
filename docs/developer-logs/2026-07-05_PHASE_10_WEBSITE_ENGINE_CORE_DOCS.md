# 2026-07-05 Phase 10 Website Engine Core Docs

## Objective

Document the Website Engine Core layer that will eventually live under `modules/builder-v2/website-engine/`, while keeping application code, builder behavior, runtime rendering, and ai-v9 unchanged.

## Files Created

Architecture docs 27-35, module docs for SDK/repository/constraints/resolver/compiler/simulation, core specification docs, ADRs 0012-0018, and implementation phases 10-18.

## Files Modified

Project state, README, changelog, system architecture, website engine, AI orchestration, migration strategy, scalability, future roadmap, glossary, and relevant module docs.

## Architecture Changes

Added SDK, repository, constraint engine, resolver engine, website compiler, simulation engine, lifecycle tracing, and ai-v9 to ai-v10 migration boundaries.

## Decisions

- Build Website Engine beside ai-v9.
- Keep ai-v10 as orchestration glue.
- Use compiler before mapper.
- Run simulation before preview.
- Preserve ai-v9 fallback until parity and quality metrics pass.

## Problems Encountered

The existing architecture had planner/spec/mapper/renderer concepts but not enough core handoff contracts for implementation.

## Solutions

Added explicit module responsibilities, typed specs, ADRs, and phase plans.

## Technical Debt

No production code exists for the new core yet. Phase 11 should create skeletons and feature flags only.

## Tests Run

Documentation path verification only.

## Open Questions

- Which validation library should SDK use?
- Should repository records begin as JSON, TypeScript objects, or Markdown-with-frontmatter?

## Next Steps

Run Phase 11 Website Engine Skeleton.
