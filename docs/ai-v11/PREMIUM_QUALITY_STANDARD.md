# BuildEZ V11 premium quality standard

Premium benchmarks measure source authorship before compiler fidelity. Engineering regression success can never compensate for mediocre design.

## Independent categories

Every trusted reference is reviewed independently for art direction, originality, visual hierarchy, typography quality, spacing rhythm, composition quality, media usage, background treatment, effects and depth, responsive composition, content quality, brand appropriateness, section-to-section narrative, conversion clarity, end-user acceptability, and compiled editability. The minimum category controls certification.

## Levels

- **Prototype-quality:** no catastrophic design failure and every category at least 50.
- **End-user acceptable:** every category at least 75; art direction, composition, typography, and responsive composition at least 80; media usage at least 75.
- **Premium launch quality:** every category at least 85; art direction, composition, typography, and responsive composition at least 90; originality, media usage, and effects/depth at least 85; no generic-pattern penalty or placeholder feel.

## Disqualifying diagnostics

`GENERIC_REPEATED_CARD_PATTERN`, `GENERIC_SPLIT_HERO`, `LOW_VISUAL_VARIETY`, `WEAK_MEDIA_STORYTELLING`, `NO_DISTINCTIVE_ART_DIRECTION`, `DEFAULT_TAILWIND_APPEARANCE`, `SECTION_RHYTHM_TOO_UNIFORM`, and `PLACEHOLDER_VISUAL_LANGUAGE` reduce source-design certification only. They never alter compiler contract fidelity.

## Human approval

Automated scores cannot approve a gold standard. A candidate counts only when `approvedAsGoldStandard` is true and a human supplies `approvedBy`, `approvalDate`, notes, and known compromises. Repository authors and automated agents must default new work to `authored-candidate`.

## Final result

Reports keep four separate objects: `sourceDesignQuality`, `contractFidelity`, `compiledVisualFidelity`, and `endUserAcceptability`. A source score below 75 invalidates the fixture as a premium benchmark before compilation.
