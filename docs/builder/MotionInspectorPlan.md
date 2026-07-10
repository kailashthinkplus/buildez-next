# Motion Inspector Plan

Date: 2026-07-09  
Phase: BSP-14  
Status: Metadata-only scaffold

## Decision

Builder motion controls are metadata-only until runtime execution, reduced-motion behavior, preview parity, publish parity, and accessibility have explicit release-gate approval.

## Inspector Groups

BSP-14 defines these metadata groups:

- Entrance
- Exit
- Hover
- Scroll
- Parallax
- Pin
- Reveal
- Mouse
- Timeline

## Presets

BSP-14 defines metadata presets:

- Fade
- Slide
- Scale
- Rotate
- Blur
- Reveal
- Parallax
- Pin
- Zoom
- Luxury
- Editorial
- Corporate
- Minimal

## Constraints

- No GSAP execution.
- No Framer Motion execution.
- No runtime animation code.
- No AI motion generation.
- No Mapper execution.
- No publish/runtime behavior changes.

Motion metadata lives under `apps/web-app/modules/builder-v2/inspector/motion/`.
