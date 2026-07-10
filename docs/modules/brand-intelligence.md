# Brand Intelligence Module

## Purpose

Model who the business is before Design decides how it looks.

## Responsibilities

Capture personality, voice, tone, emotional position, audience perception, trust posture, story angle, differentiation, premium level, energy, local/global posture, brand risks, constraints, assets, and missing facts.

## Inputs

Business intelligence profile, brand assets, prompt, saved brand context, repository brand records.

## Outputs

`BrandIntelligenceProfile` and trace decisions.

## Public Interface

`runBrandIntelligence(input): EngineResult<BrandIntelligenceProfile>`.

## Dependencies

SDK, business intelligence, repository, trace.

## Lifecycle

Runs after Business Intelligence and before Content, Experience, Pattern Intelligence, `WebsiteDNA`, and Design.

## Example Flow

Luxury real estate, healthcare, restaurant, automotive, and education brands differ in tone and risk while sharing the same profile shape.

## Known Limitations

Does not emit design tokens, CSS, or components.
