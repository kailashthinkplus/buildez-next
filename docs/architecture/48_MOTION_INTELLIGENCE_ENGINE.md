# Motion Intelligence Engine

## Purpose

Motion Intelligence defines motion language before implementation.

It does not implement animations, run GSAP, render Framer Motion components, create Lottie files, generate videos, or call providers.

## Responsibilities

Define:

- motion tone
- pacing
- transition intent
- scroll rhythm
- parallax intent
- cinematic asset intent
- interaction response
- reduced-motion behavior
- accessibility constraints
- unsuitable motion patterns

## Output

`MotionStrategy`.

## Examples

- Real estate: calm parallax intent, gallery reveal, low motion for premium trust.
- Healthcare: minimal motion, clear state changes, reduced anxiety, no distracting movement.
- Restaurant: gentle sensory reveals, menu/booking clarity, no hidden CTA.
- Automotive: precise performance motion, controlled transitions, no fake availability states.
- Education: calm guided progression, admissions path clarity.
- Hospitality: immersive but booking-friendly movement, reduced-motion alternative.
- Interior design: refined portfolio reveals and material transitions.
- D2C: product detail micro-motion, purchase path stability.

## Provider Boundary

GSAP, Framer Motion, Three.js, Spline, Rive, Lottie, Higgsfield, or future providers may execute motion artifacts later. BuildEZ decides motion language and converts provider output into editable native Builder experiences.

