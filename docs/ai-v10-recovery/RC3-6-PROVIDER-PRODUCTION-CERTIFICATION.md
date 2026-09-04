# RC-3.6 Provider-Backed Production Generation Certification

## Certification result

**Failed before provider execution.** Two normal production-route attempts returned HTTP `401 Unauthorized`. No text/image provider request, population gate evaluation, persistence transaction, reload, or runtime capture occurred. The implementation did not bypass authentication, impersonate a database user, inject forensic dependencies, call the orchestrator directly, or weaken `NativeWidgetPopulationGate`.

## Provider configuration

The redacted application configuration was loaded through the normal `.env.local` source:

- text provider: OpenAI;
- text model: `gpt-5.6-sol`;
- image provider: OpenAI Images;
- image model: `gpt-image-2`;
- OpenAI key present: yes;
- database and R2 persistence configuration present: yes;
- forensic mode: off;
- deterministic fixture: inactive;
- secret values recorded: no.

Configuration availability is not provider success. Because route authentication failed first, no paid/provider call was made.

## Generation attempts

| Run ID | Route | Status | First failure | Text requests | Image requests | Persistence |
|---|---|---:|---|---:|---:|---|
| `rc3-6-production-20260716-a` | `/api/builder-v2/ai/generate-v10` | 401 | production-route authentication | 0 | 0 | not attempted |
| `rc3-6-production-20260716-b` | `/api/builder-v2/ai/generate-v10` | 401 | production-route authentication | 0 | 0 | not attempted |

The route correctly calls `getUser()` before page lookup, orchestration, provider requests, and the Prisma persistence transaction. The available browser-control bridge could not attach to an authenticated Builder session, and the repository exposes no supported development-auth bypass. Creating a cookie or selecting a database user outside the authentication system would invalidate the certification and was not attempted.

## Unexecuted acceptance stages

The following remain unverified, and their artifacts explicitly record `not-executed` with the authentication blocker:

- real text hydration and duplicate-copy acceptance;
- real image requests, R2 uploads, and nested slot mapping;
- production population-gate result;
- final Blueprint;
- persistence and reload equality;
- normal Canvas and runtime captures;
- DOM geometry and failed-image diagnostics;
- screenshot-based visual review;
- provider latency, variability, and failure behavior.

There is therefore no honest classification of the generated page as premium, improved, generic, or structurally sound. The correct visual outcome is **failed generation: no authenticated generation occurred**.

## Required continuation

Open a valid tenant-owned Builder page in an authenticated application session, then run the certification twice through `/api/builder-v2/ai/generate-v10` using new run IDs. The page ID must belong to the authenticated tenant. On a passing gate, allow the route's existing `persistAfterSemanticHydration` transaction to save the Blueprint, reload it through the normal page API, and capture Builder/runtime routes.

Do not enable forensic mode, inject deterministic dependencies, supply stock/demo media, or relax duplicate/media/factual requirements.

## Recommendation

RC-4 should **not** be treated as unblocked by RC-3.6. The RC-3.5 implementation remains structurally verified, but provider-backed text, media, persistence, reload, and rendered behavior still require authenticated production certification.

No gate rule or production generation behavior was changed in this task. The only implementation addition is a redacted, fail-fast production-route certification harness.
