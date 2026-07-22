# BuildEZ AI v11 — proposed architecture

Date: 2026-07-16  
Status: Phase 0 proposal; no implementation  
Decision boundary: separate v11 producer, unchanged Builder v2 consumer

## Architecture objective

V11 gives the model room to design in a language it understands well—React/Next.js/Tailwind-like UI source—without making generated code part of BuildEZ runtime.

The source is an untrusted design document. BuildEZ parses it, interprets its static DOM and visual intent, creates a typed Design Graph, then compiles that graph into the existing editable Builder Blueprint. Only the Blueprint reaches Canvas, persistence, preview, publishing, or runtime.

```text
Prompt + verified business context
  -> UI Code Generator
  -> untrusted UI Source Artifact
  -> syntax parser (never execute)
  -> normalized AST
  -> static interpreter
  -> DOM/design extraction
  -> Design Graph
  -> graph validation + capability analysis
  -> Blueprint Compiler
       -> native Builder tree
       -> native styles/theme
       -> bounded AI Design Layer lowering
       -> bounded motion lowering
       -> media requests
  -> existing Blueprint validation
  -> existing renderer parity / visual benchmarks
  -> existing Builder Blueprint
  -> existing Canvas/runtime/publish path
```

## Non-negotiable principles

1. **Never execute generated source.** No `eval`, dynamic import, JSX rendering, Next.js build, server-side rendering, browser mounting, package installation, or generated event-handler execution.
2. **Builder remains authoritative at runtime.** V11 produces schema-version-2 Blueprint output; it does not add a parallel renderer.
3. **Design first, target second.** The generator describes the intended page before the interpreter chooses Builder primitives or widgets.
4. **Design Graph is Builder-independent.** It records what the design means, not how Builder currently implements it.
5. **Native structure first, AI Design Layer second.** Use native nodes/styles for hierarchy and common presentation; use bounded CSS/motion only for effects that cannot be represented natively without distortion.
6. **No silent degradation.** Unsupported syntax or intent produces diagnostics, a fidelity score, and either a controlled fallback/regeneration request or a failed compilation.
7. **One-way dependency.** `ai-v11` may depend on public Builder types, validation, registries, and capability readers. Builder core must not depend on `ai-v11`.
8. **V10 stays legacy and isolated.** V11 does not refactor or mutate v10 to share its orchestration model.
9. **Persistence is the last boundary.** Source, AST, and Design Graph are build artifacts until their privacy, size, and lifecycle are explicitly designed.

## Proposed folder structure

```text
apps/web-app/modules/builder-v2/ai-v11/
├── index.ts                         # future narrow public API
├── contracts/                      # versioned pipeline artifact envelopes
├── generator/
│   ├── prompts/                    # source-generation contract and examples
│   ├── providers/                  # model adapter; no Builder knowledge
│   └── source-artifact/            # source, manifest, hashes, diagnostics
├── ast/
│   ├── parser/                     # TSX/JSX + CSS parsing only
│   ├── normalization/              # canonical AST subset
│   ├── allowlist/                  # syntax and intrinsic/component policy
│   └── diagnostics/
├── interpreter/
│   ├── static-evaluator/           # literals and bounded static expressions
│   ├── component-expansion/        # local pure component templates
│   ├── dom-extraction/             # semantic element tree
│   ├── tailwind/                   # class-to-style interpretation
│   ├── css-extraction/             # style blocks, modules, inline styles
│   ├── content-extraction/
│   └── media-extraction/
├── design-graph/
│   ├── schema/                     # versioned graph contracts
│   ├── builders/
│   ├── normalization/
│   ├── provenance/                 # source span for every recovered decision
│   └── validation/
├── compiler/
│   ├── planning/                   # graph-to-target lowering plan
│   ├── hierarchy/                  # page/section/container/widget tree
│   ├── primitives/                 # exact native primitive lowering
│   ├── widgets/                    # capability-checked widget lowering
│   ├── styles/                     # native BuilderStyle lowering
│   ├── responsive/                 # breakpoint lowering
│   ├── media/                      # media roles -> asset requests/props
│   ├── theme/                      # tokens and fonts
│   ├── ids/                        # deterministic stable IDs
│   └── diagnostics/
├── css-layer/
│   ├── classifier/                 # native-style vs CSS-only decision
│   ├── sanitizer/                  # parsed allowlist, URL/selector policy
│   ├── scoper/                     # stable node-bound selectors
│   ├── lowering/                   # props.advanced.customCss target
│   └── budget/                     # rule/selector/complexity limits
├── motion/
│   ├── extraction/
│   ├── normalization/
│   ├── lowering/                   # existing advanced.motion subset
│   └── accessibility/              # reduced-motion contract
├── validator/
│   ├── source-validation/
│   ├── graph-validation/
│   ├── capability-validation/
│   ├── blueprint-validation/
│   ├── fidelity-validation/
│   └── security-validation/
├── benchmarks/
│   ├── fixtures/
│   ├── expected-graphs/
│   ├── expected-blueprints/
│   ├── references/
│   ├── captures/
│   ├── scoring/
│   └── reports/
└── __tests__/
    ├── ast/
    ├── interpreter/
    ├── design-graph/
    ├── compiler/
    ├── security/
    └── end-to-end/
```

No folder should be created until its contract is needed. This is a responsibility map, not a request to scaffold empty modules.

## Pipeline contracts

Every stage should consume and produce an immutable, versioned artifact with diagnostics and provenance. It should never mutate another stage’s artifact.

### 1. Generation brief

Inputs:

- User prompt and explicit decisions.
- Verified business facts and missing-fact list.
- Page scope, goals, audience, desired tone, and media constraints.
- V11 source-language profile and supported feature contract.

The generator should be told it is authoring a static design representation, not deployable application code. It should prefer semantic HTML, explicit class strings, local pure components, static arrays, stable keys, accessible labels, and named media placeholders.

It should avoid runtime state, network calls, server actions, third-party components, dynamic imports, computed class builders, arbitrary packages, canvas/WebGL, and code whose visual output depends on execution.

### 2. UI source artifact

Conceptual fields:

```text
UiSourceArtifact
  version
  languageProfile
  files[]                 # bounded virtual files; no filesystem execution
  entryFile
  generatorMetadata
  sourceHash
  diagnostics[]
```

The initial profile should be narrower than full Next.js:

- TSX/JSX function components.
- Intrinsic HTML elements.
- Local, statically analyzable components.
- Literal props, object/array literals, bounded `.map()` over literal data.
- Static `className`, inline style objects, and bounded CSS text.
- Named image/video placeholders or allowed static URLs.
- No hooks, effects, event logic, data fetching, environment access, or arbitrary imports.

“Next.js/Tailwind representation” is a model authoring dialect, not a promise to support the entire Next.js runtime.

### 3. Normalized AST

The parser produces syntax only. A separate normalizer selects the supported subset and records unsupported constructs by source span. Parsing success must never imply semantic safety.

Required AST concerns:

- JSX hierarchy and fragments.
- Intrinsic tags and local component references.
- Literal attributes and expressions.
- Static conditional branches when resolvable.
- Static iteration over local literal data.
- Imports classified as type, local, asset, framework, or forbidden.
- Tailwind class tokens, inline styles, and CSS blocks kept as separate inputs.

### 4. Static DOM/design extraction

The interpreter expands only provably static local components. It does not run JavaScript. It uses a deliberately small evaluator for literals, object/array property access, template literals with static operands, and bounded mapping.

Output is a semantic DOM model with:

- Element/component role.
- Text and content role.
- Children and ordering.
- Class/style references.
- Media references.
- Accessibility semantics.
- Source provenance.
- Unresolved expressions and confidence.

### 5. Design Graph

The Design Graph is the central v11 intermediate representation. It must preserve design intent even when the current Builder cannot lower all of it.

```text
DesignGraph
├── document
│   ├── pages
│   ├── metadata
│   └── global resources
├── tokens
│   ├── colors / gradients
│   ├── typography / fonts / type scale
│   ├── spacing / sizing
│   ├── radius / borders / shadows
│   └── motion durations / easing
├── nodes
│   ├── semanticRole
│   ├── content
│   ├── children
│   ├── layout
│   ├── visualStyle
│   ├── responsiveRules
│   ├── states
│   ├── effects
│   ├── motion
│   ├── mediaRole
│   ├── accessibility
│   └── provenance
├── layers
│   ├── stacking relationships
│   ├── overlays / pseudo-elements
│   └── section transitions
├── resources
│   ├── images / video
│   ├── icons
│   └── fonts
└── diagnostics
    ├── unsupported intent
    ├── ambiguity
    └── confidence
```

#### Layout model

The graph should describe:

- Block, flex, grid, and overlay/stack contexts.
- Tracks, spans, alignment, ordering, wrapping, and gaps.
- Box constraints, aspect ratios, min/max sizing, and container behavior.
- Normal-flow versus positioned relationships.
- Full bleed, boxed, framed, sticky, and viewport-relative sections.
- Intentional overlap and controlled overflow.
- Breakpoint-specific property changes and structural warnings.

#### Visual model

The graph should normalize values rather than retain Tailwind tokens as its primary representation. A Tailwind class is provenance; the graph value is the recovered CSS/design meaning. It should represent gradients, shadows, backdrop effects, borders, masks/filters where supported, opacity, blend behavior, object treatment, and state variants.

#### Content and media model

Content should be semantic: eyebrow, heading, body, CTA, navigation, proof item, FAQ question/answer, caption, and similar roles. Media should carry purpose such as hero background, editorial portrait, product shot, gallery item, texture, video, or decorative layer, plus crop, focal point, overlay, aspect, and responsive behavior.

#### Provenance

Every significant graph decision should retain its source file/span and extraction method. Provenance enables actionable diagnostics: “this computed class could not be resolved” is materially better than a generic low-fidelity score.

## Blueprint compiler

The compiler is a lowering system, not a second designer. It should not invent a conventional replacement merely because the target lacks a direct concept.

### Compilation phases

1. **Capability analysis:** Compare every graph feature with current native style, primitive widget, production widget, CSS layer, motion, and responsive capabilities.
2. **Lowering plan:** Choose the least lossy target for each node and effect before emitting Blueprint nodes.
3. **Hierarchy compilation:** Produce stable page/section/container/column/content nodes with deterministic IDs and legal parent/child relationships.
4. **Native style compilation:** Lower all supported layout and presentation into `BuilderStyle` and theme tokens.
5. **AI Design Layer compilation:** Lower only residual, approved visual rules into node-scoped `props.advanced.customCss`.
6. **Motion compilation:** Lower supported motion to `props.advanced.motion`; reject or simplify unsupported timelines explicitly.
7. **Media planning:** Emit role-aware media requests, then hydrate existing image/video props without changing design geometry.
8. **Blueprint validation:** Run existing schema, tree, serialization, widget, render-contract, and parity validation.
9. **Fidelity validation:** Compare the emitted Blueprint contract with the source Design Graph and enumerate every loss.

### Target-selection order

For each graph construct:

```text
exact native primitive + BuilderStyle
  -> exact registered widget contract, if it preserves editability/anatomy
  -> native structure + bounded AI Design Layer CSS
  -> supported simplification with explicit fidelity cost
  -> compilation failure / regeneration request
```

A premium widget should not be selected merely because its name resembles the semantic section. It is eligible only if its editable prop, media, hierarchy, responsive, and visual capabilities match the graph.

### Stable ID policy

IDs should be deterministic from page path, semantic role, source provenance, and sibling occurrence—not model-generated UUIDs. Stable IDs are required for scoped CSS, motion bindings, diffing, regeneration, editor selection, and benchmark comparison.

### Initial persistence policy

For the first implementation milestone:

- Persist only the existing Blueprint if/when an endpoint is later approved.
- Keep source, AST, Design Graph, lowering plan, and diagnostics as ephemeral test artifacts or forensic files.
- Lower native design into existing node styles/theme.
- Lower residual effects into existing `props.advanced.customCss` and `props.advanced.motion` only after security/capability validation.
- Do not change Blueprint schema or add v11 fields to metadata.

If later product requirements need editable Design Graph round-tripping, that is a separate schema/serialization project and must not be smuggled into the initial compiler.

## AI Design Layer

“Native Builder structure + AI Design Layer” is a compilation policy, not initially a new runtime layer.

Example:

```text
Native Blueprint
Hero section
└── Container
    ├── Content column
    │   ├── Heading
    │   ├── Text
    │   └── Button container
    └── Image

Residual AI Design Layer
- scoped gradient overlay pseudo-element
- backdrop blur on a floating proof panel
- hover treatment
- approved keyframes / reveal parameters
- breakpoint-specific residual rule not expressible by BuilderStyle
```

### Classification rules

Use native Builder fields for:

- Tree structure and content.
- Flex/grid/block layout.
- Position, offsets, z-index, overflow.
- Common backgrounds, typography, sizing, spacing, borders, radii, shadows, transforms, and transitions supported by the resolver.
- Standard responsive property overrides.

Use the CSS layer only for approved residuals such as:

- Pseudo-elements and generated decorative layers.
- `:hover`, `:focus-visible`, and other bounded state selectors.
- Backdrop filters, masks, clip paths, blend/filter effects when policy permits.
- Complex gradients or section-transition decoration.
- Carefully scoped media/container queries not representable in native responsive values.

Do not use CSS to conceal incorrect hierarchy, recreate all layout outside Builder, inject content, target unrelated nodes, load arbitrary resources, or bypass responsiveness/editability.

### CSS security and quality policy

The v11 CSS layer must operate on a parsed CSS AST. Required controls:

- Allowlisted properties and at-rules.
- Node-local selector rewriting with stable data selectors.
- Rejection of global roots, unrelated IDs/classes, broad universal selectors, and cross-page selectors.
- URL policy for `url()`, `@import`, fonts, cursors, and external resources.
- Declaration, rule, selector-specificity, nesting, byte-size, and animation-count budgets.
- Rejection of browser-behavior or data-bearing constructs outside policy.
- Reduced-motion variants for animation.
- A diagnostic explaining why each CSS rule could not be lowered natively.

The existing `selector` string replacement is an output adapter, not sufficient validation.

## Motion architecture

The graph should normalize motion independently of the existing runtime:

```text
trigger -> target -> initial state -> final state -> timing -> coordination -> accessibility fallback
```

The lowering layer then maps supported cases to existing motion fields:

- Entrance presets.
- Duration, delay, and easing.
- Viewport trigger.
- Staggered children.
- Hover translate/scale/opacity.
- Pin/sticky behavior.
- Mouse response.
- Horizontal/vertical parallax.
- Approved custom keyframes.

Unsupported scroll timelines, layout morphs, multi-node timelines, or state machines remain graph diagnostics. The compiler must also detect transform conflicts between native style, custom CSS, and runtime motion.

## Responsive architecture

V11 should model responsive intent before translating it into Builder’s desktop/tablet/mobile values.

The first supported contract should include:

- Property overrides for layout, tracks, direction, order, gap, spacing, sizing, typography, position, and visibility.
- One shared semantic node tree across viewports.
- Explicit inheritance and normalized breakpoint mapping.
- Diagnostics for source breakpoints that cannot map without material loss.

Different component trees at different breakpoints are outside the first milestone. The interpreter may detect them, but the compiler should fail or assign a high fidelity cost rather than silently merging incompatible trees.

## Validation gates

### Source gate

- Parses successfully.
- Uses supported files/imports/syntax.
- Contains no executable side-effect contract.
- Stays within file, AST-depth, element-count, expression, and token budgets.

### Graph gate

- Valid tree and stable identities.
- Resolved layout contexts.
- Typed styles/tokens/resources.
- Accessible content semantics.
- All unresolved expressions and ambiguous roles recorded.

### Capability gate

- Every feature classified as native, CSS, motion, simplified, or unsupported.
- No unknown property is assumed to render merely because `BuilderStyle` has an index signature.
- Widget selections prove exact capability compatibility.

### Blueprint gate

- Existing Blueprint schema/tree/serialization validation passes unchanged.
- No placeholder content or unsafe resource remains.
- Node-count and depth budgets pass.
- Canvas/runtime render contract agrees at desktop, tablet, and mobile.

### Fidelity gate

Use non-compensating categories so strong copy cannot hide broken geometry:

- Structure and semantic anatomy.
- Layout and responsive composition.
- Typography and visual tokens.
- Effects/CSS fidelity.
- Motion fidelity.
- Content completeness.
- Media-role completeness.
- Editability.
- Canvas/runtime parity.

Critical unsupported intent fails regardless of aggregate score.

## Benchmark strategy

V11 benchmarks should measure whether design survives each boundary, not merely whether JSON validates.

### Initial benchmark set

Start with 6–10 deliberately different static pages:

- Cinematic, full-bleed architecture hero.
- Asymmetric editorial studio page.
- Bento-style SaaS product page.
- Luxury product page with layered media.
- Hospitality page with gallery rhythm.
- Professional-services page with restrained typography and proof.
- At least one dense FAQ/content page.
- At least one design with overlap, glass, hover, and bounded motion.

Each fixture should include source, expected Design Graph assertions, expected Blueprint invariants, three viewport captures, and a list of intentional unsupported features.

### Required comparisons

- Source AST -> extracted semantic DOM.
- Extracted DOM/styles -> Design Graph.
- Design Graph -> lowering plan.
- Lowering plan -> Blueprint.
- Blueprint -> Canvas and runtime DOM/style contract.
- Desktop/tablet/mobile screenshots -> reference or structural visual metrics.
- Save/reload -> exact relevant Design Layer and motion preservation.

V10 output may be retained as a non-blocking comparison baseline, but v11 should not reuse v10’s architecture merely to improve that comparison.

## API and operational isolation

No v11 endpoint is part of Phase 0. A later endpoint should be new (for example, `/api/builder-v2/ai/generate-v11`) and should not branch inside v10’s orchestrator.

Future orchestration should expose stage artifacts and fail closed:

```text
generate source
  -> validate source
  -> interpret
  -> validate graph
  -> compile
  -> validate Blueprint
  -> render/benchmark
  -> only then persist
```

Provider failure, unsupported syntax, low fidelity, unsafe CSS, or render-parity failure must not write a partial Blueprint over an existing page.

## Recommended first implementation milestone

### Milestone V11-M1 — static interpreter-to-Blueprint proof

Goal: prove that one authored static TSX/Tailwind page can be parsed and compiled to a high-fidelity, editable Blueprint without any Builder-core change.

Scope:

- One in-repository source fixture; no model call and no API.
- TSX/JSX parser with intrinsic elements, local pure components, literal props, static arrays, and static class strings.
- A documented Tailwind subset covering layout, spacing, sizing, typography, colors, backgrounds, border/radius/shadow, positioning, overflow, z-index, responsive prefixes, and basic states.
- Design Graph v0 with hierarchy, semantic role, native layout/style, responsive rules, content, media placeholders, provenance, and diagnostics.
- Compiler to page/section/container/column/heading/text/button/image primitives only.
- Native `BuilderStyle` lowering first; no custom CSS or motion in the first passing slice.
- Existing Blueprint validation plus structural Canvas/runtime render-contract tests at three viewports.
- Golden assertions for one asymmetric editorial hero followed by one contrasting content section.

Acceptance criteria:

- Generated source is never executed.
- Output passes existing schema, tree, and serialization validation unchanged.
- Source hierarchy/content and supported responsive layout survive compilation with no critical fidelity losses.
- Every emitted Blueprint node links to source provenance in the ephemeral compilation report.
- Unsupported syntax fails with source-located diagnostics.
- No files outside `ai-v11/`, v11 tests/fixtures, and v11 docs are modified.

Why this milestone first: it tests the riskiest architectural claim—the non-executing interpreter and Design Graph boundary—without provider variability, CSS security complexity, motion conflicts, media services, persistence, or production routing.

## Complexity estimate

Overall v11 architecture: **high**, approximately **8/10** engineering complexity.

| Workstream | Complexity | Main reason |
| --- | ---: | --- |
| Static TSX/JSX subset parser/normalizer | 6/10 | Parser libraries help; safe semantic subset and diagnostics require discipline. |
| Static interpreter/component expansion | 8/10 | JavaScript-like expressions create a hard boundary between useful and executable. |
| Tailwind/CSS interpretation | 8/10 | Variants, arbitrary values, precedence, and version semantics are substantial. |
| Design Graph and provenance | 7/10 | Contract quality determines long-term fidelity and debuggability. |
| Blueprint compiler | 8/10 | Must preserve design while satisfying hierarchy, editability, widgets, and render parity. |
| CSS security/scoping | 9/10 | String CSS is powerful and must be treated as untrusted input. |
| Motion lowering | 7/10 | Existing support is useful, but transform/timeline conflicts are subtle. |
| Benchmarks/visual evaluation | 8/10 | Reliable visual quality measures and references require careful calibration. |
| API/provider/persistence integration | 6/10 | Familiar integration work, but safe failure and cost/latency controls matter. |

M1 alone is **medium-high** complexity, approximately **6–8 engineer-weeks** for one experienced engineer including tests and diagnostics, or **3–5 calendar weeks** for a focused two-person effort. This is an architecture estimate, not a delivery commitment; parser/library choices and the strictness of visual acceptance can move it materially.

## Principal risks and architecture responses

| Risk | Architecture response |
| --- | --- |
| “Do not execute React” erodes under feature pressure | Define a versioned static language profile and reject everything outside it. |
| Interpreter becomes a partial JavaScript runtime | Keep evaluator operations explicit, pure, bounded, and non-extensible by source code. |
| Design Graph mirrors Tailwind or Builder too closely | Normalize to design concepts; keep source and target mappings in provenance/lowering layers. |
| CSS becomes the real renderer | Enforce native-first lowering, CSS budgets, and fidelity/editability metrics. |
| Compiler recreates v10 recipes | Compile recovered hierarchy and constraints directly; do not choose section templates before design. |
| Widget selection reintroduces design loss | Require exact capability proof; primitives are the safe default. |
| Renderer changes become tempting | Treat renderer limitations as diagnostics and obtain separate approval for any later core change. |
| Valid Blueprint still looks poor | Gate rendered multi-viewport benchmarks and non-compensating visual categories. |
| Model output varies | Establish deterministic fixture-based interpreter/compiler certification before adding the generator. |

## Architectural decision

Proceed with v11 as an isolated, non-executing source-interpreter and Blueprint-compiler architecture. Do not begin with a provider endpoint, a new widget catalog, or changes to Builder core. Begin by proving that a static authored source fixture survives `source -> AST -> Design Graph -> existing Blueprint -> existing renderer` with measured fidelity.
