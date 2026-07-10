# WebsiteArchetype

## Purpose

`WebsiteArchetype` is the universal strategy record that lets BuildEZ compose sites across industries. It must not be owned by a single industry. Industries may prefer, forbid, or override archetype defaults, but archetypes remain shared platform primitives.

## TypeScript Interfaces

```ts
export interface WebsiteArchetype {
  id: WebsiteArchetypeId;
  name: string;
  purpose: string;
  primaryConversionGoal: string;
  compatibleBusinessModels: string[];
  compatibleRevenueModels: string[];
  requiredSectionPatterns: string[];
  optionalSectionPatterns: string[];
  requiredTrustSignals: string[];
  requiredContentNeeds: string[];
  commonAssetNeeds: string[];
  forbiddenComponentPatterns: string[];
  mobileRequirements: string[];
  qualityChecks: string[];
  version: string;
  status: 'draft' | 'active' | 'deprecated';
}

export type WebsiteArchetypeId =
  | 'lead_generation'
  | 'brochure'
  | 'corporate'
  | 'portfolio'
  | 'ecommerce'
  | 'catalogue'
  | 'booking'
  | 'appointment'
  | 'marketplace'
  | 'directory'
  | 'event'
  | 'community'
  | 'ngo'
  | 'saas'
  | 'documentation'
  | 'knowledge_base'
  | 'blog_media'
  | 'landing_page'
  | 'restaurant_menu'
  | 'hotel_resort'
  | 'property_showcase'
  | 'product_launch'
  | 'recruitment'
  | 'investor_relations';
```

## Field Descriptions

`primaryConversionGoal` defines the dominant user action. `requiredSectionPatterns` and `optionalSectionPatterns` provide composition guidance. `requiredTrustSignals`, `requiredContentNeeds`, and `commonAssetNeeds` connect the archetype to business ontology. `forbiddenComponentPatterns` prevents genre errors. `qualityChecks` define critic expectations.

## Example Object

```ts
const appointmentArchetype: WebsiteArchetype = {
  id: 'appointment',
  name: 'Appointment',
  purpose: 'Convert visitors into scheduled visits or consultations.',
  primaryConversionGoal: 'book_appointment',
  compatibleBusinessModels: ['service', 'institution'],
  compatibleRevenueModels: ['appointment', 'booking'],
  requiredSectionPatterns: ['trust_hero', 'services_summary', 'availability_or_contact', 'faq'],
  optionalSectionPatterns: ['team_credentials', 'insurance_or_pricing', 'location'],
  requiredTrustSignals: ['credentials', 'reviews_or_proof', 'clear location'],
  requiredContentNeeds: ['service names', 'appointment method', 'contact details'],
  commonAssetNeeds: ['venue photo', 'team photo'],
  forbiddenComponentPatterns: ['generic_saas_pricing', 'unsupported_claim_wall'],
  mobileRequirements: ['primary CTA reachable in first two screens'],
  qualityChecks: ['has primary CTA', 'no fake claims', 'mobile booking usable'],
  version: '1.0',
  status: 'active'
};
```

## Cross-Industry Examples

- Real estate: `property_showcase` plus `lead_generation` for project enquiry and site visit booking.
- Healthcare: `appointment` for clinic visits with credential and compliance constraints.
- Restaurant: `restaurant_menu` plus `booking` for menu browsing and reservations.
- Education: `brochure` plus `lead_generation` or `application`-like patterns for admissions.
- Automotive: `catalogue` plus `booking` for vehicle inventory, test drives, or service appointments.

## Validation Rules

- Every archetype must define at least one required section pattern and one primary conversion goal.
- Required section patterns must exist in the Website Ontology.
- Forbidden component patterns must be enforced by the mapper or critic.
- Archetypes must not encode single-industry assumptions unless the archetype itself is industry-specific, such as `restaurant_menu` or `property_showcase`.

## Future Extension Notes

Future versions can add page-level information architecture, localization behavior, funnel stage variants, and analytics-informed ranking without replacing the archetype model.
