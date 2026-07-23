import { apiHandler } from "@/lib/api/apiHandler";
import { importProjectFiles } from "@/modules/builder-v3/project-workspace";

export const POST = apiHandler(async ({ auth, params, req }) => {
  const siteId = params?.siteId;
  if (!siteId) throw new Error("Missing siteId");
  const body = (await req.json()) as Record<string, unknown>;
  if (!Array.isArray(body.files) || typeof body.expectedRevision !== "number") throw new Error("Invalid project import");
  const files = body.files.map((file) => {
    if (!file || typeof file !== "object") throw new Error("Invalid project import file");
    const candidate = file as Record<string, unknown>;
    if (typeof candidate.path !== "string" || typeof candidate.content !== "string") throw new Error("Invalid project import file");
    return { path: candidate.path, content: candidate.content };
  });
  return {
    version: 1,
    siteId,
    ...(await importProjectFiles({
      siteId,
      tenantId: auth.tenant.id,
      userId: auth.user.id,
      files,
      expectedRevision: body.expectedRevision,
      label: typeof body.label === "string" ? body.label : undefined,
    })),
  };
}, { requireTenant: true });
