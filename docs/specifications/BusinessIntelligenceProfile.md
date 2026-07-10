# BusinessIntelligenceProfile

## Purpose

Represents universal business understanding before `WebsiteSpec`.

## TypeScript Interfaces

```ts
export interface BusinessIntelligenceProfile {
  version: string;
  identity: { name?: string; summary: string };
  businessFamily: string;
  industry?: string;
  subindustry?: string;
  businessModel: string;
  revenueModel: string;
  offerModel: string[];
  customerTypes: string[];
  buyerJourney: string[];
  differentiation: string[];
  trustSignals: string[];
  objections: string[];
  competitivePositioning?: string;
  localityNeeds: string[];
  complianceNeeds: string[];
  proofNeeds: string[];
  conversionGoals: string[];
  missingBusinessFacts: string[];
  confidence: number;
}
```

## Field Descriptions

Fields separate what the business is, how it earns, who it serves, why customers trust it, and what the website must convert.

## Example Object

```ts
const profile: BusinessIntelligenceProfile = {
  version: '1.0',
  identity: { summary: 'Local clinic offering appointment-led care.' },
  businessFamily: 'healthcare',
  industry: 'clinic',
  businessModel: 'service',
  revenueModel: 'appointment',
  offerModel: ['consultation'],
  customerTypes: ['local patients'],
  buyerJourney: ['trust', 'service fit', 'appointment'],
  differentiation: ['clear care access'],
  trustSignals: ['credentials needed'],
  objections: ['privacy', 'availability'],
  localityNeeds: ['clinic location'],
  complianceNeeds: ['no cure guarantees'],
  proofNeeds: ['provider credentials'],
  conversionGoals: ['book appointment'],
  missingBusinessFacts: ['doctor names'],
  confidence: 0.72
};
```

## Validation Rules

Business family, model, revenue model, conversion goals, missing facts, and confidence are required. Confidence is 0-1.

## Versioning Notes

Version changes when field semantics or confidence rules change.

## Multi-Industry Examples

Real estate, healthcare, restaurant, automotive, and education differ in trust/proof/compliance but share the same structure.

## Failure Modes

Industry label treated as sufficient; fake proof inserted; missing facts hidden.

## Future Extensions

Add regional compliance, competitive data, and multi-location business models.
