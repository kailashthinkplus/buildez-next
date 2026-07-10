# ExperienceStrategy

## Purpose

Defines journey and rhythm before composition.

## TypeScript Interfaces

```ts
export interface ExperienceStrategy {
  version: string;
  journeyStages: string[];
  attentionCurve: string[];
  trustCurve: string[];
  ctaCadence: string[];
  proofPlacement: string[];
  contentDensityCurve: string[];
  mediaRhythm: string[];
  interactionRhythm: string[];
  scrollNarrative: string[];
  mobileJourney: string[];
  conversionFrictionPoints: string[];
}
```

## Field Descriptions

The strategy controls emotional and practical flow across desktop and mobile.

## Example Object

```ts
const experience: ExperienceStrategy = {
  version: '1.0',
  journeyStages: ['aspiration', 'program fit', 'proof', 'admissions'],
  attentionCurve: ['strong hero', 'medium program scan', 'calm proof'],
  trustCurve: ['faculty', 'outcomes with evidence'],
  ctaCadence: ['hero enquiry', 'admissions section', 'final CTA'],
  proofPlacement: ['before admissions CTA'],
  contentDensityCurve: ['low', 'medium', 'medium', 'low'],
  mediaRhythm: ['campus image', 'program cards', 'faculty'],
  interactionRhythm: ['low motion', 'clear forms'],
  scrollNarrative: ['why this school', 'what programs', 'how to apply'],
  mobileJourney: ['CTA reachable early'],
  conversionFrictionPoints: ['fees', 'eligibility']
};
```

## Validation Rules

CTA cadence, proof placement, mobile journey, and friction points are required.

## Versioning Notes

Version changes when journey modeling changes.

## Multi-Industry Examples

Real estate aspiration-to-site-visit, healthcare trust-to-appointment, restaurant ambience-to-reservation, automotive browse-to-test-drive, education aspiration-to-admissions.

## Failure Modes

Monotone layout; CTA too early/late; mobile journey ignored.

## Future Extensions

Behavioral analytics feedback and multi-page journey planning.
