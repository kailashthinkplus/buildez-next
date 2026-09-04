import { apiHandler } from "@/lib/api/apiHandler";
import { readProjectFile, writeProjectFile } from "@/modules/builder-v3/project-workspace";
import { patchElementSource, type ElementPatch } from "@/modules/builder-v3/visual-editor";

export const PUT = apiHandler(async ({ auth, params, req }) => {
  const siteId = params?.siteId;
  if (!siteId) throw new Error("Missing siteId");
  const body = await req.json() as Record<string, unknown>;
  if (typeof body.sourceFile !== "string" || typeof body.sourceAnchor !== "string") throw new Error("Invalid source selection");
  if (typeof body.expectedRevision !== "number" || !body.patch || typeof body.patch !== "object") throw new Error("Invalid element patch");
  const current = await readProjectFile(siteId, auth.tenant.id, body.sourceFile);
  const content = patchElementSource(current.content, current.path, body.sourceAnchor, body.patch as ElementPatch);
  const result = await writeProjectFile({
    siteId, tenantId: auth.tenant.id, userId: auth.user.id, path: current.path,
    content, expectedRevision: body.expectedRevision,
  });
  return { version: 1, changed: result.changed, revision: result.revision, file: result.file.path };
}, { requireTenant: true });
