# Builder RC Playwright Authentication

## Scope

Builder browser RC tests use Playwright Chromium and a local `storageState` file. The setup test logs in through the normal `/app/login` UI with credentials supplied only through the process environment. Cookies, tokens, local storage, passwords, and session state are not committed.

The authenticated state is written to `apps/web-app/playwright/.auth/builder-user.json`. The entire `.auth` directory is ignored by Git. Delete this file to revoke the local test state or force a fresh login.

## First-time setup

From the repository root:

```sh
pnpm --dir apps/web-app install
pnpm --dir apps/web-app playwright:install
```

Export local credentials in the shell or a secret manager. Do not add them to a tracked file:

```sh
export E2E_USER_EMAIL='your-test-user@example.com'
export E2E_USER_PASSWORD='your-local-secret'
```

The test account must already exist, have completed onboarding, and have access to the Builder fixture page. Run the login setup once:

```sh
pnpm --dir apps/web-app test:builder:browser:auth
```

By default Playwright starts or reuses the local app at `http://127.0.0.1:3000`. To use an already running deployment, set `PLAYWRIGHT_BASE_URL` to its origin.

## Recurring Builder tests

Set `E2E_BUILDER_URL` to an existing authenticated Builder route. It may be a path relative to `PLAYWRIGHT_BASE_URL` or a complete URL:

```sh
export E2E_BUILDER_URL='/app/my-site/home--page-id'
pnpm --dir apps/web-app test:builder:browser
```

The `builder-chromium` project depends on the authentication setup project, so normal runs refresh storage state through the login UI and then reuse it for all Builder tests in that run.

Visual commands:

```sh
pnpm --dir apps/web-app test:builder:visual
pnpm --dir apps/web-app test:builder:visual:update
```

Screenshot updates must be reviewed before their baseline files are committed. Failure traces, screenshots, and videos are placed under ignored `test-results`; the HTML report is under ignored `playwright-report`.

## Adding RC browser coverage

Add tests below `apps/web-app/playwright/tests/builder`. Tests in `builder-chromium` automatically receive authenticated storage state and Chromium desktop defaults. Playwright supports real scrolling, wheel and pointer input, drag and drop, Inspector interactions, responsive controls, preview/publish navigation, screenshots, and visual comparisons without introducing separate Builder state paths.

## Troubleshooting

- Missing credential error: export both required `E2E_USER_*` variables in the same shell that invokes Playwright.
- Redirected to onboarding: use an existing test user whose onboarding is complete.
- Builder URL error: set `E2E_BUILDER_URL` to a page the test user can access.
- Expired or invalid session: delete `apps/web-app/playwright/.auth/builder-user.json` and rerun the authentication command.
- App is hosted elsewhere: set `PLAYWRIGHT_BASE_URL`; Playwright will not start the local dev server.
- Chromium executable missing: rerun `pnpm --dir apps/web-app playwright:install`.
- Visual mismatch: inspect the report and artifacts; update screenshots only after reviewing the intended layout change.

This infrastructure is limited to the authenticated Builder RC browser foundation. It does not start RC-T3.

## Disposable RC operation pages

Set `E2E_SITE_SLUG` to a site owned by the dedicated test account (default: `home`). RC-T3B destructive tests create their own draft page using the existing authenticated page API, seed/reset it through the tenant-scoped Blueprint save API, and soft-delete it in teardown. They do not modify `E2E_BUILDER_URL` or customer-like page content.

```sh
export E2E_SITE_SLUG='home'
pnpm --dir apps/web-app test:builder:browser:operations:fixture
```

If a test process is forcibly terminated before teardown, search the Pages UI for titles beginning `RC T3B Disposable` and trash only those test drafts. Normal failures execute automatic cleanup.
