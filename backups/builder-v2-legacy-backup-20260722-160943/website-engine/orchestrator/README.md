# AI v10 Orchestrator

Phase 39 adds a disabled, inert orchestration layer for the Website Engine.

The orchestrator answers: what would AI v10 coordinate for this request?

It does not replace `ai-v9`, call live LLM APIs, call DB/network/MCP/providers, wire production routes, mutate Builder state, insert Builder nodes, execute Mapper, render UI, publish, or generate React/CSS/HTML/JS.

## Entry Points

- `runAIV10Orchestrator(input)`
- `buildPipelineStages(mode)`
- `runPipelineStage(stage, input, gates, mode, state)`
- `collectPipelineArtifacts(artifacts)`
- `buildPipelineTrace(input)`
- `validatePipelineGates(gates)`
- `validateOrchestratorInput(input)`
- `validateOrchestratorResult(result)`
- `runAIV10OrchestratorVerification()`

## Execution Modes

- `dry-run`: default. Runs only safe Planner metadata and records all other stages as skipped or blocked.
- `plan-only`: lists every stage as a plan unless provided artifacts are present.
- `metadata-only`: consumes provided metadata artifacts and records missing stages.
- `shadow`: consumes provided artifacts for future ai-v9 comparison without production execution.

## Disabled Gates

All risky gates default disabled:

- `liveLLM`
- `mapperExecution`
- `builderStoreWrite`
- `productionRoute`
- `providerExecution`
- `persistence`
- `publish`

## Pipeline

The stage order mirrors the Website Engine: Planner, Business Intelligence, Brand Intelligence, Content Intelligence, Experience, Pattern Intelligence, Inspiration, Visual Mood, Media, Motion, Design, Creative Library, Component Engine, Composition Engine, WebsiteSpec Builder, Compiler, Builder Blueprint, Mapper Plan, Simulation, Critic, Similarity, Candidate Evolution, Repair, Self-Play, and Learning.

Phase 39 intentionally does not execute those modules. It records provided artifacts, runs the safe Planner, and marks missing downstream work explicitly.
