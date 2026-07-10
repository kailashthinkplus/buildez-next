# ResolverResult

Deprecated compatibility specification. Future phases should use `DecisionPlan` from the Decision Engine. Keep this document only for older skeleton code and migration context.

## TypeScript Interfaces

```ts
export interface ResolverResult {
  selectedArchetype: string;
  selectedSectionPatterns: string[];
  selectedComponentVariants: string[];
  selectedDesignLanguage: string;
  selectedDesignTokens: string;
  compositionRules: string[];
  assetStrategy: string[];
  ctaStrategy: string[];
  seoRequirements: string[];
  qaRules: string[];
  repairRules: string[];
  conflicts: ResolverConflict[];
  fallbacks: ResolverFallback[];
  confidence: number;
  explanations: string[];
}

export interface ResolverConflict { id: string; message: string; candidates: string[]; resolution?: string; }
export interface ResolverFallback { id: string; reason: string; selectedFallback: string; risk: string; }
```

## Field Descriptions

The resolver result was the engine's old selection report. The future selection report is `DecisionPlan`.

Decision Engine should reference `ReasoningResult`, `PatternIntelligenceResult`, and `ExperienceStrategy` when committing strategy choices.

## Example Object

```ts
const result: ResolverResult = {
  selectedArchetype: 'catalogue',
  selectedSectionPatterns: ['inventory_hero', 'vehicle_grid', 'test_drive_cta'],
  selectedComponentVariants: ['VehicleGridEditable01'],
  selectedDesignLanguage: 'premium',
  selectedDesignTokens: 'tokens.automotive.premium.v1',
  compositionRules: ['avoid_three_card_grids'],
  assetStrategy: ['require_vehicle_images'],
  ctaStrategy: ['test_drive_primary'],
  seoRequirements: ['inventory_indexable'],
  qaRules: ['mobile_grid_legible'],
  repairRules: ['replace_dense_grid'],
  conflicts: [],
  fallbacks: [],
  confidence: 0.86,
  explanations: ['Automotive dealer inventory maps to catalogue archetype.']
};
```

## Validation Rules

Selected records must exist and be compatible. Confidence must be 0-1. Fallbacks must state risk.

## Versioning Notes

Record selected repository versions in lifecycle trace.

## Multi-Industry Example

ResolverResult can represent real estate property showcase, clinic appointment, restaurant menu, automotive catalogue, and education admissions selections.
