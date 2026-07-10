# Visual Mood Engine

## Purpose

The Visual Mood Engine translates brand and design intent into art-direction attributes that future media, motion, and component systems can use.

## Responsibilities

Define:

- emotion
- lighting
- depth
- texture
- camera language
- materiality
- contrast
- image style
- atmosphere
- subject treatment
- accessibility limits

## Output

`VisualMoodProfile`.

It does not generate images, CSS, components, or layouts. It describes the intended visual mood so future engines and providers can execute bounded tasks.

## Examples

- Real estate: calm, warm-neutral, golden-hour restraint, deep gallery imagery, architectural material texture.
- Healthcare: bright, even lighting, low anxiety, clean depth, human but privacy-safe imagery.
- Restaurant: warm light, tactile food texture, ambience depth, inviting table-level camera language.
- Automotive: high contrast, precision surfaces, controlled reflections, performance energy.
- Education: accessible warmth, optimistic light, clear campus/program focus, low visual noise.
- Hospitality: immersive warmth, destination depth, room/amenity atmosphere, booking confidence.
- Interior design: natural material texture, editorial camera, calm negative space, portfolio depth.
- D2C: product-first lighting, detail texture, lifestyle support, purchase confidence.

## Failure Modes

- Confusing mood with final design tokens.
- Producing inaccessible low contrast.
- Defining media moods that require unavailable assets without surfacing missing needs.
- Letting provider style presets override BuildEZ strategy.

