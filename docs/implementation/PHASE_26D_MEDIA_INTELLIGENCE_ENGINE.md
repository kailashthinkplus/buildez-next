# Phase 26D Media Intelligence Engine

## Objective

Implement deterministic local Media Intelligence.

Media Intelligence answers what media assets the website needs, which must be real, which can later be substituted or treated as provider candidates, and what the risk is. It does not generate media, upload assets, fetch media, create Builder nodes, call providers, call LLMs, use a database, use the network, or wire into production.

## Scope

Created `apps/web-app/modules/builder-v2/website-engine/media-intelligence/` with:

- `MediaIntelligenceEngine.ts`
- `mediaStrategy.ts`
- `mediaNeeds.ts`
- `assetRequirements.ts`
- `assetReadiness.ts`
- `assetSubstitution.ts`
- `assetTruthPolicy.ts`
- `imageNeeds.ts`
- `videoNeeds.ts`
- `iconNeeds.ts`
- `mapNeeds.ts`
- `threeDNeeds.ts`
- `mediaRisks.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`

Updated the Website Engine barrel export to expose the inert Media Intelligence module.

## Contracts Added

- `MediaInput`
- `MediaStrategy`
- `MediaNeed`
- `MediaAssetRequirement`
- `MediaReadinessScore`
- `MediaSubstitutionPolicy`
- `MediaTruthPolicy`
- `ImageNeed`
- `VideoNeed`
- `IconNeed`
- `MapNeed`
- `ThreeDNeed`
- `MediaRisk`
- `MediaConfidence`
- `MediaMetrics`
- `MediaWarning`

Inputs may include Business Intelligence, Brand Intelligence, Content Strategy, Experience Strategy, Pattern Intelligence, Inspiration Profile, Visual Mood Profile, Design Result, known assets, missing assets, repository records, and graph context.

## Helpers Added

- `runMediaIntelligence()`
- `buildMediaStrategy()`
- `inferMediaNeeds()`
- `inferImageNeeds()`
- `inferVideoNeeds()`
- `inferIconNeeds()`
- `inferMapNeeds()`
- `inferThreeDNeeds()`
- `buildAssetRequirements()`
- `scoreAssetReadiness()`
- `buildSubstitutionPolicy()`
- `buildMediaTruthPolicy()`
- `detectMediaRisks()`
- `scoreMediaConfidence()`
- `validateMediaStrategy()`
- `runMediaIntelligenceVerification()`

## Output

`runMediaIntelligence()` returns `EngineResult<MediaStrategy>` with:

- required images
- required videos
- icons
- maps
- 3D/interactive needs
- asset requirements
- asset readiness
- truth policy
- substitution policy
- AI-generated suitability notes
- real-asset requirements
- stock-risk warnings
- missing assets
- risks
- confidence
- warnings
- trace metadata

## Industry Coverage

- Real estate: exterior/render, amenities, interiors, floor plans, location map, walkthrough.
- Healthcare: clinic photos, doctors/team only if provided, equipment, services, map.
- Restaurant: food photos, ambience, menu, location, reservation support.
- Automotive: workshop/service bays, vehicle images, before-after only if provided, authorization caution.
- Education: campus, faculty only if provided, course/program visuals, location.
- D2C: product packshots, detail shots, lifestyle support, shipping/returns icons.
- Hospitality: rooms, amenities, destination/location, optional destination loop.
- Interior/architecture: portfolio, process/materials, consultation visuals, optional material board.

## Verification

Ran:

```sh
pnpm --dir apps/web-app typecheck:builder
```

Status: passed.

## Safety

- `ai-v9` untouched by this phase.
- Builder behavior untouched by this phase.
- Production routes untouched by this phase.
- Rendering untouched by this phase.
- Feature flags remain false.
- No DB calls.
- No network calls.
- No provider calls.
- No Higgsfield MCP implementation.
- No LLM calls.
- No image generation.
- No video generation.
- No media fetching.
- No asset upload.
- No Builder nodes.
- No Motion Intelligence, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, AI generation, or production wiring.

## Technical Debt

- Media needs are deterministic starter heuristics and should eventually move toward repository-backed media knowledge.
- Asset matching is label-based and intentionally conservative.
- Verification is compile-safe and local-only; it is not asset QA or visual QA.
- Provider candidates are metadata only and require future provider abstraction work before execution.

## Next Phase

Phase 26E — Motion Intelligence Engine.
