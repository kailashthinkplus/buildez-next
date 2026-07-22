# RC0 Repository Validation

Certification run: 2026-07-22, Asia/Kolkata

| Item | Observed value | Result |
|---|---|---|
| Repository root | `/Users/kailash/buildez` | Confirmed |
| Branch | `feature/v12-builder3-agentic-platform` | Confirmed; not an RC0-named branch |
| Commit | `b5ce29ed230aa8db8abff3f6cad4f315b58a133b` | Confirmed |
| Commit tree hash | `84f22158e168b3feb70abf0dc14497cc4f66268f` | Confirmed |
| Node | `v26.0.0` | Confirmed |
| Package manager | pnpm `11.8.0` | Confirmed |
| Workspace packages | `apps/*`, `packages/*` | Confirmed from `pnpm-workspace.yaml` |
| Lockfile SHA-256 | `8ffa45b0ebed63eb380fb8ad93812eb3efd3c4b1f9fd86d32f4dddf907621cd3` | Confirmed |
| Worktree | 78 tracked files changed by diff summary, plus many untracked paths | FAIL |

The repository is not immutable. The worktree contains modified or untracked production runtime, authentication-adjacent code, Builder 2, AI V11, database schema/generated client, API routes, tests, fixtures, logs and migrations. RC0 results describe this exact filesystem state, not a clean committed baseline.
