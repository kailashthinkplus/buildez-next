# AiV10OrchestrationContract

## TypeScript Interfaces

```ts
export interface AiV10OrchestrationContract {
  requestId: string;
  mode: 'shadow' | 'flagged' | 'production';
  prompt: string;
  contextRefs: string[];
  allowedEngineVersion: string;
  fallback: { enabled: boolean; target: 'ai-v9'; reason?: string };
}

export interface AiV10OrchestrationResult {
  requestId: string;
  engineTraceId?: string;
  status: 'completed' | 'fallback' | 'blocked';
  fallbackUsed?: boolean;
  summary: string;
}
```

## Field Descriptions

`ai-v10` orchestrates the Website Engine. It does not own product design, repository logic, mapping, rendering, critic, or repair. Fallback to `ai-v9` must remain explicit during migration.

## Example Object

```ts
const request: AiV10OrchestrationContract = {
  requestId: 'req-001',
  mode: 'shadow',
  prompt: 'Create a clinic appointment website',
  contextRefs: ['tenant-profile'],
  allowedEngineVersion: '0.1.0',
  fallback: { enabled: true, target: 'ai-v9' }
};
```

## Validation Rules

Fallback must be enabled until quality gates permit rollout. Mode must be explicit. `ai-v10` must call engine contracts rather than invent builder nodes.

## Versioning Notes

Contract versions change when orchestration modes, fallback policy, or engine request shape changes.

## Multi-Industry Example

The same orchestration request shape covers real estate, healthcare, restaurant, automotive, and education prompts.
