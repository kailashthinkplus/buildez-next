# EngineLifecycleTrace

## TypeScript Interfaces

```ts
export interface EngineLifecycleTrace {
  id: string;
  createdAt: string;
  engineVersion: string;
  stages: EngineLifecycleStage[];
  fallbackUsed?: string;
  finalStatus: 'preview_ready' | 'blocked' | 'repaired' | 'published';
}

export interface EngineLifecycleStage {
  name: string;
  startedAt: string;
  completedAt?: string;
  inputRefs: string[];
  outputRefs: string[];
  warnings: string[];
  errors: string[];
  versions: Record<string, string>;
}
```

## Field Descriptions

Trace captures stage order, versions, warnings, errors, and fallback. It is required for debugging and migration.

## Example Object

```ts
const trace: EngineLifecycleTrace = {
  id: 'trace-001',
  createdAt: '2026-07-05T00:00:00.000Z',
  engineVersion: '0.1.0',
  stages: [{ name: 'decision', startedAt: '2026-07-05T00:00:01.000Z', inputRefs: ['reasoning-001'], outputRefs: ['decision-001'], warnings: [], errors: [], versions: { repository: '0.1.0' } }],
  finalStatus: 'preview_ready'
};
```

## Validation Rules

Every stage must include name, start time, inputs, outputs, and versions. Errors must be preserved.

## Versioning Notes

Trace format version belongs to SDK. Stage versions record module versions.

## Multi-Industry Example

Trace makes it possible to compare real estate, healthcare, restaurant, automotive, and education fixture lifecycles.
