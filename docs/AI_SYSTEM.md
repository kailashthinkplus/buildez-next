# BuildEZ AI Builder Strategy

Last updated: 2026-06-27

This document is the canonical strategy for BuildEZ AI website generation. Any AI-builder module, prompt, agent, recipe, validator, or UI workflow should revisit this file before implementation.

## North Star

BuildEZ is a node-native AI website builder.

The product promise is:

> AI speed with Elementor-like editability and production validation.

BuildEZ should not generate static pages, arbitrary React, locked templates, or screenshot-only output. Every generated website must become a valid editable `BuilderBlueprint` made from registered builder nodes and widgets.

## Competitor Research Notes

Reviewed competitor positioning on June 28, 2026:

- Framer AI focuses on prompt-to-site generation inside a mature visual website canvas, plus AI-assisted review and refinement.
- Lovable and Emergent emphasize chat-first generation of working web apps and prototypes from natural language.
- Cursor's strongest pattern is agentic code execution with visible iteration, review, and developer control rather than a pure website canvas.

Implication for BuildEZ:

BuildEZ should not try to win only on "prompt goes in, page comes out." That lane becomes generic quickly. The differentiated path is professional website intelligence plus builder-native editability: brief extraction, industry recipes, brand memory, proof/CTA strategy, generated asset direction, validation, repair, and editable nodes.

The first active implementation slice is in:

- `apps/web-app/modules/builder/ai-v8/agents/`
- `apps/web-app/modules/builder/ai-v8/orchestrator/runWebsiteGenerationOrchestrator.ts`
- `apps/web-app/modules/builder/ai-v8/lib/experienceIntelligence.ts`
- `apps/web-app/app/api/ai-v8/generate-react/route.ts`

This slice adds deterministic task agents, an orchestrator layer, a professional brief, conversion strategy, competitor-gap instructions, quality scoring, repair feedback, agent run logs, and saved generation metadata before the system moves to fully node-native generation.

## Core Positioning

The crowded AI website-builder market mostly competes on prompt-to-site speed. BuildEZ should stand out through:

- Industry-specific intelligence.
- Design-style variety.
- Unique generation per request.
- Builder-node editability.
- Visual preview before build.
- Validation and repair before publishing.
- Brand and business memory across pages.

The frozen product lane:

> BuildEZ is an AI-orchestrated, node-native website builder where every generated website is visually impressive, validated, and editable like Elementor.

## Non-Negotiable Rules

1. AI must not freely generate production React for builder pages.
2. AI must not bypass the builder node schema.
3. AI-generated UI images are visual targets, not the source of truth.
4. The editable blueprint is always the canonical output.
5. Only registered widgets and approved section recipes can reach the canvas.
6. Validation must run before writing AI output into builder state.
7. Repair must modify blueprint data, not patch rendered DOM.
8. Every generated section must remain editable through normal builder controls.
9. Industry kits and design style kits should guide generation, but not create duplicate-looking sites.
10. The orchestrator owns workflow control; agents propose bounded outputs.

## Target Generation Flow

```text
User Prompt
  -> AI Orchestrator
  -> Intent Detection
  -> Industry Kit Selection
  -> Design Style Selection
  -> Site/Page Plan
  -> Optional UI Image Preview
  -> Section Recipe Selection
  -> Content + Asset Direction
  -> BuilderBlueprint Generation
  -> Blueprint Validation
  -> Render Preview
  -> QA + Repair Loop
  -> Editable Builder Canvas
```

## Source Of Truth

The canonical final output is a valid builder blueprint:

```text
Page
  Section
    Container
      Heading
      Text
      Button
      Image
```

Relevant active contracts:

- `apps/web-app/modules/builder-v2/types/blueprint.ts`
- `apps/web-app/modules/builder-v2/core/registry/WidgetRegistry.ts`
- `apps/web-app/modules/builder-v2/core/registry/registerWidgets.ts`
- `apps/web-app/modules/builder-v2/core/commands/CommandBus.ts`

AI modules must treat these contracts as hard boundaries.

## Widget Marketplace Strategy

BuildEZ should call this layer the Widget Marketplace from the beginning.

The marketplace is not only a future storefront. It is the premium builder-native component source that AI uses to assemble high-quality editable websites.

There should be two widget tiers:

```text
Default Widgets
  -> available to all plans
  -> core builder foundation

Premium Marketplace Widgets
  -> available to paid plans later
  -> richer conversion, media, content, commerce, and industry-specific widgets
```

Initial default widgets:

- Page
- Section
- Container
- Column
- Heading
- Text
- Button
- Image
- Video
- Icon
- Divider
- Spacer

Initial premium marketplace widget categories:

- Header and navigation.
- Footer.
- Hero.
- Forms.
- Cards.
- Content grids.
- Carousel.
- Slider.
- Gallery.
- Lightbox.
- Expanding cards.
- Flipbox.
- Content tabs.
- Accordion.
- FAQ.
- Testimonials.
- Pricing.
- Blog list and blog cards.
- Instagram feed.
- WhatsApp button.
- Floating contact button.
- Modal and popup.
- Announcement bar.
- Map.
- Reviews.
- Product or offer grid.

Each marketplace widget must define:

- Widget definition.
- Default node.
- Renderer.
- Property schema.
- Responsive behavior.
- Valid parent/child rules.
- AI usage description.
- Industry relevance.
- Design style compatibility.
- Validation rules.
- Free or premium tier.
- Required plan or feature flag.

AI must use marketplace metadata when selecting widgets.

Example:

```text
Need a visual property showcase for a luxury real-estate page
  -> choose premium gallery/lightbox/carousel widget
  -> fill props, assets, and copy
  -> apply luxury/editorial tokens
  -> validate
  -> insert as editable builder nodes
```

Plan gating should be implemented later through feature flags or plan entitlements, but the widget metadata should be designed for it now.

Suggested metadata fields:

```text
tier: "default" | "premium"
requiredFeature: "premium_widgets" | "ai_builder" | "commerce_widgets"
allowedPlans: string[]
marketplaceCategory: string
industryTags: string[]
styleTags: string[]
aiUseCases: string[]
```

Frozen decision:

> BuildEZ will have default widgets and a premium Widget Marketplace. AI generation should use the marketplace as its trusted source of editable builder-native widgets, with premium widgets gated by paid plans later.

## AI Images

AI UI images may be used for:

- Design direction previews.
- Section thumbnails.
- Client approval.
- Hero or section asset inspiration.
- Screenshot comparison during QA.

AI UI images must not be used as the primary editable format.

Preferred image-assisted workflow:

```text
Prompt
  -> AI design image / section mockup
  -> User approves direction
  -> AI maps design to section recipes
  -> Blueprint nodes are generated
  -> Rendered screenshot is compared to target
  -> Repair loop improves blueprint
```

This gives creative range without sacrificing editability.

## Agent Architecture

Use a controlled multi-agent pipeline. Agents are specialist modules, not autonomous code writers.

Recommended agents:

- `OrchestratorAgent`: owns workflow, state, retries, and final approval.
- `IntentAgent`: detects industry, business subtype, audience, goal, and constraints.
- `SitePlannerAgent`: creates sitemap, page list, section list, and conversion flow.
- `DesignDirectionAgent`: chooses design style, visual tone, typography direction, color logic, spacing rhythm, and motion level.
- `ContentAgent`: writes headings, body text, CTAs, FAQs, testimonials, and SEO-oriented copy.
- `SectionRecipeAgent`: maps plan sections to approved section recipes.
- `AssetAgent`: selects or generates image/icon direction and connects to the media system.
- `BlueprintAgent`: creates valid builder-node trees from recipes.
- `ValidatorAgent`: checks schema, allowed nodes, parent/child rules, props, responsive defaults, and unsafe styles.
- `QAAgent`: renders, screenshots, checks layout/contrast/mobile issues, and requests repairs.
- `RepairAgent`: makes bounded blueprint repairs after validation or visual QA failures.

The key rule:

```text
AI agents can propose.
Builder contracts decide.
Validator must approve.
Only approved blueprints reach the canvas.
```

## Industry Repository

BuildEZ should build a large internal repository of industry-specific kits. This creates quality, speed, and defensible lock-in.

Suggested structure:

```text
modules/builder-ai/repository/
  industries/
    real-estate/
    restaurant/
    healthcare/
    dentist/
    gym/
    construction/
    salon/
    ecommerce/
    saas/
    agency/
    education/
    legal/
    travel/
    finance/
    events/
```

Each industry kit should contain:

```text
industry.json
theme-presets.json
section-recipes.json
copy-patterns.json
image-prompts.json
conversion-flows.json
seo-patterns.json
element-variants.json
```

Industry gives relevance. Design style gives taste. The uniqueness engine gives variation. Builder nodes give editability.

## Design Style Library

Design style is a separate axis from industry.

Generation should combine:

```text
Industry + Use Case + Design Style + Brand Personality + Conversion Goal
```

Initial design styles:

- `modern`
- `classic`
- `minimal`
- `luxury`
- `editorial`
- `bold`
- `playful`
- `corporate`
- `premium`
- `organic`
- `futuristic`
- `brutalist`
- `warm`
- `clinical`
- `creative-agency`
- `startup`
- `heritage`

Each design style should define:

- Color behavior.
- Typography behavior.
- Spacing density.
- Border radius.
- Shadow depth.
- Image treatment.
- Section rhythm.
- Button style.
- Icon style.
- Motion level.
- Copy tone.
- Layout density.

Example matrix:

```text
Restaurant + Fine Dining + Classic + Elegant + Reservations
Dentist + Family Clinic + Modern + Friendly + Appointments
Real Estate + Luxury Villa + Editorial + Premium + Lead Capture
SaaS + Analytics Tool + Minimal + Technical + Demo Booking
```

## Uniqueness Engine

Each generation must feel custom. The system should avoid producing the same-looking website repeatedly for the same industry.

The uniqueness engine should:

- Select industry kit.
- Select design style kit.
- Select theme preset.
- Mutate theme tokens within safe ranges.
- Select section recipes.
- Vary section order.
- Vary component variants.
- Vary copy angle.
- Assign image direction.
- Score similarity against previous generations.
- Retry composition if similarity is too high.

Suggested target:

```text
similarityScore < 0.72
```

Similarity can consider:

- Section order.
- Recipe IDs.
- Color token distance.
- Typography pairing.
- Layout density.
- CTA pattern.
- Asset direction.
- Copy tone.

## Recommended Module Layout

```text
apps/web-app/modules/builder-ai/
  orchestrator/
    runAiBuilder.ts
    workflowTypes.ts
    workflowState.ts

  agents/
    intentAgent.ts
    sitePlannerAgent.ts
    designDirectionAgent.ts
    contentAgent.ts
    sectionRecipeAgent.ts
    assetAgent.ts
    blueprintAgent.ts
    validatorAgent.ts
    qaAgent.ts
    repairAgent.ts

  repository/
    industries/
    design-styles/
    use-cases/

  recipes/
    hero/
    features/
    pricing/
    gallery/
    faq/
    contact/
    footer/

  uniqueness/
    uniquenessEngine.ts
    similarityScore.ts

  validation/
    blueprintSchema.ts
    validateBlueprint.ts
    repairBlueprint.ts
    validateSection.ts

  prompts/
    intent.prompt.ts
    planner.prompt.ts
    design.prompt.ts
    content.prompt.ts
    blueprint.prompt.ts
    qa.prompt.ts
```

## MVP Build Order

Do not start with a fully autonomous AI website builder.

Start with this MVP:

```text
Prompt
  -> Intent
  -> Section Plan
  -> Recipe Selection
  -> Editable Blueprint
  -> Validation
  -> Render In Builder
```

Then add:

1. Industry kits.
2. Design style kits.
3. Uniqueness engine.
4. AI image previews.
5. Asset generation/selection.
6. Screenshot QA.
7. Repair loop.
8. Multi-page generation.
9. Brand memory.
10. Node-level AI inspector actions.

## Builder Prerequisites

Before deep AI integration, the builder foundation must support reliable AI output:

1. Stable blueprint load/save/autosave.
2. Canonical widget registry rendering path.
3. Property-registry-driven inspector.
4. Real blueprint validator and schema migration boundary.
5. Section recipe library.
6. Media pipeline for AI/generated assets.
7. Preview/publish validation.
8. Active-code typecheck boundary that excludes broken legacy/experimental AI files.

If these are not stable, AI will produce broken output faster.

## AI Inspector Direction

After MVP generation, BuildEZ should support AI actions on selected nodes:

```text
Make this section more premium.
Rewrite this for dentists.
Turn this into pricing.
Make mobile layout cleaner.
Generate three hero variants.
Replace this image style.
Improve CTA conversion.
Make this match the brand voice.
```

These actions must operate on selected builder nodes and return validated blueprint patches.

## Final Frozen Strategy

BuildEZ AI generation will use:

- A multi-agent orchestrator.
- Industry-specific kits.
- Design-style kits.
- A uniqueness engine.
- Optional AI visual previews.
- Section recipes.
- Validated editable builder nodes.
- Render QA and repair loops.

The goal is not just prompt-to-site.

The goal is prompt-to-unique, industry-aware, visually strong, editable, validated builder websites.
