# CreativeIntelligenceProfile

## Purpose

Provider-agnostic art direction profile produced after Design Engine and before future Component, Composition, Media, and Motion systems.

## TypeScript Shape

```ts
export interface CreativeIntelligenceProfile {
  id: string;
  version: string;
  inspiration: InspirationProfile;
  visualMood: VisualMoodProfile;
  mediaStrategy: MediaStrategy;
  motionStrategy: MotionStrategy;
  providerPolicy: {
    providerAgnostic: true;
    allowedProviders: string[];
    sourceOfTruth: 'buildez';
  };
  missingCreativeFacts: string[];
  confidence: number;
  warnings: string[];
}
```

## Rules

- BuildEZ owns creative strategy.
- Inspiration is metadata, not copying.
- Provider output must remain convertible to editable native Builder output.

## Examples

Real estate, healthcare, restaurant, automotive, education, hospitality, interior design, and D2C all share this contract; only mood, media, and motion requirements differ.

