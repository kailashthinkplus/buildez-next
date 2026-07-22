# Current Publishing Flow

1. `BuilderHeader.tsx` saves the current Builder 2 Blueprint through `/api/builder-v2/blueprints/:pageId`.
2. The publish UI calls `POST /api/pages/:pageId/publish`.
3. The endpoint resolves authenticated tenant/site/page context.
4. It loads `Page.blueprint.data` and either preserves a Builder 2 Blueprint or resolves a legacy Blueprint tree.
5. It creates a new `SiteSnapshot`, creates a `PageSnapshot`, and marks the Page and Site published.
6. The public catch-all runtime renders through `modules/builder-v2/runtime/PublishedPageRenderer` and Builder 2 theme modules.

Rollback currently means choosing/restoring database snapshot state; there is no discovered V12 release artifact or canonical React project build rollback. V12 publishing therefore needs a parallel implementation and validation before route cutover.
