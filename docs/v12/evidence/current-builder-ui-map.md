# Builder UI Map and Parity Classification

All capabilities are classified `PRESERVE_BEHAVIOR_REFRACTOR_INTERNALS`: the visible and interaction behavior is preserved, while Builder 3 must own its implementation and canonical React-project runtime. Status `BASELINED` means source/tests were identified, not that Builder 3 parity has passed.

| Capability | Current source/evidence | State owner / dependencies | Existing test evidence | Status |
|---|---|---|---|---|
| Builder shell layout | `modules/builder-v2/workspace/BuilderShell.tsx` | Builder, canvas, panel and selection stores | authenticated Builder and visual Playwright suites | BASELINED |
| Top toolbar | `workspace/BuilderHeader.tsx` | canvas and builder stores; command bus | responsive, zoom, persistence and command tests | BASELINED |
| Site/page selector | `workspace/BuilderHeader.tsx` | route params and pages API | authenticated Builder suite | BASELINED |
| Canvas viewport | `canvas/BuilderCanvas.tsx`, `canvas/NodeRenderer.tsx` | canvas, builder, selection, hover and drag stores | canvas/runtime, DnD, scroll and zoom suites | BASELINED |
| Responsive controls | `workspace/BuilderHeader.tsx`, `store/useCanvasStore.ts` | canvas store and responsive breakpoints | responsive-targeting and device-value tests | BASELINED |
| Left sidebar/components | `sidebar/PanelContainer.tsx` and route-local sidebar files | panel store and widget registry | widget and operations suites | BASELINED |
| Layers | route-local `sidebar/LayersPanel.tsx`, `layers/layersMetadata.ts` | builder and selection stores; command bus | layers reorder/metadata tests | BASELINED |
| Inspector | `inspector/InspectorPanel.tsx`, `inspector/tabs/*` | selection/builder stores and commands | inspector control suites | BASELINED |
| Chat | `ai/components/AiPanel.tsx` | AI store and `AiConversation` | AI generation tests; no V12 parity yet | BASELINED |
| Code editor | no active Monaco implementation confirmed in shell | unknown until UI runtime inspection | no confirmed Monaco parity test | BLOCKED |
| Panel resizing | `workspace/BuilderShell.tsx`, panel state | panel store and local layout state | browser behavior requires fresh baseline | BASELINED |
| Save/unsaved state | `workspace/BuilderHeader.tsx` | builder dirty/revision state; Blueprint API | save/reload and persistence matrix | BASELINED |
| Undo/redo/history | command bus and `store/useHistoryStore.ts` | command bus and builder state | history transaction/large undo-redo tests | BASELINED |
| Preview | toolbar plus `app/preview/...` | Builder 2 published renderer | preview/internal visual suites | BASELINED |
| Publish | `components/PublishModal.tsx`, `workspace/BuilderHeader.tsx` | Blueprint save and page publish API | no V12 publish certification | BASELINED |
| Keyboard/accessibility | shell/toolbar controls | command bus, focus behavior | keyboard-focus Playwright test; full a11y audit absent | BASELINED |

No item is approved for removal or redesign. Visual parity approval requires authenticated baseline capture and the Builder 3 comparison suite.
