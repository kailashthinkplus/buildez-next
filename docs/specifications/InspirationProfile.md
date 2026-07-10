# InspirationProfile

## Purpose

Defines safe inspiration metadata.

```ts
export interface InspirationProfile {
  id: string;
  version: string;
  themes: string[];
  referenceCategories: string[];
  suitableTerritories: string[];
  unsuitableTerritories: string[];
  doNotCopyRules: string[];
  missingInspirationFacts: string[];
  confidence: number;
}
```

## Examples

- Real estate: editorial project brochure, location storytelling.
- Healthcare: clinical reassurance.
- Restaurant: warm hospitality ambience.
- Automotive: precision engineering.
- Education: aspirational admissions.
- Hospitality: destination storytelling.
- Interior design: material-led portfolio.
- D2C: product-led campaign clarity.

