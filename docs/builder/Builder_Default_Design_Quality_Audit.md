# Builder Default Design Quality Audit

Audit date: 2026-07-11

## Finding

Core defaults were usable but mixed token aliases, fixed desktop sizing, generic copy, remote placeholder imagery, and hardcoded icon/divider colors. Premium widgets had polished-looking shells but used fixed Slate/Blue/White/Amber/Emerald utility colors inside `widgets/premium/ProductionWidgetView.tsx`; every advertised widget shared six text fields and a string list, so many previews are illustrations rather than useful widgets.

This milestone updates core defaults to semantic theme paths, responsive typography/section spacing, useful neutral copy, intrinsic media ratios, and accessible empty-media intent. Premium root defaults now declare theme surface/text/radius and responsive spacing. Internal premium states still require the P0 semantic-style refactor below.

## Per-family quality decisions

| Family | Current problem and files | Classification | Professional default | Responsive / accessibility expectation | Priority |
| --- | --- | --- | --- | --- | --- |
| Page/Section/Container/Column | Fixed spacing and ambiguous `surface` aliases in `widgets/{page,section,container,column}` | Acceptable after default update | Theme background, 1120px content measure, 88/72/56 section rhythm | No horizontal overflow; inherited text contrast | P0 |
| Heading/Text | Fixed 48px heading and placeholder copy | Professional after update | Responsive 40/34/30 heading, 68ch body measure, theme fonts/colors | Heading order validation; readable mobile line length | P1 |
| Button | No modeled hover/focus/active/disabled values | Acceptable | 48px target, semantic button tokens, restrained shadow/transition | Visible focus, disabled semantics, keyboard activation | P0 |
| Image/Video | Remote placeholder and incomplete empty/loading/error states | Acceptable empty state | Responsive aspect ratio, theme radius/surface, local picker prompt | Required alt/captions where applicable; no layout shift | P0 |
| Icon/Divider/Spacer | Hardcoded colors and weak purpose | Acceptable after token update | Semantic surface/primary/border; spacer de-emphasized | Decorative semantics; responsive spacer; AI avoids spacer | P1 |
| Header/Footer | Static spans/buttons; no real links/mobile drawer | Visually inconsistent | Structured nav/link objects and responsive drawer | landmarks, focus order, menu state, current-page semantics | P0 |
| Hero/CTA/Features/Cards | Shared generic card renderer, repeated families | Acceptable appearance, weak contract | Editorial hierarchy, useful proof, real action URLs, theme variants | Stack cleanly; logical heading; focus states | P0 |
| Forms | Divs visually imitate inputs; no labels/errors/loading/success | Broken default | Real labeled controls, validation/help/error/success states | WCAG labels, focus, error association, touch targets | P0 |
| Accordion/Tabs/Carousel/Lightbox/BeforeAfter | Advertised interactions incomplete or static | Broken advertised behavior | Native state model and restrained controls | Full keyboard patterns, reduced motion, focus restoration | P0/Post-launch |
| Galleries/Team/Portfolio/Logo cloud | String items cannot carry images, alt, roles, URLs | Functional but visually weak | Structured media cards with deliberate empty states | Alt/labels, responsive crop, predictable ordering | P1 |
| Pricing/Table/Stats/Countdown | Fabricated values and missing data semantics/runtime | Functional or broken by type | Neutral structured sample data; never invent customer facts | Table captions/headers; timezone; live-region restraint | P0 |
| Map/WhatsApp/Social/Embed | Provider/action contracts missing; brand colors hardcoded | Visually inconsistent/gated | Safe URLs/provider metadata and semantic local overrides | External-link labels, consent, CSP, keyboard access | P0 |
| Blog/Post/Category | Static string cards, no CMS binding | Acceptable preview only | Explicit empty/loading/error collection states | semantic articles/nav, pagination/focus | Post-launch |
| Popup | Metadata only but catalog-like presentation | No default styling/runtime | Do not expose until triggers/focus/dismissal are complete | dialog semantics, trap/restore, Escape, reduced motion | P0 gate |

## Acceptance standard

Every insert must provide meaningful editable copy, theme-derived surfaces/text/borders/actions, sensible content width and spacing, mobile layout, empty/loading/error/disabled/focus states where relevant, semantic elements, and no claim or price that looks like real customer data. Visual polish never substitutes for working interaction.
