# EngineTrace

## Purpose

First-class explainability and replay record for generation.

## TypeScript Interfaces

```ts
export interface EngineTrace {
  version: string;
  traceId: string;
  promptSummary: string;
  decisions: GenerationDecision[];
  repositoryRecordsUsed: string[];
  constraintsApplied: string[];
  warnings: string[];
  errors: string[];
  confidence: number;
  engineVersions: Record<string, string>;
}
```

## Field Descriptions

Trace records decisions from prompt through learning with enough version data for replay.

## Example Object

```ts
const trace: EngineTrace = {
  version: '1.0',
  traceId: 'trace_001',
  promptSummary: 'Restaurant booking website',
  decisions: [],
  repositoryRecordsUsed: ['archetype.restaurant_menu.v1'],
  constraintsApplied: ['restaurant.no_fake_menu_prices'],
  warnings: ['menu prices missing'],
  errors: [],
  confidence: 0.76,
  engineVersions: { sdk: '0.1.0' }
};
```

## Validation Rules

Trace ID, prompt summary, decisions, versions, warnings/errors, and confidence are required.

## Versioning Notes

Trace version changes only with replay-breaking structure changes.

## Multi-Industry Examples

Trace explains real estate, healthcare, restaurant, automotive, and education decisions uniformly.

## Failure Modes

No decision history; missing versions; tenant-sensitive raw data stored.

## Future Extensions

Trace viewer, replay runner, support bundle export.
