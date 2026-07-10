# PlannerResult Specification

## Contract

`PlannerResult` is the inert output of the AI Planner.

## Required Fields

- `id`
- `version`
- `interpretedIntent`
- `knownFacts`
- `missingFacts`
- `clarificationQuestions`
- `pipelinePlan`
- `orderedModulePlan`
- `disabledExecutionGates`
- `warnings`
- `confidence`
- `metrics`
- `plannerTrace`
- `trace`
- `metadata`

## Safety Flags

The result must always report:

- `generatedWebsiteSpec: false`
- `generatedBuilderNodes: false`
- `executedModules: false`
- `liveLlmCalls: false`

## Validation Rules

- Result has id and version.
- Intent exists or warning is emitted.
- Pipeline and module plans exist.
- Execution gates default disabled.
- Missing facts remain explicit.
- Required missing facts create clarification questions.
- Trace includes metadata-only execution.
