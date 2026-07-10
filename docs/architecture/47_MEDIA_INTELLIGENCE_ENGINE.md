# Media Intelligence Engine

## Purpose

Media Intelligence defines what media the site needs before providers or component systems execute anything.

## Responsibilities

Define required and optional:

- images
- videos
- icons
- maps
- diagrams
- documents
- 3D assets
- product imagery
- portfolio media
- brand assets
- fallback policies

## Output

`MediaStrategy`.

Media Intelligence does not fetch, generate, upload, or render media. It declares media requirements, asset readiness, provider suitability, editability expectations, and missing assets.

## Examples

- Real estate: project hero, gallery, amenities, location map, floor-plan document if provided.
- Healthcare: clinic exterior/interior, provider portraits only if provided, service icons, map.
- Restaurant: food/menu photos, ambience gallery, location map, reservation imagery.
- Automotive: vehicle images, service bay/process images, brand authorization assets only if provided.
- Education: campus/program/faculty media only if provided, admissions diagrams.
- Hospitality: rooms, amenities, destination/location images or video.
- Interior design: portfolio project images, materials/process media.
- D2C: product packshots, lifestyle images, detail shots, shipping/returns icons.

## Provider Boundary

A provider may generate or transform a specific asset only after BuildEZ has declared the media need, truth constraints, brand constraints, and editability destination.

