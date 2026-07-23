import { apiHandler } from "@/lib/api/apiHandler";
import { patchProjectFile } from "@/modules/builder-v3/project-workspace";

export const POST = apiHandler(
  async ({ auth, params, req }) => {
    const siteId = params?.siteId;
    if (!siteId) throw new Error("Missing siteId");
    const body = (await req.json()) as Record<string, unknown>;
    if (typeof body.path !== "string" || typeof body.search !== "string" || typeof body.replacement !== "string") {
      throw new Error("Invalid project patch");
    }
    if (typeof body.expectedRevision !== "number") throw new Error("Expected revision is required");
    const result = await patchProjectFile({
      siteId,
      tenantId: auth.tenant.id,
      userId: auth.user.id,
      path: body.path,
      search: body.search,
      replacement: body.replacement,
      expectedRevision: body.expectedRevision,
    });
    return { version: 1, siteId, changed: result.changed, revision: result.revision };
  },
  { requireTenant: true }
);
