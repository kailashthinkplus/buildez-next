# BrandIntelligenceProfile

## Purpose

Captures brand identity separately from visual design.

## TypeScript Interfaces

```ts
export interface BrandIntelligenceProfile {
  version: string;
  personality: string[];
  voice: string;
  tone: string;
  emotionalPositioning: string[];
  audiencePerception: string[];
  trustPosture: string;
  storyAngle: string;
  differentiation: string[];
  premiumLevel: 'budget' | 'accessible' | 'premium' | 'luxury';
  energyLevel: 'calm' | 'balanced' | 'dynamic';
  localityPositioning: 'local' | 'regional' | 'global';
  brandRisks: string[];
  brandConstraints: string[];
  existingBrandAssets: string[];
  missingBrandFacts: string[];
}
```

## Field Descriptions

Brand profile defines identity, voice, risk, and perception. Design tokens consume this later.

## Example Object

```ts
const brand: BrandIntelligenceProfile = {
  version: '1.0',
  personality: ['reassuring', 'credible'],
  voice: 'clear',
  tone: 'calm',
  emotionalPositioning: ['safe care'],
  audiencePerception: ['trusted local provider'],
  trustPosture: 'credentials-first',
  storyAngle: 'accessible specialist care',
  differentiation: ['clear appointment path'],
  premiumLevel: 'accessible',
  energyLevel: 'calm',
  localityPositioning: 'local',
  brandRisks: ['unsupported medical claims'],
  brandConstraints: ['plain-language copy'],
  existingBrandAssets: [],
  missingBrandFacts: ['logo'],
};
```

## Validation Rules

Tone, trust posture, premium level, energy level, risks, constraints, and missing facts are required.

## Versioning Notes

Version changes when brand taxonomy changes.

## Multi-Industry Examples

Luxury real estate is calm/premium; healthcare is reassuring; restaurant is sensory; automotive is precise; education is aspirational.

## Failure Modes

Design tokens masquerade as brand; hype overrides compliance; missing assets ignored.

## Future Extensions

Brand archetypes, brand-asset analysis, and localization.
