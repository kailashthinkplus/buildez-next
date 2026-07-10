# LearningResult Specification

## Contract

`LearningResult` is the metadata-only output of the Learning Engine.

## Required Fields

- `id`
- `version`
- `learningRecords`
- `generationHistory`
- `rankingSignals`
- `patternSignals`
- `recipeSignals`
- `fragmentSignals`
- `designDnaSignals`
- `criticSignals`
- `repairSignals`
- `similaritySignals`
- `selfPlaySignals`
- `aggregationSummary`
- `warnings`
- `metrics`
- `confidence`
- `trace`
- `metadata`

## Validation Rules

- Result has id and version.
- Ranking signals are normalized from `0` to `1`.
- Missing user edit signals are explicit.
- Missing publish signals are explicit.
- No persistence side effects are present.
- Trace includes metadata-only execution.

## Safety Flags

The result must always report:

- `persisted: false`
- `builderMutations: false`
- `mapperExecuted: false`
