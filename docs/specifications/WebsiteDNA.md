# WebsiteDNA

## Purpose

Captures coherent website identity across pages and edits.

## TypeScript Interfaces

```ts
export interface WebsiteDNA {
  version: string;
  businessProfileRef?: string;
  brandProfileRef?: string;
  contentStrategyRef?: string;
  experienceStrategyRef?: string;
  visualIdentity: string[];
  contentIdentity: string[];
  conversionIdentity: string[];
  interactionIdentity: string[];
  trustIdentity: string[];
  localityIdentity: string[];
  assetIdentity: string[];
  seoIdentity: string[];
}
```

## Field Descriptions

DNA references intelligence outputs and summarizes durable identity for future edits.

## Example Object

```ts
const dna: WebsiteDNA = {
  version: '1.0',
  visualIdentity: ['calm premium'],
  contentIdentity: ['trust-led'],
  conversionIdentity: ['site visit'],
  interactionIdentity: ['low motion'],
  trustIdentity: ['verified proof only'],
  localityIdentity: ['location-forward'],
  assetIdentity: ['real project imagery required'],
  seoIdentity: ['local project search']
};
```

## Validation Rules

Identity arrays must not contain fake facts and should reference trace decisions when derived.

## Versioning Notes

Version changes when identity taxonomy changes.

## Multi-Industry Examples

Real estate, healthcare, restaurant, automotive, and education DNA differ in trust, locality, content, and conversion identity.

## Failure Modes

DNA duplicates every spec field or invents brand facts.

## Future Extensions

Multi-page consistency and post-edit DNA updates.
