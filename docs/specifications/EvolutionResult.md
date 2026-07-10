# EvolutionResult Specification

## Contract

`EvolutionResult` is the metadata-only output of Candidate Evolution.

## Required Fields

- `id`
- `version`
- `winner`
- `runnerUps`
- `candidates`
- `candidateScores`
- `criticScores`
- `similarityScores`
- `ranking`
- `comparisons`
- `selectionReason`
- `repairPriority`
- `metrics`
- `warnings`
- `confidence`
- `trace`
- `metadata`

## Candidate Rules

- At least five candidates must be generated.
- Candidate mutations must be metadata-only.
- Runner-ups must be preserved in deterministic rank order.
- Winner selection must use weighted quality and uniqueness, not Critic score alone.

## Safety Flags

The result must always report:

- `rendered: false`
- `persisted: false`
- `builderNodesCreated: false`
- `mapperExecuted: false`

## Forbidden Outputs

`EvolutionResult` must not contain Builder nodes, HTML, CSS, React, JavaScript, screenshots, provider results, DB records, or persisted history handles.
