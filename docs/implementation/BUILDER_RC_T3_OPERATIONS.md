# Builder RC-T3 Operations Implementation

RC-T3 added created-root identity to duplicate and paste commands so BuilderShell can select the actual operation result. It removed the unused direct `useBuilderStore.setBlueprint` mutation surface, added stable semantic selection/undo locators, native operation integrity tests, and an authenticated duplicate-selection-undo journey.

The phase decision is FAILED because the required browser DnD, persistence, keyboard, responsive/zoom, and golden-journey matrix is incomplete. This implementation does not include RC-T4 work.
# RC-T3E implementation note

The selected-node toolbar move handle is the canonical browser DnD source. BuilderShell exposes read-only drag lifecycle attributes and no longer cancels native HTML5 completion on pointerup. Playwright uses live handle/target/viewport geometry, production edge auto-scroll, and the real Container padding lane. Persistence remains exclusively through the Builder save UI and production Blueprint route.

## RC-T3F note

Operation shortcuts now use existing CommandBus handlers and ignore editable targets. Palette and sibling tests use native pointer movement. Empty-container insertion remains blocked because the observed Container target and resulting generated-parent hierarchy disagree; see BRC-0016.
