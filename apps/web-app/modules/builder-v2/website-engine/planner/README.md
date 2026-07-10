# AI Planner

Phase 38 implements an inert AI Planner contract layer.

The planner answers: what should the Website Engine do with this user request?

It produces deterministic orchestration plans from structured input and optional mocked plan data. It does not call live LLM APIs, generate WebsiteSpec, create Builder nodes, execute modules, execute Mapper, call DB/network/MCP/providers, mutate Builder, or wire production routes.

## Entry Points

- `runAIPlanner(input)`
- `runPlanner(input)` compatibility wrapper
- `interpretPlannerIntent(input)`
- `extractPlannerFacts(input)`
- `collectPlannerMissingFacts(input)`
- `buildClarificationPlan(missingFacts)`
- `buildPipelinePlan(modules, clarifications)`
- `buildModulePlan(input)`
- `runPlannerVerification()`

## Execution Gates

All execution gates are disabled by default:

- Website Engine feature flag
- Mapper execution
- Builder store mutation
- Production route wiring
- Live LLM calls
- DB/network/provider calls

## Safety

Feature flags remain false. This module is planning metadata only.
