# Brand Intelligence Engine

## Purpose

Brand Intelligence decides who the business is. Design decides how that identity looks. This separation prevents the Design Engine from guessing personality from colors alone.

## Responsibilities

Model brand personality, voice, tone, emotional positioning, audience perception, trust posture, story angle, differentiation, premium level, energy level, local vs global positioning, brand risks, brand constraints, existing assets, and missing brand facts.

## Inputs

Business intelligence profile, uploaded brand assets, saved brand context, prompt tone, repository brand patterns, and known constraints.

## Output

`BrandIntelligenceProfile`.

## Multi-Industry Examples

- Real estate: luxury project can be calm, premium, trust-led, location-forward, and visually restrained.
- Healthcare: reassuring, credible, clear, accessible, and low-risk.
- Restaurant: sensory, inviting, ambience-led, menu-forward, and locality-aware.
- Automotive: performance, precision, reliability, service confidence, and authorization-safe.
- Education: aspirational, trustworthy, outcome-oriented without fake placement or exam claims.

## Failure Modes

- Confusing premium with dark colors or oversized type.
- Letting design tokens define brand personality.
- Using hype language where regulated trust is required.

## Implementation Guidance

Brand profile should feed `WebsiteDNA`, Design Engine, Content Intelligence, Experience Engine, and Pattern Intelligence. It should not emit CSS or components.
