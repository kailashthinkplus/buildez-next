# AI v10 Orchestrator

## Purpose

AI v10 Orchestrator is the disabled coordination layer for the Website Engine.

It answers: how should the Website Engine pipeline be coordinated for a structured user request?

It does not replace `ai-v9`. It does not generate production output. It does not call live LLM APIs. It does not execute Mapper, mutate Builder, insert Builder nodes, wire production routes, call DB/network/MCP/providers, or publish.

## Position In The Architecture

The orchestrator sits above deterministic Website Engine modules:

1. Planner
2. Business Intelligence
3. Brand Intelligence
4. Content Intelligence
5. Experience
6. Pattern Intelligence
7. Inspiration
8. Visual Mood
9. Media Intelligence
10. Motion Intelligence
11. Design
12. Creative Library
13. Component Engine
14. Composition Engine
15. WebsiteSpec Builder
16. Compiler
17. Builder Blueprint
18. Mapper Plan
19. Simulation
20. Critic
21. Similarity
22. Candidate Evolution
23. Repair
24. Self-Play
25. Learning

Phase 39 coordinates these stages as metadata only. It records what can run, what was provided, and what is skipped or blocked.

## Execution Modes

- `dry-run`: default. Runs only the safe inert Planner and records downstream stages.
- `plan-only`: creates the full stage plan without module execution.
- `metadata-only`: consumes already-provided artifacts and records gaps.
- `shadow`: prepares future ai-v9 comparison without changing production behavior.

## Gates

All risky gates default disabled:

- `liveLLM`
- `mapperExecution`
- `builderStoreWrite`
- `productionRoute`
- `providerExecution`
- `persistence`
- `publish`

Gate overrides are ignored while required feature flags remain false.

## Safety Boundary

AI v10 Orchestrator is intentionally inert. It can run Planner because Planner is metadata-only and local. All other modules are represented as stage plans or consumed artifacts until a later phase explicitly enables shadow comparison or controlled execution.

## Next Step

Phase 40 should add ai-v9 Shadow Comparison using the orchestrator trace and artifact model, without replacing ai-v9.
