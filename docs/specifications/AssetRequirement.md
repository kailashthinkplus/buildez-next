# AssetRequirement

## Purpose

`AssetRequirement` is a typed contract used by the BuildEZ Website Engine. It should be serializable, validated at module boundaries, and logged when it affects generated output.

## TypeScript Example

```ts
interface AssetRequirement {
  id: string;
  sectionId: string;
  kind: 'hero_image' | 'gallery_image' | 'logo' | 'map' | 'floor_plan' | 'trust_badge';
  required: boolean;
  acceptableFallback: 'none' | 'neutral_pattern' | 'map_placeholder' | 'user_upload_needed';
  reason: string;
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

