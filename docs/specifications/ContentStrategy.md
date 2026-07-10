# ContentStrategy

## Purpose

Defines content strategy before copywriting.

## TypeScript Interfaces

```ts
export interface ContentStrategy {
  version: string;
  messageHierarchy: string[];
  headlineStrategy: string;
  sectionMessagingRoles: Record<string, string>;
  ctaStrategy: string[];
  proofStrategy: string[];
  faqStrategy: string[];
  seoContentStrategy: string[];
  trustCopyRules: string[];
  objectionHandling: string[];
  localityContent: string[];
  complianceCopyRules: string[];
  missingContentFacts: string[];
  truthPolicy: string[];
}
```

## Field Descriptions

Strategy defines what must be said, why, where, and under which truth constraints.

## Example Object

```ts
const strategy: ContentStrategy = {
  version: '1.0',
  messageHierarchy: ['menu', 'ambience', 'location', 'reservation'],
  headlineStrategy: 'lead with dining experience and locality',
  sectionMessagingRoles: { hero: 'set appetite and mood' },
  ctaStrategy: ['reserve table'],
  proofStrategy: ['reviews if provided'],
  faqStrategy: ['hours', 'dietary', 'parking'],
  seoContentStrategy: ['cuisine', 'neighborhood'],
  trustCopyRules: ['no fake awards'],
  objectionHandling: ['availability', 'price clarity'],
  localityContent: ['address', 'nearby context'],
  complianceCopyRules: ['no unsupported dietary claims'],
  missingContentFacts: ['menu prices'],
  truthPolicy: ['omit prices unless provided']
};
```

## Validation Rules

Truth policy and missing facts are mandatory. Copy rules must block unsupported claims.

## Versioning Notes

Version changes when messaging roles or truth policy semantics change.

## Multi-Industry Examples

Healthcare credentials before CTA, restaurant menu early, education admissions path, automotive inventory/booking, real estate location/project/site visit.

## Failure Modes

Copy written before strategy; fake claims; generic FAQs.

## Future Extensions

Copy brief generation, localization, structured SEO entities.
