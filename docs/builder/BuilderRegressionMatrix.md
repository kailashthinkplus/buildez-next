# Builder Regression Matrix

Date: 2026-07-08  
Phase: BSP-9 update  
Status: Serialization/history, responsive/inspector, and renderer parity helpers added; executable runner still required

## Regression Levels

- L1: Pure contract/unit tests.
- L2: Store/command integration tests.
- L3: Component interaction tests.
- L4: Browser visual/behavior tests.
- L5: Stress/performance tests.

## Matrix

| Area | Bugs Covered | Level | Required Fixtures | Release Gate |
| --- | --- | --- | --- | --- |
| Serialization schema | BUG-0025, BUG-0037, BUG-0038 | L1/L2 | Valid blueprint, invalid nodes, invalid parent links, unknown widgets | Serialization stable |
| CommandBus history | BUG-0031, BUG-0032, BUG-0033 | L1/L2/L5 | 100-command fixture, compound insert fixture | History stable |
| Inspector binding proof | BUG-0001, BUG-0006, BUG-0007, BUG-0040, BUG-0048 | L1/L3/L4 | Primitive widget fixture, token fixture, rich text fixture | Inspector stable |
| Responsive controls | BUG-0002, BUG-0019, BUG-0049 | L1/L3/L4 | Desktop/tablet/mobile divergent fixture | Responsive stable |
| Canvas/runtime parity | BUG-0026, BUG-0027, BUG-0039 | L3/L4 | Primitive, premium, responsive, theme fixture | Canvas/preview/publish stable |
| Clipboard | BUG-0010, BUG-0011 | L2/L3/L4 | Nested layout fixture, style fixture | Manual quality |
| Drag/drop and layers sorting | BUG-0015, BUG-0035, BUG-0036, BUG-0046 | L2/L3/L4 | Deep tree fixture, reorder fixture | Canvas stable |
| Layout width controls | BUG-0009 | L3/L4 | Full/boxed fixture, site chrome fixture | Responsive/canvas stable |
| Header/footer policy | BUG-0004 | L1/L3/L4 | Site layout fixture, page header/footer fixture | No critical bugs |
| Theme panels | BUG-0016, BUG-0017, BUG-0041 | L1/L3/L4 | Token-heavy fixture | Inspector stable |
| Accessibility and keyboard | BUG-0028, BUG-0029, BUG-0043, BUG-0047 | L3/L4 | Keyboard-only fixture, ARIA fixture | Accessibility |
| Autosave/publish | BUG-0045, BUG-0050 | L2/L4 | Dirty revision fixture, save failure fixture | Publish stable |
| Widget expansion | BUG-0003, BUG-0012, BUG-0018, BUG-0042 | L1/L3/L4 | Widget registry fixture, embed/code fixture | AI compatibility |
| Motion and advanced UX | BUG-0005, BUG-0013, BUG-0014, BUG-0020, BUG-0030 | L3/L4/L5 | Motion fixture, large layers fixture, fullscreen fixture | Quality Score 90+ |
| AI compatibility contracts | BUG-0002, BUG-0007, BUG-0024, BUG-0025, BUG-0026, BUG-0027, BUG-0031, BUG-0033, BUG-0037, BUG-0039 | L1 | Native widget matrix, command matrix, safety rules | AI Compatibility 90+ |

## BSP-7 Fix Coverage

| Area | Bugs Covered | Status |
| --- | --- | --- |
| Blueprint validation | BUG-0037 | Production helper added, compile-safe spec updated |
| Node tree validation | BUG-0037 | Unique ids, parent ids, child links, cycles, orphans, hierarchy rules added |
| Serialization helpers | BUG-0025, BUG-0037, BUG-0038 | Serialize/deserialize/normalize/repair helpers added |
| CommandBus history | BUG-0031 | Bounded `HistoryManager` added |
| Command transactions | BUG-0033 | Explicit transaction begin/end and atomic undo/redo added |
| Failed command rollback | BUG-0031, BUG-0033 | Invalid command output rejected without history entry |

## BSP-8 Fix Coverage

| Area | Bugs Covered | Status |
| --- | --- | --- |
| Responsive model | BUG-0002, BUG-0019 | Production helper added, compile-safe spec updated |
| Responsive inheritance | BUG-0002 | Desktop/tablet/mobile fallback chain added |
| Responsive override reset | BUG-0002 | Reset helper added and covered in compile-safe spec |
| Inspector device mode | BUG-0002, BUG-0019 | Design and Advanced tabs now use canvas device state |
| Canvas responsive resolution | BUG-0019 | Canvas style picker uses shared resolver |
| Property binding proof | BUG-0007 | Binding registry, validation, and update pipeline added |
| Unsupported inspector controls | BUG-0007 | Registry renderer hides unsupported property types |

## BSP-9 Fix Coverage

| Area | Bugs Covered | Status |
| --- | --- | --- |
| Shared render contract | BUG-0025, BUG-0026, BUG-0039 | Production helper added, compile-safe spec updated |
| Shared style resolution | BUG-0039 | Canvas and runtime use `core/rendering` resolver |
| Responsive render parity | BUG-0026, BUG-0039 | Shared responsive render resolver added |
| Theme token parity | BUG-0025, BUG-0026, BUG-0039 | Shared theme token resolver added |
| Widget parity contract | BUG-0039 | Native widget support list added |
| Preview/publish parity baseline | BUG-0025, BUG-0026 | Contract-level validation added |

## BSP-3 Minimum Suite

BSP-3 created compile-safe coverage for:

1. Blueprint schema validation.
2. CommandBus bounded history.
3. CommandBus transaction grouping.
4. Inspector binding proof for color, size, spacing, typography, and responsive values.
5. Desktop/tablet/mobile responsive round-trip.
6. Canvas/preview/publish parity snapshot baseline.
7. Core widget default serialization.
8. Native node AI compatibility.

Still pending executable runner coverage:

- Clipboard node/style workflow.
- Layers reorder workflow.
- Autosave/preview/publish stale revision behavior.
- Browser-level accessibility audit baseline.
- Browser-level canvas, preview, and published runtime parity.

## BSP-3 Initial Spec Mapping

| Spec | Bugs Covered | Status |
| --- | --- | --- |
| `commands/history-transactions.test.ts` | BUG-0031, BUG-0033 | Compile-safe, includes expected-failing transaction assertion |
| `serialization/blueprint-schema.test.ts` | BUG-0037 | Compile-safe |
| `serialization/save-reload-roundtrip.test.ts` | BUG-0025 | Compile-safe |
| `inspector/property-binding.test.ts` | BUG-0007 | Compile-safe |
| `responsive/device-specific-values.test.ts` | BUG-0002, BUG-0019 | Compile-safe |
| `widgets/core-widgets-serialization.test.ts` | BUG-0037 | Compile-safe |
| `parity/canvas-runtime-contract.test.ts` | BUG-0025, BUG-0026, BUG-0027, BUG-0039 | Compile-safe |
| `ai-compatibility/native-node-contract.test.ts` | BUG-0002, BUG-0007, BUG-0028, BUG-0037, BUG-0039 | Compile-safe |

## BSP-4 Stress Spec Mapping

| Spec | Bugs Covered | Status |
| --- | --- | --- |
| `stress/large-blueprint-stress.test.ts` | BUG-0024, BUG-0031, BUG-0039 | Compile-safe |
| `stress/deep-nesting-stress.test.ts` | BUG-0024, BUG-0039 | Compile-safe |
| `stress/large-undo-redo-stress.test.ts` | BUG-0031, BUG-0033 | Compile-safe |
| `stress/responsive-switching-stress.test.ts` | BUG-0002, BUG-0019, BUG-0049 | Compile-safe |
| `stress/large-image-page-stress.test.ts` | BUG-0024, BUG-0026, BUG-0039 | Compile-safe |
| `stress/section-duplication-stress.test.ts` | BUG-0031, BUG-0033, BUG-0039 | Compile-safe |
| `stress/drag-drop-zoom-stress.test.ts` | BUG-0015, BUG-0035, BUG-0036 | Compile-safe |
| `stress/save-reload-stress.test.ts` | BUG-0025, BUG-0037, BUG-0038 | Compile-safe |
| `stress/ai-generated-page-stress.test.ts` | BUG-0002, BUG-0007, BUG-0024, BUG-0037, BUG-0039 | Compile-safe |

## BSP-5 AI Compatibility Contract Mapping

| Module | Coverage | Status |
| --- | --- | --- |
| `ai-compatibility/aiNodeCapability.ts` | Native node and widget capability metadata | Compile-safe |
| `ai-compatibility/aiInspectorCapability.ts` | Inspector AI safety metadata | Compile-safe |
| `ai-compatibility/aiCommandCapability.ts` | CommandBus AI planning/execution safety metadata | Compile-safe |
| `ai-compatibility/aiRegenerationScope.ts` | Regeneration scope and user-edit preservation policy | Compile-safe |
| `ai-compatibility/aiEditSafety.ts` | AI safety rule metadata | Compile-safe |
| `ai-compatibility/aiCompatibilityMatrix.ts` | Full compatibility matrix | Compile-safe |
| `ai-compatibility/aiCompatibilityValidation.ts` | Warning and metrics calculation | Compile-safe |
| `ai-compatibility/aiCompatibilityVerification.ts` | Metadata-only verification checks | Compile-safe |
| `ai-compatibility/aiCompatibility.ts` | `runAICompatibilityAudit()` entry point | Compile-safe |

## Stress Matrix

| Stress Case | Covered Bugs | Threshold Owner |
| --- | --- | --- |
| 300 node AI-like page | BUG-0024, BUG-0031, BUG-0039 | Wave 1 |
| 500 history snapshots | BUG-0031, BUG-0032 | Wave 1 |
| 500 inspector edits | BUG-0007, BUG-0045 | Wave 1/2 |
| 100 drag/reparent operations | BUG-0035, BUG-0036, BUG-0015 | Wave 2 |
| Full responsive override matrix | BUG-0002, BUG-0019, BUG-0049 | Wave 1 |

## BSP-10 Clipboard, Layers, and Layout Coverage

| Spec | Bugs Covered | Status |
| --- | --- | --- |
| `commands/clipboard.test.ts` | BUG-0011 | Compile-safe; covers subtree copy/paste, duplicate-safe ids, invalid parent rejection, and undo/redo intent |
| `commands/style-clipboard.test.ts` | BUG-0010 | Compile-safe; covers compatible style transfer and incompatible style rejection |
| `commands/layers-reorder.test.ts` | BUG-0015 | Compile-safe; covers sibling reorder, invalid move rejection, and undo/redo intent |
| `inspector/layout-controls.test.ts` | BUG-0009 | Compile-safe; covers full-width/boxed style resolution and responsive layout override intent |
| `helpers/testClipboardHarness.ts` | BUG-0010, BUG-0011 | Compile-safe harness for CommandBus-backed clipboard workflows |
| `helpers/testLayersHarness.ts` | BUG-0015 | Compile-safe harness for CommandBus-backed layer reordering |

Runner status: `apps/web-app/package.json` does not define an executable test runner script. BSP-10 coverage is typechecked regression specification coverage until BSP-3 follow-up runner wiring is approved.

## BSP-11 Inspector UX Coverage

| Spec | Bugs Covered | Status |
| --- | --- | --- |
| `inspector/color-picker.test.ts` | BUG-0001, BUG-0007 | Compile-safe; covers theme-token-ready metadata, responsive color writes, active-device isolation, and clear binding intent |
| `inspector/unit-picker.test.ts` | BUG-0006, BUG-0007 | Compile-safe; covers unit parsing, formatting, unknown-unit fallback, and responsive unit updates |
| `inspector/alignment-controls.test.ts` | BUG-0008, BUG-0007 | Compile-safe; covers text/layout alignment validity and responsive alignment writes |
| `inspector/dead-controls.test.ts` | BUG-0007 | Compile-safe; covers visible binding paths and hidden unsupported controls with disabled reasons |
| `helpers/testInspectorHarness.ts` | BUG-0001, BUG-0006, BUG-0007, BUG-0008 | Compile-safe helper support for inspector property, unit, and alignment specs |

Runner status: `apps/web-app/package.json` does not define an executable test runner script. BSP-11 coverage is typechecked regression specification coverage until runner wiring is approved.

## BSP-12 Theme, Global Section, and Column Coverage

| Spec | Bugs Covered | Status |
| --- | --- | --- |
| `theme/theme-panels.test.ts` | BUG-0016, BUG-0017 | Compile-safe; covers non-empty theme panel sections |
| `theme/theme-tokens.test.ts` | BUG-0016, BUG-0017, BUG-0001 | Compile-safe; covers color, font, spacing, radius, shadow, and token lookup metadata |
| `layout/multi-column-selector.test.ts` | BUG-0018 | Compile-safe; covers required presets, native column counts, ratio serialization, and CommandBus undo |
| `global/header-footer-policy.test.ts` | BUG-0004 | Compile-safe; covers AI/opaque global section blocking and native-structure policy |

Runner status: `apps/web-app/package.json` does not define an executable test runner script. BSP-12 coverage is typechecked regression specification coverage until runner wiring is approved.

## BSP-13 Widget Modernization Coverage

| Spec | Bugs Covered | Status |
| --- | --- | --- |
| `widgets/widget-capabilities.test.ts` | BUG-0003, BUG-0042 | Compile-safe; covers capability metadata for every registered widget |
| `widgets/widget-modernization.test.ts` | BUG-0003, BUG-0012, BUG-0042 | Compile-safe; covers BSP-15 production widget baseline and gated AI state |
| `widgets/widget-inspector-support.test.ts` | BUG-0003, BUG-0007, BUG-0042 | Compile-safe; covers inspector support metadata |
| `widgets/widget-serialization-support.test.ts` | BUG-0037, BUG-0042 | Compile-safe; covers serialization requirements and no opaque output |
| `widgets/widget-ai-readiness.test.ts` | BUG-0003, BUG-0012, BUG-0042 | Compile-safe; covers explicit AI readiness and gated embed/code scaffold |

Runner status: `apps/web-app/package.json` does not define an executable test runner script. BSP-13 coverage is typechecked regression specification coverage until runner wiring is approved.
