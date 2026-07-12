# Builder Default Theme Preset Plan

Audit date: 2026-07-11

## Existing presets

Six presets exist in `theme/themePresets.ts`: BuildEZ Default, Modern SaaS, Premium Studio, Local Business, Bold Launch, and Editorial Minimal. Preview assets exist in `public/theme-previews`. These are usable palette/typography/radius/shadow variants, but the present token model cannot fully express forms, cards, component states, section character, or image treatment; premium internal hardcoded colors also reduce visible preset differences.

## Minimal launch set

| Launch name | Existing basis | Character | Work required |
| --- | --- | --- | --- |
| Modern Light | BuildEZ Default / Modern SaaS | clean cool neutral | Consolidate naming; semantic states/forms/cards |
| Modern Dark | Bold Launch | restrained dark product | Replace neon-specific assumptions; inverse/contrast contract |
| Premium Neutral | Premium Studio | warm quiet luxury | Add editorial typography/spacing/image treatment tokens |
| Bold Startup | Bold Launch | high contrast and energetic | Keep motion restrained; state tokens |
| Warm Organic | Local Business | warm approachable local | Form/card/section tokens |
| Professional Corporate | BuildEZ Default | conservative, readable | Stronger typography hierarchy and subtle elevation |
| Minimal Portfolio | Editorial Minimal | image-led editorial | Section/image treatment and compact navigation |

Do not add an eighth “Elegant Luxury” preset until Premium Neutral proves insufficient; that would initially be a content/template variant, not a distinct token system.

Each preset must define palette, typography scale/weights/line heights, spacing character, radii, elevation, button states, form states, card states, section surfaces/rhythm, image radius/crop treatment, and light/dark/inverse behavior. Presets must contain token values only; widget-specific CSS is prohibited. Visual regression pages must render the same representative core and premium widgets at desktop and mobile for every preset.
