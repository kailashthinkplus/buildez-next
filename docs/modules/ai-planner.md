# AI Planner Module

## Module

`apps/web-app/modules/builder-v2/website-engine/planner`

## Responsibility

Create deterministic orchestration metadata for Website Engine modules from structured request inputs and optional mocked plan data.

## Public Helpers

- `runAIPlanner()`
- `interpretPlannerIntent()`
- `extractPlannerFacts()`
- `collectPlannerMissingFacts()`
- `buildClarificationPlan()`
- `buildPipelinePlan()`
- `buildModulePlan()`
- `validatePlannerInput()`
- `validatePlannerResult()`
- `runPlannerVerification()`

## Non-Responsibilities

- No live LLM calls
- No WebsiteSpec generation
- No Builder nodes
- No Mapper execution
- No Builder store writes
- No DB/network/MCP/provider calls
- No production route wiring
