# 2026-07-12 — Builder RC-T3H Invalid DnD Atomicity

BRC-0018 was traced to two causes: split DnD transient ownership permitted stale payload/target reuse, and focusing the production move handle blurred contenteditable Buttons into an identical UpdateNodeCommand that created phantom dirty/history/autosave state.

BuilderShell now owns an active/cancelled/consumed session, clears invalid observable state, and revalidates current pointer stack, payload, over ID, intent, parent, chrome occlusion, and dragged-subtree exclusion at native drop time. Inline text blur is a no-op when content is unchanged. Five authenticated invalid/cancel regressions pass. Broader RC-T3 and RC-T4 work was not started.
