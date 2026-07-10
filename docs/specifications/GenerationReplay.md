# GenerationReplay

## Purpose

Defines how a generation can be reproduced from trace, inputs, versions, and repository records.

## TypeScript Interfaces

```ts
export interface GenerationReplay {
  replayId: string;
  sourceTraceId: string;
  requiredEngineVersions: Record<string, string>;
  requiredRepositoryRecords: string[];
  inputRefs: string[];
  expectedDecisionIds: string[];
  expectedOutputRefs: string[];
  replayStatus: 'ready' | 'blocked' | 'completed' | 'failed';
}
```

## Field Descriptions

Replay references inputs instead of storing unsafe raw tenant data.

## Example Object

```ts
const replay: GenerationReplay = {
  replayId: 'replay_001',
  sourceTraceId: 'trace_001',
  requiredEngineVersions: { sdk: '0.1.0' },
  requiredRepositoryRecords: ['pattern.booking_path.v1'],
  inputRefs: ['fixture.restaurant.basic'],
  expectedDecisionIds: ['decision_pattern_001'],
  expectedOutputRefs: ['compiled_plan_001'],
  replayStatus: 'ready'
};
```

## Validation Rules

Replay must include trace, versions, records, inputs, and expected decisions.

## Versioning Notes

Replay compatibility depends on trace and SDK versions.

## Multi-Industry Examples

Replay supports regression tests for real estate, healthcare, restaurant, automotive, and education fixtures.

## Failure Modes

Missing record versions; raw sensitive data embedded; non-deterministic decisions.

## Future Extensions

Automated replay CI and customer support diagnostics.
