# Builder Blueprint Engine

## Purpose

Builder Blueprint Engine converts WebsiteSpec, WebsiteDNA, CompiledWebsitePlan, DesignResult, ComponentResult, and CompositionResult metadata into a mapper-ready editable Builder blueprint contract.

It is not the Mapper. It does not insert anything into the Builder store or canvas. It does not replace the manual Builder model. It is only an AI translation layer into existing native BuildEZ Builder concepts: `BuilderNode`, `BuilderBlueprint`, `NodeType`, `WidgetProperty`, registered widget definitions, inspector property paths, and future CommandBus-compatible intents.

## Current Status

Phase 30.6 Native Builder Alignment.

## Public API

- `runBuilderBlueprintEngine(input)` returns `EngineResult<BuilderBlueprintResult>`.
- `buildBuilderBlueprint(input)` creates a mapper-ready editable blueprint contract.
- `validateNativeBlueprintCompatibility(widgets)` verifies generated widgets map to existing Builder node/widget/property concepts.
- `buildNativeNodeIntents(widgets)` creates existing `BuilderNode`-shaped insertion intents.
- `buildNativeWidgetIntents(widgets)` confirms existing native widget types.
- `buildNativeInspectorBindingIntents(widgets)` maps InspectorBlueprint metadata to existing `WidgetProperty` paths.
- `buildNativeCommandIntents(widgets)` creates future CommandBus-compatible intent metadata for Insert, Update, Style, Move, Reorder, and Duplicate commands without executing anything.
- `expandComponentRecipes(input)` expands component recipes into native primitive widget seeds.
- `buildSectionBlueprints(input, widgets)` builds section blueprint metadata.
- `buildWidgetBlueprint(input, seed)` builds editable widget metadata.
- `buildInspectorBlueprint(...)` builds content, design, advanced, responsive, and AI inspector metadata.
- `buildPropertyDefinitions(type, widgetId)` builds Inspector property definitions.
- `buildPropertyBindings(widgetId, definitions)` connects inspector controls to widget paths.
- `buildEditablePropertyBindings(bindings, definitions)` marks editability and AI-editability.
- `buildResponsivePropertyBindings(definitions)` builds desktop, tablet, and mobile responsive metadata.
- `buildStyleBindings(widgetId, style)` preserves style binding metadata.
- `buildMotionBindings(input, widgetId)` preserves motion intent metadata only.
- `validateBuilderBlueprint(blueprint)` validates editability, inspector coverage, primitive safety, and responsive metadata.
- `runBuilderBlueprintVerification()` performs compile-safe verification.

## Primitive Policy

Allowed primitives only:

- `page`
- `section`
- `container`
- `column`
- `heading`
- `text`
- `button`
- `image`
- `video`
- `icon`
- `divider`
- `spacer`

The engine must not create opaque HTML widgets, screenshots, PremiumWidgetPreview output, non-editable blobs, React components, CSS, HTML, JavaScript, or rendered websites.

## Inspector Blueprint

Every widget includes:

- property groups
- property definitions
- property bindings
- editable property bindings
- responsive bindings
- content/design/advanced/responsive/AI tabs
- widget capabilities
- AI metadata
- regeneration metadata
- native node intent
- native widget intent
- native inspector/property binding intent
- future native command intents

## Native Alignment

This module aliases or adapts to existing Builder contracts instead of creating a second node model:

- Native node shape: `apps/web-app/modules/builder-v2/types/blueprint.ts` `BuilderNode`
- Native blueprint shape: `BuilderBlueprint`
- Native widget type: `NodeType`
- Native inspector property shape: `WidgetProperty`
- Native mutation pathway: existing command concepts such as `InsertNodeCommand`, `UpdateNodeCommand`, `StyleCommands`, `MoveNodeCommand`, `ReorderNodeCommand`, and `DuplicateNodeCommand`

The output remains inert intent metadata. A future Mapper may consume these intents and execute real Builder commands, but this phase does not.

## Creative Library Alignment

Creative Library provides metadata-only recipe variants. Builder Blueprint Engine may later expand selected recipes into native editable primitives, while preserving InspectorBlueprint bindings and native Builder compatibility.

## Safety Notes

- No Builder store insertion.
- No CommandBus execution.
- No production wiring.
- No Mapper implementation.
- No Renderer implementation.
- No Critic or Repair implementation.
- No DB, network, LLM, MCP, provider calls, generated websites, React, CSS, HTML, or JavaScript.
- Feature flags remain false.

## Implementation Phase

Phase 30.6 Native Builder Alignment.
