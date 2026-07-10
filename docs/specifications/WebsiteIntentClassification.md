# WebsiteIntentClassification

## Purpose

`WebsiteIntentClassification` is a typed contract used by the BuildEZ Website Engine. It should be serializable, validated at module boundaries, and logged when it affects generated output.

Intent classification is a hypothesis, not a generation plan. Business Intelligence must refine it before WebsiteSpec.

## TypeScript Example

```ts
interface WebsiteIntentClassification {
  version: '1.0';
  industry: 'real_estate' | string;
  subIndustry?: string;
  businessType: string;
  primaryGoal: 'lead_generation' | 'booking' | 'portfolio' | 'commerce' | 'brochure';
  audience: string[];
  requestedDeliverable: 'single_page' | 'multi_page' | 'section' | 'unknown';
  confidence: number;
  missingFacts: string[];
}
```

## Validation Rules

- Required fields must be present before downstream modules execute.
- Confidence must be numeric and bounded from 0 to 1 where applicable.
- Missing facts must remain explicit and must not be converted into fake claims.
- Industry anti-patterns should be enforced by schema-aware validation or critic checks.

## Real Estate Example

Real estate developer example: a premium residential project lead-generation site uses Hero, Project Showcase, Amenities, Gallery, Location, FAQ, and CTA sections; requires real project/location/configuration facts; forbids SaaS pricing tables, generic feature cards, placeholder claims, and fake availability.

## Implementation Notes

Interfaces in this document are illustrative contracts. Production code should place versioned types near the owning engine module and keep migrations explicit.
