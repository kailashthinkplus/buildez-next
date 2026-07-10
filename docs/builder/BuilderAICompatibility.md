# Builder AI Compatibility

Date: 2026-07-08  
Phase: BSP-5 update  
Status: Failed, AI generation must remain gated

## Decision

Native Builder is not compatible with AI-generated editable nodes yet.

## Compatibility Requirements

AI-generated nodes require:

- Complete widget coverage.
- Stable widget schema and defaults.
- Validated property bindings.
- Per-device responsive bindings.
- Stable serialization schema.
- Canvas/preview/publish parity.
- Atomic CommandBus transactions.
- Reliable undo/redo.
- Reliable clipboard and repair workflows.
- Editable header/footer policy.
- Layers navigation for complex generated pages.
- Theme token editing.
- Accessibility and keyboard compliance.

## Current Compatibility Gaps

| Area | Status | AI Risk |
| --- | --- | --- |
| Widget library | Incomplete | AI overuses primitives or placeholders |
| Inspector bindings | Unverified | Edits may not render |
| Responsive controls | Unstable | Mobile/tablet output cannot be trusted |
| Serialization | Insufficient validation | Invalid AI payloads can persist |
| Runtime parity | Unproven | Published output may differ |
| History | Functional but not durable | AI repair operations are hard to undo |
| Clipboard | Incomplete | Human repair flow is weak |
| Layers | Basic | Complex AI pages become hard to edit |
| Theme editing | Placeholder panels | Generated design tokens are not manageable |
| Header/footer | Not normal editable nodes | AI site structure remains partly locked |

## BSP-5 Contract Audit

BSP-5 added metadata-only AI compatibility contracts under `apps/web-app/modules/builder-v2/ai-compatibility/`.

Entry point:

`runAICompatibilityAudit()`

Contract files:

- `aiCompatibility.ts`
- `aiNodeCapability.ts`
- `aiInspectorCapability.ts`
- `aiCommandCapability.ts`
- `aiRegenerationScope.ts`
- `aiEditSafety.ts`
- `aiCompatibilityMatrix.ts`
- `aiCompatibilityValidation.ts`
- `aiCompatibilityVerification.ts`
- `version.ts`
- `index.ts`
- `README.md`

The contract audit reports:

- `aiReady: false`
- `status: blocked`
- contract score: `6/100`

This low contract score is intentional. Native widget shapes are known, but AI insertion, AI CommandBus execution, AI publish safety, regeneration, user-edit preservation, responsive editing, and inspector use remain blocked until release gates pass.

## Widget Compatibility Summary

| Widget | Content Shape Known | Style Shape Known | Responsive Safe | AI Insert Safe | AI Inspector Safe | AI CommandBus Safe | AI Publish Safe |
| --- | --- | --- | --- | --- | --- | --- | --- |
| page | Yes | Yes | No | No | No | No | No |
| section | Yes | Yes | No | No | No | No | No |
| container | Yes | Yes | No | No | No | No | No |
| column | Yes | Yes | No | No | No | No | No |
| heading | Yes | Yes | No | No | No | No | No |
| text | Yes | Yes | No | No | No | No | No |
| button | Yes | Yes | No | No | No | No | No |
| image | Yes | Yes | No | No | No | No | No |
| video | Yes | Yes | No | No | No | No | No |
| icon | Yes | Yes | No | No | No | No | No |
| divider | Yes | Yes | No | No | No | No | No |
| spacer | Limited | Yes | No | No | No | No | No |

## Unsafe AI Areas

- AI Builder node insertion.
- AI CommandBus execution.
- AI Mapper execution into Builder.
- AI publish or preview approval.
- AI responsive edits.
- AI inspector operation.
- AI regeneration or partial regeneration.
- AI preservation of user edits.
- AI custom CSS or JavaScript generation.

## AI Compatibility Score

Score: 42/100

Rationale:

- Strongest assets: native blueprint shape, primitive widgets, CommandBus, inspector foundation, preview/runtime renderer.
- Largest blockers: serialization validation, responsive parity, inspector binding proof, incomplete widgets, unbounded history, weak layers, theme placeholders, and header/footer editability.

Note: the BSP-1 strategic compatibility score remains 42/100. The BSP-5 executable-contract score is 6/100 because the contract module only counts currently safe AI actions, not future shape potential.

## AI Handoff Policy

Until the release gate passes:

- Do not allow AI to insert Builder nodes.
- Do not execute Mapper into Builder store.
- Do not execute CommandBus from AI generation.
- Do not persist AI-generated editable Builder blueprints as production output.
- Keep AI work inert, metadata-only, or shadow-only.

## Minimum AI Compatibility Gate

AI Compatibility must be 90+ with passing tests for:

- Valid AI blueprint payload rejection/acceptance.
- Widget schema compatibility.
- Inspector binding round-trip.
- Responsive desktop/tablet/mobile output.
- Canvas/preview/publish parity.
- Undo/redo after AI-style compound insertion.
- Save/publish after generated-node editing.
