# RC0 Current Architecture Lock

Until RC0 passes, Builder 2 and AI V11 remain the frozen baseline. Only defects directly preventing certification may be changed and every such change requires a new RC0 run.

The following areas are frozen: Builder UI, authentication, publishing, storage, database, routing, inspector, toolbar, canvas, layers, history, CommandBus, responsive behavior, preview, dashboard, Monaco/code-editor behavior, AI V11, runtime and public behavior.

Builder 3 must reuse the established visible behavior and capability set. It must not redesign, remove, rename, relocate, modernize, optimize or replace these areas without explicit approval. This lock does not certify the areas as healthy; it prevents uncontrolled drift while the documented RC0 blockers are resolved.

Current RC0 status: **FAIL — LOCK NOT YET AN IMMUTABLE CERTIFIED BASELINE**.
