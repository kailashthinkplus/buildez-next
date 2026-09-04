# AI v10 Root Cause Fix RC-3.5

## Outcome

RC-3.5 establishes an end-to-end production contract for native widgets: population, typed nested hydration, exact media assignment, persistence, and a final non-compensating gate. It does not claim that the rendered output is visually premium. Background and media art direction remain RC-4 work.

## Root causes from RC-3.5A

The forensic audit found four shared boundaries:

1. `compileNativeVisualCapability` emitted the same flat content envelope for every widget instead of purpose-specific structures.
2. creative hydration could traverse arrays but had no typed widget-specific structures or mutation constraints.
3. image generation discovered only primitive `image` nodes, not native widget media slots.
4. renderers masked missing data with demo media/copy, while verified-data capabilities such as logo clouds and WhatsApp were not safely gated.

Serialization was exact and was not a root cause.

## RC-3.5B population architecture

The production flow now starts with immutable `ProductionWidgetPopulationContract` records and declarative `IndustryRolePolicy` data:

```text
section intent
  -> native capability selection
  -> ProductionWidgetPopulationContract
  -> dedicated WidgetPopulationCompiler
  -> initial validated native props
```

Contracts declare supported roles and families, required and optional props, item limits, verified facts, editable paths, hydration and media schemas, renderer shape, and fallback policy. Dedicated compilers produce section-scoped semantic slots and stable nested IDs. They contain no fixed business copy. Missing verified logo assets or contact destinations cannot be fabricated.

## RC-3.5C typed hydration and media

Creative enrichment remains props-only. Widget-specific schemas constrain allowed fields, immutable identity/structure, item counts, required keys, string limits, URLs, and deletion. Unknown fields, node/tree/type/style mutations, malformed URLs, duplicate IDs, and required-field deletion are rejected.

Hydration receives compact page-wide context: verified and missing facts, brand/design context, section order, adjacent summaries, major headlines, CTA labels, widget contracts, and media roles. Native media discovery traverses contract-declared paths such as `media.src`, `slides[].src`, and `galleryItems[].src`. Generated results map back to the exact stable path; unsafe URLs and unknown shapes are rejected. Nested props, IDs, order, and media paths survive serialization.

## RC-3.5D production gate

`NativeWidgetPopulationGate` runs after creative hydration, image assignment, deterministic cleanup, and renderer-parity evaluation, but before a Blueprint can be returned or persisted as successful. Its decision is non-compensating: engineering, semantic, visual, or critic scores cannot hide population failure.

The gate requires:

- complete contract-required props;
- assigned required media;
- no registered defaults or renderer demo content;
- compatible production/Inspector/renderer shape;
- verified facts for fact-dependent widgets;
- industry and role compatibility;
- distinct contract-defined major copy across unrelated sections;
- exact nested prop serialization/reload.

Duplicate-copy fingerprints cover section/widget headlines, hero/CTA primary actions, carousel item titles, timeline titles, FAQ questions, and footer summary. Short unavoidable labels such as `Contact`, `Learn more`, and `Submit` are not treated as distinctive copy.

## Recovery rules

Only one deterministic recovery pass is allowed:

- **Repopulate:** only when valid contract content can be reconstructed without default/demo filler. No deterministic content reconstruction was safe for the fixed fixture, so none was falsely reported.
- **Replace:** a floating WhatsApp widget without a verified destination becomes a standard contact CTA using its existing hydrated purpose/copy; the destination is not invented.
- **Omit:** optional unresolved gallery/carousel or unverifiable optional proof sections may be removed with explicit diagnostics.
- **Fail:** unresolved hero media, essential conversion/navigation content, renderer mismatch, unsafe facts, incomplete required content, or unresolved required nested media after recovery blocks return.

## Fixed fixture result

The deterministic Sanjeevini seed `104729` correctly fails the production gate. The result is intentionally not loosened:

- 8 initially eligible native widgets;
- carousel and gallery omitted as optional because their required media remained unresolved;
- hero retained and rejected because `props.media.src` remained empty;
- 6 retained widgets shared the normalized major-title fingerprint `sanjeevini group`;
- persistence remained exact;
- no default leakage, renderer-shape mismatch, industry mismatch, or fabricated facts were accepted.

This distinction matters: the forensic fixture deliberately returns zero generated images and replaces semantic tokens with the business name. Production image generation normally attempts every declared slot, but provider success is still mandatory; failed required media now blocks production return. Fixture behavior is evidence input, not production logic.

## Cross-industry certification

Deterministic contract/gate certification covers luxury residential development, healthcare, SaaS, hospitality, automotive service, architecture, education/coaching, and D2C. All 8 cases pass with 8 distinct widget sequences, complete required media, no defaults, unsafe facts, fit failures, duplicate copy, or terminology leaks. This is a population/gate certification, not a provider-backed creative or visual-quality certification.

## Old and new flow

```text
Old:
selection -> shared flat props -> unconstrained hydration -> primitive-only images
-> demo renderer fallbacks -> critic scores -> successful return

New:
selection -> typed population contract -> validated initial native props
-> typed page-wide hydration -> exact native media slots -> persistence/parity
-> non-compensating population gate -> recover/replace/omit/fail -> return only if passed
```

## Remaining limitations

- Provider-backed normal production generation was not available for certification in this environment.
- The fixed deterministic fixture cannot pass because it intentionally supplies no images and collapses copy specificity.
- Current screenshot evidence predates a successful gate because the new fixed run is rejected before successful persistence/capture.
- Visual art direction, background systems, richer media choice, and premium rendered composition remain outside RC-3.5.

No production source contains the fixture business, seed, section IDs, site ID, benchmark headline, or one-off fixture substitution.
