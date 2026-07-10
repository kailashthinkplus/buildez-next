# BusinessOntology

## Purpose

`BusinessOntology` describes the universal business facts BuildEZ needs before selecting a website archetype. It is industry-agnostic and should work for real estate, healthcare, restaurant, education, automotive, and future verticals.

## TypeScript Interfaces

```ts
export interface BusinessOntology {
  version: string;
  businessFamily: BusinessFamily;
  industry: IndustryNode;
  subIndustry?: IndustryNode;
  businessModel: BusinessModel;
  revenueModel: RevenueModel;
  customerJourney: CustomerJourneyStage[];
  trustModel: TrustModel;
  conversionGoals: ConversionGoal[];
  localityNeed: LocalityNeed;
  complianceNeeds: ComplianceNeed[];
  contentNeeds: ContentNeed[];
  assetNeeds: AssetNeed[];
}

export interface BusinessFamily { id: string; name: string; defaultArchetypes: string[]; }
export interface IndustryNode { id: string; name: string; inheritsFrom?: string; overrides?: string[]; }
export type BusinessModel = 'service' | 'venue' | 'product' | 'marketplace' | 'institution' | 'publisher' | 'portfolio' | 'nonprofit';
export type RevenueModel = 'lead' | 'booking' | 'appointment' | 'transaction' | 'subscription' | 'donation' | 'tuition' | 'retainer' | 'quote';
export type CustomerJourneyStage = 'awareness' | 'comparison' | 'proof' | 'conversion' | 'retention';
export interface TrustModel { requiredProof: string[]; forbiddenClaims: string[]; trustSignals: string[]; }
export interface ConversionGoal { id: string; action: string; priority: 'primary' | 'secondary'; }
export interface LocalityNeed { scope: 'none' | 'local' | 'multi_location' | 'destination' | 'project_site' | 'service_area'; requiredFields: string[]; }
export interface ComplianceNeed { id: string; severity: 'hard' | 'soft'; rule: string; }
export interface ContentNeed { id: string; required: boolean; fields: string[]; }
export interface AssetNeed { id: string; required: boolean; kind: string; reason: string; }
```

## Field Descriptions

`businessFamily`, `industry`, and `subIndustry` provide inheritance. `businessModel` and `revenueModel` explain how the site should convert. `customerJourney`, `trustModel`, and `conversionGoals` drive page narrative. `localityNeed`, `complianceNeeds`, `contentNeeds`, and `assetNeeds` constrain what the engine may render.

## Example Object

```ts
const apartmentProjectOntology: BusinessOntology = {
  version: '1.0',
  businessFamily: { id: 'real_estate', name: 'Real Estate', defaultArchetypes: ['lead_generation', 'property_showcase'] },
  industry: { id: 'residential_developer', name: 'Residential Developer', inheritsFrom: 'real_estate' },
  subIndustry: { id: 'apartment_project', name: 'Apartment Project', inheritsFrom: 'residential_developer' },
  businessModel: 'product',
  revenueModel: 'lead',
  customerJourney: ['awareness', 'comparison', 'proof', 'conversion'],
  trustModel: { requiredProof: ['location', 'developer credibility'], forbiddenClaims: ['fake approvals'], trustSignals: ['site visit', 'brochure'] },
  conversionGoals: [{ id: 'site_visit', action: 'Book site visit', priority: 'primary' }],
  localityNeed: { scope: 'project_site', requiredFields: ['city', 'neighborhood'] },
  complianceNeeds: [{ id: 'approval_truth', severity: 'hard', rule: 'Do not invent registration or approval numbers.' }],
  contentNeeds: [{ id: 'configuration', required: true, fields: ['unit types', 'status'] }],
  assetNeeds: [{ id: 'hero_project_image', required: true, kind: 'project_image', reason: 'Property must be inspectable.' }]
};
```

## Cross-Industry Examples

- Real estate: project-site locality, visual proof, lead enquiry, compliance caution.
- Healthcare: local appointment, physician credentials, medical privacy, no guaranteed outcomes.
- Restaurant: venue locality, menu content, reservation or order conversion, ambience assets.
- Education: programs, admissions journey, faculty/outcomes trust, tuition or application conversion.
- Automotive: inventory or service model, test drive/booking, warranty trust, vehicle imagery.

## Validation Rules

- `businessFamily`, `industry`, `businessModel`, `revenueModel`, and at least one `conversionGoal` are required.
- Required compliance rules must block unsupported claims.
- Required content and asset needs must either be satisfied or listed as missing facts/assets.
- Subindustry overrides must reference a valid parent.

## Future Extension Notes

Add richer regional compliance, seasonal demand, B2B/B2C split, franchise models, and multi-brand ownership only after the base ontology is fixture-tested across at least five industries.
