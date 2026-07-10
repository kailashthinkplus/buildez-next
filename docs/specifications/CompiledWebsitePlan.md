# CompiledWebsitePlan

## TypeScript Interfaces

```ts
export interface CompiledWebsitePlan {
  id: string;
  engineVersion: string;
  specVersion: string;
  decisionPlanId?: string;
  sections: CompiledSection[];
  design: { tokensId: string; responsiveProfile: string; densityProfile: string };
  assets: CompiledAssetRequirement[];
  seo: string[];
  accessibility: string[];
  ctaCadence: string[];
  mapperTargets: string[];
  qualityGates: string[];
  trace: string[];
}

export interface CompiledSection {
  id: string;
  sectionPatternId: string;
  componentVariantId: string;
  requiredProps: Record<string, unknown>;
  responsiveBehavior: string;
  editable: boolean;
}

export interface CompiledAssetRequirement { id: string; required: boolean; strategy: string; }
```

## Field Descriptions

This is the final pre-mapper plan. Sections include component assignments, props, responsive behavior, and editability.

Compiled plans should preserve references to content, experience, and pattern intelligence so simulation and critic can test whether the plan still matches the intended journey.

## Example Object

```ts
const plan: CompiledWebsitePlan = {
  id: 'compiled.education.admissions.001',
  engineVersion: '0.1.0',
  specVersion: '1.0',
  sections: [{ id: 'hero', sectionPatternId: 'admissions_hero', componentVariantId: 'HeroAdmissions01', requiredProps: { headline: 'Admissions Open' }, responsiveBehavior: 'stack_cta_first', editable: true }],
  design: { tokensId: 'tokens.education.trust.v1', responsiveProfile: 'mobile_first', densityProfile: 'medium' },
  assets: [{ id: 'campus_photo', required: true, strategy: 'request_or_use_provided' }],
  seo: ['program_schema'],
  accessibility: ['contrast_aa'],
  ctaCadence: ['hero', 'mid_page', 'final'],
  mapperTargets: ['native_builder_nodes'],
  qualityGates: ['mobile_cta_visible', 'no_fake_outcomes'],
  trace: ['compiled from decision plan']
};
```

## Validation Rules

Every section must be editable, mapped to an existing component, and include required props. Required assets must be satisfied or flagged.

## Versioning Notes

Compiled plans record engine, spec, decision, repository, mapper, and renderer versions.

## Multi-Industry Example

Plans differ by sections and props but share the same structure for property showcase, appointment, menu, catalogue, and admissions sites.
