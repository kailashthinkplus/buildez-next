import { apiHandler } from "@/lib/api/apiHandler";
import { deleteProjectFile, renameProjectFile, searchProjectFiles } from "@/modules/builder-v3/project-workspace";

export const GET = apiHandler(async ({ auth, params, req }) => {
  const siteId = params?.siteId;
  if (!siteId) throw new Error("Missing siteId");
  const query = new URL(req.url).searchParams.get("query") ?? "";
  return { version: 1, siteId, results: await searchProjectFiles({ siteId, tenantId: auth.tenant.id, query }) };
}, { requireTenant: true });

export const POST = apiHandler(async ({ auth, params, req }) => {
  const siteId = params?.siteId;
  if (!siteId) throw new Error("Missing siteId");
  const body = (await req.json()) as Record<string, unknown>;
  if (typeof body.path !== "string" || typeof body.targetPath !== "string" || typeof body.expectedRevision !== "number") {
    throw new Error("Invalid file rename request");
  }
  const result = await renameProjectFile({ siteId, tenantId: auth.tenant.id, userId: auth.user.id, path: body.path, targetPath: body.targetPath, expectedRevision: body.expectedRevision });
  return { version: 1, siteId, path: result.file.path, revision: result.revision };
}, { requireTenant: true });

export const DELETE = apiHandler(async ({ auth, params, req }) => {
  const siteId = params?.siteId;
  if (!siteId) throw new Error("Missing siteId");
  const body = (await req.json()) as Record<string, unknown>;
  if (typeof body.path !== "string" || typeof body.expectedRevision !== "number") throw new Error("Invalid file delete request");
  return { version: 1, siteId, ...(await deleteProjectFile({ siteId, tenantId: auth.tenant.id, userId: auth.user.id, path: body.path, expectedRevision: body.expectedRevision })) };
}, { requireTenant: true });
