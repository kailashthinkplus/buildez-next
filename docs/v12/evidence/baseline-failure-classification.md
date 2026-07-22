# RC0 Baseline Failure Classification

`Approved: No` means no named release authority approved the risk during this run.

## Failing test cases

| Failure | Category | Owner | Cause | Impact | Blocks Builder 3? | Blocks Release? | Fix required? | Approved? |
|---|---|---|---|---|---|---|---|---|
| `explicit model permission error fails immediately` | Environment | AI platform | Configured `gpt-5.6-sol` access returns a raw permission error instead of the expected stable error contract | Recovery behavior is not deterministic in the current environment | Yes | Yes | Yes | No |
| `certifies eight distinct deterministic contract/gate sequences` | Missing dependency | Website Engine | Required `cross-industry-population-certification.json` evidence is absent | Certification result cannot be evaluated | Yes | Yes | Yes | No |
| `has no missing media, defaults, unsafe facts, fit failures, duplicate copy, or terminology leaks` | Missing dependency | Website Engine | Same missing cross-industry evidence artifact | Quality/safety assertions cannot run | Yes | Yes | Yes | No |
| `does not rely on fixture logic or fake verified facts` | Missing dependency | Website Engine | Same missing cross-industry evidence artifact | Provenance assertion cannot run | Yes | Yes | Yes | No |
| `traces every selected native widget and preserves persistence evidence` | Missing dependency | Website Engine | Required `widget-population-provenance.json` is absent | Widget provenance is uncertified | Yes | Yes | Yes | No |
| `records the first observed failure boundary instead of asserting visual success` | Missing dependency | Website Engine | Same missing provenance artifact | Failure-boundary evidence is unavailable | Yes | Yes | Yes | No |
| `distinguishes renderer/demo fallbacks from defaultNode prop leakage` | Missing dependency | Website Engine | Same missing provenance artifact | Renderer/default leakage is uncertified | Yes | Yes | Yes | No |
| `core and complete premium catalog count remains explicit` | Regression | Builder widget platform | Test expects 48 catalog entries; runtime catalog exposes 49 | Catalog contract and test baseline disagree | Yes | Yes | Yes | No |

## Non-test certification gates

| Gate | Category | Owner | Cause and impact | Blocks Builder 3? | Blocks Release? | Fix required? | Approved? |
|---|---|---|---|---|---|---|---|
| Dirty worktree | Infrastructure | Release engineering | RC0 cannot be reproduced from one immutable commit | Yes | Yes | Yes | No |
| Root typecheck | Known issue | Repository owners | 100 syntax/type diagnostics across legacy, Builder and backup-inclusive root scope | Yes | Yes | Yes | No |
| Builder typecheck | Regression | Builder/Website Engine | 40 current type-contract errors | Yes | Yes | Yes | No |
| Lint | Infrastructure | Tooling plus code owners | Root lint includes generated `.next` output and also reports source violations | Yes | Yes | Yes | No |
| Production build | Regression | Web application owners | Missing exports in auth/onboarding/preview APIs plus source lint failures | Yes | Yes | Yes | No |
| Playwright | Infrastructure | Test infrastructure | Port collision prevented all browser tests from starting | Yes | Yes | Yes | No |
| Dedicated publishing suite absent | Broken test | Publishing owner | No executable publishing certification suite was discovered | Yes | Yes | Yes | No |
| Builder UI capture unavailable | Environment | Release engineering | Browser reached a blank root page without an authenticated Builder route | Yes | Yes | Yes | No |

No observed failure is classified Flaky or Intentional because the run produced no evidence supporting either classification.
