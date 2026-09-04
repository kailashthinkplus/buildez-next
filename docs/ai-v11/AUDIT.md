# BuildEZ AI v11 — Phase 0 architecture audit

Date: 2026-07-16  
Status: architecture only; no implementation  
Scope: Builder v2, AI v10, Website Engine, AI endpoints, architecture decisions, and relevant tests

## Executive finding

Builder v2 is not the primary cause of AI v10's creative-quality ceiling. Its normalized node tree can already represent sections, nested containers, primitive widgets, flex/grid layouts, responsive values, positioning, gradients, shadows, scoped custom CSS, and a bounded motion model. Manual Figma-to-Builder recreation working accurately is consistent with the code.

V10 loses authorship earlier. It asks deterministic intelligence, component-selection, composition, and recipe systems to commit the page structure before the creative model runs. The model then receives batches of existing node IDs and is contractually limited to `props` hydration. It cannot author hierarchy, layout, style, responsive composition, or page-wide visual motifs. The renderer faithfully receives a design whose creative degrees of freedom have already been removed.

V11 should therefore be a separate producer architecture. It should let a model express a complete UI concept in a familiar React/Next.js/Tailwind-like design language, parse that source without executing it, recover design intent into a typed Design Graph, and compile the graph into the existing Builder Blueprint. The existing Builder remains the output platform and stability boundary.

## Audit boundaries

This audit does not propose changes to Canvas, runtime, renderer, Blueprint schema, CommandBus, serialization, widgets, publishing, or existing v10 code. Any future change to those areas requires a separate compatibility case and explicit approval.

The repository has no `docs/ai-v10/` directory. V10 documentation is distributed across `docs/architecture/`, `docs/modules/`, `docs/ai-v10-recovery/`, the v10 orchestrator README, Website Engine documentation, and tests. This audit used those sources and the current code as authoritative, including in-progress worktree files.

## Current v10 architecture

### Production path

```text
Prompt + saved context
  -> AI Planner
  -> Business Intelligence
  -> Brand Intelligence
  -> Content Intelligence
  -> Experience Engine
  -> Pattern Intelligence
  -> deterministic Design Engine
  -> Creative Director metadata / art-direction brief
  -> Component Engine
  -> Composition Engine
  -> Decision Engine
  -> WebsiteSpec Builder
  -> Builder Blueprint Engine
  -> Semantic Blueprint Compiler
       -> native capability compiler, dedicated recipe,
          layout archetype, or generic semantic recipe
  -> recipe expansion
  -> GPT creative enrichment of existing node props
  -> image generation and slot assignment
  -> metadata critic + repair plan
  -> deterministic cleanup
  -> optional rendered visual-quality loop
  -> native widget population gate
  -> renderer parity + final critic
  -> API persistence as Blueprint schema version 2
  -> existing Canvas/runtime renderer
```

The active endpoint is `POST /api/builder-v2/ai/generate-v10`. It calls `runV10WebsiteGeneration`, persists `renderMode: "BLUEPRINT"`, clears `reactCode`, and upserts the returned native Blueprint after semantic-hydration checks. V9 and the older generic generation route remain separate endpoints.

### Ownership by stage

| Stage | Owns in v10 | Consequence |
| --- | --- | --- |
| Intelligence engines | Business, brand, narrative, journey, patterns, design-profile metadata | Rich intent is expressed mostly as metadata. |
| Component and composition engines | Candidate choice, section sequence, rhythm descriptors | Choices are deterministic and constrained by registered variants. |
| Semantic compiler and recipes | Node types, IDs, parent/child tree, layout, initial styles, responsive values | The visible geometry is substantially fixed here. |
| Creative enrichment model | Existing-node `props`, chiefly copy and image prompts | It is a hydrator, not a UI designer. |
| Media generation | Image assets for discovered slots | It cannot change image role or composition. |
| Critic/repair/parity | Quality metadata, deterministic cleanup, optional render checks | Primarily validates or repairs a committed design. |
| Builder renderer | Existing Blueprint interpretation | It cannot restore intent absent from the Blueprint. |

## Creative-quality loss points

### 1. The model enters after structural commitment — critical

`runV10WebsiteGeneration` compiles a native Blueprint before calling creative enrichment. `runV10CreativeEnrichment` rejects candidate patches containing keys other than `props`, merges only those props, and deliberately retains the original `style`. IDs, node types, children, parents, hierarchy, and responsive geometry are already authoritative.

Result: the only generative creative pass cannot create an asymmetric hero, overlap media, introduce a full-bleed interruption, change grid spans, establish a cross-section motif, or recompose mobile layouts.

### 2. Enrichment batching breaks page-wide authorship — critical

The creative pass uses compact context and small batches of existing nodes. This is appropriate for reliable semantic hydration, but each response lacks direct control over the full page. Even if style patches were allowed, independent batches would make coordinated art direction and consistent spatial decisions fragile.

### 3. Semantic metadata is repeatedly compressed — high

Business, brand, experience, pattern, design, component, and composition stages produce many descriptive artifacts. At each boundary, richer intent is converted into narrower enumerations: design language, component variant, section category, layout archetype, and finally a fixed recipe tree. Metadata that is not consumed by the selected compiler has no effect on pixels.

### 4. Recipe fallback narrows visual grammar — critical

The generic semantic recipe factory converges many section purposes on a small grammar: section shell, intro, uniform grid, repeated cards, conventional split, CTA, or footer. Dedicated variant compilers, layout archetypes, and native capabilities improve coverage, but unsupported or unmatched intent still falls through to deterministic recipes.

### 5. Composition describes more than it controls — high

V10 calculates rhythm, breathing, density, media alternation, scroll narrative, and art-direction metadata. Those concepts do not consistently own actual tracks, spans, overlap, section silhouette, or breakpoint-specific recomposition. The compiler may observe a composition concern without having a structural operation capable of resolving it.

### 6. Component-first thinking biases the design — high

The model is effectively asked to populate a page assembled from Builder-oriented component choices. The selection and scoring systems encourage registered, compilable options, so design exploration is bounded by the catalog before a free visual concept exists.

### 7. Visual feedback is late and mostly corrective — high

The optional rendered-quality loop occurs after compilation, enrichment, and media assignment. It can repair a candidate within existing mechanisms but is not the source of the design. A critic cannot reliably turn a conventional structural grammar into an authored visual concept through bounded repairs.

### 8. Contract mismatches can further reduce fidelity — medium

The v10 forensic work found a concrete compiler/renderer layout discriminator mismatch (`style.display` versus legacy `props.layout`). Current in-progress changes address portions of this area, but the broader lesson for v11 is important: compilation must validate the exact shared render contract, not merely Blueprint shape or intended styles.

## Current Blueprint capability analysis

### Capability matrix

| Requirement | Current support | Evidence and limits |
| --- | --- | --- |
| Sections | **Yes** | `page` may contain registered section-like nodes; `section` is a native node and renders full bleed with an inner content-width contract. Semantic meaning is conventionally stored in props rather than enforced by schema. |
| Containers | **Yes** | Nested `container`, `grid`, and `column` nodes support arbitrary non-page children subject to tree validation. Boxed/full width, max width, flex, and grid are available. Some renderer behavior also recognizes legacy layout props, so compiler parity must be tested. |
| Widgets | **Yes** | Primitive content/media nodes and a broad production-widget union are registered. Primitive composition offers the greatest design fidelity; premium widgets have their own prop contracts and may be less structurally decomposable. |
| Styles | **Yes, broad but resolver-bounded** | `BuilderStyle` supports color, backgrounds, typography, sizing, spacing, border/radius/shadow, flex/grid, position, offsets, overflow, z-index, object fit, transforms, and transitions. Its index signature accepts more keys, but only properties emitted by the shared style resolver or custom CSS are guaranteed to render. |
| CSS layers | **Partial** | Per-node `props.advanced.customCss` is collected and `selector`/`&` are rewritten to a node data selector. Classes and CSS IDs are supported. This can express pseudo-elements, hover states, media queries, filters, backdrop effects, and complex selectors, but it is a string convention, not a typed first-class Design Layer. Scoping and sanitization are not a strong security boundary. |
| Motion | **Yes, bounded** | `props.advanced.motion` supports presets, duration/delay/easing, viewport triggering, custom keyframes, staggered children, hover transform/opacity, pinning, mouse response, and horizontal/vertical parallax. It is not a general timeline/state-machine system, and transform ownership can conflict with authored CSS. |
| Responsive behavior | **Yes, property-level; partial for structural recomposition** | Style values can carry desktop/tablet/mobile overrides with deterministic inheritance. Visibility metadata is supported. Grid tracks, direction, gaps, sizing, spacing, and backgrounds can change per breakpoint. The same node tree is retained across devices, so radically different DOM order/anatomy requires CSS ordering/visibility/duplication or a future approved capability. |

### What the current Blueprint can represent well

- Full-bleed and boxed sections.
- Nested flex and grid compositions.
- Asymmetric columns and explicit grid tracks.
- Editorial splits, bento-like grids, galleries, and varied media ratios.
- Relative/absolute layering, overlap, sticky elements, controlled overflow, and z-index.
- Responsive typography, spacing, sizing, tracks, direction, and visibility.
- Gradients through background values, shadows, borders, radii, overlays through nodes or pseudo-elements, and many glass effects through custom CSS.
- Content primitives and registered marketing/media widgets.
- Common entrance, hover, parallax, pin, and stagger effects.

### What is not first-class or not guaranteed

- A typed, independently validatable AI Design Layer.
- Arbitrary CSS property passthrough through `BuilderStyle`; the type is open but the resolver is explicit.
- Safe, fully isolated CSS. Custom CSS may escape intended scope through authored selectors or at-rules unless a v11 sanitizer constrains it.
- Different node trees per breakpoint.
- General React state, event logic, data fetching, server components, or arbitrary JavaScript.
- General animation timelines, scroll choreography, layout transitions, or inter-node orchestration.
- CSS variables and font/resource acquisition as an explicit Blueprint-level contract.
- Semantically typed media roles beyond node props/conventions.
- Guaranteed parity for every premium widget property without widget-specific capability checks.

### Serialization and validation implications

Blueprint schema version 2 is a normalized JSON object containing metadata, theme, root ID, and a node map. Validation checks supported node types, node shape, parent/child rules, tree integrity, and serialization-safe values. Normalization copies unknown JSON-safe props/style data, but metadata normalization retains only known metadata fields.

This creates a safe v11 Phase 1 strategy: keep the Design Graph and compilation report outside the persisted Blueprint, and lower supported design decisions into existing `style`, theme tokens, and `props.advanced` fields. Do not add a top-level Blueprint field or metadata payload until persistence requirements are separately designed and approved.

## Reusable components

### Reuse as stable output platform

- `BuilderBlueprint`, `BuilderNode`, `BuilderStyle`, theme, and responsive value contracts.
- Blueprint schema/tree/serialization validation and normalization.
- Existing Canvas/runtime render contract and parity checks as acceptance targets.
- Primitive page/section/container/column/heading/text/button/image/video/icon/divider/spacer nodes.
- Widget registry and capability metadata for compiler target discovery.
- Theme-token conventions and shared style resolution.
- Existing per-node advanced CSS convention, subject to a v11-owned sanitizer and lowering policy.
- Existing motion runtime for the subset it explicitly supports.
- Existing image upload/generation infrastructure and media-slot assignment concepts.
- Forensic traces, golden website fixtures, viewport captures, renderer-parity tests, and visual-quality test harnesses.
- Persistence endpoint pattern, only after v11 output has passed all gates.

### Reuse selectively as inputs or evaluation aids

- Business/context extraction and fact-safety concepts.
- Content and media strategy artifacts where they do not prescribe layout.
- WebsiteSpec semantics as optional brief context, not as the controlling visual IR.
- Existing critic, repair, and visual-quality modules as benchmark inputs; they need calibration against rendered references before serving as v11 release gates.
- Widget population contracts for premium widget lowering.

## Components to replace in the v11 generation path

“Replace” means bypass for v11, not delete or modify v10.

| V10 responsibility | V11 replacement |
| --- | --- |
| Deterministic design profile as primary visual author | UI code generator producing a coherent page concept. |
| Global component selection before design | Interpreter identifies semantic components after the design exists. |
| Composition metadata followed by recipe geometry | Design Graph owns actual hierarchy, layout constraints, layers, and responsive intent. |
| Semantic recipe/archetype fallback as the primary compiler | Capability-driven Blueprint compiler lowers graph nodes to primitives/widgets without silently changing design intent. |
| Props-only creative enrichment | Content is extracted with the design and compiled with it; optional fact-safe copy refinement happens before final compilation. |
| Late slot-driven media semantics | Design Graph records media role, crop, treatment, placement, and responsive behavior before asset hydration. |
| Advisory metadata critic as principal quality judgment | Static graph validation plus render-parity and visual benchmark gates. |

V10 remains legacy and operationally isolated. V11 should not import its orchestrator, semantic recipe compiler, component-selection sequence, or props-batching enrichment as its core path.

## Risks

| Risk | Severity | Mitigation direction |
| --- | --- | --- |
| Generated source contains executable or malicious code | Critical | Never evaluate, transpile, import, SSR, or mount generated code. Parse text only with a strict syntax and semantic allowlist. |
| Tailwind/dynamic-class ambiguity | High | Support statically recoverable class strings first; mark computed classes and arbitrary runtime expressions unsupported. |
| CSS escape, global selectors, resource loading, or data exfiltration | Critical | Parse CSS, reject unsafe at-rules/URLs/selectors/properties, scope selectors structurally, cap size/complexity, and never trust string replacement as sanitization. |
| Design intent is silently flattened during lowering | Critical | Emit capability findings and fidelity loss as compiler diagnostics; fail or request regeneration above a threshold. |
| Responsive designs require different DOM anatomy | High | Define a same-tree responsive subset for the first milestone; report unsupported structural variants instead of approximating them invisibly. |
| Custom CSS becomes an uneditable escape hatch | High | Prefer native style and node lowering; budget and classify CSS; require every CSS rule to map to stable node IDs and explain why it could not be native. |
| Primitive explosion harms editor usability/performance | High | Use semantic grouping, node-count budgets, stable naming, and registered widgets only where their contract is an exact fit. |
| Canvas/runtime/publish parity differs | Critical | Compile once and test the unchanged shared renderer on all surfaces and viewports; no v11-specific renderer. |
| Motion conflicts over transforms or accessibility | High | Normalize transform composition, enforce reduced-motion fallbacks, and lower only supported effects. |
| Hallucinated assets, fonts, claims, or links | High | Separate design placeholders from verified resources; fact/media/font resolution gates precede persistence. |
| Parser/version churn | Medium | Pin parser and Tailwind interpretation versions; store source hash and interpreter version in v11 trace artifacts, not Blueprint metadata initially. |
| V11 accidentally couples to Builder internals | High | Enforce one-way dependency: v11 compiler may import public Builder contracts/capabilities; Builder core must never import v11. |
| Existing dirty worktree obscures causality | Medium | Keep v11 changes isolated, document-only in Phase 0, and establish a clean benchmark baseline before implementation. |

## Audit conclusion

The current Blueprint is a viable compilation target for a meaningful v11 vertical slice. It is not necessary to change Builder core to prove the new architecture. The missing layer is a design-native, typed intermediate representation plus a compiler that measures fidelity instead of forcing intent through preselected widgets and recipes.

The first implementation should validate this claim on a narrow static subset before adding APIs, persistence, image generation, or production routing.

## Inspection ledger

The repository structure was inventoried across `apps/web-app/modules/builder-v2/`, `apps/web-app/app/api/`, `docs/`, and the workspace package/configuration files. There are currently about 890 Website Engine files, 103 Builder v2 test files, and 78 widget files; the audit traced relevant contracts and execution paths rather than treating every file as equally authoritative.

Principal files inspected directly:

- Blueprint and validation: `types/blueprint.ts`, `core/validation/blueprintSchema.ts`, `blueprintValidation.ts`, `nodeTreeValidation.ts`, and serialization validation.
- Serialization: `core/serialization/serializeBlueprint.ts`, `deserializeBlueprint.ts`, `normalizeBlueprint.ts`, and tree repair.
- Rendering: `core/rendering/renderContract.ts`, `renderStyleResolver.ts`, `renderResponsiveResolver.ts`, `renderCustomCss.ts`, `canvas/NodeRenderer.tsx`, and `runtime/PublishedPageRenderer.tsx`.
- Responsive and motion: `core/responsive/*`, `motion/runtimeMotionEntries.ts`, and `motion/MotionRuntimeEffects.tsx`.
- Widgets: registry/registration, primitive page/section/container/column/heading/text/button/image/video definitions and renderers, premium production widget rendering, widget capability/readiness/serialization metadata, and the widget directory inventory.
- V10: `ai-v10/orchestrator/runV10WebsiteGeneration.ts`, `runAiV10Orchestrator.ts`, orchestrator README/index, creative enrichment and hydration validation, typed widget hydration, recipe expansion, media generation/slot assignment, repair, preflight, progress, persistence gate, model profile, forensics, and v10 public index.
- Website Engine: business/brand/content/experience/pattern/design stages; `ComponentEngine`, selection/scoring contracts; `CompositionEngine` and composition helpers; `WebsiteSpecBuilder`; `BuilderBlueprintEngine`; `SemanticBlueprintCompiler`; native capability, archetype, dedicated component recipe, and generic recipe paths; critic, repair, visual-quality, visual-critic, golden website, renderer-parity, and SDK contracts.
- Endpoints: Builder v2 AI context, generic generation, v9 generation, v10 generation/preflight/progress/finalize routes; Blueprint persistence and page publish/runtime-related route inventory; older AI v8 React generation routes for historical contrast.
- Tests: v10 hybrid/creative recovery/forensic and widget-population tests; Blueprint schema and save/reload round-trip tests; responsive/layout/rendering tests; AI compatibility and stress fixtures; widget library/serialization tests; visual quality/critic/repair tests; and golden website Playwright coverage.
- Documentation/decisions: `docs/BUILDER_V2_ARCHITECTURE.md`, `BLUEPRINT_SCHEMA.md`, `BUILDER_V2_DECISIONS.md`, `AI_SYSTEM.md`, Website Engine architecture/progress, AI v10 module/orchestrator docs, architecture documents 03/05/07–14/19/34/43–49/51–59, Builder AI compatibility/readiness/certification docs, v10 recovery audit/root-cause documents, and related implementation phase notes.

Working-tree note: many v10 recovery, rendering, Website Engine, test, log, and golden-capture files were already modified or untracked before this audit. They were read as current-state evidence and were not changed by Phase 0.
