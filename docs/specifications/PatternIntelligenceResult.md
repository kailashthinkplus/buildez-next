# PatternIntelligenceResult

## Purpose

Records semantic pattern reasoning before component selection.

## TypeScript Interfaces

```ts
export interface PatternIntelligenceResult {
  version: string;
  selectedPatterns: PatternDecision[];
  rejectedPatterns: PatternDecision[];
  conflicts: string[];
  overuseWarnings: string[];
  journeyRationale: string[];
  confidence: number;
}

export interface PatternDecision {
  patternId: string;
  reason: string;
  satisfies: string[];
  risks: string[];
}
```

## Field Descriptions

Selected and rejected patterns preserve why Reasoning and the Decision Engine receive certain semantic options.

## Example Object

```ts
const result: PatternIntelligenceResult = {
  version: '1.0',
  selectedPatterns: [{ patternId: 'booking_path', reason: 'Supports appointment conversion.', satisfies: ['conversion'], risks: [] }],
  rejectedPatterns: [{ patternId: 'pricing_table', reason: 'Wrong genre for clinic trust.', satisfies: [], risks: ['generic SaaS pattern'] }],
  conflicts: [],
  overuseWarnings: [],
  journeyRationale: ['Trust before appointment CTA.'],
  confidence: 0.8
};
```

## Validation Rules

Every decision needs reason and risks. Confidence is 0-1.

## Versioning Notes

Version changes when pattern taxonomy changes.

## Multi-Industry Examples

Project Showcase, Provider Proof Stack, Menu Preview, Comparison Section, and Outcome Proof are peer pattern decisions across industries.

## Failure Modes

Template matching; unexplained pattern rejection; overused card grids.

## Future Extensions

Learned pattern ranking and cross-page pattern systems.
