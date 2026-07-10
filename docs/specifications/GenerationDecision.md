# GenerationDecision

## Purpose

Captures one explainable decision made by the Website Engine.

## TypeScript Interfaces

```ts
export interface GenerationDecision {
  id: string;
  stage: string;
  selected: string[];
  rejected: string[];
  rationale: string;
  inputs: string[];
  outputs: string[];
  confidence: number;
  warnings: string[];
}
```

## Field Descriptions

Decision records selected/rejected options, why, and the confidence of that stage.

## Example Object

```ts
const decision: GenerationDecision = {
  id: 'decision_pattern_001',
  stage: 'pattern_intelligence',
  selected: ['menu_preview', 'booking_path'],
  rejected: ['pricing_table'],
  rationale: 'Restaurant conversion requires menu and reservation, not SaaS pricing.',
  inputs: ['ContentStrategy'],
  outputs: ['PatternIntelligenceResult'],
  confidence: 0.84,
  warnings: []
};
```

## Validation Rules

Stage, rationale, inputs, outputs, and confidence are required.

## Versioning Notes

Decision shape should remain stable for replay.

## Multi-Industry Examples

Works for project showcase, clinic appointment, restaurant booking, vehicle catalogue, and admissions strategy decisions.

## Failure Modes

Decision lacks rejected alternatives or rationale.

## Future Extensions

Human review annotations and ranking feedback.
