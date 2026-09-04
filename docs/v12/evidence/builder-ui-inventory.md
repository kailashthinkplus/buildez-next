# RC0 Builder UI Inventory

Source inspection only; no code was modified. Migration priority `P0` means behavior must be preserved before any Builder route cutover.

| Capability | Source path | Dependencies | Existing tests | State owner | Priority | Status |
|---|---|---|---|---|---|---|
| Shell | `modules/builder-v2/workspace/BuilderShell.tsx` | sidebar, inspector, canvas, CommandBus | authenticated Builder, operations | builder/panel/canvas stores | P0 | Inventoried; visual uncertified |
| Toolbar | `workspace/BuilderHeader.tsx` | pages API, publish modal, CommandBus | responsive, zoom, persistence | builder/canvas stores | P0 | Inventoried |
| Canvas | `canvas/BuilderCanvas.tsx`, `canvas/NodeRenderer.tsx` | registry, renderer, DnD | canvas, parity, DnD | canvas/builder/selection stores | P0 | Inventoried |
| Inspector | `inspector/InspectorPanel.tsx`, `inspector/tabs/*` | properties, commands, media API | inspector suites | selection/builder stores | P0 | Inventoried |
| Layers | route `sidebar/LayersPanel.tsx`, `layers/layersMetadata.ts` | CommandBus, node tree | layers metadata/reorder | builder/selection stores | P0 | Inventoried |
| Chat | `ai/components/AiPanel.tsx` | `AiConversation`, AI endpoints | AI generation suites | AI store | P0 | Inventoried |
| Code editor/Monaco | No active Monaco surface confirmed in current shell | Unknown | No confirmed parity test | Unknown | P0 | BLOCKED |
| Responsive controls | `workspace/BuilderHeader.tsx`, `core/responsive/*` | breakpoints and canvas zoom | responsive browser/unit suites | canvas store | P0 | Inventoried |
| Save state | `workspace/BuilderHeader.tsx`, Blueprint API | Prisma persistence | save/reload, persistence matrix | builder store | P0 | Inventoried |
| History/undo/redo | `core/commands/*`, `store/useHistoryStore.ts` | CommandBus | command/history/stress tests | history/builder stores | P0 | Inventoried |
| Preview | `app/preview/...`, Builder 2 runtime | PublishedPageRenderer | internal/visual suites | server/database | P0 | Inventoried; runtime uncertified |
| Publishing | `components/PublishModal.tsx`, page publish API | snapshots, Blueprint runtime | no dedicated certification suite | server/database | P0 | BLOCKED |
| Authentication | Builder page plus tenant verification | session/cookies/Prisma | Playwright setup intended | server | P0 | BLOCKED by build/browser |
| Dashboard navigation | tenant routes/sidebar | Next routing and tenant context | no RC0 browser result | server/client | P0 | Inventoried; uncertified |

The broader Builder UI source inventory contains 153 files across workspace, toolbar, canvas, inspector, layers, sidebar, AI UI, stores, commands and shared components.
