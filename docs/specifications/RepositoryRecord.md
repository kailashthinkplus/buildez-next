# RepositoryRecord

## TypeScript Interfaces

```ts
export interface RepositoryRecord<TPayload = unknown> {
  id: string;
  kind: RepositoryRecordKind;
  version: string;
  status: 'draft' | 'active' | 'deprecated';
  title: string;
  description: string;
  compatibleIndustries: string[];
  compatibleArchetypes: string[];
  tags: string[];
  payload: TPayload;
  provenance: { source: 'buildez' | 'fixture' | 'learned' | 'imported'; notes?: string };
  quality: { confidence: number; fixtureCoverage: string[] };
}

export type RepositoryRecordKind =
  | 'business-family'
  | 'industry'
  | 'subindustry'
  | 'archetype'
  | 'pattern'
  | 'component'
  | 'design-language'
  | 'tokens'
  | 'composition-rule'
  | 'constraint'
  | 'asset-rule'
  | 'qa-rule'
  | 'repair-rule'
  | 'fixture'
  | 'example'
  | 'anti-pattern';
```

## Field Descriptions

Records are versioned, scoped, queryable, and ranked later. `payload` contains the typed domain object. `quality.fixtureCoverage` records which fixture families prove the record.

## Example Object

```ts
const bookingPattern: RepositoryRecord = {
  id: 'pattern.booking.primary-cta',
  kind: 'pattern',
  version: '1.0.0',
  status: 'active',
  title: 'Primary Booking CTA',
  description: 'Reusable booking conversion pattern.',
  compatibleIndustries: ['healthcare', 'restaurant', 'automotive', 'education', 'real_estate'],
  compatibleArchetypes: ['booking', 'appointment', 'lead_generation'],
  tags: ['cta', 'conversion'],
  payload: { requiredFields: ['label', 'destination'] },
  provenance: { source: 'buildez' },
  quality: { confidence: 0.8, fixtureCoverage: ['clinic', 'restaurant', 'dealer'] }
};
```

## Validation Rules

IDs must be stable. Deprecated records cannot be selected unless explicitly allowed by migration. Fixture coverage must be honest.

## Versioning Notes

Record versions change when payload or compatibility changes. Consumers record selected versions in `EngineLifecycleTrace`.

## Multi-Industry Example

One booking CTA record can support clinic appointment, restaurant reservation, automotive service booking, education campus tour, and real estate site visit flows.
