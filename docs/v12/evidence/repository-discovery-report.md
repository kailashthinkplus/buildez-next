# BuildEZ V12 Repository Discovery Report

Generated: 2026-07-22 (Asia/Kolkata)

## Repository state

- Root: `/Users/kailash/buildez`
- Branch: `feature/v12-builder3-agentic-platform`
- Pre-migration commit: `cc01d84a73288b1304432a706f2bd4612d14b626`
- Node: `v26.0.0`
- pnpm: `11.8.0`
- Workspace packages: `apps/*`, `packages/*`
- Lockfile SHA-256: `8ffa45b0ebed63eb380fb8ad93812eb3efd3c4b1f9fd86d32f4dddf907621cd3`

The worktree was already substantially modified before V12 execution began. Those changes are user-owned and were not reverted. The user directed execution of the pack after this state was reported. The full live state is captured by `git status --short`; V12 cutover remains blocked until pre-existing changes are separated or explicitly included in a release commit.

## Pack and backup evidence

- Execution pack integrity: 25/25 payload hashes matched `PACK_SHA256_MANIFEST.md`.
- Builder 2 source: `apps/web-app/modules/builder-v2` (1,791 files at snapshot time).
- AI V11 source: `apps/web-app/modules/builder-v2/ai-v11` (440 files at snapshot time).
- Builder snapshot: `backups/builder-v2-legacy-backup-20260722-160943`.
- V11 snapshot: `backups/ai-v11-legacy-backup-20260722-160943`.
- Restore drill: both snapshots copied to a new temporary root with file counts preserved (1,791 and 440).
- SHA-256 inventories were generated during snapshot creation; repository copies are required before the Phase 0 commit.

## Active architecture

The active Builder page is `apps/web-app/app/app/(builder)/[siteSlug]/[pageSlugWithId]/page.tsx`. It tenant-authorizes the request, loads or creates a database Blueprint, then delegates through the route-local `BuilderRoot.tsx` to `modules/builder-v2/workspace/BuilderRoot`. Widget registration also comes directly from Builder 2.

The Builder 2 shell owns the header, canvas, sidebars, inspector, command bus, selection, history, AI conversation and blueprint save lifecycle. Its AI conversation resolves V11 requests to `/api/builder-v2/ai/generate-v11`.

The public runtime (`app/(runtime)/[...slug]/page.tsx`) and preview route (`app/preview/[siteSlug]/[pageSlugWithId]/page.tsx`) import Builder 2 rendering and theme modules. The page publish endpoint stores Blueprint-derived page snapshots. This means React project source is not yet canonical.

## Inventory

- App pages: 41 (`current-route-map.json`).
- API handlers: 111 (`current-api-map.json`).
- Relevant repository test files discovered: 120 (`current-tests.txt`).
- Environment variable names referenced by the web app: 86 (`current-env-names.txt`).
- Files containing Builder 2 references outside excluded legacy paths: evidence in `builder-v2-imports.txt`.
- V11 references and endpoint strings: evidence in `ai-v11-imports.txt`.

## Persistence and integrations

- Database access uses `@buildez/db` / Prisma.
- Current site content is stored through Page, Blueprint, BlueprintHistory, SiteLayout, SiteSnapshot and PageSnapshot records.
- Media metadata uses `MediaAsset`; current upload code authenticates the user and tenant, verifies site ownership, processes images with Sharp and uploads through the R2 helper.
- Current R2 configuration names are `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `R2_PUBLIC_URL`.
- Current object keys use a `stores/.../websites/.../users/.../media` convention, not the V12 `tenants/<tenantId>/sites/<siteId>/...` contract.

## Confirmed blockers and unknowns

1. No Builder 3 production module boundary exists outside archived legacy code.
2. No AI V12 module or versioned V12 API exists.
3. No persistent canonical React project record or workspace location is defined in the current database schema.
4. Preview isolation, origin policy, token lifecycle and process orchestration for Vite require implementation and security tests.
5. The current unauthenticated `/api/preview/:pageId` endpoint reads by page ID and must not be reused for V12.
6. Current R2 metadata/schema does not yet evidence every field required by the V12 asset contract.
7. Current Builder baselines exist in Playwright tests and RC reports, but fresh pre-migration screenshots must be captured against a running authenticated environment.
8. Production route cutover and release approvals remain intentionally incomplete.

## Discovery gate result

Repository discovery is complete enough to begin Phase 2 foundations. Phase 3 UI parity certification, Phase 4 preview security, and production cutover remain blocked on their documented tests and evidence. No claim of V12 production readiness is made.
