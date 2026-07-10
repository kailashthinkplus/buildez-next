# SimulationResult

## TypeScript Interfaces

```ts
export interface SimulationResult {
  passed: boolean;
  score: number;
  breakpoints: BreakpointSimulation[];
  issues: SimulationIssue[];
  assetReadiness: number;
  editabilityRisk: number;
  rendererParityRisk: number;
  repairHints: string[];
}

export interface BreakpointSimulation {
  breakpoint: 'desktop' | 'tablet' | 'mobile';
  structureScore: number;
  ctaReachable: boolean;
  overflowRisk: number;
}

export interface SimulationIssue {
  severity: 'blocker' | 'major' | 'minor';
  category: 'layout' | 'asset' | 'accessibility' | 'seo' | 'performance' | 'parity' | 'editability';
  message: string;
  targetId?: string;
}
```

## Field Descriptions

Simulation predicts pre-preview risk. `score` is 0-100. Parity and editability risks are explicit because generated output must remain native and preview must match publish.

## Example Object

```ts
const simulation: SimulationResult = {
  passed: false,
  score: 78,
  breakpoints: [{ breakpoint: 'mobile', structureScore: 70, ctaReachable: false, overflowRisk: 0.4 }],
  issues: [{ severity: 'major', category: 'layout', message: 'Primary CTA may not appear in first two mobile screens.', targetId: 'hero' }],
  assetReadiness: 0.8,
  editabilityRisk: 0.1,
  rendererParityRisk: 0.2,
  repairHints: ['Move primary CTA into mobile hero summary.']
};
```

## Validation Rules

Scores must be bounded. Blockers make `passed` false. Every issue should include category and severity.

## Versioning Notes

Simulation results record compiler, mapper, renderer contract, and simulation engine versions.

## Multi-Industry Example

Simulation checks mobile CTAs for real estate, appointment reachability for healthcare, menu stacking for restaurants, inventory density for automotive, and timeline readability for education.
