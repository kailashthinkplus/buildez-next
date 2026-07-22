# Current Storage Map

| Concern | Current implementation | Evidence / gap versus V12 |
|---|---|---|
| Database client | `packages/db`, imported as `@buildez/db` | Prisma is the current persistence layer. |
| Page source | `Page.reactCode` plus `Blueprint.data` | React is not canonical; Builder reads and writes Blueprint. |
| Edit history | `BlueprintHistory` and command/history stores | Project-file checkpoints do not yet exist. |
| Published state | `SiteSnapshot`, `PageSnapshot`, Page/Site status | Publish snapshots blueprint-derived content. |
| Asset record | `MediaAsset` | Existing fields must be audited against V12 provenance and access-policy requirements. |
| R2 client | `apps/web-app/lib/storage/uploadToR2.ts` | Uses AWS S3 client and five `R2_*` environment variables. |
| Image upload | `app/api/builder-v2/assets/upload/route.ts` | Tenant/site checks and Sharp processing exist; MIME is accepted from `File.type` before decode and key layout is not the V12 contract. |
| Object key | `stores/<tenant>/websites/<site>/users/<user>/media/...` | Must be replaced for V12 by server-derived `tenants/<tenantId>/sites/<siteId>/...`. |
| Delivery | `R2_PUBLIC_URL/<key>` | Public URL helper exists; V12 signed/private access policy is not implemented. |

V12 must introduce a separate tenant-safe asset boundary and must not import the Builder 2 media implementation.
