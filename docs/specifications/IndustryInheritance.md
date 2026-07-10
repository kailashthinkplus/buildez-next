# IndustryInheritance

## Purpose

`IndustryInheritance` describes how business families, industries, and subindustries share and override generation rules. It prevents hardcoded generators by making inheritance explicit and testable.

## TypeScript Interfaces

```ts
export interface IndustryInheritance {
  version: string;
  family: IndustryInheritanceNode;
  industry: IndustryInheritanceNode;
  subIndustry?: IndustryInheritanceNode;
  resolvedRules: ResolvedIndustryRules;
  trace: InheritanceTraceEntry[];
}

export interface IndustryInheritanceNode {
  id: string;
  label: string;
  parentId?: string;
  defaults?: Partial<ResolvedIndustryRules>;
  overrides?: Partial<ResolvedIndustryRules>;
}

export interface ResolvedIndustryRules {
  preferredArchetypes: string[];
  forbiddenArchetypes: string[];
  requiredSectionPatterns: string[];
  forbiddenComponentPatterns: string[];
  trustSignals: string[];
  contentNeeds: string[];
  assetNeeds: string[];
  complianceNeeds: string[];
  localityNeed: string;
}

export interface InheritanceTraceEntry {
  sourceId: string;
  field: keyof ResolvedIndustryRules;
  operation: 'default' | 'append' | 'override' | 'forbid';
  value: string | string[];
}
```

## Field Descriptions

`family`, `industry`, and `subIndustry` preserve hierarchy. `resolvedRules` is the merged output consumed by planning, composition, mapping, and critique. `trace` explains why a rule exists.

## Example Object

```ts
const evDealerInheritance: IndustryInheritance = {
  version: '1.0',
  family: { id: 'automotive', label: 'Automotive', defaults: { preferredArchetypes: ['catalogue', 'booking'], trustSignals: ['warranty', 'reviews'], localityNeed: 'dealer_or_service_area' } },
  industry: { id: 'dealer', label: 'Dealer', parentId: 'automotive', overrides: { requiredSectionPatterns: ['inventory_grid', 'finance_options', 'test_drive_cta'] } },
  subIndustry: { id: 'ev_dealer', label: 'EV Dealer', parentId: 'dealer', overrides: { contentNeeds: ['range', 'charging', 'incentives'], complianceNeeds: ['incentive accuracy'] } },
  resolvedRules: {
    preferredArchetypes: ['catalogue', 'booking'],
    forbiddenArchetypes: [],
    requiredSectionPatterns: ['inventory_grid', 'finance_options', 'test_drive_cta'],
    forbiddenComponentPatterns: ['fake_discount_badges'],
    trustSignals: ['warranty', 'reviews'],
    contentNeeds: ['range', 'charging', 'incentives'],
    assetNeeds: ['vehicle_images'],
    complianceNeeds: ['incentive accuracy'],
    localityNeed: 'dealer_or_service_area'
  },
  trace: [{ sourceId: 'ev_dealer', field: 'contentNeeds', operation: 'append', value: ['range', 'charging', 'incentives'] }]
};
```

## Cross-Industry Examples

- Real estate inherits locality and visual proof, then apartment projects add floor plans and configuration.
- Healthcare inherits compliance caution, then dental clinics add insurance and provider credentials.
- Restaurant inherits venue/menu/location, then fine dining adds reservation and ambience emphasis.
- Education inherits outcomes/programs, then admissions sites add timeline and application CTA.
- Automotive inherits inventory/service, then EV dealers add charging and incentive accuracy.

## Validation Rules

- Every node except a root family must reference a valid parent.
- Overrides must be additive or explicit replacements; silent mutation is forbidden.
- Resolved rules must include trace entries for inherited and overridden critical fields.
- Hard compliance and anti-pattern rules cannot be removed by a child unless an explicit governance exception exists.

## Future Extension Notes

Later versions can support region-specific inheritance, franchise constraints, language variants, and seasonal campaigns.
