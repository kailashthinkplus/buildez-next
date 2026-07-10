# Builder Fix Waves

Date: 2026-07-08  
Phase: BSP-2  
Status: Sprint planning only

## Wave 1 - Structural Blockers

Goal: Build the foundation that makes every later fix testable.

Scope:

- Serialization/schema validation.
- CommandBus/history transactions.
- Responsive control architecture.
- Inspector property binding proof.
- Canvas/runtime parity baseline.

Bugs:

BUG-0002, BUG-0007, BUG-0019, BUG-0024, BUG-0025, BUG-0026, BUG-0027, BUG-0031, BUG-0032, BUG-0033, BUG-0037, BUG-0038, BUG-0039, BUG-0044, BUG-0049.

Exit criteria:

- Invalid blueprints are rejected before persistence.
- CommandBus supports bounded history and transaction grouping.
- Responsive state model is documented and testable.
- Inspector binding harness can prove control-to-render behavior.
- Canvas, preview, and published runtime have a baseline parity test.

## Wave 2 - Editing Basics

Goal: Restore the manual repair loop needed before generated pages can be safely edited.

Scope:

- Copy/paste nodes.
- Copy/paste style.
- Layers sorting.
- Full-width/boxed layout controls.
- Header/footer editability policy.
- Selection, keyboard, accessibility, autosave, and publish flow basics.

Bugs:

BUG-0004, BUG-0009, BUG-0010, BUG-0011, BUG-0015, BUG-0021, BUG-0023, BUG-0028, BUG-0029, BUG-0034, BUG-0035, BUG-0036, BUG-0043, BUG-0045, BUG-0046, BUG-0047, BUG-0050.

Exit criteria:

- Users can copy, paste, reorder, select, and repair complex native pages.
- Header/footer policy is decided and documented before widget expansion.
- Layers can support reorder and meaningful identification.
- Autosave/preview/publish flows use stable saved revisions.

## Wave 3 - Inspector UX

Goal: Make the inspector professional, token-aware, responsive-aware, and trustworthy.

Scope:

- Color picker.
- Unit picker.
- Alignment controls.
- Theme colors/settings panel.
- Controls that do nothing.
- Rich text policy.

Bugs:

BUG-0001, BUG-0006, BUG-0008, BUG-0016, BUG-0017, BUG-0022, BUG-0040, BUG-0041, BUG-0048.

Exit criteria:

- Every inspector control maps to a validated rendered effect or is removed.
- Color and unit controls are structured, token-aware, and regression tested.
- Theme controls can change global tokens without breaking per-node styles.

## Wave 4 - Widget Expansion

Goal: Expand Builder vocabulary after the editing contract is stable.

Scope:

- Richer widgets.
- Embed/code widget.
- Multi-column selector.
- Header/footer widgets or sections.
- Advanced layout primitives.

Bugs:

BUG-0003, BUG-0012, BUG-0018, BUG-0042.

Exit criteria:

- Widget registry and marketplace expose production-safe widgets.
- Embed/code widgets have safety policies.
- Premium widgets are either natively editable or explicitly locked with clear policy.

## Wave 5 - Motion and Premium UX

Goal: Add advanced authoring capabilities without destabilizing the core editor.

Scope:

- Parallax controls.
- Transition controls.
- GSAP/motion metadata.
- Fullscreen Builder.
- Layers UI upgrade.
- Toolbar and mobile Builder policy.

Bugs:

BUG-0005, BUG-0013, BUG-0014, BUG-0020, BUG-0030.

Exit criteria:

- Advanced motion has accessibility and reduced-motion policy.
- Fullscreen and toolbar UX improve review and repair workflows.
- Layers panel supports dense generated pages.

## Wave 6 - AI Readiness

Goal: Re-open AI node generation only after native Builder passes release gates.

Scope:

- AI node actions.
- AI inspector prompts.
- Regeneration metadata.
- Partial regeneration safety.
- Streaming canvas compatibility.

Bugs:

No current BSP-1 bug is assigned directly to Wave 6 because Wave 6 is gated by Waves 1-5. It should produce new AI-specific work items only after Quality Score and AI Compatibility can credibly approach 90+.

Exit criteria:

- No blockers or critical bugs.
- Quality Score 90+.
- AI Compatibility 90+.
- Regression and stress suites pass.
- Mapper and CommandBus execution remain explicitly gated until approved.
