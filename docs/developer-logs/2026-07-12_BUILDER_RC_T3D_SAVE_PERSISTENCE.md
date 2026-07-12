# 2026-07-12 — Builder RC-T3D Save Persistence

Implemented an observable save lifecycle, latest-revision serialized save orchestration, Playwright save helpers, API persistence assertions, and timeout-independent disposable-page teardown.

Headed trace evidence classified the original timeout as test infrastructure before the save phase: fixed Builder chrome intercepted `dragTo`; cleanup then inherited an exhausted deadline. The overlay issue was removed from the journey, but the focused native DnD regression remains unstable before it can exercise save. RC-T3D is therefore partial and RC-T3 remains blocked. RC-T4 was not started.
