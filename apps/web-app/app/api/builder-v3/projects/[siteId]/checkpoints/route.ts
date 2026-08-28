import { apiHandler } from "@/lib/api/apiHandler";
import { createProjectCheckpoint, listProjectCheckpoints, restoreProjectCheckpoint } from "@/modules/builder-v3/project-workspace";

export const GET = apiHandler(
  async ({ auth, params }) => {
    const siteId = params?.siteId;
    if (!siteId) throw new Error("Missing siteId");
    const checkpoints = await listProjectCheckpoints({ siteId, tenantId: auth.tenant.id });
    return {
      version: 1,
      siteId,
      checkpoints: checkpoints.map((checkpoint) => ({
        id: checkpoint.id,
        label: checkpoint.label,
        revision: checkpoint.revision.sequence,
        createdAt: checkpoint.createdAt.toISOString(),
      })),
    };
  },
  { requireTenant: true },
);

export const POST = apiHandler(
  async ({ auth, params, req }) => {
    const siteId = params?.siteId;
    if (!siteId) throw new Error("Missing siteId");
    const body = (await req.json()) as Record<string, unknown>;
    const checkpoint = await createProjectCheckpoint({
      siteId,
      tenantId: auth.tenant.id,
      userId: auth.user.id,
      label: typeof body.label === "string" ? body.label : undefined,
    });
    return { version: 1, siteId, checkpointId: checkpoint.id, createdAt: checkpoint.createdAt.toISOString() };
  },
  { requireTenant: true }
);

export const PUT = apiHandler(
  async ({ auth, params, req }) => {
    const siteId = params?.siteId;
    if (!siteId) throw new Error("Missing siteId");
    const body = (await req.json()) as Record<string, unknown>;
    if (typeof body.checkpointId !== "string" || typeof body.expectedRevision !== "number") {
      throw new Error("Checkpoint and expected revision are required");
    }
    const result = await restoreProjectCheckpoint({
      siteId,
      tenantId: auth.tenant.id,
      userId: auth.user.id,
      checkpointId: body.checkpointId,
      expectedRevision: body.expectedRevision,
    });
    return { version: 1, siteId, ...result };
  },
  { requireTenant: true }
);
