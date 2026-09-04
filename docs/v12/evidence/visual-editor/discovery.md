# Builder 3 visual-editor discovery

Recorded 2026-07-23 on `feature/v12-builder3-agentic-platform`, starting at `536dd3fec18a2000e453e36a613cb8a497bc89d1`. Safety checkpoint: `6a368683`.

| Capability | Existing source | Observed baseline | Builder 3 action |
|---|---|---|---|
| Shell, modes, canvas | `apps/web-app/app/app/(builder-v3)/builder-v3/[siteId]/Builder3Canvas.tsx` | Real shell and Vite iframe; Edit was only a top-border label | Preserve shell; connect source-backed editor |
| Preview runtime | `modules/builder-v3/preview/*` | Tenant-scoped materialization and local Vite worker | Instrument sandbox TSX only |
| Project source/history | `modules/builder-v3/project-workspace/*` | Database files, revisions, atomic checkpoints | Reuse as canonical source |
| Inspector | `Builder3Canvas.tsx` | Placeholder with no controls | Add capability-driven source Inspector |
| Node toolbar | V2 references: `builder-v2/canvas/SelectionToolbar.tsx`, `builder-v2/selection/FloatingToolbar.tsx` | No Builder 3 toolbar | Add isolated Builder 3 toolbar; no V2 runtime dependency |
| AI Chat | `modules/builder-v3/agent-ui/V12AgentPanel.tsx` | Working attachments/events, Auto/Discuss | Add context modes and image clarification |
| Pages/routes | React project files; database `Page` also exists | No Builder 3 canonical page manifest contract | Require `src/buildez.pages.json` for complete-site agent output |
| R2/media | `lib/storage/uploadToR2.ts`, `MediaAsset` | Existing tenant/site storage primitives | Not yet integrated into V12 generation |

Baseline verification: root typecheck passed; Builder typecheck passed; 7/7 V12 boundary tests passed. Production build failed before implementation at `modules/builder/runtime/generateRuntimeHTML.ts:276` because `"divider"` is not comparable to `NodeType`.

Browser baseline was blocked by authentication at `/app/login`; no authenticated Builder fixture was available. No baseline screenshots were fabricated or regenerated.
