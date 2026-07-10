# ConstraintRule

## TypeScript Interfaces

```ts
export interface ConstraintRule {
  id: string;
  version: string;
  scope: ConstraintScope;
  severity: ConstraintSeverity;
  description: string;
  appliesTo: string[];
  condition: ConstraintCondition;
  repairHint: ConstraintRepairHint;
}

export type ConstraintScope = 'global' | 'industry' | 'archetype' | 'section' | 'component' | 'asset' | 'renderer';
export type ConstraintSeverity = 'blocker' | 'major' | 'minor' | 'info';
export interface ConstraintCondition { type: string; requiredFacts?: string[]; forbiddenClaims?: string[]; maxCount?: number; }
export interface ConstraintRepairHint { action: string; target?: string; message: string; }
```

## Field Descriptions

`scope` prevents rules from leaking across contexts. `severity` determines whether output blocks. `condition` is typed rule data, not arbitrary prompt text.

## Example Object

```ts
const noFakeHealthcareDoctors: ConstraintRule = {
  id: 'healthcare.no_fake_doctors',
  version: '1.0',
  scope: 'industry',
  severity: 'blocker',
  description: 'Do not fabricate doctors or certifications.',
  appliesTo: ['healthcare'],
  condition: { type: 'forbidden_claims', forbiddenClaims: ['doctor name', 'certification'] },
  repairHint: { action: 'request_fact_or_remove_claim', message: 'Use provided provider facts or omit provider claims.' }
};
```

## Validation Rules

Every blocker requires a repair hint. Industry-scoped constraints must declare `appliesTo`. Conditions must be machine-evaluable.

## Versioning Notes

Rule changes can alter output quality, so selected rule versions must be logged.

## Multi-Industry Example

Rules cover fake RERA/prices for real estate, fake doctors for healthcare, invented menu prices for restaurants, unauthorized brand claims for automotive, and fake placement data for education.
