# WebsiteOntology

## Purpose

`WebsiteOntology` defines universal website concepts used after business classification. It turns business ontology into composable archetypes, sections, and component patterns.

## TypeScript Interfaces

```ts
export interface WebsiteOntology {
  version: string;
  archetypes: WebsiteArchetypeRef[];
  sectionPatterns: SectionPatternRef[];
  componentPatterns: ComponentPatternRef[];
  conversionGoals: string[];
  antiPatterns: string[];
}

export interface WebsiteArchetypeRef { id: string; priority: number; reason: string; }
export interface SectionPatternRef { id: string; purpose: string; required: boolean; contentNeeds: string[]; assetNeeds: string[]; }
export interface ComponentPatternRef { id: string; sectionPatternId: string; editable: boolean; propsSchemaId: string; }
```

## Field Descriptions

`archetypes` define the site strategy. `sectionPatterns` define narrative units. `componentPatterns` define editable implementation choices. `antiPatterns` prevent wrong genre output, such as SaaS pricing blocks on a clinic, restaurant, or apartment project page.

## Example Object

```ts
const clinicWebsiteOntology: WebsiteOntology = {
  version: '1.0',
  archetypes: [{ id: 'appointment', priority: 1, reason: 'Primary goal is booking visits.' }],
  sectionPatterns: [
    { id: 'trust_hero', purpose: 'Establish care category and appointment CTA.', required: true, contentNeeds: ['specialty', 'location'], assetNeeds: ['clinic_photo'] },
    { id: 'provider_credentials', purpose: 'Satisfy trust model.', required: true, contentNeeds: ['doctors', 'credentials'], assetNeeds: ['doctor_photos'] }
  ],
  componentPatterns: [
    { id: 'hero_with_booking_cta', sectionPatternId: 'trust_hero', editable: true, propsSchemaId: 'HeroBookingProps' }
  ],
  conversionGoals: ['book_appointment'],
  antiPatterns: ['guaranteed_cure_claims', 'generic_saas_pricing']
};
```

## Cross-Industry Examples

- Real estate: property showcase archetype with project hero, gallery, location, enquiry CTA.
- Healthcare: appointment archetype with credentials, services, insurance/privacy, booking CTA.
- Restaurant: restaurant menu or booking archetype with menu, ambience, hours, reservation.
- Education: brochure/application archetype with programs, outcomes, faculty, admissions.
- Automotive: catalogue/booking archetype with inventory, finance, test drive, service appointment.

## Validation Rules

- Every required section pattern must map to at least one editable component pattern.
- Every component pattern must declare a props schema and editability.
- Anti-patterns inherited from business ontology must remain active.
- Conversion goals must align with the selected archetype.

## Future Extension Notes

The ontology can later support multi-page IA, personalization, localization, and conditional journeys without changing the universal pipeline.
