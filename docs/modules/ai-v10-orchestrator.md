# AI v10 Orchestrator Module

## Responsibility

The AI v10 Orchestrator coordinates the Website Engine pipeline as disabled metadata.

It preserves stage order, execution gates, artifacts, warnings, skipped stages, blocked stages, and trace metadata.

## Inputs

- User prompt
- Planner input
- Existing metadata artifacts
- Feature flag metadata
- Gate override requests
- Execution mode

## Outputs

- `AIV10OrchestratorResult`
- Pipeline stages
- Stage results
- Pipeline artifacts
- Disabled gates
- Pipeline trace
- Warnings
- Metrics

## Execution Modes

- `dry-run`
- `plan-only`
- `metadata-only`
- `shadow`

Default mode is `dry-run`.

## Non-Responsibilities

The module must not:

- Replace `ai-v9`
- Call live LLM APIs
- Call DB/network/MCP/providers
- Execute Mapper by default
- Mutate Builder store
- Insert Builder nodes
- Change Builder behavior
- Wire production routes
- Render, publish, or generate code

## Verification

Use `runAIV10OrchestratorVerification()` for compile-safe verification. It checks EngineResult shape, stage listing, disabled gates, artifacts, skipped/blocked stages, trace metadata, and forbidden side-effect flags.
