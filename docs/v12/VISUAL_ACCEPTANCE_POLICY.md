# V12 Visual Acceptance Policy

## Governing rule

Automated code, type, unit, integration, security, build, and runtime tests are necessary engineering gates. They are not sufficient for a V12 phase or release to receive final PASS.

Final PASS requires rendered product evidence.

## Required evidence

The applicable real website output must be captured at:

- desktop
- tablet
- mobile

The evidence must include every implemented page and critical state relevant to the phase. For ecommerce fixtures this includes, at minimum, the homepage, product listing or catalogue, product detail, navigation, cart interaction, and publishing output when available.

## Final visual gate

A phase or release may receive final PASS only when screenshot review confirms:

- high-quality, coherent art direction
- complete requested scope and page coverage
- correct typography, spacing, hierarchy, alignment, and imagery
- responsive adaptation without clipping, overflow, overlap, or unreadable text
- no broken assets, placeholder content, empty sections, or visible runtime errors
- preservation of the approved design through preview, editing, build, and publishing
- explicit human visual approval recorded with the evidence

## Status vocabulary

- `ENGINEERING_GATE_PASS`: applicable automated checks pass; visual approval is still pending.
- `VISUAL_GATE_PASS`: required screenshots have been reviewed and approved.
- `FINAL_PASS`: both engineering and visual gates pass with no mandatory blocker.
- `FAIL`: a mandatory engineering or visual gate fails.

The word `PASS` must not be used by itself for an engineering-only result.

## Golden vertical slice

All V12 phases must contribute to a real canonical React/TypeScript website exercised end-to-end. Infrastructure-only fixtures may supplement this vertical slice but may not replace it.

The Sunlit Meadows premium ecommerce homepage and product-detail experience are the initial visual-quality benchmark. The reference PDF and product-page screenshot may guide review; executable source and durable assets are required before it can become a reproducible golden fixture.
