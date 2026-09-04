# RC0 Baseline Test Summary

| Gate | Command | Passed | Failed | Skipped | Flaky | Duration | Result |
|---|---|---:|---:|---:|---:|---:|---|
| Root typecheck | `pnpm exec tsc --noEmit` | — | 100 diagnostics | — | 0 | 8s | FAIL |
| Builder typecheck | `pnpm typecheck:builder` | — | 40 diagnostics | — | 0 | 12s | FAIL |
| Repository lint | `pnpm lint` | — | 3,712 errors | — | 0 | 68s | FAIL; also 9,948 warnings |
| Builder unit/integration suite | `pnpm test:builder` | 542 | 8 | 0 | 0 observed | 45.72s | FAIL |
| AI V11 tests | Node test runner over `ai-v11/tests` | 84 | 0 | 0 | 0 observed | 14.58s | PASS |
| Production build | `pnpm build` in `apps/web-app` | — | 1 gate | — | 0 | 36s | FAIL |
| Playwright | `pnpm exec playwright test` | 0 executed | 1 infrastructure gate | 0 | 0 | 123s | FAIL |
| Dedicated publishing tests | No dedicated command or matching test suite discovered | 0 | 1 missing-suite gate | 0 | 0 | — | NOT CERTIFIED |

No standalone root unit or integration command is declared. Builder tests combine unit and integration-style coverage. Playwright did not execute a test because port 3000 was occupied and the managed server moved to port 3001 while the configured readiness URL remained port 3000.

Full logs:

- `baseline-builder-tests.log`
- `rc0-ai-v11-tests.log`
- `rc0-root-typecheck.log`
- `rc0-builder-typecheck.log`
- `rc0-lint.log`
- `rc0-production-build.log`
- `rc0-playwright.log`

No failure was fixed during certification.
