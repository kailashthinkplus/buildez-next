# BuildEZ Manual RC Test Report

- Run directory: `/Users/kailash/buildez/test-results/manual-rc/20260712-233703`
- Passed commands: 3
- Failed commands: 4

## Command Results

### FAIL — cleanup

- Exit code: 1
- Duration: 1.4s
- Command: `pnpm --dir /Users/kailash/buildez/apps/web-app test:builder:browser:operations:cleanup`
- Log: `/Users/kailash/buildez/test-results/manual-rc/20260712-233703/cleanup.log`

#### Failure log tail

```text
$ tsx playwright/scripts/cleanupDisposablePages.ts
(node:66531) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
apiRequestContext.get: connect ECONNREFUSED 127.0.0.1:3000
Call log:
[2m  - → GET http://127.0.0.1:3000/api/pages?take=200&siteSlug=home[22m
[2m    - user-agent: Playwright/1.61.1 (arm64; macOS 15.7) node/26.0[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m    - cookie: session=cmrhu98rj0001tyk5jmavxw6r; onboarding=completed; tenant-id=cmqnpozay000cvcj7k5akog2y[22m

[ELIFECYCLE] Command failed with exit code 1.
```

### PASS — typecheck

- Exit code: 0
- Duration: 4.4s
- Command: `pnpm --dir /Users/kailash/buildez/apps/web-app typecheck:builder`
- Log: `/Users/kailash/buildez/test-results/manual-rc/20260712-233703/typecheck.log`

### PASS — rc-t3-node

- Exit code: 0
- Duration: 2.6s
- Command: `pnpm --dir /Users/kailash/buildez/apps/web-app test:builder:rc-t3`
- Log: `/Users/kailash/buildez/test-results/manual-rc/20260712-233703/rc-t3-node.log`

### PASS — operations-node

- Exit code: 0
- Duration: 1.0s
- Command: `pnpm --dir /Users/kailash/buildez/apps/web-app test:builder:operations`
- Log: `/Users/kailash/buildez/test-results/manual-rc/20260712-233703/operations-node.log`

### FAIL — invalid-dnd

- Exit code: 1
- Duration: 7.5s
- Command: `pnpm --dir /Users/kailash/buildez/apps/web-app test:builder:browser:operations:invalid`
- Log: `/Users/kailash/buildez/test-results/manual-rc/20260712-233703/invalid-dnd.log`

#### Failure log tail

```text
$ playwright test --project=builder-chromium --grep @invalid-dnd
[WebServer] $ next dev

Running 6 tests using 1 worker

  ✘  1 [setup] › playwright/tests/auth.setup.ts:7:6 › authenticate Builder RC user (312ms)


  1) [setup] › playwright/tests/auth.setup.ts:7:6 › authenticate Builder RC user ───────────────────

    Error: E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in the local environment.

      10 |
      11 |   if (!email || !password) {
    > 12 |     throw new Error(
         |           ^
      13 |       "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in the local environment."
      14 |     );
      15 |   }
        at /Users/kailash/buildez/apps/web-app/playwright/tests/auth.setup.ts:12:11

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/trace.zip
    Usage:

        pnpm exec playwright show-trace test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    [setup] › playwright/tests/auth.setup.ts:7:6 › authenticate Builder RC user ────────────────────
  5 did not run

To open last HTML report run:
[36m[39m
[36m  pnpm exec playwright show-report[39m
[36m[39m
[ELIFECYCLE] Command failed with exit code 1.
```

### FAIL — dnd

- Exit code: 1
- Duration: 6.6s
- Command: `pnpm --dir /Users/kailash/buildez/apps/web-app test:builder:browser:operations:dnd`
- Log: `/Users/kailash/buildez/test-results/manual-rc/20260712-233703/dnd.log`

#### Failure log tail

```text
$ playwright test --project=builder-chromium --grep @dnd
[WebServer] $ next dev

Running 2 tests using 1 worker

  ✘  1 [setup] › playwright/tests/auth.setup.ts:7:6 › authenticate Builder RC user (197ms)


  1) [setup] › playwright/tests/auth.setup.ts:7:6 › authenticate Builder RC user ───────────────────

    Error: E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in the local environment.

      10 |
      11 |   if (!email || !password) {
    > 12 |     throw new Error(
         |           ^
      13 |       "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in the local environment."
      14 |     );
      15 |   }
        at /Users/kailash/buildez/apps/web-app/playwright/tests/auth.setup.ts:12:11

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/trace.zip
    Usage:

        pnpm exec playwright show-trace test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    [setup] › playwright/tests/auth.setup.ts:7:6 › authenticate Builder RC user ────────────────────
  1 did not run

To open last HTML report run:
[36m[39m
[36m  pnpm exec playwright show-report[39m
[36m[39m
[ELIFECYCLE] Command failed with exit code 1.
```

### FAIL — palette

- Exit code: 1
- Duration: 6.4s
- Command: `pnpm --dir /Users/kailash/buildez/apps/web-app test:builder:browser:operations:palette`
- Log: `/Users/kailash/buildez/test-results/manual-rc/20260712-233703/palette.log`

#### Failure log tail

```text
$ playwright test --project=builder-chromium --grep @palette
[WebServer] $ next dev

Running 5 tests using 1 worker

  ✘  1 [setup] › playwright/tests/auth.setup.ts:7:6 › authenticate Builder RC user (218ms)


  1) [setup] › playwright/tests/auth.setup.ts:7:6 › authenticate Builder RC user ───────────────────

    Error: E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in the local environment.

      10 |
      11 |   if (!email || !password) {
    > 12 |     throw new Error(
         |           ^
      13 |       "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in the local environment."
      14 |     );
      15 |   }
        at /Users/kailash/buildez/apps/web-app/playwright/tests/auth.setup.ts:12:11

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/trace.zip
    Usage:

        pnpm exec playwright show-trace test-results/auth.setup.ts-authenticate-Builder-RC-user-setup/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    [setup] › playwright/tests/auth.setup.ts:7:6 › authenticate Builder RC user ────────────────────
  4 did not run

To open last HTML report run:
[36m[39m
[36m  pnpm exec playwright show-report[39m
[36m[39m
[ELIFECYCLE] Command failed with exit code 1.
```

## Git Status

```text
 M .gitignore
 M apps/web-app/.next/app-build-manifest.json
 M apps/web-app/.next/cache/.rscinfo
 M apps/web-app/.next/server/app-paths-manifest.json
 D apps/web-app/.next/server/app/(runtime)/[...slug]/page.js
 D apps/web-app/.next/server/app/(runtime)/[...slug]/page_client-reference-manifest.js
 D apps/web-app/.next/server/app/api/ai/rewrite/route.js
 D apps/web-app/.next/server/app/api/ai/rewrite/route_client-reference-manifest.js
 D apps/web-app/.next/server/app/api/builder-v2/ai/context/route.js
 D apps/web-app/.next/server/app/api/builder-v2/ai/context/route_client-reference-manifest.js
 D apps/web-app/.next/server/app/api/builder-v2/assets/route.js
 D apps/web-app/.next/server/app/api/builder-v2/assets/route_client-reference-manifest.js
 D apps/web-app/.next/server/app/api/builder-v2/blueprints/[pageId]/route.js
 D apps/web-app/.next/server/app/api/builder-v2/blueprints/[pageId]/route_client-reference-manifest.js
 D apps/web-app/.next/server/app/api/fonts/google/route.js
 D apps/web-app/.next/server/app/api/fonts/google/route_client-reference-manifest.js
 D apps/web-app/.next/server/app/api/onboarding/status/route.js
 D apps/web-app/.next/server/app/api/onboarding/status/route_client-reference-manifest.js
 D apps/web-app/.next/server/app/api/tenant/me/route.js
 D apps/web-app/.next/server/app/api/tenant/me/route_client-reference-manifest.js
 M apps/web-app/.next/server/edge-runtime-webpack.js
 M apps/web-app/.next/server/middleware-manifest.json
 M apps/web-app/.next/server/middleware.js
 M apps/web-app/.next/server/server-reference-manifest.json
 M apps/web-app/.next/server/vendor-chunks/lucide-react@0.562.0_react@19.2.4.js
 M apps/web-app/.next/server/vendor-chunks/next-themes@0.4.6_react-dom@19.2.4_react@19.2.4__react@19.2.4.js
 D apps/web-app/.next/server/vendor-chunks/next@15.2.8_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4.js
 D apps/web-app/.next/server/vendor-chunks/openai@6.44.0_zod@4.3.6.js
 D apps/web-app/.next/server/vendor-chunks/uuid@13.0.0.js
 M apps/web-app/.next/server/webpack-runtime.js
 M apps/web-app/.next/static/chunks/app-pages-internals.js
 D apps/web-app/.next/static/chunks/app/(runtime)/[...slug]/page.js
 D apps/web-app/.next/static/chunks/app/(runtime)/layout.js
 D apps/web-app/.next/static/chunks/app/api/ai/rewrite/route.js
 D apps/web-app/.next/static/chunks/app/api/builder-v2/ai/context/route.js
 D apps/web-app/.next/static/chunks/app/api/builder-v2/assets/route.js
 D apps/web-app/.next/static/chunks/app/api/builder-v2/blueprints/[pageId]/route.js
 D apps/web-app/.next/static/chunks/app/api/fonts/google/route.js
 D apps/web-app/.next/static/chunks/app/api/onboarding/status/route.js
 D apps/web-app/.next/static/chunks/app/api/tenant/me/route.js
 M apps/web-app/.next/static/chunks/app/layout.js
 M apps/web-app/.next/static/chunks/main-app.js
 M apps/web-app/.next/static/chunks/webpack.js
 M apps/web-app/.next/static/css/app/layout.css
 D apps/web-app/.next/static/webpack/02aef0814f75be13.webpack.hot-update.json
 D apps/web-app/.next/static/webpack/10ef34fea9a2eecc.webpack.hot-update.json
 D apps/web-app/.next/static/webpack/899584dde73c2a38.webpack.hot-update.json
 D apps/web-app/.next/static/webpack/9a4681d78025eaf1.webpack.hot-update.json
 D apps/web-app/.next/static/webpack/app/layout.9a4681d78025eaf1.hot-update.js
 D apps/web-app/.next/static/webpack/b69edfe993eadbbf.webpack.hot-update.json
 D apps/web-app/.next/static/webpack/dd30be083d907768.webpack.hot-update.json
 D apps/web-app/.next/static/webpack/f5d25f20d7404e7f.webpack.hot-update.json
 D apps/web-app/.next/static/webpack/webpack.02aef0814f75be13.hot-update.js
 D apps/web-app/.next/static/webpack/webpack.10ef34fea9a2eecc.hot-update.js
 D apps/web-app/.next/static/webpack/webpack.899584dde73c2a38.hot-update.js
 D apps/web-app/.next/static/webpack/webpack.9a4681d78025eaf1.hot-update.js
 D apps/web-app/.next/static/webpack/webpack.b69edfe993eadbbf.hot-update.js
 D apps/web-app/.next/static/webpack/webpack.dd30be083d907768.hot-update.js
 D apps/web-app/.next/static/webpack/webpack.f5d25f20d7404e7f.hot-update.js
 M apps/web-app/.next/trace
 D apps/web-app/.next/types/app/(runtime)/[...slug]/page.ts
 D apps/web-app/.next/types/app/(runtime)/layout.ts
 D apps/web-app/.next/types/app/api/ai/rewrite/route.ts
 D apps/web-app/.next/types/app/api/builder-v2/ai/context/route.ts
 D apps/web-app/.next/types/app/api/builder-v2/assets/route.ts
 D apps/web-app/.next/types/app/api/builder-v2/blueprints/[pageId]/route.ts
 D apps/web-app/.next/types/app/api/fonts/google/route.ts
 D apps/web-app/.next/types/app/api/onboarding/status/route.ts
 D apps/web-app/.next/types/app/api/tenant/me/route.ts
 M apps/web-app/app/api/ai-v8/generate-images/route.ts
 M apps/web-app/app/api/app/sites/[siteId]/preview/route.ts
 M apps/web-app/app/api/auth/login/route.ts
 M apps/web-app/app/api/builder-v2/assets/upload/route.ts
 M apps/web-app/app/api/onboarding/finish/route.ts
 M apps/web-app/app/api/sites/[siteId]/branding/logo/route.ts
 M apps/web-app/app/app/(tenant)/[siteSlug]/dashboard/page.tsx
 M apps/web-app/app/app/(tenant)/[siteSlug]/themes/ThemeMarketplaceClient.tsx
 M apps/web-app/app/app/(tenant)/components/CopilotPromptCard.tsx
 M apps/web-app/app/app/(tenant)/components/PagesView.tsx
 M apps/web-app/app/app/(tenant)/components/TenantHeader.tsx
 M apps/web-app/app/app/(tenant)/components/sidebar/GlobalSidebar.tsx
 M apps/web-app/app/app/(tenant)/components/sidebar/SidebarShell.tsx
 M apps/web-app/app/app/(tenant)/components/sidebar/SiteSidebar.tsx
 M apps/web-app/app/app/(tenant)/dashboard/page.tsx
 M apps/web-app/app/app/(tenant)/layout.tsx
 M apps/web-app/app/app/components/ThemeToggle.tsx
 M apps/web-app/app/globals.css
 M apps/web-app/lib/runtime/render-page.ts
 M apps/web-app/logs/ai-debug/latest.json
 M apps/web-app/modules/builder-v2/__tests__/commands/clipboard.test.ts
 M apps/web-app/modules/builder-v2/__tests__/commands/hierarchy-insertion.test.ts
 M apps/web-app/modules/builder-v2/__tests__/helpers/testAssertions.ts
 M apps/web-app/modules/builder-v2/__tests__/helpers/testNodeFactory.ts
 M apps/web-app/modules/builder-v2/__tests__/inspector/motion-metadata.test.ts
 M apps/web-app/modules/builder-v2/__tests__/theme/theme-tokens.test.ts
 M apps/web-app/modules/builder-v2/__tests__/widgets/production-widget-library.test.ts
 M apps/web-app/modules/builder-v2/ai/components/AiPanel.tsx
 M apps/web-app/modules/builder-v2/canvas/DragGhost.tsx
 M apps/web-app/modules/builder-v2/canvas/DropZoneIndicator.tsx
 M apps/web-app/modules/builder-v2/canvas/NodeRenderer.tsx
 M apps/web-app/modules/builder-v2/canvas/SelectionOverlay.tsx
 M apps/web-app/modules/builder-v2/canvas/SelectionToolbar.tsx
 M apps/web-app/modules/builder-v2/components/PublishModal.tsx
 M apps/web-app/modules/builder-v2/core/commands/CommandBus.ts
 M apps/web-app/modules/builder-v2/core/commands/DuplicateNodeCommand.ts
 M apps/web-app/modules/builder-v2/core/commands/ElementClipboardCommands.ts
 M apps/web-app/modules/builder-v2/core/commands/MoveNodeCommand.ts
 M apps/web-app/modules/builder-v2/core/commands/nativeHierarchyInsertion.ts
 M apps/web-app/modules/builder-v2/core/rendering/renderStyleResolver.ts
 M apps/web-app/modules/builder-v2/inspector/InspectorPanel.tsx
 M apps/web-app/modules/builder-v2/inspector/components/ColorPicker.tsx
 M apps/web-app/modules/builder-v2/inspector/hooks/useNodeUpdater.ts
 M apps/web-app/modules/builder-v2/inspector/motion/motionInspectorMetadata.ts
 M apps/web-app/modules/builder-v2/inspector/properties/ColorProperty.tsx
 M apps/web-app/modules/builder-v2/inspector/tabs/AdvancedTab.tsx
 M apps/web-app/modules/builder-v2/inspector/tabs/ContentTab.tsx
 M apps/web-app/modules/builder-v2/inspector/tabs/DesignTab.tsx
 M apps/web-app/modules/builder-v2/inspector/tabs/InspectorControls.tsx
 M apps/web-app/modules/builder-v2/layout/columnStructure.ts
 M apps/web-app/modules/builder-v2/marketplace/ElementMarketplaceRegistry.ts
 M apps/web-app/modules/builder-v2/marketplace/components/WidgetMarketplaceModal.tsx
 M apps/web-app/modules/builder-v2/marketplace/types.ts
 M apps/web-app/modules/builder-v2/media/components/MediaCard.tsx
 M apps/web-app/modules/builder-v2/media/components/MediaGrid.tsx
 M apps/web-app/modules/builder-v2/media/components/MediaLibrary.tsx
 M apps/web-app/modules/builder-v2/media/components/MediaLibraryModal.tsx
 M apps/web-app/modules/builder-v2/media/components/MediaTabs.tsx
 M apps/web-app/modules/builder-v2/media/services/media.service.ts
 M apps/web-app/modules/builder-v2/runtime/PublishedPageRenderer.tsx
 M apps/web-app/modules/builder-v2/sidebar/PanelContainer.tsx
 M apps/web-app/modules/builder-v2/sidebar/panels/BlockMenu.tsx
 M apps/web-app/modules/builder-v2/store/useBuilderStore.ts
 M apps/web-app/modules/builder-v2/theme/SiteThemeFrame.tsx
 M apps/web-app/modules/builder-v2/theme/defaultTheme.ts
 M apps/web-app/modules/builder-v2/theme/theme.types.ts
 M apps/web-app/modules/builder-v2/theme/themeTokenMetadata.ts
 M apps/web-app/modules/builder-v2/widgets/button/Button.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/container/Container.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/divider/Divider.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/divider/Divider.definition.ts
 M apps/web-app/modules/builder-v2/widgets/heading/Heading.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/icon/Icon.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/icon/Icon.definition.ts
 M apps/web-app/modules/builder-v2/widgets/image/Image.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/page/Page.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/premium/PremiumWidget.definition.ts
 M apps/web-app/modules/builder-v2/widgets/premium/PremiumWidget.tsx
 M apps/web-app/modules/builder-v2/widgets/premium/ProductionWidgetView.tsx
 M apps/web-app/modules/builder-v2/widgets/sdk/useWidget.ts
 M apps/web-app/modules/builder-v2/widgets/section/Section.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/text/Text.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/video/Video.defaults.ts
 M apps/web-app/modules/builder-v2/widgets/widgetCapabilities.ts
 M apps/web-app/modules/builder-v2/workspace/BuilderHeader.tsx
 M apps/web-app/modules/builder-v2/workspace/BuilderShell.tsx
 M apps/web-app/next.config.js
 M apps/web-app/node_modules/.bin/next
 M apps/web-app/node_modules/next
 M apps/web-app/package.json
 M packages/db/generated/client/edge.js
 M packages/db/generated/client/index-browser.js
 M packages/db/generated/client/index.d.ts
 M packages/db/generated/client/index.js
 M packages/db/generated/client/package.json
 M packages/db/generated/client/schema.prisma
 M packages/db/generated/client/wasm.js
 M packages/db/prisma/schema.prisma
 M pnpm-lock.yaml
?? apps/web-app/.next/server/app/app/
?? apps/web-app/.next/server/vendor-chunks/next@15.2.8_@babel+core@7.29.0_@playwright+test@1.61.1_react-dom@19.2.4_react@19.2.4__react@19.2.4.js
?? apps/web-app/.next/static/chunks/app/app/
?? apps/web-app/.next/types/app/app/
?? apps/web-app/app/api/cms/
?? apps/web-app/app/api/profile/
?? apps/web-app/app/api/sites/[siteId]/branding/route.ts
?? apps/web-app/app/app/(tenant)/[siteSlug]/brand/
?? apps/web-app/app/app/(tenant)/[siteSlug]/cms/
?? apps/web-app/app/app/(tenant)/components/DashboardLogo.tsx
?? apps/web-app/app/app/(tenant)/profile/
?? apps/web-app/lib/cms.ts
?? apps/web-app/logs/ai-debug/events-2026-07-11.jsonl
?? apps/web-app/modules/builder-v2/__tests__/commands/color-clear-removal.test.ts
?? apps/web-app/modules/builder-v2/__tests__/rc-t1/
?? apps/web-app/modules/builder-v2/__tests__/rc-t2/
?? apps/web-app/modules/builder-v2/__tests__/rc-t3/
?? apps/web-app/modules/builder-v2/__tests__/rendering/
?? apps/web-app/modules/builder-v2/__tests__/widgets/marketplace-launch-gates.test.ts
?? apps/web-app/modules/builder-v2/brand/
?? apps/web-app/modules/builder-v2/canvas/inlineTextUpdate.ts
?? apps/web-app/modules/builder-v2/core/dnd/
?? apps/web-app/modules/builder-v2/media/server/
?? apps/web-app/modules/builder-v2/motion/
?? apps/web-app/node_modules/.bin/playwright
?? apps/web-app/node_modules/.bin/tsx
?? apps/web-app/node_modules/@playwright/
?? apps/web-app/node_modules/tsx
?? apps/web-app/playwright.config.ts
?? apps/web-app/playwright/
?? docs/builder/Builder_Complete_Widget_Inventory.md
?? docs/builder/Builder_Default_Design_Quality_Audit.md
?? docs/builder/Builder_Default_Theme_Preset_Plan.md
?? docs/builder/Builder_Industry_Widget_and_Theme_Coverage.md
?? docs/builder/Builder_Launch_Widget_Decision_Matrix.md
?? docs/builder/Builder_Premium_Widget_Marketplace_Audit.md
?? docs/builder/Builder_RC_Blueprint_CommandBus_Report.md
?? docs/builder/Builder_RC_Canvas_Layout_Baseline.md
?? docs/builder/Builder_RC_Canvas_Layout_Report.md
?? docs/builder/Builder_RC_Checklist.md
?? docs/builder/Builder_RC_Defect_Register.md
?? docs/builder/Builder_RC_DnD_Cancellation_Baseline.md
?? docs/builder/Builder_RC_DnD_Determinism_Baseline.md
?? docs/builder/Builder_RC_Operations_Baseline.md
?? docs/builder/Builder_RC_Operations_Matrix.md
?? docs/builder/Builder_RC_Operations_Report.md
?? docs/builder/Builder_RC_Playwright_Authentication.md
?? docs/builder/Builder_RC_Save_Persistence_Baseline.md
?? docs/builder/Builder_RC_Test_Baseline.md
?? docs/builder/Builder_RC_Test_Matrix.md
?? docs/builder/Builder_Theme_Color_Audit.md
?? docs/builder/Builder_Widget_and_Theme_Implementation_Backlog.md
?? docs/developer-logs/2026-07-11_BUILDER_RC_T1_BLUEPRINT_COMMANDBUS.md
?? docs/developer-logs/2026-07-11_BUILDER_RC_WIDGET_MARKETPLACE_THEME_AUDIT.md
?? docs/developer-logs/2026-07-12_BUILDER_RC_T3B_BROWSER_OPERATIONS.md
?? docs/developer-logs/2026-07-12_BUILDER_RC_T3D_SAVE_PERSISTENCE.md
?? docs/developer-logs/2026-07-12_BUILDER_RC_T3E_DND_DETERMINISM.md
?? docs/developer-logs/2026-07-12_BUILDER_RC_T3F_FINAL_OPERATIONS.md
?? docs/developer-logs/2026-07-12_BUILDER_RC_T3G_HIERARCHY_AND_COMPLETION.md
?? docs/developer-logs/2026-07-12_BUILDER_RC_T3H_DND_ATOMICITY.md
?? docs/developer-logs/2026-07-12_BUILDER_RC_T3_OPERATIONS.md
?? docs/implementation/BUILDER_RC_T1_BLUEPRINT_COMMANDBUS.md
?? docs/implementation/BUILDER_RC_T3_OPERATIONS.md
?? docs/implementation/BUILDER_RC_WIDGET_MARKETPLACE_THEME_AUDIT.md
?? packages/db/prisma/migrations/20260711140000_add_cms/
?? packages/db/prisma/migrations/20260711170000_add_user_profile/
?? scripts/
?? test-results/

```

## Diff Stat

```text
 .gitignore                                         |    3 +
 apps/web-app/.next/app-build-manifest.json         |   42 +-
 apps/web-app/.next/cache/.rscinfo                  |    2 +-
 apps/web-app/.next/server/app-paths-manifest.json  |    7 +-
 .../.next/server/app/(runtime)/[...slug]/page.js   |  734 ----
 .../[...slug]/page_client-reference-manifest.js    |    1 -
 .../.next/server/app/api/ai/rewrite/route.js       |  122 -
 .../ai/rewrite/route_client-reference-manifest.js  |    1 -
 .../server/app/api/builder-v2/ai/context/route.js  |  287 --
 .../ai/context/route_client-reference-manifest.js  |    1 -
 .../server/app/api/builder-v2/assets/route.js      |  287 --
 .../assets/route_client-reference-manifest.js      |    1 -
 .../api/builder-v2/blueprints/[pageId]/route.js    |  298 --
 .../[pageId]/route_client-reference-manifest.js    |    1 -
 .../.next/server/app/api/fonts/google/route.js     |  133 -
 .../google/route_client-reference-manifest.js      |    1 -
 .../server/app/api/onboarding/status/route.js      |  265 --
 .../status/route_client-reference-manifest.js      |    1 -
 .../.next/server/app/api/tenant/me/route.js        |  265 --
 .../tenant/me/route_client-reference-manifest.js   |    1 -
 apps/web-app/.next/server/edge-runtime-webpack.js  |    2 +-
 apps/web-app/.next/server/middleware-manifest.json |    2 +-
 apps/web-app/.next/server/middleware.js            |  844 ++--
 .../.next/server/server-reference-manifest.json    |    2 +-
 .../lucide-react@0.562.0_react@19.2.4.js           |  186 +-
 ..._react-dom@19.2.4_react@19.2.4__react@19.2.4.js |    2 +-
 ..._react-dom@19.2.4_react@19.2.4__react@19.2.4.js | 3832 ------------------
 .../vendor-chunks/openai@6.44.0_zod@4.3.6.js       | 1475 -------
 .../.next/server/vendor-chunks/uuid@13.0.0.js      |   75 -
 apps/web-app/.next/server/webpack-runtime.js       |    7 +-
 .../.next/static/chunks/app-pages-internals.js     |  172 +-
 .../static/chunks/app/(runtime)/[...slug]/page.js  |   28 -
 .../.next/static/chunks/app/(runtime)/layout.js    |   28 -
 .../static/chunks/app/api/ai/rewrite/route.js      |   28 -
 .../chunks/app/api/builder-v2/ai/context/route.js  |   28 -
 .../chunks/app/api/builder-v2/assets/route.js      |   28 -
 .../api/builder-v2/blueprints/[pageId]/route.js    |   28 -
 .../static/chunks/app/api/fonts/google/route.js    |   28 -
 .../chunks/app/api/onboarding/status/route.js      |   28 -
 .../.next/static/chunks/app/api/tenant/me/route.js |   28 -
 apps/web-app/.next/static/chunks/app/layout.js     |   68 +-
 apps/web-app/.next/static/chunks/main-app.js       | 2472 ++++++------
 apps/web-app/.next/static/chunks/webpack.js        |   14 +-
 apps/web-app/.next/static/css/app/layout.css       | 1347 +++++--
 .../02aef0814f75be13.webpack.hot-update.json       |    1 -
 .../10ef34fea9a2eecc.webpack.hot-update.json       |    1 -
 .../899584dde73c2a38.webpack.hot-update.json       |    1 -
 .../9a4681d78025eaf1.webpack.hot-update.json       |    1 -
 .../app/layout.9a4681d78025eaf1.hot-update.js      |   22 -
 .../b69edfe993eadbbf.webpack.hot-update.json       |    1 -
 .../dd30be083d907768.webpack.hot-update.json       |    1 -
 .../f5d25f20d7404e7f.webpack.hot-update.json       |    1 -
 .../webpack/webpack.02aef0814f75be13.hot-update.js |   18 -
 .../webpack/webpack.10ef34fea9a2eecc.hot-update.js |   18 -
 .../webpack/webpack.899584dde73c2a38.hot-update.js |   48 -
 .../webpack/webpack.9a4681d78025eaf1.hot-update.js |   18 -
 .../webpack/webpack.b69edfe993eadbbf.hot-update.js |   18 -
 .../webpack/webpack.dd30be083d907768.hot-update.js |   18 -
 .../webpack/webpack.f5d25f20d7404e7f.hot-update.js |   18 -
 apps/web-app/.next/trace                           |   36 +-
 .../.next/types/app/(runtime)/[...slug]/page.ts    |   84 -
 apps/web-app/.next/types/app/(runtime)/layout.ts   |   84 -
 .../.next/types/app/api/ai/rewrite/route.ts        |  347 --
 .../types/app/api/builder-v2/ai/context/route.ts   |  347 --
 .../.next/types/app/api/builder-v2/assets/route.ts |  347 --
 .../api/builder-v2/blueprints/[pageId]/route.ts    |  347 --
 .../.next/types/app/api/fonts/google/route.ts      |  347 --
 .../.next/types/app/api/onboarding/status/route.ts |  347 --
 .../web-app/.next/types/app/api/tenant/me/route.ts |  347 --
 .../web-app/app/api/ai-v8/generate-images/route.ts |   17 +-
 .../app/api/app/sites/[siteId]/preview/route.ts    |   14 +-
 apps/web-app/app/api/auth/login/route.ts           |    3 +-
 .../app/api/builder-v2/assets/upload/route.ts      |    2 +-
 apps/web-app/app/api/onboarding/finish/route.ts    |   34 +-
 .../app/api/sites/[siteId]/branding/logo/route.ts  |   16 +-
 .../app/app/(tenant)/[siteSlug]/dashboard/page.tsx |  252 +-
 .../[siteSlug]/themes/ThemeMarketplaceClient.tsx   |   17 +-
 .../app/(tenant)/components/CopilotPromptCard.tsx  |  253 +-
 .../app/app/(tenant)/components/PagesView.tsx      |   30 +-
 .../app/app/(tenant)/components/TenantHeader.tsx   |   14 +-
 .../(tenant)/components/sidebar/GlobalSidebar.tsx  |   42 +-
 .../(tenant)/components/sidebar/SidebarShell.tsx   |    2 +-
 .../(tenant)/components/sidebar/SiteSidebar.tsx    |   39 +-
 apps/web-app/app/app/(tenant)/dashboard/page.tsx   |  207 +-
 apps/web-app/app/app/(tenant)/layout.tsx           |    6 +-
 apps/web-app/app/app/components/ThemeToggle.tsx    |   22 +-
 apps/web-app/app/globals.css                       |  464 ++-
 apps/web-app/lib/runtime/render-page.ts            |   17 +-
 apps/web-app/logs/ai-debug/latest.json             |   21 +-
 .../__tests__/commands/clipboard.test.ts           |    4 +-
 .../__tests__/commands/hierarchy-insertion.test.ts |   55 +
 .../builder-v2/__tests__/helpers/testAssertions.ts |   18 +
 .../__tests__/helpers/testNodeFactory.ts           |    6 +-
 .../__tests__/inspector/motion-metadata.test.ts    |    6 +-
 .../__tests__/theme/theme-tokens.test.ts           |    3 +
 .../widgets/production-widget-library.test.ts      |   28 +-
 .../modules/builder-v2/ai/components/AiPanel.tsx   |    8 +-
 .../modules/builder-v2/canvas/DragGhost.tsx        |    6 +-
 .../builder-v2/canvas/DropZoneIndicator.tsx        |    2 +
 .../modules/builder-v2/canvas/NodeRenderer.tsx     |   79 +-
 .../modules/builder-v2/canvas/SelectionOverlay.tsx |    6 +-
 .../modules/builder-v2/canvas/SelectionToolbar.tsx |    6 +-
 .../modules/builder-v2/components/PublishModal.tsx |   13 +-
 .../modules/builder-v2/core/commands/CommandBus.ts |   29 +-
 .../core/commands/DuplicateNodeCommand.ts          |   11 +-
 .../core/commands/ElementClipboardCommands.ts      |   15 +-
 .../builder-v2/core/commands/MoveNodeCommand.ts    |   34 +-
 .../core/commands/nativeHierarchyInsertion.ts      |   11 +
 .../core/rendering/renderStyleResolver.ts          |   36 +-
 .../builder-v2/inspector/InspectorPanel.tsx        |    6 +-
 .../inspector/components/ColorPicker.tsx           |   22 +-
 .../builder-v2/inspector/hooks/useNodeUpdater.ts   |   16 +-
 .../inspector/motion/motionInspectorMetadata.ts    |   34 +-
 .../inspector/properties/ColorProperty.tsx         |   30 +-
 .../builder-v2/inspector/tabs/AdvancedTab.tsx      |  164 +-
 .../builder-v2/inspector/tabs/ContentTab.tsx       |   28 +-
 .../builder-v2/inspector/tabs/DesignTab.tsx        |  168 +-
 .../inspector/tabs/InspectorControls.tsx           |   74 +
 .../modules/builder-v2/layout/columnStructure.ts   |    4 +-
 .../marketplace/ElementMarketplaceRegistry.ts      |   55 +-
 .../components/WidgetMarketplaceModal.tsx          |   23 +-
 .../modules/builder-v2/marketplace/types.ts        |    2 +
 .../builder-v2/media/components/MediaCard.tsx      |    8 +-
 .../builder-v2/media/components/MediaGrid.tsx      |   20 +-
 .../builder-v2/media/components/MediaLibrary.tsx   |    3 +
 .../media/components/MediaLibraryModal.tsx         |   17 +-
 .../builder-v2/media/components/MediaTabs.tsx      |   10 +-
 .../builder-v2/media/services/media.service.ts     |    1 +
 .../builder-v2/runtime/PublishedPageRenderer.tsx   |   33 +-
 .../modules/builder-v2/sidebar/PanelContainer.tsx  |   34 +-
 .../builder-v2/sidebar/panels/BlockMenu.tsx        |    1 +
 .../modules/builder-v2/store/useBuilderStore.ts    |   13 -
 .../modules/builder-v2/theme/SiteThemeFrame.tsx    |    7 +-
 .../modules/builder-v2/theme/defaultTheme.ts       |   54 +
 .../modules/builder-v2/theme/theme.types.ts        |   27 +
 .../modules/builder-v2/theme/themeTokenMetadata.ts |    6 +
 .../builder-v2/widgets/button/Button.defaults.ts   |   14 +-
 .../widgets/container/Container.defaults.ts        |    3 +-
 .../builder-v2/widgets/divider/Divider.defaults.ts |    2 +-
 .../widgets/divider/Divider.definition.ts          |    2 +-
 .../builder-v2/widgets/heading/Heading.defaults.ts |   10 +-
 .../builder-v2/widgets/icon/Icon.defaults.ts       |    4 +-
 .../builder-v2/widgets/icon/Icon.definition.ts     |    4 +-
 .../builder-v2/widgets/image/Image.defaults.ts     |    8 +-
 .../builder-v2/widgets/page/Page.defaults.ts       |    6 +-
 .../widgets/premium/PremiumWidget.definition.ts    |   68 +-
 .../builder-v2/widgets/premium/PremiumWidget.tsx   |   16 +-
 .../widgets/premium/ProductionWidgetView.tsx       |  479 +--
 .../modules/builder-v2/widgets/sdk/useWidget.ts    |   18 +
 .../builder-v2/widgets/section/Section.defaults.ts |    8 +-
 .../builder-v2/widgets/text/Text.defaults.ts       |    8 +-
 .../builder-v2/widgets/video/Video.defaults.ts     |    5 +-
 .../builder-v2/widgets/widgetCapabilities.ts       |   12 +-
 .../modules/builder-v2/workspace/BuilderHeader.tsx |  152 +-
 .../modules/builder-v2/workspace/BuilderShell.tsx  |  217 +-
 apps/web-app/next.config.js                        |    5 -
 apps/web-app/node_modules/.bin/next                |    4 +-
 apps/web-app/node_modules/next                     |    2 +-
 apps/web-app/package.json                          |   30 +-
 packages/db/generated/client/edge.js               |   37 +-
 packages/db/generated/client/index-browser.js      |   30 +
 packages/db/generated/client/index.d.ts            | 4178 ++++++++++++++++++--
 packages/db/generated/client/index.js              |   37 +-
 packages/db/generated/client/package.json          |    2 +-
 packages/db/generated/client/schema.prisma         |   40 +
 packages/db/generated/client/wasm.js               |   30 +
 packages/db/prisma/schema.prisma                   |   40 +
 pnpm-lock.yaml                                     |   56 +-
 168 files changed, 9343 insertions(+), 14915 deletions(-)

```